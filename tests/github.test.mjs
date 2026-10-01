import {test} from 'node:test';
import assert from 'node:assert/strict';
import {githubContributions} from '../server/github.js';
test('public calendar extracts counts and rejects broken upstream markup',async()=>{
 const original=globalThis.fetch;
 try{
 const html=Array.from({length:365},(_,i)=>{const date=new Date(Date.UTC(2025,0,1+i)).toISOString().slice(0,10);return `<td data-date="${date}" id="day-${i}" data-level="1"></td><tool-tip for="day-${i}">2 contributions on this date.</tool-tip>`}).join('');
 globalThis.fetch=async()=>new Response(html);
 const r=await githubContributions(new Request('https://erickbenitez.com/api/github/contributions'),{waitUntil(){}});
 const data=await r.json();assert.equal(r.status,200);assert.equal(data.total,730);assert.equal(data.days.length,365);assert.deepEqual(Object.keys(data.days[0]).sort(),['count','date','level']);
 globalThis.fetch=async()=>new Response('<html>Unavailable</html>');
 assert.equal((await githubContributions(new Request('https://erickbenitez.com/api/github/contributions'),{waitUntil(){}})).status,503);
 }finally{globalThis.fetch=original;}
});
