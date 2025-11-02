#!/usr/bin/env node

/**
 * Pleading Sanity - Image Optimization Script
 * Optimizes images for web performance and generates responsive variants
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

class ImageOptimizer {
  constructor() {
    this.inputDir = path.join(__dirname, '..', 'assets', 'images');
    this.outputDir = path.join(__dirname, '..', 'assets', 'optimized');
    this.config = {
      quality: 85,
      progressive: true,
      responsive: {
        small: 320,
        medium: 768,
        large: 1200,
        xlarge: 1920
      },
      formats: ['webp', 'jpg', 'png']
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[IMG-OPT] ${message}${colors.reset}`);
  }

  async ensureDirectory(dirPath) {
    try {
      await fs.access(dirPath);
    } catch (error) {
      await fs.mkdir(dirPath, { recursive: true });
      this.log(`Created directory: ${dirPath}`, 'success');
    }
  }

  async getImageFiles(dir) {
    const files = [];
    const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.getImageFiles(fullPath);
          files.push(...subFiles);
        } else if (extensions.some(ext => entry.name.toLowerCase().endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      this.log(`Error reading directory ${dir}: ${error.message}`, 'error');
    }
    
    return files;
  }

  async optimizeImage(inputPath, outputDir, filename) {
    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();
      const baseName = path.parse(filename).name;
      
      this.log(`Processing: ${filename} (${metadata.width}x${metadata.height})`, 'info');

      // Ensure output directory exists
      await this.ensureDirectory(outputDir);

      const results = {
        original: {
          path: inputPath,
          size: (await fs.stat(inputPath)).size,
          width: metadata.width,
          height: metadata.height
        },
        optimized: []
      };

      // Generate responsive variants for each format
      for (const format of this.config.formats) {
        // Skip if original is SVG (vector graphics don't need optimization)
        if (metadata.format === 'svg' && format !== 'svg') continue;

        for (const [sizeName, width] of Object.entries(this.config.responsive)) {
          // Skip if original is smaller than target width
          if (metadata.width < width) continue;

          const outputFilename = `${baseName}-${sizeName}.${format}`;
          const outputPath = path.join(outputDir, outputFilename);

          let processor = image.clone().resize(width, null, {
            withoutEnlargement: true,
            fit: 'inside'
          });

          // Apply format-specific optimizations
          switch (format) {
            case 'webp':
              processor = processor.webp({ 
                quality: this.config.quality,
                effort: 6
              });
              break;
            case 'jpg':
            case 'jpeg':
              processor = processor.jpeg({ 
                quality: this.config.quality,
                progressive: this.config.progressive,
                mozjpeg: true
              });
              break;
            case 'png':
              processor = processor.png({ 
                quality: this.config.quality,
                compressionLevel: 9,
                progressive: this.config.progressive
              });
              break;
          }

          await processor.toFile(outputPath);
          
          const outputStats = await fs.stat(outputPath);
          const outputMeta = await sharp(outputPath).metadata();
          
          results.optimized.push({
            path: outputPath,
            filename: outputFilename,
            format: format,
            size: outputStats.size,
            width: outputMeta.width,
            height: outputMeta.height,
            compression: ((results.original.size - outputStats.size) / results.original.size * 100).toFixed(1)
          });

          this.log(`  → ${outputFilename} (${format.toUpperCase()}, ${outputMeta.width}x${outputMeta.height}, ${(outputStats.size / 1024).toFixed(1)}KB, ${results.optimized[results.optimized.length - 1].compression}% smaller)`, 'success');
        }
      }

      return results;
    } catch (error) {
      this.log(`Failed to optimize ${filename}: ${error.message}`, 'error');
      return null;
    }
  }

  async generateFavicons(inputPath) {
    try {
      const faviconDir = path.join(__dirname, '..', 'assets', 'favicons');
      await this.ensureDirectory(faviconDir);

      const sizes = [16, 32, 48, 64, 128, 180, 192, 512];
      const image = sharp(inputPath);
      
      this.log('Generating favicon variants...', 'info');

      for (const size of sizes) {
        const outputPath = path.join(faviconDir, `favicon-${size}x${size}.png`);
        
        await image
          .clone()
          .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png({ quality: 90 })
          .toFile(outputPath);
        
        this.log(`  → favicon-${size}x${size}.png`, 'success');
      }

      // Generate ICO file (requires imagemagick or similar)
      // For now, we'll use the 32x32 PNG as favicon.ico
      const ico32Path = path.join(faviconDir, 'favicon-32x32.png');
      const icoPath = path.join(faviconDir, 'favicon.ico');
      await fs.copyFile(ico32Path, icoPath);
      
      this.log('Favicon generation complete', 'success');
      return true;
    } catch (error) {
      this.log(`Favicon generation failed: ${error.message}`, 'error');
      return false;
    }
  }

  async generateSrcset(results) {
    // Generate HTML srcset attributes for responsive images
    const srcsets = {};
    
    for (const optimized of results.optimized) {
      const format = optimized.format;
      if (!srcsets[format]) srcsets[format] = [];
      
      srcsets[format].push(`assets/optimized/${optimized.filename} ${optimized.width}w`);
    }

    return Object.entries(srcsets).map(([format, sources]) => ({
      format,
      srcset: sources.join(', ')
    }));
  }

  async createOptimizationReport(allResults) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalImages: allResults.length,
        totalOriginalSize: 0,
        totalOptimizedSize: 0,
        totalSavings: 0,
        averageCompression: 0
      },
      images: allResults.filter(r => r !== null)
    };

    // Calculate summary statistics
    for (const result of report.images) {
      report.summary.totalOriginalSize += result.original.size;
      
      for (const opt of result.optimized) {
        report.summary.totalOptimizedSize += opt.size;
      }
    }

    report.summary.totalSavings = report.summary.totalOriginalSize - report.summary.totalOptimizedSize;
    report.summary.averageCompression = (report.summary.totalSavings / report.summary.totalOriginalSize * 100);

    const reportPath = path.join(__dirname, '..', 'image-optimization-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`Optimization report saved to: ${reportPath}`, 'info');
    return report;
  }

  async run() {
    this.log('Starting Pleading Sanity Image Optimization...', 'info');
    this.log('===============================================', 'info');

    try {
      // Ensure input and output directories exist
      await this.ensureDirectory(this.inputDir);
      await this.ensureDirectory(this.outputDir);

      // Get all image files
      const imageFiles = await this.getImageFiles(this.inputDir);
      
      if (imageFiles.length === 0) {
        this.log('No images found to optimize', 'warning');
        return;
      }

      this.log(`Found ${imageFiles.length} images to optimize`, 'info');

      // Process each image
      const results = [];
      for (const imagePath of imageFiles) {
        const relativePath = path.relative(this.inputDir, imagePath);
        const filename = path.basename(imagePath);
        const outputSubDir = path.join(this.outputDir, path.dirname(relativePath));
        
        const result = await this.optimizeImage(imagePath, outputSubDir, filename);
        if (result) {
          results.push(result);
        }
      }

      // Generate favicons from logo if available
      const logoPath = path.join(this.inputDir, 'brain-logo.png');
      try {
        await fs.access(logoPath);
        await this.generateFavicons(logoPath);
      } catch (error) {
        this.log('No brain-logo.png found for favicon generation', 'warning');
      }

      // Generate optimization report
      const report = await this.createOptimizationReport(results);

      // Summary
      this.log('===============================================', 'info');
      this.log(`Optimization Complete!`, 'success');
      this.log(`  Images processed: ${report.summary.totalImages}`, 'info');
      this.log(`  Original size: ${(report.summary.totalOriginalSize / 1024 / 1024).toFixed(2)}MB`, 'info');
      this.log(`  Optimized size: ${(report.summary.totalOptimizedSize / 1024 / 1024).toFixed(2)}MB`, 'info');
      this.log(`  Total savings: ${(report.summary.totalSavings / 1024 / 1024).toFixed(2)}MB (${report.summary.averageCompression.toFixed(1)}%)`, 'success');

    } catch (error) {
      this.log(`Image optimization failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Run optimization if called directly
if (require.main === module) {
  const optimizer = new ImageOptimizer();
  optimizer.run().catch(error => {
    console.error('Image optimization failed:', error);
    process.exit(1);
  });
}

module.exports = ImageOptimizer;