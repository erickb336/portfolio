export function deskView(data, failed=false) {
  const online=!failed&&data?.status==='online'&&data?.tracker==='connected';
  const active=failed?null:data?.agents?.active;
  const partial=data?.agents?.coverage==='partial';
  const usage=data?.tokensToday;
  const number=n=>new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(n);
  return {online,agents:Number.isInteger(active)?`${active}${partial?'+':''}`:'—',
    hint:failed?'Connection unavailable':data?.tracker==='connected'?(active===0?'No agents running':partial?'Partial coverage':'Across Claude + Codex'):'Tracker offline',
    tokens:Number.isFinite(usage?.total)?`${number(usage.total)}${usage.coverage==='partial'?'+':''}`:'—',
    usage:usage?`${usage.usageDate} · Seattle${failed||data.tracker!=='connected'?' · last reported totals':''}`:'Today in Seattle · no usage reported',
    heartbeat:failed?'→ Connection lost · retrying':data?.lastHeartbeatAt?`→ Last signal ${new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',hour:'numeric',minute:'2-digit',second:'2-digit',timeZoneName:'short'}).format(new Date(data.lastHeartbeatAt))}`:'→ Waiting for the first heartbeat'};
}
if(typeof document!=='undefined'&&document.querySelector('#workstation')) {
  let last=null,busy=false;
  const set=(key,value)=>{document.querySelector(`[data-desk-${key}]`).textContent=value;};
  function render(failed=false){const v=deskView(last,failed);set('status',v.online?'● ONLINE':'○ OFFLINE');document.querySelector('[data-desk-status]').dataset.online=String(v.online);set('agents',v.agents);set('agent-hint',v.hint);set('tokens',v.tokens);set('usage',v.usage);set('heartbeat',v.heartbeat);}
  async function refresh(){if(busy||document.hidden)return;busy=true;try{const r=await fetch('/api/workstation/status',{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error();const d=await r.json();if(d.schemaVersion!==1||!['online','offline'].includes(d.status))throw Error();last=d;render();}catch{render(true);}finally{busy=false;}}
  refresh();setInterval(refresh,15000);document.addEventListener('visibilitychange',()=>{if(!document.hidden){render(true);refresh();}});
}
