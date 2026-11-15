import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const script = fileURLToPath(new URL('./audit-whole-site.js', import.meta.url));
const page = body => `<!doctype html><html><head><title>Fixture</title><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${body}</body></html>`;
function fixture(t, files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ps-audit-'));
  t.after(() => fs.rmSync(root,{recursive:true,force:true}));
  for(const [name,text] of Object.entries(files)){const p=path.join(root,name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,text);}
  return JSON.parse(execFileSync(process.execPath,[script,'--root',root,'--json'],{encoding:'utf8'}));
}
test('audit accepts equivalent viewport, negative clinical disclaimer, redirects and decorative alt', t => {
  const r=fixture(t, {'index.html':page('<p>Arron is an AI companion, not a therapist. Samaritans 116 123, Shout 85258, NHS 111, emergency 999.</p><a href="/old">Next</a><a href="/api/health">API</a><img src="/pixel.svg" alt=""><script src="/js/site.js"></script><button class="ps-group-btn">Menu</button>'), 'next.html':page('Next'), '_redirects':'/old /next.html 301\n', 'pixel.svg':'<svg/>', 'js/site.js':'// no tracking here\nexport const analytics = null;'});
  assert.equal(r.counts.htmlPages,2);assert.equal(r.counts.productionScriptFiles,1);
  assert.equal(r.findings.filter(f=>f.severity==='FAIL').length,0);
  assert.ok(!r.findings.some(f=>f.code==='CLINICAL_ROLE_REVIEW'));
  assert.ok(r.dynamicRoutes.includes('/api/health'));
});
test('audit catches missing assets, literal redirect loops, menus, tracker code and inaccessible markup',t=>{
 const r=fixture(t,{'index.html':'<html><head><title> </title></head><body><a href="/missing.html">Broken</a><a href="/loop-a">Loop</a><img src="/absent.png"><button class="ps-group-btn">Menu</button><script src="/js/tracker.js"></script></body></html>', '_redirects':'/loop-a /loop-b 301\n/loop-b /loop-a 301\n', 'js/tracker.js':"gtag('config', 'example');"});
 const codes=new Set(r.findings.map(f=>f.code));
 for(const code of ['LINK_MISSING','LINK_LOOP','REDIRECT_LOOP','SHARED_MENU_SCRIPT_MISSING','TRACKER_SIGNATURE','IMAGE_ALT_MISSING','TITLE_MISSING_OR_EMPTY','VIEWPORT_MISSING_OR_INCOMPLETE'])assert.ok(codes.has(code),code);
});
test('audit distinguishes scoped warnings and retains multiple findings on one source line',t=>{
 const r=fixture(t,{'index.html':page('<p>Arron is your therapist. Everything stays on your device.</p><script src="/js/auth.js"></script>'), 'frequencies.html':page('<p>These tones cure anxiety.</p>'), 'shop.html':page('<p>PS-H01 organic cotton, squat-proof, zero bulk.</p>'), 'js/auth.js':'document.cookie;', 'js/arron-companion.js':`const reply = "whole picture; put you in a room; You're safe";`, 'docs/ACTIVEWEAR_DESIGN_PACK.md':'| Beneath signature hoodie-back brain | 40-50 |'});
 for(const code of ['SUPPORT_NUMBERS_MISSING','COMPANION_LABEL_MISSING','CLINICAL_ROLE_REVIEW','PRIVACY_SCOPE_REVIEW','LISTENING_HEALTH_CLAIM_REVIEW','PRODUCT_CLAIM_REVIEW','DESIGN_PREVIEW_LABEL_MISSING','V11_SPEC_CONFLICT','COOKIE_SOURCE_REVIEW'])assert.ok(r.findings.some(f=>f.code===code),code);
 assert.equal(r.findings.filter(f=>f.code==='ARRON_UNSUPPORTED_ASSURANCE').length,3);
});
