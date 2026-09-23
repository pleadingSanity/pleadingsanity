<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deployment Checker — Pleading Sanity</title>
  <style>
    :root { --cyan:#00fff0; --magenta:#ff00ff; --dark:#0d1b2a; --light:#f0faff; }
    body { font-family: system-ui; background: radial-gradient(ellipse at top, #1a0b3d, var(--dark)); color: var(--light); padding: 30px 20px; min-height: 100vh; }
    .container { max-width: 900px; margin: 0 auto; }
    h1 { color: var(--cyan); text-shadow: 0 0 20px rgba(0,255,240,0.3); text-align: center; margin-bottom: 30px; }
    .upload-area { border: 2px dashed var(--cyan); border-radius: 16px; padding: 40px; text-align: center; margin-bottom: 30px; background: rgba(0,255,240,0.04); cursor: pointer; transition: all 0.3s; }
    .upload-area:hover, .upload-area.dragover { border-color: var(--magenta); background: rgba(255,0,255,0.06); }
    .file-input { display: none; }
    .btn { background: linear-gradient(135deg, var(--cyan), var(--magenta)); color: #000; font-weight: 700; border: none; padding: 12px 24px; border-radius: 10px; cursor: pointer; font-size: 1rem; margin-top: 15px; }
    .results { margin-top: 30px; font-family: monospace; font-size: 0.9rem; white-space: pre-wrap; background: rgba(0,0,0,0.4); padding: 20px; border-radius: 12px; border: 1px solid rgba(0,255,240,0.15); }
    .pass { color: #51cf66; }
    .warn { color: #ffd43b; }
    .fail { color: #ff6b6b; }
    .section { margin: 10px 0; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Deployment Readiness Checker</h1>
    
    <div class="upload-area" id="dropZone">
      <p><strong>📂 Drop your project files here</strong></p>
      <p style="color:#b9faff; font-size:0.9rem; margin:10px 0;">Select all files from your Pleading Sanity folder</p>
      <input type="file" id="fileInput" class="file-input" webkitdirectory directory multiple>
      <button class="btn" onclick="document.getElementById('fileInput').click()">Select Folder</button>
    </div>

    <div class="results" id="results">
      <div style="color:#b9faff;">Report will appear here after selecting files...</div>
    </div>
  </div>

  <script>
    const REQUIRED_FILES = [
      'index.html', 'about.html', 'sanityhub.html', 'community-dashboard.html',
      'shop.html', 'feed.html', 'games.html', 'videos.html', 'movement.html',
      'journal-vault.html', '_redirects', 'manifest.json', 'sw.js'
    ];

    const JS_FILES = [
      'error-handler.js', 'script.js', 'cosmic-bg.js', 'crisis-response-system.js',
      'partnership-api-system.js', 'research-analytics-framework.js',
      'content-media-system.js', 'platform-orchestrator.js', 'maintenance-system.js'
    ];

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const resultsEl = document.getElementById('results');

    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault(); dropZone.classList.remove('dragover');
      processFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', e => processFiles(e.target.files));

    async function processFiles(files) {
      const fileMap = new Map();
      for (const file of files) {
        const name = file.webkitRelativePath ? file.webkitRelativePath.split('/').pop() : file.name;
        fileMap.set(name, await readFile(file));
      }
      runChecks(fileMap);
    }

    function readFile(file) {
      return new Promise(res => {
        const reader = new FileReader();
        reader.onload = e => res(e.target.result);
        reader.readAsText(file);
      });
    }

    function runChecks(fileMap) {
      let out = '', passes = 0, warns = 0, fails = 0;

      out += '════════════════════════════════════════════════════════════\n';
      out += '🎯 PLEADING SANITY — DEPLOYMENT READINESS REPORT\n';
      out += '════════════════════════════════════════════════════════════\n\n';

      // Core Files
      out += '📁 CORE FILES\n';
      let missing = [];
      for (const f of REQUIRED_FILES) {
        if (fileMap.has(f)) { out += `   ✅ ${f}\n`; passes++; }
        else { out += `   ❌ MISSING: ${f}\n`; missing.push(f); fails++; }
      }
      out += '\n';

      // JS Files
      out += '⚙️ SYSTEM FILES\n';
      for (const f of JS_FILES) {
        if (fileMap.has(f)) { out += `   ✅ ${f}\n`; passes++; }
        else { out += `   ⚠️ Not found: ${f}\n`; warns++; }
      }
      out += '\n';

      // Navigation Check
      out += '🔗 NAVIGATION CONSISTENCY\n';
      const htmlFiles = [...fileMap.keys()].filter(n => n.endsWith('.html'));
      let brokenLinks = 0, navOk = true;
      for (const [name, content] of fileMap) {
        if (!name.endsWith('.html')) continue;
        const links = content.match(/href="([^"]+\.html)"/g) || [];
        for (const l of links) {
          const target = l.replace('href="','').replace('"','').split('#')[0];
          if (target && !fileMap.has(target)) {
            out += `   ❌ Broken in ${name}: ${target}\n`; brokenLinks++; fails++; navOk = false;
          }
        }
      }
      if (navOk && brokenLinks === 0) { out += '   ✅ All links resolve\n'; passes++; }
      out += '\n';

      // Google Fonts Check
      out += '🔤 FONT INTEGRITY\n';
      let badFonts = [];
      for (const [name, content] of fileMap) {
        if (!name.endsWith('.html')) continue;
        if (content.includes('fonts.googleapis.com')) badFonts.push(name);
      }
      if (badFonts.length === 0) { out += '   ✅ No external font dependencies — loads instantly\n'; passes++; }
      else { out += `   ⚠️ Google Fonts still in: ${badFonts.join(', ')}\n`; warns++; }
      out += '\n';

      // Summary
      out += '════════════════════════════════════════════════════════════\n';
      out += `✅ PASS: ${passes}  |  ⚠️ WARNING: ${warns}  |  ❌ FAIL: ${fails}\n`;
      out += '════════════════════════════════════════════════════════════\n\n';

      if (fails === 0) {
        out += '🚀 READY TO DEPLOY! Drop all files to Netlify/Vercel ✅\n';
        out += '   No broken links · All core pages present · Clean theme\n';
      } else {
        out += '⚠️ Fix the ❌ items above before deploying\n';
        if (missing.length > 0) out += `   Missing: ${missing.join(', ')}\n`;
        if (brokenLinks > 0) out += `   Broken links: ${brokenLinks}\n`;
      }
      out += '\n🧠 Pleading Sanity — Rise From Madness 🌌';

      resultsEl.innerHTML = '';
      resultsEl.appendChild(document.createTextNode(out));
    }
  </script>
</body>
</html>
