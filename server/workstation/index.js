import {dateIn, validateMessage} from './validate.js';
const ZONE='America/Los_Angeles';
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const reply=(error,status,extra={})=>Response.json({error},{status,headers:{...headers,...extra}});
const tokens=row=>({usageDate:row.usage_date,total:row.total,input:row.input,cachedInput:row.cached_input,output:row.output,coverage:row.coverage});

async function authorized(request, expected) {
  const match=/^Bearer ([^\s]+)$/i.exec(request.headers.get('authorization')||'');
  if (!match || match[1].length>1024) return false;
  const actual=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(match[1]));
  const digest=Uint8Array.from(expected.match(/../g),s=>parseInt(s,16));
  if (crypto.subtle.timingSafeEqual) return crypto.subtle.timingSafeEqual(actual,digest);
  // Portable constant-time comparison via Web Crypto's HMAC verification.
  const key=await crypto.subtle.generateKey({name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
  const signature=await crypto.subtle.sign('HMAC',key,actual);
  return crypto.subtle.verify('HMAC',key,signature,digest);
}

async function readBody(request) {
  if(Number(request.headers.get('content-length'))>4096) return {error:'too_large',status:413};
  const reader=request.body?.getReader();
  if(!reader)return {error:'invalid',status:400};
  const chunks=[];let size=0;
  try {
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();return {error:'too_large',status:413};}chunks.push(value);}
    const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
    return {value:JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes))};
  }catch{return {error:'invalid',status:400};}
  finally {reader.releaseLock();}
}

async function permit(db,now) {
  // A single bounded row implements a shared rolling window across Worker instances.
  return db.prepare(`INSERT INTO workstation_rate(id,events) VALUES(1,json_array(?1))
    ON CONFLICT(id) DO UPDATE SET events=(SELECT json_group_array(value) FROM
      (SELECT value FROM json_each(workstation_rate.events) WHERE value>?2 UNION ALL SELECT ?1))
    WHERE (SELECT count(*) FROM json_each(workstation_rate.events) WHERE value>?2)<10
    RETURNING id`).bind(now,now-1000).first();
}

const dailySql=`INSERT INTO workstation_daily(usage_date,input,cached_input,output,total,coverage,observed_at_ms,received_at_ms)
 SELECT ?1,?2,?3,?4,?5,?6,?7,?8 WHERE `;
const dailyUpdate=` ON CONFLICT(usage_date) DO UPDATE SET input=excluded.input,cached_input=excluded.cached_input,
 output=excluded.output,total=excluded.total,coverage=excluded.coverage,observed_at_ms=excluded.observed_at_ms,
 received_at_ms=excluded.received_at_ms WHERE excluded.observed_at_ms>workstation_daily.observed_at_ms RETURNING usage_date`;
async function store(db,m,now) {
  const observed=Date.parse(m.observedAt),t=m.tokens;
  const args=[m.usageDate,t.input,t.cachedInput,t.output,t.total,t.coverage,observed,now];
  if(m.type==='dailyUsage') return Boolean(await db.prepare(dailySql+'1'+dailyUpdate).bind(...args).first());
  const live=db.prepare(`INSERT INTO workstation_live(id,observed_at_ms,received_at_ms,lease_until_ms,agents_active,agents_coverage)
    VALUES(1,?1,?2,?3,?4,?5) ON CONFLICT(id) DO UPDATE SET observed_at_ms=excluded.observed_at_ms,
    received_at_ms=excluded.received_at_ms,lease_until_ms=excluded.lease_until_ms,agents_active=excluded.agents_active,
    agents_coverage=excluded.agents_coverage WHERE excluded.observed_at_ms>workstation_live.observed_at_ms RETURNING id`)
    .bind(observed,now,now+Math.min(m.ttlSeconds,300)*1000,m.agents.active,m.agents.coverage);
  // D1 batch is a transaction. The daily write only runs when its preceding live write won.
  const daily=db.prepare(dailySql+'changes()=1'+dailyUpdate).bind(...args);
  const results=await db.batch([live,daily]);
  return results[0].results.length>0;
}

async function snapshot(db,now) {
  const rows=await db.batch([
    db.prepare('SELECT * FROM workstation_live WHERE id=1'),
    db.prepare('SELECT * FROM workstation_daily WHERE usage_date=?').bind(dateIn(now,ZONE)),
  ]);
  const live=rows[0].results[0],day=rows[1].results[0];
  const connected=Boolean(live&&live.lease_until_ms>now);
  const agents=connected?{active:live.agents_active,coverage:live.agents_coverage}:{active:null,coverage:'unavailable'};
  return {schemaVersion:1,status:connected&&agents.active>=1?'online':'offline',
    tracker:!live?'never':connected?'connected':'disconnected',agents,tokensToday:day?tokens(day):null,
    lastHeartbeatAt:live?new Date(live.received_at_ms).toISOString():null,asOf:new Date(now).toISOString()};
}

export async function handleWorkstation(request,env,now=Date.now()) {
  const path=new URL(request.url).pathname;
  if(!path.startsWith('/api/workstation/'))return null;
  if(!((path==='/api/workstation/status'&&request.method==='GET')||(path==='/api/workstation/heartbeat'&&request.method==='POST')))return reply('not_found',404);
  try {
    if(!env.DB)return reply('temporarily_unavailable',503);
    if(path.endsWith('/status'))return Response.json(await snapshot(env.DB,now),{headers});
    const hash=env.WORKSTATION_INGEST_SECRET_SHA256;
    if(typeof hash!=='string'||!/^[a-f0-9]{64}$/i.test(hash))return reply('not_configured',503);
    if(!await authorized(request,hash))return reply('unauthorized',401);
    if(!await permit(env.DB,now))return reply('rate_limited',429,{'Retry-After':'1'});
    if(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')return reply('unsupported_media_type',415);
    const body=await readBody(request);
    if(body.error)return reply(body.error,body.status);
    const result=validateMessage(body.value);
    if(!result.ok)return Response.json({error:'invalid',details:result.errors},{status:400,headers});
    const m=result.message;
    if(m.timeZone!==ZONE)return Response.json({error:'invalid',details:['/timeZone: not_receiver_zone']},{status:400,headers});
    if(Math.abs(Date.parse(m.observedAt)-now)>120000)return reply('clock_skew',422);
    if(!await store(env.DB,m,now))return reply('stale',409);
    return new Response(null,{status:204,headers});
  } catch {
    console.error(JSON.stringify({event:'workstation_unavailable'}));
    return reply('temporarily_unavailable',503);
  }
}
