import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spotify} from '../server/spotify.js';
const env={SPOTIFY_CLIENT_ID:'test',SPOTIFY_CLIENT_SECRET:'DO_NOT_LEAK_SECRET',SPOTIFY_REFRESH_TOKEN:'DO_NOT_LEAK_REFRESH',SPOTIFY_PROFILE_URL:'https://open.spotify.com/user/example'};
function setup(t){let time=0,calls=0,entry;const oldFetch=globalThis.fetch,oldCaches=globalThis.caches;
 globalThis.caches={async open(){return {async match(){return entry&&entry.expiry>time?entry.response.clone():undefined;},async put(key,response){assert.equal(key.url,'https://erickbenitez.com/api/spotify');entry={response,expiry:time+Number(response.headers.get('cache-control').match(/\d+/)[0])*1000};assert.doesNotMatch(await response.clone().text(),/DO_NOT_LEAK/);}};}};
 globalThis.fetch=async(url,options)=>{calls++;assert.ok(options.signal);return String(url).includes('/api/token')?Response.json({access_token:'DO_NOT_LEAK_ACCESS'}):Response.json({is_playing:true,progress_ms:100,item:{name:'Test song',artists:[{name:'Artist'}],duration_ms:10000}});};
 t.after(()=>{globalThis.fetch=oldFetch;globalThis.caches=oldCaches;});return {calls:()=>calls,advance:n=>time+=n};}
const req=(suffix='',method='GET')=>new Request('https://erickbenitez.com/api/spotify'+suffix,{method,headers:{'Cache-Control':'no-cache',Authorization:'Bearer CALLER_INPUT'}});
test('5-second server cache ignores query/cache-busting headers and refreshes at expiry',async t=>{
 const f=setup(t);let r=await spotify(req(),env);assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'public, max-age=5');assert.equal((await r.json()).profileUrl,env.SPOTIFY_PROFILE_URL);
 for(let i=0;i<100;i++)assert.equal((await spotify(req('?nonce='+i),env)).status,200);
 assert.equal(f.calls(),2,'one token request and one playback request for 101 visitors');
 f.advance(4999);await spotify(req(),env);assert.equal(f.calls(),2);
 f.advance(1);await spotify(req(),env);assert.equal(f.calls(),4);
});
test('failure cooldown avoids retry storms and never returns upstream errors or credentials',async t=>{
 const f=setup(t);let calls=0;globalThis.fetch=async()=>{calls++;throw Error('DO_NOT_LEAK_SECRET');};
 for(let i=0;i<20;i++){const r=await spotify(req(),env);assert.equal(r.status,503);assert.equal(r.headers.get('cache-control'),'no-store');assert.deepEqual(await r.json(),{error:'temporarily_unavailable'});}
 assert.equal(calls,1);f.advance(5000);await spotify(req(),env);assert.equal(calls,2);
});
test('unsupported methods and unavailable caches cannot reach Spotify',async t=>{
 const f=setup(t);for(const method of ['POST','PUT','DELETE','HEAD','OPTIONS'])assert.equal((await spotify(req('',method),env)).status,405);
 globalThis.caches={async open(){throw Error('cache unavailable');}};
 assert.equal((await spotify(req(),env)).status,503);assert.equal(f.calls(),0);
});
test('unconfigured Spotify and provider auth failures are safely cached',async t=>{
 setup(t);assert.equal((await spotify(req(),{})).status,503);
 assert.deepEqual(await (await spotify(req(),{})).json(),{error:'not_connected'});
});

test('provider authentication failure is cached without exposing its body', async t => {
  const f = setup(t);
  let calls = 0;
  globalThis.fetch = async () => { calls++; return new Response('DO_NOT_LEAK_SECRET', {status: 401}); };
  for (let i = 0; i < 10; i++) {
    const response = await spotify(req(), env);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {error: 'token_refresh_failed'});
  }
  assert.equal(calls, 1);
  f.advance(5000);
  await spotify(req(), env);
  assert.equal(calls, 2);
});

test('playback rate limit does not trigger an extra recently-played request', async t => {
  setup(t);
  let calls = 0;
  globalThis.fetch = async url => {
    calls++;
    return String(url).includes('/api/token')
      ? Response.json({access_token: 'DO_NOT_LEAK_ACCESS'})
      : new Response('DO_NOT_LEAK_PROVIDER_BODY', {status: 429});
  };
  for (let i = 0; i < 10; i++) {
    const response = await spotify(req(), env);
    assert.deepEqual(await response.json(), {error: 'playback_unavailable'});
  }
  assert.equal(calls, 2);
});

test('no current playback falls back to recent history and caches the sanitized result', async t => {
  setup(t);
  let calls = 0;
  globalThis.fetch = async url => {
    calls++;
    if (String(url).includes('/api/token')) return Response.json({access_token: 'DO_NOT_LEAK_ACCESS'});
    if (String(url).includes('currently-playing')) return new Response(null, {status: 204});
    return Response.json({items: [{played_at: '2026-10-25T00:00:00Z', track: {
      name: 'Recent song', artists: [{name: 'Artist'}], privateData: 'DO_NOT_LEAK_EXTRA'
    }}]});
  };
  for (let i = 0; i < 10; i++) {
    const response = await spotify(req(), env);
    const body = await response.json();
    assert.equal(body.title, 'Recent song');
    assert.equal(body.isPlaying, false);
    assert.doesNotMatch(JSON.stringify(body), /DO_NOT_LEAK/);
  }
  assert.equal(calls, 3);
});

test('cache read and write failures return safe errors', async t => {
  const f = setup(t);
  globalThis.caches = {async open() { return {async match() { throw Error('DO_NOT_LEAK'); }}; }};
  assert.equal((await spotify(req(), env)).status, 503);
  assert.equal(f.calls(), 0);
  globalThis.caches = {async open() { return {async match() {}, async put() { throw Error('DO_NOT_LEAK'); }}; }};
  assert.deepEqual(await (await spotify(req(), env)).json(), {error: 'temporarily_unavailable'});
  assert.equal(f.calls(), 2);
});

test('no recent tracks returns a cached 404 without browser caching', async t => {
  setup(t);
  let calls = 0;
  globalThis.fetch = async url => {
    calls++;
    if (String(url).includes('/api/token')) return Response.json({access_token: 'DO_NOT_LEAK_ACCESS'});
    if (String(url).includes('currently-playing')) return new Response(null, {status: 204});
    return Response.json({items: []});
  };
  for (let i = 0; i < 10; i++) {
    const response = await spotify(req(), env);
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), {error: 'no_tracks'});
  }
  assert.equal(calls, 3);
});

test('built Worker routes Spotify through the server cache', async t => {
  const f = setup(t);
  const {default: worker} = await import('../dist/server/index.js');
  for (let i = 0; i < 10; i++) {
    const response = await worker.fetch(req('?nonce=' + i), env, {waitUntil() {}});
    assert.equal(response.status, 200);
    assert.equal((await response.json()).title, 'Test song');
  }
  assert.equal(f.calls(), 2);
});

test('provider Retry-After extends the failure cooldown', async t => {
  const f = setup(t);
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return new Response('DO_NOT_LEAK_PROVIDER_BODY', {status: 429, headers: {'Retry-After': '60'}});
  };
  assert.equal((await spotify(req(), env)).status, 503);
  f.advance(59999);
  assert.equal((await spotify(req(), env)).status, 503);
  assert.equal(calls, 1);
  f.advance(1);
  await spotify(req(), env);
  assert.equal(calls, 2);
});
