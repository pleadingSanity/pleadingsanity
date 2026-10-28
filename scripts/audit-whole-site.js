#!/usr/bin/env node
// Read-only static audit. No network calls, model calls or page edits.
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const args = process.argv.slice(2);
const root = path.resolve(args.includes('--root') ? args[args.indexOf('--root') + 1] : path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
const base = 'https://pleadingsanity.co.uk';
const internalHosts = new Set(['pleadingsanity.co.uk', 'www.pleadingsanity.co.uk', 'pleadingsanity.uk', 'www.pleadingsanity.uk']);
const categories = ['Navigation and links', 'Crisis and companion boundaries', 'Trackers and privacy', 'Listening claims', 'Activewear claims', 'Mobile and accessibility'];
const findings = [], seen = new Set(), external = new Set(), dynamic = new Set();
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const exists = p => fs.existsSync(path.join(root, p));
const lineAt = (text, index) => text.slice(0, Math.max(0, index)).split('\n').length;
const decode = s => s.replace(/&(?:amp|quot|apos|lt|gt|#39|#34);/g, x => ({'&amp;':'&','&quot;':'"','&apos;':"'",'&#39;':"'",'&#34;':'"','&lt;':'<','&gt;':'>'}[x]));
const strip = s => decode(s.replace(/<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script\s*>|<style\b[\s\S]*?<\/style\s*>/gi, ' ').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
function add(category, severity, code, file, line, message, evidence = '') {
  const key = [code, file, line, message, evidence].join('|'); if (seen.has(key)) return; seen.add(key);
  findings.push({ category, severity, code, file, line, message, evidence: evidence.trim().slice(0, 260) });
}
function walk(dir = '') {
  return fs.readdirSync(path.join(root, dir), {withFileTypes:true}).flatMap(e => {
    if (['.git','node_modules','.netlify','.vercel'].includes(e.name)) return [];
    const p = path.posix.join(dir, e.name); return e.isDirectory() ? walk(p) : [p];
  });
}
let files, commit = 'unversioned fixture';
try { files = execFileSync('git', ['ls-files','-z'], {cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).split('\0').filter(Boolean); commit = execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim(); }
catch { files = walk(); }
const pages = files.filter(p => /\.html$/i.test(p));
const scriptFiles = files.filter(p => /\.(?:js|mjs|mts|ts)$/i.test(p));
const runtimeScripts = scriptFiles.filter(p => !/^(?:scripts|tests|tools)\//.test(p) && !/(?:^|[-.])test\./.test(p));
function tags(html) {
  const result = [];
  // Preserve quoted > characters and consume raw script/style bodies as a unit.
  const re = /<!--[\s\S]*?-->|<(script|style)\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/\1\s*>|<([a-z][\w:-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
  for (const m of html.matchAll(re)) {
    if (m[0].startsWith('<!--')) continue;
    const attrs = {}, raw = m[2] ?? m[5];
    for (const a of raw.matchAll(/([^\s=\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) attrs[a[1].toLowerCase()] = decode(a[2] ?? a[3] ?? a[4] ?? '');
    result.push({name:(m[1] ?? m[4]).toLowerCase(),attrs,body:m[3] ?? '',index:m.index,line:lineAt(html,m.index)});
  }
  return result;
}
const pageData = new Map(pages.map(file => { const html = read(file); return [file,{html,tags:tags(html),text:strip(html)}]; }));
const redirects = [];
if (exists('_redirects')) read('_redirects').split('\n').forEach((s,i) => {
  const parts = s.replace(/\s+#.*$/, '').trim().split(/\s+/);
  if (parts.length >= 2 && !parts[0].startsWith('#')) redirects.push({from:parts[0],to:parts[1],status:Number((parts[2] || '301').replace('!','')),force:(parts[2] || '').includes('!'),line:i+1,file:'_redirects'});
});
// netlify.toml redirect blocks: static string fields only; conditions require runtime review.
if (exists('netlify.toml')) {
  const text = read('netlify.toml');
  for (const m of text.matchAll(/\[\[redirects\]\]([\s\S]*?)(?=\n\[\[|$)/g)) {
    const from = m[1].match(/\bfrom\s*=\s*"([^"]+)"/), to = m[1].match(/\bto\s*=\s*"([^"]+)"/);
    if (from && to) redirects.push({from:from[1],to:to[1],status:Number(m[1].match(/\bstatus\s*=\s*(\d+)/)?.[1] || 301),force:/force\s*=\s*true/.test(m[1]),line:lineAt(text,m.index),file:'netlify.toml'});
  }
}
function disk(url) {
  const p = decodeURIComponent(url.pathname).replace(/^\//,'');
  for (const f of [p || 'index.html',p + '.html',path.posix.join(p,'index.html')]) if (exists(f) && fs.statSync(path.join(root,f)).isFile()) return f;
  return null;
}
function matchRedirect(url) {
  for (const r of redirects) {
    const target = r.from.startsWith('http') ? url.origin + url.pathname : url.pathname;
    const pattern = '^' + r.from.replace(/[.+?^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'(.*)').replace(/:splat/g,'(.*)') + '$';
    const m = target.match(new RegExp(pattern));
    if (m && (r.force || !disk(url))) return {...r,to:r.to.replace(/:splat/g,m[1] || '')};
  }
  return null;
}
function resolveLink(raw,file) {
  let url; try { url = new URL(raw,base+'/'+file); } catch { return {kind:'invalid'}; }
  if (!['http:','https:'].includes(url.protocol)) return {kind:'other'};
  if (!internalHosts.has(url.hostname)) { external.add(url.origin); return {kind:'external'}; }
  const visited = new Set();
  for (let i=0;i<25;i++) {
    const key = url.origin + url.pathname;
    if (visited.has(key)) return {kind:'loop',target:key}; visited.add(key);
    const redirect = matchRedirect(url);
    if (redirect) {
      if (redirect.status >= 400) return {kind:'blocked',target:url.pathname};
      const next = new URL(redirect.to,url);
      if (!internalHosts.has(next.hostname)) { external.add(next.origin); return {kind:'external'}; }
      if (next.origin+next.pathname === key && redirect.status === 200) return {kind:'dynamic',target:key};
      url = next; continue;
    }
    if (/^\/(?:api|\.netlify|@)\//.test(url.pathname)) {dynamic.add(url.pathname); return {kind:'dynamic'};}
    const target = disk(url);
    return target ? {kind:'file',target,hash:url.hash} : {kind:'missing',target:url.pathname};
  }
  return {kind:'indeterminate',target:url.href};
}
let anchors = 0, scriptRefs = 0, inlineScripts = 0, imageRefs = 0;
const sourceUnits = runtimeScripts.map(file => ({file,text:read(file),line:1}));
for (const [file,p] of pageData) {
  const {html,text} = p, ts=p.tags;
  for (const t of ts) {
    if (t.name==='script' && !t.attrs.src && (!t.attrs.type || /module|javascript/.test(t.attrs.type))) { inlineScripts++; sourceUnits.push({file,text:t.body,line:t.line}); }
    const attr = t.name==='a' ? 'href' : ['script','img','audio','source','iframe'].includes(t.name) ? 'src' : t.name==='link' ? 'href' : null;
    if (t.name==='a') anchors++; if(t.name==='script' && t.attrs.src)scriptRefs++; if(t.name==='img')imageRefs++;
    if (attr && t.attrs[attr] && !t.attrs[attr].includes('${')) {
      const r = resolveLink(t.attrs[attr],file);
      if (['missing','blocked','invalid','loop','indeterminate'].includes(r.kind)) add(categories[0],r.kind==='indeterminate'?'WARN':'FAIL','LINK_'+r.kind.toUpperCase(),file,t.line,`${t.name} ${attr}: ${t.attrs[attr]} (${r.kind})`,r.target || '');
      if (r.kind==='file' && r.hash && /\.html$/.test(r.target)) {
        let id;try{id=decodeURIComponent(r.hash.slice(1));}catch{id=r.hash.slice(1);}
        const target=pageData.get(r.target);
        if (target && id && !target.tags.some(n => n.attrs.id===id || n.attrs.name===id)) add(categories[0],'WARN','FRAGMENT_NOT_STATIC',file,t.line,`Fragment ${r.hash} not found in static ${r.target}; may be generated by JS`);
      }
    }
    if (t.name==='img' && !Object.hasOwn(t.attrs,'alt')) add(categories[5],'FAIL','IMAGE_ALT_MISSING',file,t.line,'Image has no alt attribute',t.attrs.src || '');
    if (t.name==='meta' && t.attrs['http-equiv']?.toLowerCase()==='refresh') {
      const target=t.attrs.content?.match(/url\s*=\s*(.*)/i)?.[1]?.replace(/^['"]|['"]$/g,'');
      if(target){const r=resolveLink(target,file);if(['loop','missing'].includes(r.kind))add(categories[0],'FAIL','META_REDIRECT_'+r.kind.toUpperCase(),file,t.line,target);}
    }
  }
  const viewport=ts.find(t=>t.name==='meta' && t.attrs.name?.toLowerCase()==='viewport');
  if (!viewport || !/width\s*=\s*device-width/i.test(viewport.attrs.content) || !/initial-scale\s*=\s*1(?:\.0)?(?:\s*[,;]|\s*$)/i.test(viewport.attrs.content)) add(categories[5],'FAIL','VIEWPORT_MISSING_OR_INCOMPLETE',file,viewport?.line || 1,'Require device-width and initial-scale=1 (equivalent formatting accepted)');
  if (!/<title\b[^>]*>\s*[^<\s][\s\S]*?<\/title>/i.test(html)) add(categories[5],'FAIL','TITLE_MISSING_OR_EMPTY',file,1,'Missing or empty title');
  if (/ps-group-btn|ps-mobile-(?:menu|toggle)|id=["']menu-toggle/.test(html) && !ts.some(t=>t.name==='script' && /(?:^|\/)site\.js(?:[?#]|$)/.test(t.attrs.src || ''))) add(categories[0],'FAIL','SHARED_MENU_SCRIPT_MISSING',file,1,'Shared-menu markup exists without site.js; verify any alternate controller');
  if (/mental\s+health|\bcrisis\b|\barron\b/i.test(text)) {
    const missing=[['Samaritans','116\\s*123'],['Shout','85258'],['NHS','\\b111\\b'],['emergency','\\b999\\b']].filter(([,re])=>!new RegExp(re).test(text)).map(([label])=>label);
    if(missing.length)add(categories[1],'WARN','SUPPORT_NUMBERS_MISSING',file,1,'Rule requires visible support numbers; missing: '+missing.join(', '));
  }
  if (/\barron\b/i.test(text) && !/\bcompanion\b/i.test(text)) add(categories[1],'WARN','COMPANION_LABEL_MISSING',file,1,'Arron mentioned without a static companion label (may be navigation-only)');
  for(const m of text.matchAll(/[^.!?]*(?:\bArron\b|\bAI\b)[^.!?]*(?:therapist|doctor)[^.!?]*/gi)) {
    if(!/\bnot\b|isn['’]t|is not|cannot|can['’]t|no substitute|never/i.test(m[0]))add(categories[1],'WARN','CLINICAL_ROLE_REVIEW',file,1,'Review possible clinical-role assertion',m[0]);
  }
  const backend = /(?:auth|firebase|arron-companion|arron-core|community|profile|member|feed)\.js|\/api\/|\.netlify\/|netlify-identity/.test(html);
  for(const m of text.matchAll(/(?:100%|entirely|everything|all (?:your )?data|nothing leaves|never leaves|local[- ]only|on[- ]device only)[^.!?]{0,150}/gi)) {
    if(backend && /device|browser|local|leaves|data/i.test(m[0]))add(categories[2],'WARN','PRIVACY_SCOPE_REVIEW',file,1,'Absolute/local-only language on a page with backend/auth indicators; verify feature scope',m[0]);
  }
  if (/(?:frequenc|meditation|rhythm|mind-mode)/i.test(file) || /<audio\b|AudioContext|createOscillator/i.test(html)) for(const m of text.matchAll(/[^.!?]*\b(?:cur(?:e|es|ing)|treat(?:s|ing|ment)?|clinical therapy|sound therapy|heal(?:s|ing)? (?:your |the )?(?:body|brain|trauma|cells|anxiety))\b[^.!?]*/gi)) {
    if(!/\bnot\b|no evidence|does not|isn['’]t/i.test(m[0]))add(categories[3],'WARN','LISTENING_HEALTH_CLAIM_REVIEW',file,1,'Listening page health/therapy wording requires evidence/context',m[0]);
  }
  for(const m of text.matchAll(/[^.!?]*(?:organic|squat[- ]proof|zero[- ]bulk|medical mask|protective mask)[^.!?]*/gi)) {
    if(!/not |no |unconfirmed|pending|subject|test|target|prototyp|without|verify|evidence|guarantee is|not established/i.test(m[0]))add(categories[4],'WARN','PRODUCT_CLAIM_REVIEW',file,1,'Unqualified product/material phrase requires source/sample evidence',m[0]);
  }
  if(/\bPS-(?:H01|J01|M01|L01|B01)\b/.test(text) && !/design previews?|prototypes?|sampling|sample approval/i.test(text))add(categories[4],'WARN','DESIGN_PREVIEW_LABEL_MISSING',file,1,'Garment page lacks static preview/prototype/sampling label');
}
for (const {file,text,line} of sourceUnits) {
  const clean=text.replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g,' ')).replace(/^[ \t]*\/\/[^\n]*/gm,m=>m.replace(/[^\n]/g,' '));
  for(const m of clean.matchAll(/google-analytics\.com|googletagmanager\.com|connect\.facebook\.net|facebook\.com\/tr|\bfbq\s*\(|\bgtag\s*\(|firebase\/analytics|\bgetAnalytics\s*\(|\binitializeAnalytics\s*\(|hotjar\.com|clarity\.ms|doubleclick\.net|adsbygoogle/gi))add(categories[2],'FAIL','TRACKER_SIGNATURE',file,line+lineAt(clean,m.index)-1,'Production source contains an analytics/advertising signature; verify execution/config',m[0]);
  if (/(?:frequenc|meditation|rhythm|mind-mode)/i.test(file) || /AudioContext|createOscillator/.test(clean)) {
    for (const m of clean.matchAll(/^.*\b(?:cures?|curing|treats?|treating|clinical therapy|sound therapy|heals? (?:the|your) (?:body|brain|cells|anxiety|trauma))\b.*$/gim)) {
      if (!/\bnot\b|no evidence|does not|isn['’]t/i.test(m[0])) add(categories[3],'WARN','LISTENING_SCRIPT_CLAIM_REVIEW',file,line+lineAt(clean,m.index)-1,'Audio-related source wording needs context/evidence',m[0]);
    }
  }
  for(const m of clean.matchAll(/document\.cookie|cookieStore\.(?:set|get)|SameSite\s*=\s*None/gi))add(categories[2],'WARN','COOKIE_SOURCE_REVIEW',file,line+lineAt(clean,m.index)-1,'Cookie-related source; static code cannot determine third-party cookie behaviour',m[0]);
  for(const m of clean.matchAll(/whole picture|put you in a room|you['’]re safe|it['’]s safe here|safe with me|send you to a waiting room/gi)) if(/arron-(?:core|companion)\.js$/.test(file)) add(categories[1],'FAIL','ARRON_UNSUPPORTED_ASSURANCE',file,line+lineAt(clean,m.index)-1,'Unsupported safety/clinical assurance in Arron client',m[0]);
}
// Check all literal HTML resource endpoints for known trackers too (iframe/img/script).
for(const [file,p] of pageData)for(const t of p.tags)for(const attr of ['src','href'])if(t.attrs[attr] && /google-analytics\.com|googletagmanager\.com|connect\.facebook\.net|facebook\.com\/tr|doubleclick\.net/i.test(t.attrs[attr]))add(categories[2],'FAIL','TRACKER_RESOURCE',file,t.line,'Known tracking resource',t.attrs[attr]);
for(const r of redirects)if(!/[\*:]/.test(r.from.replace(/^https?:\/\//,''))) {
  const result=resolveLink(r.from,'index.html');if(result.kind==='loop')add(categories[0],'FAIL','REDIRECT_LOOP',r.file,r.line,'Literal redirect loop: '+r.from,result.target);
}
if(exists('docs/ACTIVEWEAR_DESIGN_PACK.md')) {
 const text=read('docs/ACTIVEWEAR_DESIGN_PACK.md');
 for(const m of text.matchAll(/^.*(?:Beneath signature hoodie-back brain|Crying Brain \+ P\.S\. back|stow tunnel zero bulk).*$/gm))add(categories[4],'FAIL','V11_SPEC_CONFLICT','docs/ACTIVEWEAR_DESIGN_PACK.md',lineAt(text,m.index),'Editable design pack conflicts with owner-approved v1.1',m[0]);
}
if(exists('shop.html')) {
  const text=strip(read('shop.html'));
  const missing=[['hoodie 420-450gsm',/420\s*[-–]\s*450\s*gsm/i],['upper-back brain 220-240 mm',/220\s*[-–]\s*240/],['tonal-black rear-hem wordmark',/tonal[ -](?:matte[ -])?black[\s\S]{0,150}rear[ -](?:ribbed[ -])?hem/i],['four covered magnetic points',/(?:four|4)[\s\S]{0,80}(?:magnet|snap)/i]].filter(([,re])=>!re.test(text)).map(([label])=>label);
  if(missing.length)add(categories[4],'WARN','SHOP_V11_DETAIL_GAPS','shop.html',1,'Shop lacks explicit v1.1 details (not proof of a contradictory claim): '+missing.join('; '));
}
if(exists('shop.html')) {
  const raw=read('shop.html');
  const current=/pleading-sanity-factory-sampling-pack-v1\.1-owner-revision\.pdf/.test(raw);
  const leadsWithOld=/Start with the 12-page v1\.0/.test(raw);
  if(!current || leadsWithOld) add(categories[4],'WARN','OLDER_PUBLIC_FACTORY_PDF','shop.html',1,'Shop does not point at the v1.1 owner-revision PDF as the current factory brief');
}
findings.sort((a,b)=>categories.indexOf(a.category)-categories.indexOf(b.category)||a.file.localeCompare(b.file)||a.line-b.line||a.code.localeCompare(b.code));
const summary=categories.map(category=>{const f=findings.filter(x=>x.category===category),fail=f.filter(x=>x.severity==='FAIL').length,warnings=f.length-fail;return {category,status:fail?'FAIL':warnings?'WARN':'PASS',fail,warnings};});
const report={sourceCommit:commit,auditScriptSHA256:createHash('sha256').update(fs.readFileSync(fileURLToPath(import.meta.url))).digest('hex'),scope:'Read-only static repository audit; not live HTTP, runtime, legal or clinical certification',counts:{htmlPages:pages.length,rootHtmlPages:pages.filter(p=>!p.includes('/')).length,trackedScriptFiles:scriptFiles.length,productionScriptFiles:runtimeScripts.length,inlineScriptBlocks:inlineScripts,anchorElements:anchors,scriptSrcReferences:scriptRefs,imageElements:imageRefs,redirectRules:redirects.length},summary,findings,externalOrigins:[...external].sort(),dynamicRoutes:[...dynamic].sort(),pageInventory:pages,limitations:['No live HTTP requests: missing/blocked source targets are not measured production HTTP 404s.','External links, script-generated URLs, dynamic imports, conditional/auth redirects and platform routing need runtime verification.','Cookie headers, third-party cookies, consent, trackers injected by external scripts and complete network behaviour are unverified.','Shared-menu presence, viewport, title and alt checks do not establish mobile usability or accessibility compliance.','Support-number/companion checks use static HTML text only; runtime-injected footers may supply missing copy. Keyword heuristics cannot certify clinical safety.','Product wording is checked against provided v1.1 rules; no PDF byte replacement, original-artwork or physical-performance verification.','Inline claims have page-level line 1 where stripped visible text cannot be mapped reliably; evidence excerpts identify the text.']};
if(args.includes('--json')) console.log(JSON.stringify(report,null,2));
else {
 console.log(`PLEADING SANITY — WHOLE-SITE STATIC AUDIT\nSource commit: ${commit}\n${report.scope}\nCOUNTS ${JSON.stringify(report.counts)}`);
 for(const s of summary)console.log(`${s.status} | ${s.category} | ${s.fail} failures | ${s.warnings} warnings`);
 console.log('\nFINDINGS');for(const f of findings)console.log(`${f.severity} ${f.code} ${f.file}:${f.line} — ${f.message}${f.evidence?' | '+f.evidence:''}`);
 console.log('\nEXTERNAL ORIGINS (not fetched)\n'+report.externalOrigins.join('\n'));
 console.log('\nDYNAMIC ROUTES (not exercised)\n'+report.dynamicRoutes.join('\n'));
 console.log('\nLIMITATIONS\n'+report.limitations.map(x=>'- '+x).join('\n'));
 console.log('\nPAGE INVENTORY\n'+pages.join('\n'));
}
if(args.includes('--fail-on-findings') && findings.some(f=>f.severity==='FAIL'))process.exitCode=1;
