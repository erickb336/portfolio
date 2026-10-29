import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

for (const [file, url] of [['dist/index.html', 'https://erickbenitez.com/'], ['dist/about/index.html', 'https://erickbenitez.com/about/']]) {
  test(`${file} identifies both public names for search engines`, () => {
    const html = readFileSync(file, 'utf8');
    const data = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const person = data['@graph']?.find(node => node['@type'] === 'Person') ?? data.mainEntity;
    assert.equal(person.name, 'Erick Benitez-Ramos');
    assert.ok(person.alternateName.includes('Erick Benitez'));
    assert.equal(person['@id'], 'https://erickbenitez.com/#person');
    for (const attr of ['name="description"', 'property="og:description"', 'name="twitter:description"']) {
      const matches = [...html.matchAll(new RegExp(`<meta ${attr} content="([^"]*)">`, 'g'))];
      assert.equal(matches.length, 1);
      assert.ok(matches[0][1].includes('Erick Benitez-Ramos'));
      assert.match(matches[0][1], /Erick Benitez[,) ]/);
    }
    assert.ok(html.includes(`<link rel="canonical" href="${url}">`));
    const visible = html.split('<main')[1].replace(/<[^>]*>/g, ' ');
    assert.match(visible, /Erick Benitez-Ramos/);
    assert.match(visible, /Erick Benitez[,)]/);
    assert.ok(html.includes('content="index,follow,max-image-preview:large"'));
  });
}
