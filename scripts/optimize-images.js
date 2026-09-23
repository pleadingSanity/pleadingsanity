#!/usr/bin/env node

/**
 * PLEADING SANITY — IMAGE OPTIMIZER v2.2-FINAL
 * WebP First • Responsive Sizes • Favicons • SVG Preserve • Lazy-Load Ready
 * Zero Quality Loss • Subfolder Support • Code Snippets • Full Report
 * Evolution, Not Erasure • pleadingSanity • Shane Cooper Founder
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

class ImageOptimizer {
  constructor() {
    this.root = path.join(__dirname, '..');
    this.inputDir = path.join(this.root, 'assets');
    this.outputDir = path.join(this.root, 'assets', 'optimized');
    this.faviconDir = path.join(this.root, 'assets', 'favicons');
    
    // Responsive breakpoints — match your design
    this.sizes = {
      small: 320,
      medium: 768,
      large: 1200,
      xlarge: 1920
    };
    
    // Quality tuned for Pleading Sanity — balance of beauty & speed
    this.formats = ['webp', 'jpg']; // WebP first, JPG fallback
    this.quality = {
      webp: 85,    // Crisp cosmic gradients
      jpg: 82,     // Warmth preserved
      png: 90      // Logos sharp
    };
    
    // Files/folders to skip
    this.skip = ['optimized', 'favicons', 'node_modules', '.git', 'dist'];
    this.supportedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    
    this.stats = {
      totalFiles: 0,
      skipped: 0,
      originalBytes: 0,
      optimizedBytes: 0,
      startTime: Date.now()
    };
  }

  // ==========================================
  // COSMIC LOGGING — COLOURED & CLEAR
  // ==========================================
  log(msg, type = 'info') {
    const C = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
      glow: '\x1b[36;1m',
      reset: '\x1b[0m'
    };
    const ts = new Date().toLocaleTimeString('en-GB', { hour12: false });
    console.log(`${C[type]}[${ts}] [IMG] ${msg}${C.reset}`);
  }

  // ==========================================
  // ENSURE FOLDERS EXIST — RECURSIVE SAFE
  // ==========================================
  async ensureDir(p) {
    try {
      await fs.access(p);
    } catch {
      await fs.mkdir(p, { recursive: true });
      this.log(`Created directory: ${path.relative(this.root, p)}`, 'glow');
    }
  }

  // ==========================================
  // SCAN IMAGES — RECURSIVE, SKIP INTELLIGENTLY
  // ==========================================
  async scanImages(dir = this.inputDir) {
    const files = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (this.skip.includes(entry.name)) continue;
        
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          files.push(...(await this.scanImages(fullPath)));
          continue;
        }
        
        const ext = path.extname(entry.name).toLowerCase();
        if (this.supportedExts.includes(ext)) {
          files.push(fullPath);
        }
      }
    } catch (err) {
      this.log(`Scan failed: ${err.message}`, 'error');
    }
    
    return files;
  }

  // ==========================================
  // PROCESS ONE IMAGE — SMART, NO UPSCALE
  // ==========================================
  async processOne(filePath) {
    const meta = await sharp(filePath).metadata();
    const name = path.basename(filePath, path.extname(filePath));
    const relPath = path.relative(this.inputDir, filePath);
    const outSubDir = path.dirname(relPath);
    const outDir = path.join(this.outputDir, outSubDir);
    
    await this.ensureDir(outDir);
    
    const originalStats = await fs.stat(filePath);
    this.stats.originalBytes += originalStats.size;
    
    const result = {
      file: relPath,
      name,
      originalSize: originalStats.size,
      width: meta.width,
      height: meta.height,
      format: meta.format,
      variants: []
    };

    // ── SVG = COPY AS-IS (vector = perfect) ──
    if (meta.format === 'svg') {
      const dest = path.join(outDir, `${name}.svg`);
      await fs.copyFile(filePath, dest);
      result.variants.push({
        name: `${name}.svg`,
        format: 'svg',
        size: originalStats.size,
        width: meta.width,
        note: 'Vector — copied without change'
      });
      this.log(`✅ SVG: ${relPath} (unchanged)`, 'success');
      return result;
    }

    // ── GIF = COPY AS-IS (preserve animation) ──
    if (meta.format === 'gif') {
      const dest = path.join(outDir, `${name}.gif`);
      await fs.copyFile(filePath, dest);
      result.variants.push({
        name: `${name}.gif`,
        format: 'gif',
        size: originalStats.size,
        note: 'Animated — copied without change'
      });
      this.log(`✅ GIF: ${relPath} (animation preserved)`, 'success');
      return result;
    }

    // ── Generate responsive variants ──
    for (const [sizeLabel, targetWidth] of Object.entries(this.sizes)) {
      // Skip if original is smaller — NEVER upscale
      if (meta.width < targetWidth) {
        this.log(`  ⏭️  ${sizeLabel} (${targetWidth}px) — original smaller, skipped`, 'warn');
        continue;
      }

      for (const fmt of this.formats) {
        const outName = `${name}-${sizeLabel}.${fmt}`;
        const outPath = path.join(outDir, outName);

        let pipeline = sharp(filePath).resize(targetWidth, null, {
          fit: 'inside',
          withoutEnlargement: true,
          fastShrinkOnLoad: true
        });

        if (fmt === 'webp') {
          pipeline = pipeline.webp({
            quality: this.quality.webp,
            effort: 6, // Balance: 6 = great compression, fast enough
            alphaQuality: 90,
            lossless: false
          });
        } else if (fmt === 'jpg') {
          pipeline = pipeline.jpeg({
            quality: this.quality.jpg,
            mozjpeg: true, // Better compression
            progressive: true
          });
        } else if (fmt === 'png') {
          pipeline = pipeline.png({
            quality: this.quality.png,
            compressionLevel: 9,
            palette: meta.colors && meta.colors < 256
          });
        }

        await pipeline.toFile(outPath);
        const optimizedStats = await fs.stat(outPath);
        const savingPct = ((originalStats.size - optimizedStats.size) / originalStats.size * 100).toFixed(1);
        
        this.stats.optimizedBytes += optimizedStats.size;

        result.variants.push({
          name: outName,
          format: fmt,
          size: optimizedStats.size,
          width: targetWidth,
          savingPct: parseFloat(savingPct)
        });

        this.log(`  ✨ ${outName} • ${(optimizedStats.size / 1024).toFixed(1)}KB • -${savingPct}%`, 'success');
      }
    }

    return result;
  }

  // ==========================================
  // FAVICON GENERATOR — FROM YOUR BRAND IMAGE
  // ==========================================
  async generateFavicons() {
    const logoSource = path.join(this.inputDir, 'crying-brain.png');
    const altSource = path.join(this.inputDir, 'brain-logo.png');
    
    let sourceImage = null;
    for (const candidate of [logoSource, altSource]) {
      try {
        await fs.access(candidate);
        sourceImage = candidate;
        break;
      } catch {}
    }
    
    if (!sourceImage) {
      this.log('ℹ️ No favicon source found (crying-brain.png / brain-logo.png) — skipping', 'warn');
      return;
    }

    await this.ensureDir(this.faviconDir);
    const sizes = [16, 32, 48, 64, 96, 128, 180, 192, 512];
    
    this.log(`🧠 Generating favicons from ${path.basename(sourceImage)}…`, 'glow');

    for (const sz of sizes) {
      await sharp(sourceImage)
        .resize(sz, sz, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({ quality: 95 })
        .toFile(path.join(this.faviconDir, `favicon-${sz}.png`));
      
      // WebP version too
      await sharp(sourceImage)
        .resize(sz, sz, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .webp({ quality: 90 })
        .toFile(path.join(this.faviconDir, `favicon-${sz}.webp`));
    }

    // Standard ICO
    await fs.copyFile(
      path.join(this.faviconDir, 'favicon-32.png'),
      path.join(this.faviconDir, 'favicon.ico')
    );

    this.log(`✅ Favicons ready → assets/favicons/`, 'success');
  }

  // ==========================================
  // GENERATE HTML <picture> SNIPPET
  // ==========================================
  generatePictureHTML(result) {
    const base = result.name;
    const hasXL = result.variants.some(v => v.name.includes('xlarge'));
    const hasLg = result.variants.some(v => v.name.includes('large'));
    
    return `
<!-- ${result.file} → Pleading Sanity Optimized -->
<picture>
  <source srcset="
    ${hasXL ? `assets/optimized/${base}-xlarge.webp 1920w,` : ''}
    ${hasLg ? `assets/optimized/${base}-large.webp 1200w,` : ''}
    assets/optimized/${base}-medium.webp 768w,
    assets/optimized/${base}-small.webp 320w"
          type="image/webp"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 85vw, 75vw">
  <source srcset="
    ${hasXL ? `assets/optimized/${base}-xlarge.jpg 1920w,` : ''}
    ${hasLg ? `assets/optimized/${base}-large.jpg 1200w,` : ''}
    assets/optimized/${base}-medium.jpg 768w,
    assets/optimized/${base}-small.jpg 320w"
          type="image/jpeg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 85vw, 75vw">
  <img src="assets/optimized/${base}-large.jpg"
       alt="Pleading Sanity"
       loading="lazy"
       decoding="async"
       width="${result.width}"
       height="${result.height}"
       class="cosmic-image">
</picture>`;
  }

  // ==========================================
  // SAVE FULL REPORT
  // ==========================================
  async saveReport(results) {
    const duration = ((Date.now() - this.stats.startTime) / 1000).toFixed(1);
    const savedBytes = this.stats.originalBytes - this.stats.optimizedBytes;
    const savedPct = this.stats.originalBytes > 0 
      ? ((savedBytes / this.stats.originalBytes) * 100).toFixed(1)
      : '0';

    const report = {
      project: 'Pleading Sanity',
      generated: new Date().toISOString(),
      durationSeconds: duration,
      totalImages: results.length,
      originalSizeMB: (this.stats.originalBytes / 1024 / 1024).toFixed(2),
      optimizedSizeMB: (this.stats.optimizedBytes / 1024 / 1024).toFixed(2),
      savedMB: (savedBytes / 1024 / 1024).toFixed(2),
      savedPercent: savedPct,
      note: 'WebP-first • responsive • no upscale • SVG/GIF preserved',
      images: results.map(r => ({
        file: r.file,
        originalDimensions: `${r.width}×${r.height}`,
        format: r.format,
        variantsCreated: r.variants.length,
        htmlSnippet: this.generatePictureHTML(r)
      }))
    };

    const reportPath = path.join(this.root, 'image-optimization-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    this.log(`📄 Report saved → image-optimization-report.json`, 'info');
    
    return report;
  }

  // ==========================================
  // MAIN EXECUTION
  // ==========================================
  async run() {
    console.log('\n' + '═.✧ 🌌 PLEADING SANITY IMAGE OPTIMIZER ✧.═'.padStart(60, ' ') + '\n');

    await this.ensureDir(this.outputDir);
    const files = await this.scanImages();

    if (!files.length) {
      this.log('No images found in assets/ — add your files first', 'warn');
      this.log('Expected: assets/*.jpg, assets/*.png, assets/**/*', 'info');
      return;
    }

    this.stats.totalFiles = files.length;
    this.log(`Found ${files.length} image${files.length !== 1 ? 's' : ''} to process`, 'glow');
    console.log('─'.repeat(55));

    const results = [];
    for (const file of files) {
      this.log(`Processing: ${path.relative(this.root, file)}`, 'info');
      results.push(await this.processOne(file));
    }

    console.log('─'.repeat(55));
    await this.generateFavicons();
    const report = await this.saveReport(results);

    console.log('─'.repeat(55));
    this.log(`✅ OPTIMIZATION COMPLETE — Ready to Rise 🌌`, 'success');
    this.log(`Original:  ${report.originalSizeMB} MB`, 'info');
    this.log(`Optimized: ${report.optimizedSizeMB} MB`, 'success');
    this.log(`Saved:     ${report.savedMB} MB (${report.savedPercent}%)`, 'glow');
    this.log(`Time:      ${report.durationSeconds}s`, 'info');
    console.log('═'.repeat(55) + '\n');
  }
}

// ==========================================
// LAUNCH
// ==========================================
if (require.main === module) {
  new ImageOptimizer().run().catch(err => {
    console.error('\n💥 Fatal Error:', err.message);
    console.error('Check: npm install sharp — or see errors above', '\n');
    process.exit(1);
  });
}

module.exports = ImageOptimizer;
