export function compact(n) {
  for(const [size,suffix] of [[1e12,'T'],[1e9,'B'],[1e6,'M'],[1e3,'k']])
    if(n>=size)return (Math.floor(n*10/size)/10).toFixed(1)+suffix;
  return String(n);
}
export function deskView(data,failed=false,elapsed=0) {
  if(failed||!data)return {online:false,agents:'—',hint:'status unavailable',tokens:'—',line:'Agent count unknown',heartbeat:'Status endpoint not reachable'};
  const {active,coverage}=data.agents,partial=coverage==='partial',usage=data.tokensToday;
  const age=Math.max(0,Math.floor((Date.parse(data.asOf)-Date.parse(data.lastHeartbeatAt)+elapsed)/1000));
  const ageText=age<120?`${age} second${age===1?'':'s'}`:age<7200?`${Math.floor(age/60)} minutes`:age<172800?`${Math.floor(age/3600)} hours`:`${Math.floor(age/86400)} days`;
  return {online:data.status==='online'&&data.tracker==='connected',
    agents:active===null?'—':partial?`${active}+`:String(active).padStart(2,'0'),
    hint:active===null?(data.tracker==='connected'?'count unavailable':'tracker disconnected'):partial?'known subtotal':'connected agents',
    tokens:usage?.total==null?'—':compact(usage.total)+(usage.coverage==='partial'?'+':''),
    line:active===null?'Agent count unknown':partial&&active===0?'Agent count incomplete':active===0?'No agents running':`${partial?'At least ':''}${active} agent${active===1?'':'s'} active`,
    heartbeat:data.lastHeartbeatAt?`Last heartbeat ${ageText} ago`:'No heartbeat yet'};
}
export function mountWorkstation(root, {document:doc=document,fetchStatus=()=>fetch('/api/workstation/status',{cache:'no-store',signal:AbortSignal.timeout(8000)}),clock=()=>performance.now()}={}) {
  let latest=null,received=0,next=null,busy=false;
  const set=(key,value)=>{const el=root.querySelector(`[data-desk-${key}]`);if(el)el.textContent=value;};
  function render(){const v=deskView(latest,!latest,clock()-received);set('status',v.online?'● ONLINE':'● OFFLINE');root.querySelector('[data-desk-status]').dataset.online=String(v.online);set('agents',v.agents);set('agent-hint',v.hint);set('tokens',v.tokens);set('line',v.line);set('heartbeat',v.heartbeat);root.querySelector('[data-token-processing]')?.classList.toggle('is-processing',v.online&&!doc.hidden);}
  async function poll(){clearTimeout(next);next=null;if(busy||doc.hidden)return;busy=true;
    try{const r=await fetchStatus();if(!r.ok)throw Error();const d=await r.json();if(d.schemaVersion!==1||!['online','offline'].includes(d.status)||!d.agents)throw Error();latest=d;received=clock();}catch{latest=null;}
    finally{busy=false;render();if(!doc.hidden)next=setTimeout(poll,5000);}
  }
  const visibility=()=>{if(doc.hidden){clearTimeout(next);next=null;render();}else poll();};
  doc.addEventListener('visibilitychange',visibility);
  const ticker=setInterval(()=>{if(!doc.hidden)render();},1000);
  poll();
  return ()=>{clearTimeout(next);clearInterval(ticker);doc.removeEventListener('visibilitychange',visibility);};
}
if(typeof document!=='undefined') {const root=document.querySelector('#workstation');if(root&&!root.hasAttribute('data-preview'))mountWorkstation(root);}
