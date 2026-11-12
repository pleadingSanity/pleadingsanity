import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));
const host='html-starter-pleadinsanity-shane-coopers-projects.vercel.app';
const rules=config.redirects.filter(r=>r.has?.some(h=>h.type==='host'&&h.value===host));
test('spare music alias routes only its root into the studio',()=>{
 assert.equal(rules[0].source,'/');assert.equal(rules[0].destination,'/music-creator.html');assert.equal(rules[0].permanent,false);
 assert.equal(rules.length,2);
});
test('music tools stay local while unsupported pages and APIs return to canonical hosting',()=>{
 const r=rules[1],match=new RegExp('^/'+r.source.slice('/:path('.length,-1)+'$');
 for(const path of ['/music-creator.html','/music-creator','/insane-radio.html','/insane-radio','/music/index.html','/music/sw.js','/js/music-creator.js','/css/site.css','/assets/favicon.svg','/images/radio/cover-rnb.jpg','/data/radio-library.json'])assert.equal(match.test(path),false,path);
 for(const path of ['/arron-app.html','/api/arron/health','/login.html','/shop.html','/support-us.html','/crisis.html','/sw.js','/index.html','/music-creator-fake.html'])assert.equal(match.test(path),true,path);
 assert.equal(r.destination,'https://pleadingsanity.co.uk/:path');assert.equal(r.permanent,false);
});
test('creator headers allow its own mic and camera and do not enable external code or frames',()=>{
 for(const page of ['/music-creator.html','/music-creator']){
  const h=config.headers.find(h=>h.source===page).headers;
  assert.match(h.find(h=>h.key==='Permissions-Policy').value,/camera=\(self\), microphone=\(self\)/);
  assert.match(h.find(h=>h.key==='Content-Security-Policy').value,/script-src 'self';/);
  assert.match(h.find(h=>h.key==='Content-Security-Policy').value,/frame-src 'none'/);
 }
 assert.ok(config.redirects.some(r=>r.has?.some(h=>h.value==='www.pleadingsanity.uk')),'existing mirror redirect retained');
});

test('only the release branch skips Netlify; main and unknown contexts continue normally',async()=>{
 const {shouldSkip}=await import('../scripts/music-release-build-guard.mjs');
 assert.equal(shouldSkip('netlify',{BRANCH:'release/music-radio-vercel'}),true);
 assert.equal(shouldSkip('netlify',{BRANCH:'main'}),false);
 assert.equal(shouldSkip('netlify',{}),false);
});
test('release duplicates skip Vercel while the intended project and all main builds continue',async()=>{
 const {shouldSkip}=await import('../scripts/music-release-build-guard.mjs');
 const env={VERCEL_GIT_COMMIT_REF:'release/music-radio-vercel',VERCEL_PROJECT_ID:'prj_jaS396m0HCvh9FDzSUmLurBuNmjI'};
 assert.equal(shouldSkip('vercel',env),false);
 assert.equal(shouldSkip('vercel',{...env,VERCEL_PROJECT_ID:'other-project'}),true);
 assert.equal(shouldSkip('vercel',{...env,VERCEL_GIT_COMMIT_REF:'main',VERCEL_PROJECT_ID:'other-project'}),false);
 assert.equal(shouldSkip('vercel',{VERCEL_GIT_COMMIT_REF:env.VERCEL_GIT_COMMIT_REF}),false);
 assert.equal(shouldSkip('unknown',env),false);
});
