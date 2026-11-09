import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./audit-markup-safety.mjs', import.meta.url));

test('markup safety scan reports pages and does not print a raw secret', () => {
  const raw = execFileSync(process.execPath, [script, '--json'], { encoding: 'utf8' });
  const report = JSON.parse(raw);
  assert.ok(report.summary.pages >= 80);
  assert.equal(typeof report.summary.secrets, 'number');
  assert.equal(typeof report.summary.imagesWithoutAlt, 'number');
  assert.doesNotMatch(raw, /sk_live_[A-Za-z0-9]{8,}|AIza[0-9A-Za-z\-_]{20,}|AKIA[0-9A-Z]{16}/);
});
