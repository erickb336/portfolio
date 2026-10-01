const clock=document.querySelector('#clock');
function tick(){const now=new Date();const date=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',month:'short',day:'numeric',year:'numeric'}).format(now);clock.textContent=date+' · '+new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',hour:'2-digit',minute:'2-digit',hour12:false}).format(now)+' PT';}
tick();setInterval(tick,60000);
fetch('/api/github/contributions').then(r=>r.ok?r:fetch('/assets/studio/contributions.json')).then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{
 document.querySelector('#snapshot').textContent='Updated '+data.updated;
 const days=data.days;let best=0,run=0;
 for(const d of days){run=d.count?run+1:0;best=Math.max(best,run)}
 for(const [label,value] of [['Contributions · past year',data.total],['Active days',days.filter(d=>d.count>0).length],['Longest streak · days',best]]){
 const el=document.createElement('div');el.className='stat';const number=document.createElement('strong');number.textContent=value.toLocaleString();const caption=document.createElement('span');caption.textContent=label;el.append(number,caption);document.querySelector('#stats').append(el);
 }
 const calendar=document.querySelector('#contribution-calendar');const months=document.querySelector('#calendar-months');let lastMonth=-1;
 days.forEach((d,index)=>{
 const date=new Date(d.date+'T12:00:00Z');const cell=document.createElement('a');cell.dataset.level=d.level;cell.href='https://github.com/erickb336?tab=overview&from='+d.date+'&to='+d.date;
 cell.title=d.count+' contributions on '+d.date;cell.setAttribute('aria-label',cell.title);calendar.append(cell);
 if(index%7===0){const label=document.createElement('span');const m=date.getUTCMonth();if(m!==lastMonth){if(index!==0||date.getUTCDate()<15)label.textContent=date.toLocaleString('en-US',{month:'short',timeZone:'UTC'});lastMonth=m}months.append(label)}
 });
}).catch(()=>{document.querySelector('#snapshot').textContent='Calendar unavailable — view GitHub profile';});
