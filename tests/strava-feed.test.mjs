import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

test('renders new API activities without embed codes, refreshes edits, and clears unavailable data', async () => {
  const element = tag => ({tag, setAttribute(name,value){this[name]=value;}, dataset:{}, children:[], append(...items){this.children.push(...items);}, replaceChildren(...items){this.children=items;}});
  const list=element(), status=element(), profile=element(), section=element(), body=element();
  section.querySelector=selector=>({'[data-activity-list]':list,'[data-activity-status]':status,'[data-strava-profile]':profile})[selector];
  let data={connected:true,activities:[{id:'20401166942',name:'Evening Weight Training',sport:'WeightTraining',startDate:'2026-10-01T01:16:00Z',timezone:'America/Los_Angeles',elapsedTime:2049,movingTime:2049,distance:0,elevation:0}],profileUrl:'https://www.strava.com/athletes/123'};
  let poll; const calls=[];
  runInNewContext(readFileSync('dist/strava-feed.js','utf8'),{
    document:{querySelector:selector=>selector==='#activity'?section:null,createElement:element,body,addEventListener(){}},
    fetch:async url=>{calls.push(url);return {ok:true,json:async()=>data};},
    AbortSignal,URL,Intl,setInterval(fn){poll=fn;},
  });
  const flush=()=>new Promise(resolve=>setImmediate(resolve));
  await flush();
  assert.equal(list.children.length,1);
  const card=list.children[0];
  assert.equal(card.children[1].textContent,'Evening Weight Training');
  assert.match(card.children[2].textContent,/6:16 PM/);
  assert.equal(card.children[3].children[0].children[1].textContent,'34m 9s');
  assert.equal(card.children.at(-1).href,'https://www.strava.com/activities/20401166942');
  assert.deepEqual(calls,['/api/strava']);
  assert.equal(body.children.length,0);
  data.activities[0].name='<script>not executable</script>';
  poll();await flush();
  assert.equal(list.children[0].children[1].textContent,'<script>not executable</script>');
  data={connected:true,unavailable:true,activities:[]};
  poll();await flush();
  assert.equal(list.children.length,0);
  assert.match(status.textContent,/temporarily unavailable/);
});

test('route decoder handles valid coordinates and rejects malformed or oversized paths',()=>{
 const context={document:{querySelector:()=>null}};
 runInNewContext(readFileSync('dist/strava-feed.js','utf8'),context);
 const points=context.decodeRoute('_p~iF~ps|U_ulLnnqC_mqNvxq`@');
 assert.equal(points.length,3);
 assert.equal(points[0][0],38.5);
 assert.equal(points[0][1],-120.2);
 assert.equal(context.decodeRoute('_').length,0);
 assert.equal(context.decodeRoute('x'.repeat(20001)).length,0);
});

test('run and walk carousels toggle map/photo and wrap without replacing the media frame',async()=>{
 for(const sport of ['Run','Walk']){
  const element=tag=>({tag,dataset:{},children:[],events:{},setAttribute(k,v){this[k]=v;},addEventListener(k,v){this.events[k]=v;},append(...x){this.children.push(...x);},replaceChildren(...x){this.children=x;}});
  const list=element(),status=element(),profile=element(),section=element();
  section.querySelector=s=>({'[data-activity-list]':list,'[data-activity-status]':status,'[data-strava-profile]':profile})[s];
  let resized=0;
  const map={remove(){},fitBounds(){},invalidateSize(){resized++;}};
  runInNewContext(readFileSync('dist/strava-feed.js','utf8'),{
   document:{querySelector:()=>section,createElement:element,addEventListener(){}},
   fetch:async()=>({ok:true,json:async()=>({connected:true,activities:[{id:'1',name:'Outdoor activity',sport,movingTime:60,distance:100,route:'_p~iF~ps|U_ulLnnqC_mqNvxq`@',photo:'https://dgtzuqphqg23d.cloudfront.net/photo.jpg'}]})}),
   L:{map:()=>map,tileLayer:()=>({addTo(){}}),polyline:()=>({addTo(){return {getBounds(){return [];}};}})},
   URL,AbortSignal,Intl,setInterval(){}
  });
  await new Promise(resolve=>setImmediate(resolve));
  const media=list.children[0].children.find(x=>x.className==='strava-media');
  const [route,photo,controls]=media.children;
  assert.equal(route.hidden,false);assert.equal(photo.hidden,true);
  controls.children[2].events.click();
  assert.equal(route.hidden,true);assert.equal(photo.hidden,false);
  controls.children[2].events.click();
  assert.equal(route.hidden,false);assert.equal(photo.hidden,true);
  assert.equal(resized,1);
 }
});
