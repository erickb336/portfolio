import { cpSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve('dist');
const client = resolve('dist/client');
const excluded = new Set(['.openai', 'client', 'server']);

rmSync(client, { recursive: true, force: true });
mkdirSync(client, { recursive: true });

for (const entry of readdirSync(dist, { withFileTypes: true })) {
  if (excluded.has(entry.name)) continue;
  cpSync(resolve(dist, entry.name), resolve(client, entry.name), {
    recursive: true,
    dereference: false
  });
}
