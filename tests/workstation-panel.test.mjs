import {test} from 'node:test';
import assert from 'node:assert/strict';
import {deskView,compact,mountWorkstation} from '../dist/assets/studio/workstation.js';
const data={schemaVersion:1,status:'online',tracker:'connected',agents:{active:3,coverage:'complete'},tokensToday:{total:128499,coverage:'complete'},asOf:'2026-10-02T18:00:10Z',lastHeartbeatAt:'2026-10-02T18:00:00Z'};
const settle=()=>new Promise(resolve=>setImmediate(resolve));
test('contract display preserves unknown and lower bounds, and uses server heartbeat age',()=>{
 assert.equal(compact(999), '999');assert.equal(compact(128499),'128.4K');
 assert.equal(deskView(data).agents,'03');assert.equal(deskView(data,false,5000).heartbeat,'Last heartbeat 15 seconds ago');
 assert.equal(deskView({...data,agents:{active:2,coverage:'partial'}}).agents,'2+');
 assert.equal(deskView({...data,tokensToday:{total:128499,coverage:'partial'}}).tokens,'128.4K+');
 assert.equal(deskView({...data,agents:{active:null,coverage:'unavailable'},tokensToday:null}).agents,'—');
 assert.equal(deskView(data,true).tokens,'—');
});
test('polls on load, five seconds AFTER an answer, pauses hidden, resumes immediately, never overlaps',async t=>{
 t.mock.timers.enable({apis:['setTimeout','setInterval']});
 const nodes=new Map(),root={querySelector(key){if(!nodes.has(key))nodes.set(key,{textContent:'',dataset:{},classList:{toggle(){}}});return nodes.get(key);}};
 let listener,checks=0,answer;
 const doc={hidden:false,addEventListener(type,fn){listener=fn;},removeEventListener(){}};
 const dispose=mountWorkstation(root,{document:doc,clock:()=>0,fetchStatus:()=>{checks++;return new Promise(r=>{answer=()=>r({ok:true,json:async()=>data});});}});
 assert.equal(checks,1);t.mock.timers.tick(15000);await settle();assert.equal(checks,1);
 doc.hidden=true;listener();doc.hidden=false;listener();assert.equal(checks,1,'no overlap during visibility change');
 answer();await settle();t.mock.timers.tick(4999);await settle();assert.equal(checks,1);t.mock.timers.tick(1);await settle();assert.equal(checks,2);
 doc.hidden=true;listener();answer();await settle();t.mock.timers.tick(60000);await settle();assert.equal(checks,2);
 doc.hidden=false;listener();assert.equal(checks,3);answer();await settle();dispose();
});
test('initially hidden tabs make no request',t=>{
 t.mock.timers.enable({apis:['setTimeout','setInterval']});let checks=0;
 const dispose=mountWorkstation({}, {document:{hidden:true,addEventListener(){},removeEventListener(){}},fetchStatus:()=>{checks++;}});
 assert.equal(checks,0);dispose();
});
