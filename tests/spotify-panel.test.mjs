import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const script = readFileSync('dist/script.js', 'utf8');
const settle = () => new Promise(resolve => setImmediate(resolve));
function mount(hidden = false) {
  const nodes = new Map();
  function node(key) {
    if (!nodes.has(key)) nodes.set(key, {style: {}, dataset: {}, hidden: false, querySelector: node, getBoundingClientRect() {}, append() {}});
    return nodes.get(key);
  }
  const card = node('card');
  let poll, visibility, answer, calls = 0;
  const document = {hidden, querySelector: () => card, createElement: node, addEventListener(_, fn) { visibility = fn; }};
  vm.runInNewContext(script.slice(script.indexOf('const spotifyCard =')), {
    document, AbortSignal,
    window: {matchMedia: () => ({matches: true}), setInterval(fn, ms) { assert.equal(ms, 5000); poll = fn; }},
    fetch: () => { calls++; return new Promise(resolve => { answer = resolve; }); }
  });
  return {document, nodes, card, poll: () => poll(), visible: () => visibility(), calls: () => calls,
    answer: response => answer(response)};
}
test('Spotify polls every five seconds, pauses hidden, resumes and prevents overlaps', async () => {
  const ui = mount();
  assert.equal(ui.calls(), 1);
  ui.poll(); ui.visible(); assert.equal(ui.calls(), 1);
  ui.answer({ok: true, json: async () => ({isPlaying: true, title: 'Song', artist: 'Artist', album: 'Album'})});
  await settle();
  assert.equal(ui.nodes.get('[data-spotify-title]').textContent, 'Song');
  ui.document.hidden = true; ui.poll(); assert.equal(ui.calls(), 1);
  ui.document.hidden = false; ui.visible(); assert.equal(ui.calls(), 2);
  ui.answer({ok: false}); await settle();
  assert.equal(ui.card.dataset.playing, 'false');
  assert.equal(ui.nodes.get('[data-spotify-state]').textContent, 'Spotify temporarily unavailable');
  assert.equal(ui.nodes.get('[data-spotify-title]').hidden, true);
  ui.poll(); assert.equal(ui.calls(), 3);
  ui.answer({ok: true, json: async () => ({isPlaying: true, title: 'New song', artist: 'Artist', album: 'Album'})});
  await settle();
  assert.equal(ui.nodes.get('[data-spotify-title]').hidden, false);
  assert.equal(ui.nodes.get('[data-spotify-title]').textContent, 'New song');
});
test('initially hidden page does not request Spotify', () => {
  const ui = mount(true); assert.equal(ui.calls(), 0);
  ui.document.hidden = false; ui.visible(); assert.equal(ui.calls(), 1);
});
