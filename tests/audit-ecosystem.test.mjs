import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

test('heading audit excludes the journal export documents embedded in scripts', () => {
  const report = JSON.parse(execFileSync(process.execPath, [
    new URL('../scripts/audit-ecosystem.mjs', import.meta.url).pathname, '--json'
  ], { encoding: 'utf8' }));
  for (const name of ['journal-vault.html', 'journal-vault-viewer.html', 'sanityhub.html']) {
    const page = report.pages.find(page => page.page === name);
    assert.ok(page, `${name} was audited`);
    assert.equal(page.h1, 1, `${name} has one page heading; its print heading is separate`);
    assert.equal(report.issues.some(issue => issue.path === name && issue.rule === 'heading-structure'), false);
  }
});
