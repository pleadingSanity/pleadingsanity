#!/usr/bin/env node

/**
 * PLEADING SANITY — HTML MINIFIER v2.2-FINAL
 * Preserve Arron • Preserve Frequencies • Preserve All Functionality
 * Next.js + Static Compatible • Dual Output • Safe Fallbacks
 * Evolution, Not Erasure • pleadingSanity • Shane Cooper Founder
 */

const fs = require('fs').promises;
const path = require('path');
const { minify } = require('html-minifier-terser');

class HTMLMinifier {
  constructor() {
    this.rootDir = path.join(__dirname, '..');
    this.sourceDir = this.rootDir;
    this.outputDir = path.join(this.rootDir, 'dist');

    // ==========================================
    // MINIFY CONFIG — AGGRESSIVE BUT ZERO BREAKAGE
    // ==========================================
    this.options = {
      collapseWhitespace: true,
      collapseInlineTagWhitespace: false,
      conservativeCollapse: true,
      preserveLineBreaks: false,
      removeComments: true,
      removeCommentsFromCDATA: true,
      removeCDATASectionsFromCDATA: true,
      removeEmptyAttributes: true,
      removeEmptyElements: false,        // Keep — accessibility & layout
      removeOptionalTags: false,         // Keep — consistent DOM
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true,
      minifyCSS: { 
        level: { 1: { all: true }, 2: { all: true, restructureRules: true } },
        all: true
      },
      minifyJS: {
        compress: {
          drop_console: false,           // Keep — Arron/Dola feedback
          drop_debugger: false,
          pure_funcs: []                 // Preserve ALL console calls
        },
        mangle: {
          reserved: [
            'Arron', 'Dola', 'Shane', 'PleadingSanity',  // Identities
            'localStorage', 'sessionStorage', 'getItem', 'setItem', // State
            'Tone', 'Frequency', 'heal', 'startHz', 'stopHz', 'CosmicAudio', // Hz
            'playBattle', 'submitEntry', 'vote', 'JournalVault', // Features
            'fetchVideos', 'NewsletterSignup', 'VideoCard' // Components
          ]
        }
      },
      caseSensitive: true,                // Preserve class case
      keepClosingSlash: true,
      processConditionalComments: true,
      processScripts: ['text/template', 'text/html'],
      ignoreCustomFragments: [
        /<%[\s\S]*?%>/,
        /<\?[\s\S]*?\?>/,
        /{{[\s\S]*?}}/,                    // Mustache/Next placeholders
        /\$\{[\s\S]*?\}/,                  // JS template literals
        /<script[\s\S]*?Arron[\s\S]*?<\/script>/i,
        /<script[\s\S]*?Dola[\s\S]*?<\/script>/i,
        /<script[\s\S]*?CosmicAudio[\s\S]*?<\/script>/i,
        /<script[\s\S]*?frequency[\s\S]*?<\/script>/i,
        /<script[\s\S]*?JournalVault[\s\S]*?<\/script>/i
      ]
    };

    // Skip directories — clean & safe
    this.skipDirs = [
      'node_modules', '.git', '.github',
      'dist', 'build', '.next', 'out',
      'scripts', 'coverage', '.netlify', '.vercel',
      'tmp', 'temp'
    ];

    this.results = [];
  }

  // ==========================================
  // COSMIC LOGGING
  // ==========================================
  log(message, type = 'info') {
    const C = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      glow: '\x1b[36;1m',
      reset: '\x1b[0m'
    };
    const ts = new Date().toLocaleTimeString('en-GB', { hour12: false });
    console.log(`${C[type]}[${ts}] [MINIFY] ${message}${C.reset}`);
  }

  // ==========================================
  // ENSURE FOLDERS EXIST — RECURSIVE
  // ==========================================
  async ensureDir(dirPath) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
      this.log(`Created: ${path.relative(this.rootDir, dirPath)}`, 'glow');
    }
  }

  // ==========================================
  // FIND ALL HTML — NEXT.JS + STATIC AWARE
  // ==========================================
  async findHTML(dir = this.sourceDir, base = this.sourceDir) {
    const files = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (this.skipDirs.includes(entry.name)) continue;

      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(base, fullPath);

      if (entry.isDirectory()) {
        files.push(...(await this.findHTML(fullPath, base)));
        continue;
      }

      if (entry.name.endsWith('.html')) {
        files.push({
          input: fullPath,
          output: path.join(this.outputDir, relPath),
          relative: relPath
        });
      }
    }
    return files;
  }

  // ==========================================
  // PROTECT BLOCKS — LAYERED SAFETY
  // ==========================================
  protectBlocks(html) {
    const placeholders = [];
    let protectedHtml = html;

    // 1. AI Core — Arron & Dola scripts
    const aiPattern = /<script[^>]*>(?:[\s\S]{0,200}?)(Arron|Dola|PleadingSanity)(?:[\s\S]{0,200}?)<\/script>/gi;
    protectedHtml = protectedHtml.replace(aiPattern, (match) => {
      const id = `__PROTECTED_AI_${placeholders.length}__`;
      placeholders.push({ id, content: match, type: 'AI Core' });
      return id;
    });

    // 2. Cosmic Audio / Hz Engine
    const audioPattern = /<script[^>]*>(?:[\s\S]{0,200}?)(CosmicAudio|Tone|frequency|heal|startHz)(?:[\s\S]{0,200}?)<\/script>/gi;
    protectedHtml = protectedHtml.replace(audioPattern, (match) => {
      if (placeholders.some(p => p.content === match)) return match;
      const id = `__PROTECTED_AUDIO_${placeholders.length}__`;
      placeholders.push({ id, content: match, type: 'Audio Engine' });
      return id;
    });

    // 3. Journal Vault / Storage
    const storagePattern = /localStorage\.(?:get|set|remove|clear)Item[\s\S]{0,50}?/g;
    protectedHtml = protectedHtml.replace(storagePattern, (match) => {
      const id = `__PROTECTED_STORAGE_${placeholders.length}__`;
      placeholders.push({ id, content: match, type: 'Storage' });
      return id;
    });

    // 4. Component render blocks
    const componentPattern = /<script[^>]*>(?:[\s\S]{0,200}?)(JournalVault|VideoCard|NewsletterSignup)(?:[\s\S]{0,200}?)<\/script>/gi;
    protectedHtml = protectedHtml.replace(componentPattern, (match) => {
      if (placeholders.some(p => p.content === match)) return match;
      const id = `__PROTECTED_COMP_${placeholders.length}__`;
      placeholders.push({ id, content: match, type: 'Component' });
      return id;
    });

    return { html: protectedHtml, placeholders };
  }

  // ==========================================
  // RESTORE — PERFECT REINTEGRATION
  // ==========================================
  restoreBlocks(html, placeholders) {
    return placeholders.reduce((output, p) => {
      const restored = output.replace(p.id, p.content);
      if (restored === output) {
        this.log(`⚠️  Placeholder not restored: ${p.type}`, 'warning');
      }
      return restored;
    }, html);
  }

  // ==========================================
  // PROCESS ONE FILE — PROTECT → MINIFY → RESTORE
  // ==========================================
  async minifyOne(file) {
    try {
      this.log(`Processing: ${file.relative}`, 'info');

      const original = await fs.readFile(file.input, 'utf8');
      const originalBytes = Buffer.byteLength(original, 'utf8');

      // Protection pipeline
      const { html: protectedHtml, placeholders } = this.protectBlocks(original);
      
      // Minify
      let minified = await minify(protectedHtml, this.options);
      
      // Restore protected blocks
      const final = this.restoreBlocks(minified, placeholders);
      
      // Verify restore integrity
      if (placeholders.length > 0) {
        const missing = placeholders.filter(p => !final.includes(p.content));
        if (missing.length > 0) {
          this.log(`⚠️  ${missing.length} block(s) may have been lost — using original`, 'warning');
          throw new Error('Restore integrity check failed');
        }
      }

      // Write output
      await this.ensureDir(path.dirname(file.output));
      await fs.writeFile(file.output, final, 'utf8');

      const finalBytes = Buffer.byteLength(final, 'utf8');
      const savedPct = ((originalBytes - finalBytes) / originalBytes * 100).toFixed(1);

      this.log(`  ✅ ${(originalBytes/1024).toFixed(1)}KB → ${(finalBytes/1024).toFixed(1)}KB • -${savedPct}% • ${placeholders.length} blocks protected`, 'success');

      return {
        file: file.relative,
        status: 'success',
        originalBytes,
        finalBytes,
        savedPct: parseFloat(savedPct),
        protectedBlocks: placeholders.length
      };
    } catch (err) {
      // SAFETY NET — copy original so deploy NEVER breaks
      this.log(`❌ Minify failed: ${file.relative} — copying original`, 'error');
      await this.ensureDir(path.dirname(file.output));
      await fs.copyFile(file.input, file.output);
      
      return {
        file: file.relative,
        status: 'fallback',
        error: err.message,
        note: 'Original preserved — deployment safe'
      };
    }
  }

  // ==========================================
  // COPY SUPPORTING ASSETS — MATCH YOUR STRUCTURE
  // ==========================================
  async copyAssets() {
    this.log('Copying deployment assets…', 'info');

    // ── Root config & PWA files ──
    const rootFiles = [
      'manifest.json', 'sw.js', 'robots.txt', 'sitemap.xml',
      '_redirects', 'netlify.toml', 'vercel.json',
      'favicon.ico'
    ];
    for (const f of rootFiles) {
      try {
        await fs.copyFile(path.join(this.sourceDir, f), path.join(this.outputDir, f));
        this.log(`  ✅ ${f}`, 'success');
      } catch { /* skip if missing */ }
    }

    // ── Public folder mirror (Next.js pattern) ──
    const publicSrc = path.join(this.sourceDir, 'public');
    if (await this.dirExists(publicSrc)) {
      await this.copyDirRecursive(publicSrc, this.outputDir);
      this.log('  ✅ public/ → dist/ (merged)', 'success');
    }

    // ── Assets folder ──
    const assetsSrc = path.join(this.sourceDir, 'assets');
    if (await this.dirExists(assetsSrc)) {
      await this.copyDirRecursive(assetsSrc, path.join(this.outputDir, 'assets'));
      this.log('  ✅ assets/', 'success');
    }

    // ── CSS ──
    const cssSrc = path.join(this.sourceDir, 'css');
    if (await this.dirExists(cssSrc)) {
      await this.copyDirRecursive(cssSrc, path.join(this.outputDir, 'css'));
      this.log('  ✅ css/', 'success');
    }

    // ── JS ──
    const jsSrc = path.join(this.sourceDir, 'js');
    if (await this.dirExists(jsSrc)) {
      await this.copyDirRecursive(jsSrc, path.join(this.outputDir, 'js'));
      this.log('  ✅ js/', 'success');
    }
  }

  async dirExists(p) {
    try { await fs.access(p); return true; } catch { return false; }
  }

  async copyDirRecursive(src, dest) {
    await this.ensureDir(dest);
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
      const s = path.join(src, entry.name);
      const d = path.join(dest, entry.name);
      entry.isDirectory() 
        ? await this.copyDirRecursive(s, d)
        : await fs.copyFile(s, d);
    }
  }

  // ==========================================
  // FINAL REPORT — FULL TRANSPARENCY
  // ==========================================
  async saveReport() {
    const totalOrig = this.results.reduce((s, r) => s + (r.originalBytes || 0), 0);
    const totalFinal = this.results.reduce((s, r) => s + (r.finalBytes || 0), 0);
    const success = this.results.filter(r => r.status === 'success');
    const fallback = this.results.filter(r => r.status === 'fallback');

    const report = {
      project: 'Pleading Sanity',
      version: '2.2-FINAL',
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: this.results.length,
        minifiedSuccess: success.length,
        fallbackCopies: fallback.length,
        totalProtectedBlocks: success.reduce((s, r) => s + (r.protectedBlocks || 0), 0),
        originalKB: (totalOrig / 1024).toFixed(1),
        finalKB: (totalFinal / 1024).toFixed(1),
        savedKB: ((totalOrig - totalFinal) / 1024).toFixed(1),
        savedPercent: totalOrig ? ((totalOrig - totalFinal) / totalOrig * 100).toFixed(1) : '0'
      },
      files: this.results,
      nextStep: 'Deploy dist/ → or use as static export',
      note: 'Arron • Dola • CosmicAudio • JournalVault — ALL preserved ✅'
    };

    const reportPath = path.join(this.outputDir, 'minification-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    this.log(`📄 Report saved → dist/minification-report.json`, 'info');

    return report;
  }

  // ==========================================
  // MAIN EXECUTION
  // ==========================================
  async run() {
    console.log('\n' + '═.✧ 🌌 HTML MINIFICATION ENGINE ✧.═'.padStart(60, ' ') + '\n');

    await this.ensureDir(this.outputDir);
    const htmlFiles = await this.findHTML();

    if (!htmlFiles.length) {
      this.log('No .html files found — check folder structure', 'warn');
      this.log('Scanned from: ' + this.sourceDir, 'info');
      return;
    }

    this.log(`Found ${htmlFiles.length} HTML file${htmlFiles.length !== 1 ? 's' : ''}`, 'glow');
    console.log('─'.repeat(55));

    // Process each file
    for (const file of htmlFiles) {
      this.results.push(await this.minifyOne(file));
    }

    // Copy supporting files
    console.log('─'.repeat(55));
    await this.copyAssets();

    // Final summary
    console.log('─'.repeat(55));
    const report = await this.saveReport();
    const s = report.summary;

    this.log('✅ MINIFICATION COMPLETE — Ready to Rise 🌌', 'success');
    this.log(`Files: ${s.totalFiles} • Minified: ${s.minifiedSuccess} • Fallback: ${s.fallbackCopies}`, 'info');
    this.log(`Protected: ${s.totalProtectedBlocks} blocks (Arron, Audio, Vault, Storage)`, 'glow');
    this.log(`Size: ${s.originalKB}KB → ${s.finalKB}KB • Saved: ${s.savedKB}KB (${s.savedPercent}%)`, 'success');
    console.log('═'.repeat(55) + '\n');
  }
}

// ==========================================
// LAUNCH
// ==========================================
if (require.main === module) {
  new HTMLMinifier().run().catch(err => {
    console.error('\n💥 Fatal Error:', err.message);
    console.error('Check permissions & folder structure above', '\n');
    process.exit(1);
  });
}

module.exports = HTMLMinifier;
