import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync, readdirSync} from 'node:fs';
import {handleStrava, publicActivities, seal, unseal} from '../server/strava.js';
function database() {
 const db = new DatabaseSync(':memory:');
 for (const name of readdirSync('drizzle').filter(n=>n.endsWith('.sql')).sort()) db.exec(readFileSync(`drizzle/${name}`,'utf8'));
 const wrap = (sql, params=[]) => ({bind(...values){return wrap(sql,values);},async first(){return db.prepare(sql).get(...params) || null;},async run(){return db.prepare(sql).run(...params);}});
 return {prepare:sql=>wrap(sql),batch:statements=>Promise.all(statements.map(s=>s.run()))};
}
const stamp=()=>Math.floor(Date.now()/1000);
const request=path=>new Request(`https://erickbenitez.com${path}`);
const auth={athleteId:'123',clientId:'456',clientSecret:'test-secret',accessToken:'old-access',refreshToken:'old-refresh',expiresAt:0,webhookKey:'webhook-secret',subscriptionId:7};
async function fixture(){const env={DB:database(),STRAVA_ENCRYPTION_KEY:'test-encryption',STRAVA_SETUP_KEY:'setup-secret'}; await env.DB.prepare('INSERT INTO strava_state (id, encrypted) VALUES (1, ?)').bind(await seal(env,auth)).run(); return env;}
const activity=(id,type='Run',visibility='everyone')=>({id,sport_type:type,visibility,athlete:{id:123},start_date:`2026-09-${id<10?'0':''}${id}T12:00:00Z`});
test('includes public runs walks lifts, rejects followers private foreign and malformed activities',()=>{
 const input=[activity(1),activity(2,'Walk'),activity(3,'WeightTraining'),activity(4,'Run','followers_only'),{...activity(5),private:true},activity(6,'Ride'),{...activity(7),athlete:{id:999}},activity('bad')];
 assert.deepEqual(publicActivities(input,'123').map(a=>a.id),['3','2','1']);
 assert.deepEqual(publicActivities([{...activity(8),visibility:undefined}],'123'),[]);
});
test('tokens are encrypted with authenticated encryption',async()=>{
 const env={STRAVA_ENCRYPTION_KEY:'key'};const value=await seal(env,auth);
 assert.equal(value.includes('old-refresh'),false);assert.deepEqual(await unseal(env,value),auth);
 await assert.rejects(unseal({STRAVA_ENCRYPTION_KEY:'different'},value));
});
test('unconfigured endpoint hides feed',async()=>{
 assert.deepEqual(await (await handleStrava(request('/api/strava'),{},{})).json(),{connected:false,activities:[]});
});
test('refresh rotates token before listing, cache prevents repeat calls, only allowlisted fields are exposed',async()=>{
 const env=await fixture();const original=globalThis.fetch;const calls=[];
 globalThis.fetch=async(url,options)=>{calls.push(String(url));if(String(url).endsWith('/oauth/token'))return Response.json({access_token:'new-access',refresh_token:'new-refresh',expires_at:stamp()+21600});assert.equal(options.headers.authorization,'Bearer new-access');return Response.json([activity(1),activity(2,'Walk'),activity(3,'WeightTraining')]);};
 try{for(let i=0;i<2;i++){const result=await(await handleStrava(request('/api/strava'),env,{})).json();assert.deepEqual(result.activities.map(a=>a.id),['3','2','1']);assert.equal(JSON.stringify(result).includes('token'),false);}assert.equal(calls.length,2);const row=await env.DB.prepare('SELECT * FROM strava_state').first();assert.equal((await unseal(env,row.encrypted)).refreshToken,'new-refresh');}finally{globalThis.fetch=original;}
});
test('setup requires owner key and same origin; callback requires matching cookie',async()=>{
 const env=await fixture();const res=await handleStrava(new Request('https://erickbenitez.com/strava/connect',{method:'POST',headers:{origin:'https://evil.example'},body:'{}'}),env,{});assert.equal(res.status,403);
 const invalid=await handleStrava(new Request('https://erickbenitez.com/strava/connect',{method:'POST',headers:{origin:'https://erickbenitez.com'},body:JSON.stringify({setupKey:'wrong'})}),env,{});assert.equal(invalid.status,403);
 const callback=await handleStrava(request('/strava/callback?state=abc&code=secret'),env,{});assert.equal(callback.status,400);
});
test('webhook rejects wrong key and clears data on deauthorization',async()=>{
 const env=await fixture();let res=await handleStrava(request('/api/strava/webhook/wrong'),env,{});assert.equal(res.status,404);
 res=await handleStrava(request('/api/strava/webhook/webhook-secret?hub.mode=subscribe&hub.verify_token=webhook-secret&hub.challenge=hello'),env,{});assert.deepEqual(await res.json(),{'hub.challenge':'hello'});
 await handleStrava(new Request('https://erickbenitez.com/api/strava/webhook/webhook-secret',{method:'POST',body:JSON.stringify({owner_id:123,subscription_id:7,object_type:'athlete',updates:{authorized:'false'}})}),env,{});
 assert.equal(await env.DB.prepare('SELECT * FROM strava_state').first(),null);
});
test('API failure backs off and stale feed is not served',async()=>{
 const env=await fixture();const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;return new Response('',{status:429});};
 try{for(let i=0;i<2;i++){const result=await(await handleStrava(request('/api/strava'),env,{})).json();assert.deepEqual(result.activities,[]);assert.equal(result.unavailable,true);}assert.equal(calls,1);}finally{globalThis.fetch=original;}
});

test('public summaries exclude sensitive fields and sanitize photo URLs',()=>{
 const result=publicActivities([{...activity(1),name:'Lift',elapsed_time:2049,private_note:'secret',start_latlng:[1,2],average_heartrate:140,photos:{primary:{urls:{600:'https://d3nn82uaxijpm6.cloudfront.net/test.jpg'}}}}],'123')[0];
 assert.equal(result.elapsedTime,2049);
 assert.equal(result.photo,'https://d3nn82uaxijpm6.cloudfront.net/test.jpg');
 for(const field of ['private_note','start_latlng','average_heartrate','athlete','map'])assert.equal(field in result,false);
 assert.equal(publicActivities([{...activity(2),photos:{primary:{urls:{600:'javascript:alert(1)'}}}}],'123')[0].photo,null);
});
