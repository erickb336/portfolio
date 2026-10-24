import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

test('both pages render the shared bookshelf and load the same behavior', () => {
  execFileSync(process.execPath, ['scripts/render-bookshelf.mjs']);
  const pages = ['dist/index.html', 'dist/about/index.html'].map(file => readFileSync(file, 'utf8'));
  const sections = pages.map(page => page.match(/<!-- bookshelf:start -->([\s\S]*?)<!-- bookshelf:end -->/)[1].replace(/0[26] \/ READING/, 'READING'));
  assert.equal(sections[0], sections[1]);
  for (const page of pages) {
    assert.equal((page.match(/src="\/book-reviews.js"/g) || []).length, 1);
    assert.equal((page.match(/href="\/assets\/studio\/bookshelf.css"/g) || []).length, 1);
    assert.equal((page.match(/id="finished-books"/g) || []).length, 1);
    assert.equal((page.match(/class="book-card"/g) || []).length, 25);
    assert.match(page, /<h4>Persuasion<\/h4>/);
  }
});
