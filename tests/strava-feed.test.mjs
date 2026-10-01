import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

test('renders only complete official embeds and skips missing or malformed codes', async () => {
  const element = () => ({dataset: {}, children: [], append(...items) {this.children.push(...items);}, replaceChildren() {this.children = [];}});
  const list = element();
  list.querySelector = () => list.children.flatMap(card => card.children).find(item => item.className === 'strava-embed-placeholder');
  const status = element(), profile = element(), section = element(), body = element();
  section.querySelector = selector => ({'[data-activity-list]':list, '[data-activity-status]':status, '[data-strava-profile]':profile})[selector];
  runInNewContext(readFileSync('dist/strava-feed.js', 'utf8'), {
    document: {querySelector: selector => selector === '#activity' ? section : null, createElement: element, body},
    fetch: async url => ({ok:true, json:async () => url === '/api/strava'
      ? {connected:true, activities:[{id:'1'}, {id:'2'}, {id:'3'}, {id:'4'}], profileUrl:'https://www.strava.com/athletes/123'}
      : {'1':'public-embed-token', '3':'', '4':'bad token!'}}),
    AbortSignal, setInterval() {},
  });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(list.children.length, 1);
  assert.equal(list.children[0].children[0].dataset.token, 'public-embed-token');
  assert.equal(list.children[0].children[0].dataset.fromEmbed, 'false');
  assert.equal(body.children[0].src, 'https://strava-embeds.com/embed.js');
});
