const $ = selector => document.querySelector(selector);
const days=$('#days'),slots=$('#slots'),next=$('#continue-book'),form=$('#book-form');
const zone='America/Los_Angeles';
const dateKey=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'});
const todayKey=dateKey.format(new Date());
let month=new Date(todayKey+'T12:00:00Z');month.setUTCDate(1);
let chosenDay,chosenSlot,requestVersion=0,config,widget,id,busy=false;
$('#zone').textContent='Seattle time · America/Los_Angeles';
const time=iso=>new Intl.DateTimeFormat('en-US',{timeZone:zone,hour:'numeric',minute:'2-digit'}).format(new Date(iso));
const dayLabel=d=>new Date(d+'T12:00:00Z').toLocaleDateString('en-US',{timeZone:'UTC',weekday:'short',month:'short',day:'numeric'});
function reset(){chosenDay=null;chosenSlot=null;id=null;next.disabled=true;requestVersion++;slots.replaceChildren();$('#selected-date').textContent='Choose a day'}
function render(){
 reset();$('#month-label').textContent=month.toLocaleDateString('en-US',{timeZone:'UTC',month:'long',year:'numeric'});days.replaceChildren();
 for(let i=0;i<month.getUTCDay();i++)days.append(document.createElement('span'));
 const count=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth()+1,0)).getUTCDate();
 for(let n=1;n<=count;n++){
  const d=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth(),n,12)),key=d.toISOString().slice(0,10),b=document.createElement('button');
  b.type='button';b.textContent=n;b.setAttribute('aria-label',dayLabel(key));b.disabled=key<todayKey||[0,6].includes(d.getUTCDay())||d.getTime()>Date.now()+30*86400000;
  b.onclick=()=>{chosenDay=key;chosenSlot=null;id=null;next.disabled=true;days.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');$('#selected-date').textContent=dayLabel(key);loadTimes(key)};days.append(b);
 }
 $('#prev-month').disabled=month.toISOString().slice(0,7)<=todayKey.slice(0,7);
}
$('#prev-month').onclick=()=>{month.setUTCMonth(month.getUTCMonth()-1);render()};$('#next-month').onclick=()=>{month.setUTCMonth(month.getUTCMonth()+1);render()};render();
async function api(path,options){const r=await fetch('/api/booking/'+path,{...options,cache:'no-store'});let data;try{data=await r.json()}catch{throw Error('not_connected')}if(!r.ok)throw Error(data.error||'unavailable');return data}
function notice(text){const p=document.createElement('p');p.className='timeline-hint';p.textContent=text;slots.replaceChildren(p)}
async function loadTimes(day){
 const version=++requestVersion;notice('Checking calendar availability…');
 try{
  config=await api('config');const data=await api('availability?date='+encodeURIComponent(day));if(version!==requestVersion)return;
  if(!Array.isArray(data.slots)||!data.slots.length){notice('No available 30-minute times on this day. Try another date.');return}
  timeline(data.slots);
 }catch(e){if(version!==requestVersion)return;notice(e.message==='not_connected'?'Calendar is not connected yet. Please use Email below to arrange a time.':'Availability is temporarily unavailable. Please try again or email me.');next.disabled=true}
}
function timeline(times){
 slots.innerHTML='<p class="timeline-hint">Drag the 30-minute block or use ↑ / ↓. Shaded time is unavailable.</p><div class="day-timeline"></div><p class="time-feedback" aria-live="polite"></p>';
 const line=$('.day-timeline'),feedback=$('.time-feedback'),start=600,end=960;
 const minute=iso=>{const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:zone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(iso)).map(p=>[p.type,p.value]));return Number(parts.hour)*60+Number(parts.minute)};
 const values=times.map(minute);
 for(let m=start;m<end;m+=60){const tick=document.createElement('div');tick.className='time-tick';tick.style.top=((m-start)/(end-start)*100)+'%';tick.textContent=(m/60>12?m/60-12:m/60)+(m<720?' AM':' PM');line.append(tick)}
 for(let m=start;m<end;m+=15){if(values.some(v=>m>=v&&m<v+30))continue;const shade=document.createElement('div');shade.className='busy-block';shade.style.top=((m-start)/(end-start)*100)+'%';shade.style.height=(15/(end-start)*100)+'%';line.append(shade)}
 const block=document.createElement('div');block.className='time-block';block.tabIndex=0;block.setAttribute('role','slider');block.setAttribute('aria-label','Meeting start time, Seattle time');block.setAttribute('aria-orientation','vertical');block.setAttribute('aria-valuemin',0);block.setAttribute('aria-valuemax',times.length-1);line.append(block);
 let index=0,drag=false;
 function select(i){index=Math.max(0,Math.min(times.length-1,i));chosenSlot=times[index];id=null;const label=time(chosenSlot)+' – '+time(new Date(Date.parse(chosenSlot)+1800000));block.style.top=((values[index]-start)/(end-start)*100)+'%';block.style.height=(30/(end-start)*100)+'%';block.textContent=time(chosenSlot)+' · 30 min';block.setAttribute('aria-valuenow',index);block.setAttribute('aria-valuetext',label);feedback.textContent=label;next.disabled=false}
 function pointer(e){const r=line.getBoundingClientRect(),m=start+(e.clientY-r.top)/r.height*(end-start)-15;let nearest=0;values.forEach((v,i)=>{if(Math.abs(v-m)<Math.abs(values[nearest]-m))nearest=i});select(nearest)}
 block.onpointerdown=e=>{drag=true;block.setPointerCapture(e.pointerId);e.preventDefault()};block.onpointermove=e=>{if(drag)pointer(e)};block.onpointerup=()=>drag=false;block.onpointercancel=()=>drag=false;line.onclick=e=>{if(e.target!==block)pointer(e)};
 block.onkeydown=e=>{if(['ArrowDown','ArrowRight'].includes(e.key)){e.preventDefault();select(index+1)}else if(['ArrowUp','ArrowLeft'].includes(e.key)){e.preventDefault();select(index-1)}else if(e.key==='Home'){e.preventDefault();select(0)}else if(e.key==='End'){e.preventDefault();select(times.length-1)}};select(0);
}
let verificationLoad;
function loadVerification(){return verificationLoad ||= new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.onload=resolve;script.onerror=reject;document.head.append(script)})}
next.onclick=async()=>{
 if(!chosenSlot||!config)return;$('#book-selection').hidden=true;form.hidden=false;$('#chosen-time').textContent=dayLabel(chosenDay)+' · '+time(chosenSlot)+' · 30 minutes · Seattle time';form.querySelector('input').focus();
 try{await loadVerification();if(widget===undefined)widget=window.turnstile.render('#booking-verification',{sitekey:config.siteKey,action:'booking',theme:'dark'});else window.turnstile.reset(widget)}catch{$('#booking-error').textContent='Verification could not load. Please use the Email link.'}
};
$('#back-book').onclick=()=>{if(busy)return;form.hidden=true;$('#book-selection').hidden=false;$('#booking-error').textContent=''};
form.onsubmit=async e=>{
 e.preventDefault();if(busy||!chosenSlot)return;const proof=window.turnstile?.getResponse(widget);if(!proof){$('#booking-error').textContent='Please complete the verification first.';return}
 id ||= crypto.randomUUID().replaceAll('-','');const data=new FormData(form),button=form.querySelector('[type=submit]');busy=true;button.disabled=true;$('#booking-error').textContent='Booking your chat…';
 try{const result=await api('reserve',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id,start:chosenSlot,name:data.get('name'),email:data.get('email'),topic:data.get('topic')||'',proof})});if(!result.booked)throw Error('unavailable');form.hidden=true;$('#book-success').hidden=false;$('#success-time').textContent=$('#chosen-time').textContent;form.reset()}
 catch(e){const messages={slot_unavailable:'That time is no longer available. Go back and choose another time.',confirmation_pending:'Confirmation is pending. Please check your calendar or email Erick before making another booking.',rate_limited:'Too many attempts. Please try later or use Email.',verification_failed:'Verification expired. Please verify and try again.'};$('#booking-error').textContent=messages[e.message]||'Booking could not be confirmed. Please check your inbox before retrying.'}
 finally{busy=false;button.disabled=false;window.turnstile?.reset(widget)}
};
