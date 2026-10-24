import { readFileSync, writeFileSync } from 'node:fs';

const template = readFileSync(new URL('../src/components/bookshelf.html', import.meta.url), 'utf8').trim();
const marker = /<!-- bookshelf:start -->[\s\S]*?<!-- bookshelf:end -->/g;
for (const [file, sectionNumber] of [['dist/index.html', '06'], ['dist/about/index.html', '02']]) {
  const source = readFileSync(file, 'utf8');
  if ([...source.matchAll(marker)].length !== 1) throw new Error(`Expected one bookshelf in ${file}`);
  const component = template.replaceAll('{{sectionNumber}}', sectionNumber);
  writeFileSync(file, source.replace(marker, `<!-- bookshelf:start -->${component}<!-- bookshelf:end -->`));
}
