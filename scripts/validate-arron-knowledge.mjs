import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const file = resolve('arron-knowledge.json');
let raw;
try { raw = readFileSync(file, 'utf8'); }
catch (error) { console.error('Missing Arron knowledge file:', error.message); process.exit(1); }

const forbidden = /PLACEHOLDER_FIX_LATER|REPLACE_WITH_|TODO_RESTORE|FIX_ME_LATER/i;
if (forbidden.test(raw)) {
  console.error('Arron knowledge contains a forbidden placeholder. Refusing release.');
  process.exit(1);
}

let data;
try { data = JSON.parse(raw); }
catch (error) { console.error('Invalid Arron knowledge JSON:', error.message); process.exit(1); }

if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length < 5) {
  console.error('Arron knowledge is empty or structurally incomplete.');
  process.exit(1);
}
if (statSync(file).size < 1000) {
  console.error('Arron knowledge is unexpectedly small; check against known-good history.');
  process.exit(1);
}
console.log('Arron knowledge: valid JSON, non-placeholder, basic structure present.');
