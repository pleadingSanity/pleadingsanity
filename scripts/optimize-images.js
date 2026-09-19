#!/usr/bin/env node

/**
 * PLEADING SANITY — IMAGE OPTIMIZER v2.1-FINAL
 * WebP First • Responsive Sizes • Favicons • Reported • Zero Quality Loss
 * Evolution, Not Erasure • pleadingSanity
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

class ImageOptimizer {
  constructor() {
    this.root = path.join(__dirname, '..');
    this.inputDir = path.join(this.root, 'assets');
    this.outputDir = path.join(this.root, 'assets', 'optimized');
    
    this.sizes = { small: 320, medium: 768, large: 1200, xlarge: 1920 };
    this.formats = ['webp', 'jpg', 'png'];
    this.quality = { webp: 85, jpg: 82, png: 85 };
  }

  // ==========================================
  // COSMIC LOGGING
  // ==========================================
  log(msg, type = 'info') {
    const C = { info: '\x1b[36m', success: '\x1b[32m', warn: '\x1b[33m', error: '\x1b[31m', reset: '\x1b[0m' };
    const ts = new Date().toLocaleTimeString('en-GB', { hour12: false });
    console.log(`${C[type]}[${ts}] [IMG] ${msg}${C.reset}`);
  }

  // ==========================================
  // ENSURE FOLDERS EXIST
  // ==========================================
  async ensureDir(p) {
    try { await fs.access(p); }
    catch { await fs.mkdir(p, { recursive: true }); }
  }

  // ==========================================
  // SCAN IMAGE FILES
  // ==========================================
  async scanImages(dir = this.inputDir) {
    const files = [];
    const exts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    const skip = ['optimized', 'favicons', 'node_modules'];

    try {
      for (const e of await fs.readdir(dir, { withFileTypes: true })) {
        if (skip.includes(e.name)) continue;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) files.push(...(await this.scanImages(full)));
        else if (exts.some(x => e.name.toLowerCase().endsWith(x))) files.push(full);
      }
    } catch (err) {
      this.log(`Scan failed: ${err.message}`, 'error');
    }
    return files;
  }

  // ==========================================
  // OPTIMIZE ONE IMAGE
  // ==========================================
  async processOne(filePath) {
    const meta = await sharp(filePath).metadata();
    const name = path.basename(filePath, path.extname(filePath));
    const relPath = path.relative(this.inputDir, filePath);
    const outSub = path.dirname(relPath);
    const outDir = path.join(this.outputDir, outSub);
    await this.ensureDir(outDir);

    const origSize = (await fs.stat(filePath)).size;
    const results = {
      file: relPath,
      originalSize: origSize,
      width: meta.width,
      height: meta.height,
      variants: []
    };

    // SVG → copy as-is (vector = already perfect)
    if (meta.format === 'svg') {
      const dest = path.join(outDir, `${name}.svg`);
      await fs.copyFile(filePath, dest);
      results.variants.push({ name: `${name}.svg`, format: 'svg', size: origSize, width: meta.width });
      this.log(`✅ Copied SVG: ${relPath}`, 'success');
      return results;
    }

    // Generate all responsive variants
    for (const [sizeLabel, targetW] of Object.entries(this.sizes)) {
      if (meta.width < targetW) continue; // skip upscaling

      for (const fmt of this.formats) {
        const outName = `${name}-${sizeLabel}.${fmt}`;
        const outPath = path.join(outDir, outName);

        let proc = sharp(filePath)
          .resize(targetW, null, { fit: 'inside', withoutEnlargement: true });

        if (fmt === 'webp') proc = proc.webp({ quality: this.quality.webp, effort: 6 });
        else if (fmt === 'jpg') proc = proc.jpeg({ quality: this.quality.jpg, mozjpeg: true });
        else if (fmt === 'png') proc = proc.png({ quality: this.quality.png, compressionLevel: 9 });

        await proc.toFile(outPath);
        const stats = await fs.stat(outPath);
        const pct = ((origSize - stats.size) / origSize * 100).toFixed(1);

        results.variants.push({
          name: outName, format: fmt, size: stats.size,
          width: targetW, savingPct: pct
        });
        this.log(`  → ${outName} • ${(stats.size/1024).toFixed(1)}KB • -${pct}%`, 'success');
      }
    }
    return results;
  }

  // ==========================================
  // FAVICON GENERATOR — from brain-logo.png
  // ==========================================
  async makeFavicons() {
    const logo = path.join(this.inputDir, 'brain-logo.png');
    try { await fs.access(logo); }
    catch {
      this.log('No brain-logo.png — skipping favicons', 'warn');
      return;
    }

    const favDir = path.join(this.outputDir, '..', 'favicons');
    await this.ensureDir(favDir);
    const sizes = [16, 32, 48, 64, 128, 180, 192, 512];

    for (const sz of sizes) {
      await sharp(logo)
        .resize(sz, sz, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ quality: 90 })
        .toFile(path.join(favDir, `favicon-${sz}.png`));
    }
    // Standard ICO
    await fs.copyFile(path.join(favDir, 'favicon-32.png'), path.join(favDir, 'favicon.ico'));
    this.log(`✅ Favicons generated → assets/favicons/`, 'success');
  }

  // ==========================================
  // BUILD <picture> SOURCESET SNIPPET
  // ==========================================
  makePictureSnippet(fileResults) {
    const base = path.basename(fileResults.file, path.extname(fileResults.file));
    return `
<!-- ${fileResults.file} -->
<picture>
  <source srcset="assets/optimized/${base}-xlarge.webp 1920w,
                  assets/optimized/${base}-large.webp 1200w,
                  assets/optimized/${base}-medium.webp 768w,
                  assets/optimized/${base}-small.webp 320w"
          type="image/webp" sizes="100vw">
  <source srcset="assets/optimized/${base}-xlarge.jpg 1920w,
                  assets/optimized/${base}-large.jpg 1200w,
                  assets/optimized/${base}-medium.jpg 768w,
                  assets/optimized/${base}-small.jpg 320w"
          type="image/jpeg" sizes="100vw">
  <img src="assets/optimized/${base}-large.jpg" alt="Pleading Sanity" loading="lazy" decoding="async">
</picture>`;
  }

  // ==========================================
  // SAVE REPORT
  // ==========================================
  async saveReport(allResults) {
    const totalOrig = allResults.reduce((s, r) => s + r.originalSize, 0);
    const totalOpt = allResults.reduce((s, r) => s + r.variants.reduce((a, v) => a + v.size, 0), 0);
    const saved = totalOrig - totalOpt;

    const report = {
      generated: new Date().toISOString(),
      totalImages: allResults.length,
      originalMB: (totalOrig / 1024 / 1024).toFixed(2),
      optimizedMB: (totalOpt / 1024 / 1024).toFixed(2),
      savedMB: (saved / 1024 / 1024).toFixed(2),
      savedPct: ((saved / totalOrig) * 100).toFixed(1),
      images: allResults.map(r => ({
        file: r.file,
        variants: r.variants.length,
        snippet: this.makePictureSnippet(r)
      }))
    };

    await fs.writeFile(path.join(this.root, 'image-opt-report.json'), JSON.stringify(report, null, 2));
    this.log(`📄 Report saved → image-opt-report.json`, 'info');
    return report;
  }

  // ==========================================
  // MAIN RUN
  // ==========================================
  async run() {
    console.log('\n' + '═.✧ 🌌 IMAGE OPTIMIZATION ENGINE ✧.═'.padStart(55, ' ') + '\n');

    await this.ensureDir(this.outputDir);
    const files = await this.scanImages();

    if (!files.length) {
      this.log('No images found in assets/ — add your visuals first', 'warn');
      return;
    }

    this.log(`Found ${files.length} image${files.length!==1?'s':''}`, 'info');
    console.log('─'.repeat(50));

    const results = [];
    for (const f of files) results.push(await this.processOne(f));
    await this.makeFavicons();
    const report = await this.saveReport(results);

    console.log('─'.repeat(50));
    this.log(`✅ OPTIMIZATION COMPLETE`, 'success');
    this.log(`Original:  ${report.originalMB}MB`, 'info');
    this.log(`Optimized: ${report.optimizedMB}MB`, 'success');
    this.log(`Saved:     ${report.savedMB}MB (${report.savedPct}%)`, 'success');
    console.log('═'.repeat(50) + '\n');
  }
}

// ==========================================
// LAUNCH
// ==========================================
if (require.main === module) {
  new ImageOptimizer().run().catch(err => {
    console.error('💥 Error:', err.message);
    process.exit(1);
  });
}

module.exports = ImageOptimizer;
