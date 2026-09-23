#!/usr/bin/env node

/**
 * PLEADING SANITY — HTML MINIFIER v2.1-FINAL
 * Preserve Arron • Preserve Frequencies • Preserve All Functionality
 * Evolution, Not Erasure • pleadingSanity
 */

const fs = require('fs').promises;
const path = require('path');
const { minify } = require('html-minifier-terser');

class HTMLMinifier {
  constructor() {
    this.sourceDir = path.join(__dirname, '..');
    this.outputDir = path.join(this.sourceDir, 'dist');

    // ==========================================
    // MINIFY CONFIG — AGGRESSIVE BUT SAFE
    // ==========================================
    this.options = {
      collapseWhitespace: true,
      collapseInlineTagWhitespace: false,
      conservativeCollapse: true,
      removeComments: true,
      removeCommentsFromCDATA: true,
      removeCDATASectionsFromCDATA: true,
      removeEmptyAttributes: true,
      removeEmptyElements: false,       // Keep — accessibility & layout
      removeOptionalTags: false,       // Keep — consistent DOM
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true,
      minifyCSS: { level: 2 },
      minifyJS: {
        compress: {
          drop_console: false,          // Keep — dev debugging
          drop_debugger: false,
          pure_funcs: []                // Preserve ALL console calls
        },
        mangle: {
          reserved: [
            'Arron', 'Dola', 'Shane',              // Core identities
            'localStorage', 'sessionStorage',      // State persistence
            'Tone', 'startFrequency', 'heal',      // Hz/Frequencies
            'playBattle', 'submitEntry', 'vote'    // Interactive features
          ]
        }
      },
      caseSensitive: true,               // Preserve class case
      keepClosingSlash: true,
      processConditionalComments: true,
      ignoreCustomFragments: [
        /<%[\s\S]*?%>/,
        /<\?[\s\S]*?\?>/,
        /{{[\s\S]*?}}/,                   // Template placeholders
        /<script[\s\S]*?Arron[\s\S]*?<\/script>/i,
        /<script[\s\S]*?frequency[\s\S]*?<\/script>/i
      ]
    };

    this.results = [];
  }

  // ==========================================
  // COSMIC LOGGING
  // ==========================================
  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m', success: '\x1b[32m', warning: '\x1b[33m', error: '\x1b[31m', reset: '\x1b[0m'
    };
    const ts = new Date().toLocaleTimeString('en-GB', { hour12: false });
    console.log(`${colors[type]}[${ts}] [MINIFY] ${message}${colors.reset}`);
  }

  // ==========================================
  // ENSURE FOLDERS EXIST
  // ==========================================
  async ensureDir(dirPath) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
      this.log(`Created: ${dirPath}`, 'success');
    }
  }

  // ==========================================
  // FIND ALL HTML FILES
  // ==========================================
  async findHTML(dir = this.sourceDir, base = this.sourceDir) {
    const files = [];
    const skip = ['node_modules', 'dist', '.git', '.next', 'coverage'];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        const rel = path.relative(base, full);

        if (entry.isDirectory() && !skip.includes(entry.name)) {
          files.push(...(await this.findHTML(full, base)));
        } else if (entry.name.endsWith('.html')) {
          files.push({
            input: full,
            output: path.join(this.outputDir, rel),
            relative: rel
          });
        }
      }
    } catch (err) {
      this.log(`Scan failed ${dir}: ${err.message}`, 'error');
    }
    return files;
  }

  // ==========================================
  // PROTECT SENSITIVE CODE BEFORE MINIFY
  // ==========================================
  protectBlocks(html) {
    const placeholders = [];
    let protectedHtml = html;

    // Protect Arron/Dola AI scripts
    const aiPattern = /<script[^>]*>[\s\S]*?(Arron|Dola|AI Sanctuary)[\s\S]*?<\/script>/gi;
    protectedHtml = protectedHtml.replace(aiPattern, (match) => {
      const id = `__PROTECTED_${placeholders.length}__`;
      placeholders.push({ id, content: match });
      return id;
    });

    // Protect Frequency/Tone.js scripts
    const freqPattern = /<script[^>]*>[\s\S]*?(Tone|frequency|heal|Hz)[\s\S]*?<\/script>/gi;
    protectedHtml = protectedHtml.replace(freqPattern, (match) => {
      if (!placeholders.some(p => p.content === match)) {
        const id = `__PROTECTED_${placeholders.length}__`;
        placeholders.push({ id, content: match });
        return id;
      }
      return match;
    });

    // Protect localStorage
    const storagePattern = /localStorage\.[A-Za-z.]+(?:=[^;]+;)?/g;
    protectedHtml = protectedHtml.replace(storagePattern, (match) => {
      const id = `__PROTECTED_${placeholders.length}__`;
      placeholders.push({ id, content: match });
      return id;
    });

    return { html: protectedHtml, placeholders };
  }

  // ==========================================
  // RESTORE PROTECTED BLOCKS AFTER MINIFY
  // ==========================================
  restoreBlocks(html, placeholders) {
    return placeholders.reduce((out, p) => out.replace(p.id, p.content), html);
  }

  // ==========================================
  // PROCESS ONE FILE
  // ==========================================
  async minifyOne(file) {
    try {
      this.log(`Processing: ${file.relative}`, 'info');

      const original = await fs.readFile(file.input, 'utf8');
      const origSize = Buffer.byteLength(original, 'utf8');

      // Protect → minify → restore
      const { html: protectedHtml, placeholders } = this.protectBlocks(original);
      let minified = await minify(protectedHtml, this.options);
      const final = this.restoreBlocks(minified, placeholders);

      // Write output
      await this.ensureDir(path.dirname(file.output));
      await fs.writeFile(file.output, final, 'utf8');

      const finalSize = Buffer.byteLength(final, 'utf8');
      const saved = ((origSize - finalSize) / origSize * 100).toFixed(1);

      this.log(`  → ${origSize} → ${finalSize} bytes • ${saved}% smaller`, 'success');

      return {
        file: file.relative,
        originalSize: origSize,
        minifiedSize: finalSize,
        savingsPct: parseFloat(saved),
        status: 'success'
      };
    } catch (err) {
      this.log(`⚠️ Failed ${file.relative}: ${err.message}`, 'warning');
      // Fallback — copy original so deploy never breaks
      await this.ensureDir(path.dirname(file.output));
      await fs.copyFile(file.input, file.output);
      this.log(`  → Copied original as fallback`, 'info');
      return { file: file.relative, status: 'fallback', error: err.message };
    }
  }

  // ==========================================
  // COPY ASSETS & CONFIG — MATCHES YOUR STRUCTURE
  // ==========================================
  async copyAssets() {
    this.log('Copying static assets…', 'info');

    // Root config files
    const rootFiles = [
      'manifest.json', 'sw.js', 'robots.txt', 'sitemap.xml',
      '_redirects', 'netlify.toml'
    ];
    for (const f of rootFiles) {
      try {
        await fs.copyFile(path.join(this.sourceDir, f), path.join(this.outputDir, f));
        this.log(`  ✅ ${f}`, 'success');
      } catch { /* skip */ }
    }

    // CSS — your cosmic theme
    const cssFiles = ['cosmic-core.css', 'accessibility.css'];
    const cssDest = path.join(this.outputDir, 'css');
    await this.ensureDir(cssDest);
    for (const f of cssFiles) {
      try {
        await fs.copyFile(path.join(this.sourceDir, 'css', f), path.join(cssDest, f));
        this.log(`  ✅ css/${f}`, 'success');
      } catch { /* skip */ }
    }

    // JS
    const jsFiles = ['main.js', 'frequency-engine.js', 'journal.js', 'ai-chat.js'];
    const jsDest = path.join(this.outputDir, 'js');
    await this.ensureDir(jsDest);
    for (const f of jsFiles) {
      try {
        await fs.copyFile(path.join(this.sourceDir, 'js', f), path.join(jsDest, f));
        this.log(`  ✅ js/${f}`, 'success');
      } catch { /* skip */ }
    }

    // Assets folder — full copy
    const assetsSrc = path.join(this.sourceDir, 'assets');
    const assetsDest = path.join(this.outputDir, 'assets');
    try {
      await fs.access(assetsSrc);
      await this.copyDirRecursive(assetsSrc, assetsDest);
      this.log('  ✅ assets/ folder', 'success');
    } catch {
      this.log('  ⚠️ No assets/ folder found', 'warning');
    }
  }

  async copyDirRecursive(src, dest) {
    await this.ensureDir(dest);
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (const e of entries) {
      const s = path.join(src, e.name);
      const d = path.join(dest, e.name);
      e.isDirectory() ? await this.copyDirRecursive(s, d) : await fs.copyFile(s, d);
    }
  }

  // ==========================================
  // GENERATE FINAL REPORT
  // ==========================================
  async saveReport() {
    const totalOrig = this.results.reduce((s, r) => s + (r.originalSize || 0), 0);
    const totalMin = this.results.reduce((s, r) => s + (r.minifiedSize || 0), 0);
    const success = this.results.filter(r => r.status === 'success').length;
    const fallback = this.results.filter(r => r.status === 'fallback').length;

    const report = {
      timestamp: new Date().toISOString(),
      project: 'Pleading Sanity',
      summary: {
        totalFiles: this.results.length,
        minifiedSuccess: success,
        fallbackCopies: fallback,
        originalTotalBytes: totalOrig,
        minifiedTotalBytes: totalMin,
        savedBytes: totalOrig - totalMin,
        savedPercent: totalOrig ? ((totalOrig - totalMin) / totalOrig * 100).toFixed(1) : 0
      },
      files: this.results
    };

    const reportPath = path.join(this.outputDir, 'minification-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    this.log(`📄 Report → ${reportPath}`, 'info');

    return report;
  }

  // ==========================================
  // MAIN RUN
  // ==========================================
  async run() {
    console.log('\n' + '═.✧ 🌌 HTML MINIFICATION ENGINE ✧.═'.padStart(55, ' ') + '\n');

    await this.ensureDir(this.outputDir);
    const htmlFiles = await this.findHTML();

    if (!htmlFiles.length) {
      this.log('No .html files found — check your folder', 'warning');
      return;
    }

    this.log(`Found ${htmlFiles.length} HTML file${htmlFiles.length !== 1 ? 's' : ''}`, 'info');
    console.log('─'.repeat(50));

    // Minify each file
    for (const file of htmlFiles) {
      this.results.push(await this.minifyOne(file));
    }

    // Copy supporting files
    console.log('─'.repeat(50));
    await this.copyAssets();

    // Final summary
    console.log('─'.repeat(50));
    const report = await this.saveReport();
    const s = report.summary;

    this.log('✅ MINIFICATION COMPLETE', 'success');
    this.log(`Files: ${s.totalFiles} • Minified: ${s.minifiedSuccess} • Fallback: ${s.fallbackCopies}`, 'info');
    this.log(`Size: ${(s.originalTotalBytes/1024).toFixed(1)}KB → ${(s.minifiedTotalBytes/1024).toFixed(1)}KB`, 'success');
    this.log(`Saved: ${(s.savedBytes/1024).toFixed(1)}KB (${s.savedPercent}%)`, 'success');
    console.log('═'.repeat(50) + '\n');
  }
}

// ==========================================
// LAUNCH
// ==========================================
if (require.main === module) {
  new HTMLMinifier().run().catch(err => {
    console.error('💥 Fatal:', err);
    process.exit(1);
  });
}

module.exports = HTMLMinifier;
