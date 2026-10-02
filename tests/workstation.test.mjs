import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {handleWorkstation} from '../server/workstation/index.js';
import {validateMessage,dateIn} from '../server/workstation/validate.js';
const secret='synthetic-test-secret';
const epoch=Date.parse('2026-10-02T18:00:00Z');
function fixture(){
 const sqlite=new DatabaseSync(':memory:');
 for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync('drizzle/'+f,'utf8'));
 const wrap=(sql,args=[])=>({bind(...a){return wrap(sql,a);},async first(){return sqlite.prepare(sql).get(...args)||null;},execute(){return {results:sqlite.prepare(sql).all(...args)};}});
 return {DB:{prepare:sql=>wrap(sql),async batch(stmts){sqlite.exec('BEGIN');try{const result=stmts.map(s=>s.execute());sqlite.exec('COMMIT');return result;}catch(e){sqlite.exec('ROLLBACK');throw e;}}},WORKSTATION_INGEST_SECRET_SHA256:createHash('sha256').update(secret).digest('hex')};
}
const sample=(name)=>JSON.parse(readFileSync(`contract/workstation/samples/${name}.json`,'utf8'));
const message=(offset=0,changes={})=>({...sample('heartbeat-complete'),observedAt:new Date(epoch+offset).toISOString(),...changes});
const post=(env,m,now=epoch,options={})=>handleWorkstation(new Request('https://example.com/api/workstation/heartbeat',{method:'POST',headers:{authorization:`Bearer ${secret}`,'content-type':'application/json',...options.headers},body:options.body??JSON.stringify(m)}),env,now);
const status=async(env,now=epoch)=>(await handleWorkstation(new Request('https://example.com/api/workstation/status'),env,now)).json();
test('validates every tracker sample and rejects every invalid sample',()=>{
 for(const name of readdirSync('contract/workstation/samples').filter(n=>n.endsWith('.json')&&!n.startsWith('status-'))){const result=validateMessage(sample(name.slice(0,-5)));assert.equal(result.ok,!name.startsWith('invalid-'),name);}
});
test('never, online, idle, expired and clean stop states; daily totals survive disconnect',async()=>{
 const env=fixture();assert.equal((await status(env)).tracker,'never');
 assert.equal((await post(env,message())).status,204);let s=await status(env);assert.equal(s.status,'online');assert.equal(s.agents.active,3);assert.equal(s.tokensToday.total,128400);
 s=await status(env,epoch+90000);assert.equal(s.status,'offline');assert.equal(s.agents.active,null);assert.equal(s.tokensToday.total,128400);
 assert.equal((await post(env,message(1000,{agents:{active:0,coverage:'complete'}}),epoch+1000)).status,204);s=await status(env,epoch+1000);assert.equal(s.status,'offline');assert.equal(s.tracker,'connected');assert.equal(s.agents.active,0);
 await post(env,message(2000,{ttlSeconds:0}),epoch+2000);s=await status(env,epoch+2000);assert.equal(s.tracker,'disconnected');assert.equal(s.agents.active,null);
 assert.deepEqual(Object.keys(s).sort(),['schemaVersion','status','tracker','agents','tokensToday','lastHeartbeatAt','asOf'].sort());
});
test('stale heartbeats change neither live nor daily state; corrections never renew lease',async()=>{
 const env=fixture();await post(env,message(1000),epoch+1000);
 const before=await status(env,epoch+1000);
 assert.equal((await post(env,message(0,{tokens:{input:1,cachedInput:0,output:0,total:1,coverage:'complete'}}),epoch+1000)).status,409);
 assert.deepEqual(await status(env,epoch+1000),before);
 const correction={...message(2000),type:'dailyUsage',tokens:{input:10,cachedInput:0,output:5,total:15,coverage:'complete'}};delete correction.agents;delete correction.ttlSeconds;
 assert.equal((await post(env,correction,epoch+2000)).status,204);assert.equal((await post(env,correction,epoch+2000)).status,409);
 let s=await status(env,epoch+2000);assert.equal(s.tokensToday.total,15);assert.equal(s.lastHeartbeatAt,before.lastHeartbeatAt);
 assert.equal((await status(env,epoch+91000)).status,'offline');
 // A newer live observation may be older than a daily correction: never replace that correction.
 assert.equal((await post(env,message(1500),epoch+2000)).status,204);assert.equal((await status(env,epoch+2000)).tokensToday.total,15);
});
test('auth, media type, size, invalid UTF8, skew and unknown fields fail safely',async()=>{
 const env=fixture();assert.equal((await post(env,message(),epoch,{headers:{authorization:'Bearer wrong'}})).status,401);
 assert.equal((await post(env,message(),epoch,{headers:{'content-type':'text/plain'}})).status,415);
 assert.equal((await post(env,message(),epoch,{body:'x'.repeat(4097)})).status,413);
 assert.equal((await post(env,message(),epoch,{body:new Uint8Array([0xff])})).status,400);
 assert.equal((await post(env,message(120001))).status,422);
 const r=await post(env,message(0,{private_project:'DO_NOT_ECHO'}));assert.equal(r.status,400);assert.ok(!(await r.text()).includes('DO_NOT_ECHO'));
 assert.equal((await status(env)).tracker,'never');
});
test('rolling rate limit is durable across calls and does not count bad authentication',async()=>{
 const env=fixture();for(let i=0;i<12;i++)assert.equal((await post(env,message(),epoch,{headers:{authorization:'Bearer bad'}})).status,401);
 for(let i=0;i<10;i++)assert.equal((await post(env,message(i),epoch)).status,204);
 const r=await post(env,message(10));assert.equal(r.status,429);assert.equal(r.headers.get('retry-after'),'1');
 assert.equal((await post(env,message(1000),epoch+1000)).status,204);
});
test('partial/unavailable coverage, lease cap, strict dates and Seattle rollover',async()=>{
 const env=fixture();await post(env,message(0,{ttlSeconds:600,agents:{active:2,coverage:'partial'}}));assert.equal((await status(env)).agents.coverage,'partial');assert.equal((await status(env,epoch+300000)).tracker,'disconnected');
 await post(env,message(1000,{agents:{active:null,coverage:'unavailable'}}),epoch+1000);assert.equal((await status(env,epoch+1000)).status,'offline');
 assert.equal((await status(env,Date.parse('2026-10-03T07:00:00Z'))).tokensToday,null);
 assert.equal(dateIn(Date.parse('2026-11-01T08:30:00Z'),'America/Los_Angeles'),'2026-11-01');
 assert.equal(dateIn(Date.parse('2026-11-01T09:30:00Z'),'America/Los_Angeles'),'2026-11-01');
 assert.equal(validateMessage(message(0,{observedAt:'2026-02-30T12:00:00Z'})).ok,false);
});

test('simultaneous out-of-order heartbeats keep newest observation and daily usage',async()=>{
 const env=fixture();await Promise.all([9,3,6,1,8,4,2,7,5,0].map(i=>post(env,message(i,{agents:{active:i,coverage:'complete'},tokens:{input:i,cachedInput:0,output:0,total:i,coverage:'complete'}}))));
 const s=await status(env);assert.equal(s.agents.active,9);assert.equal(s.tokensToday.total,9);
});
test('bundled Worker serves the contract without dynamic compilation',async()=>{
 const worker=(await import('../dist/server/index.js')).default;
 const env=fixture();const req=new Request('https://example.com/api/workstation/heartbeat',{method:'POST',headers:{authorization:`Bearer ${secret}`,'content-type':'application/json'},body:JSON.stringify({...message(),observedAt:new Date().toISOString(),usageDate:dateIn(Date.now(),'America/Los_Angeles')})});
 assert.equal((await worker.fetch(req,env,{})).status,204);
 const r=await worker.fetch(new Request('https://example.com/api/workstation/status'),env,{});assert.equal(r.headers.get('cache-control'),'no-store');assert.equal((await r.json()).status,'online');
});
