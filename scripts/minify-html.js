#!/usr/bin/env node

/**
 * Pleading Sanity - HTML Minification Script
 * Minifies HTML files while preserving functionality and inline scripts
 */

const fs = require('fs').promises;
const path = require('path');
const { minify } = require('html-minifier-terser');

class HTMLMinifier {
  constructor() {
    this.sourceDir = path.join(__dirname, '..');
    this.outputDir = path.join(__dirname, '..', 'dist');
    this.options = {
      collapseWhitespace: true,
      collapseInlineTagWhitespace: false,
      conservativeCollapse: true,
      removeComments: true,
      removeCommentsFromCDATA: true,
      removeCDATASectionsFromCDATA: true,
      removeEmptyAttributes: true,
      removeEmptyElements: false, // Keep for accessibility
      removeOptionalTags: false,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true,
      minifyCSS: {
        level: 2,
        compatibility: 'ie8'
      },
      minifyJS: {
        compress: {
          drop_console: false, // Keep console for debugging
          drop_debugger: false,
          pure_funcs: ['console.log'] // Remove console.log calls only
        },
        mangle: {
          reserved: ['Arron', 'ChatGPT', 'localStorage'] // Preserve important globals
        }
      },
      caseSensitive: false,
      keepClosingSlash: true,
      processConditionalComments: true,
      processScripts: ['text/html'],
      ignoreCustomFragments: [
        /<%[\s\S]*?%>/,
        /<\?[\s\S]*?\?>/,
        /{{[\s\S]*?}}/  // Preserve template literals
      ]
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
    console.log(`${colors[type]}[HTML-MIN] ${message}${colors.reset}`);
  }

  async ensureDirectory(dirPath) {
    try {
      await fs.access(dirPath);
    } catch (error) {
      await fs.mkdir(dirPath, { recursive: true });
      this.log(`Created directory: ${dirPath}`, 'success');
    }
  }

  async getHTMLFiles(dir = this.sourceDir, baseDir = this.sourceDir) {
    const files = [];
    const skipDirs = ['node_modules', 'dist', '.git', '.next', 'coverage'];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);
        
        if (entry.isDirectory() && !skipDirs.includes(entry.name)) {
          const subFiles = await this.getHTMLFiles(fullPath, baseDir);
          files.push(...subFiles);
        } else if (entry.name.endsWith('.html')) {
          files.push({
            input: fullPath,
            output: path.join(this.outputDir, relativePath),
            relative: relativePath
          });
        }
      }
    } catch (error) {
      this.log(`Error reading directory ${dir}: ${error.message}`, 'error');
    }
    
    return files;
  }

  async preProcessHTML(content, filePath) {
    // Pre-process HTML to handle special cases
    let processed = content;
    
    // Preserve ChatGPT widget functionality
    const chatGPTRegex = /<script[^>]*>[\s\S]*?chatGPT[\s\S]*?<\/script>/gi;
    const chatGPTScripts = processed.match(chatGPTRegex) || [];
    const chatGPTPlaceholders = [];
    
    chatGPTScripts.forEach((script, index) => {
      const placeholder = `<!-- CHATGPT_SCRIPT_${index} -->`;
      chatGPTPlaceholders.push({ placeholder, script });
      processed = processed.replace(script, placeholder);
    });
    
    // Preserve localStorage operations
    const localStorageRegex = /localStorage\.[^;]+;?/g;
    const localStorageOps = processed.match(localStorageRegex) || [];
    const localStoragePlaceholders = [];
    
    localStorageOps.forEach((op, index) => {
      const placeholder = `LOCALSTORAGE_OP_${index}`;
      localStoragePlaceholders.push({ placeholder, op });
      processed = processed.replace(op, placeholder);
    });
    
    return {
      content: processed,
      chatGPTPlaceholders,
      localStoragePlaceholders
    };
  }

  async postProcessHTML(content, placeholders) {
    let processed = content;
    
    // Restore ChatGPT scripts
    placeholders.chatGPTPlaceholders.forEach(({ placeholder, script }) => {
      processed = processed.replace(placeholder, script);
    });
    
    // Restore localStorage operations
    placeholders.localStoragePlaceholders.forEach(({ placeholder, op }) => {
      processed = processed.replace(placeholder, op);
    });
    
    return processed;
  }

  async minifyFile(file) {
    try {
      this.log(`Processing: ${file.relative}`, 'info');
      
      const originalContent = await fs.readFile(file.input, 'utf8');
      const originalSize = Buffer.byteLength(originalContent, 'utf8');
      
      // Pre-process to preserve critical functionality
      const { content: preProcessed, ...placeholders } = await this.preProcessHTML(originalContent, file.input);
      
      // Minify the HTML
      const minified = await minify(preProcessed, this.options);
      
      // Post-process to restore preserved content
      const finalContent = await this.postProcessHTML(minified, placeholders);
      
      // Ensure output directory exists
      const outputDir = path.dirname(file.output);
      await this.ensureDirectory(outputDir);
      
      // Write minified file
      await fs.writeFile(file.output, finalContent, 'utf8');
      
      const finalSize = Buffer.byteLength(finalContent, 'utf8');
      const savings = ((originalSize - finalSize) / originalSize * 100).toFixed(1);
      
      this.log(`  → Saved ${savings}% (${originalSize} → ${finalSize} bytes)`, 'success');
      
      return {
        file: file.relative,
        originalSize,
        minifiedSize: finalSize,
        savings: parseFloat(savings),
        status: 'success'
      };
      
    } catch (error) {
      this.log(`Failed to minify ${file.relative}: ${error.message}`, 'error');
      
      // Copy original file if minification fails
      try {
        const outputDir = path.dirname(file.output);
        await this.ensureDirectory(outputDir);
        await fs.copyFile(file.input, file.output);
        this.log(`  → Copied original file as fallback`, 'warning');
      } catch (copyError) {
        this.log(`  → Failed to copy original: ${copyError.message}`, 'error');
      }
      
      return {
        file: file.relative,
        originalSize: 0,
        minifiedSize: 0,
        savings: 0,
        status: 'failed',
        error: error.message
      };
    }
  }

  async copyStaticAssets() {
    const staticFiles = [
      'manifest.json',
      'sw.js',
      'robots.txt',
      'sitemap.xml',
      '_redirects',
      'netlify.toml'
    ];

    for (const file of staticFiles) {
      const sourcePath = path.join(this.sourceDir, file);
      const destPath = path.join(this.outputDir, file);
      
      try {
        await fs.access(sourcePath);
        await fs.copyFile(sourcePath, destPath);
        this.log(`Copied: ${file}`, 'info');
      } catch (error) {
        // File doesn't exist, skip silently
      }
    }

    // Copy entire assets directory
    const assetsSource = path.join(this.sourceDir, 'assets');
    const assetsDest = path.join(this.outputDir, 'assets');
    
    try {
      await fs.access(assetsSource);
      await this.copyDirectory(assetsSource, assetsDest);
      this.log('Copied: assets directory', 'info');
    } catch (error) {
      this.log('No assets directory found', 'warning');
    }

    // Copy CSS and JS files
    const webAssets = [
      'styles.css',
      'animations.css', 
      'accessibility.css',
      'script.js',
      'error-handler.js',
      'cosmic-bg.js',
      'video-feed.js'
    ];

    for (const file of webAssets) {
      const sourcePath = path.join(this.sourceDir, file);
      const destPath = path.join(this.outputDir, file);
      
      try {
        await fs.access(sourcePath);
        await fs.copyFile(sourcePath, destPath);
        this.log(`Copied: ${file}`, 'info');
      } catch (error) {
        // File doesn't exist, skip
      }
    }
  }

  async copyDirectory(src, dest) {
    await this.ensureDirectory(dest);
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  async generateReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: results.length,
        successfulFiles: results.filter(r => r.status === 'success').length,
        failedFiles: results.filter(r => r.status === 'failed').length,
        totalOriginalSize: results.reduce((sum, r) => sum + r.originalSize, 0),
        totalMinifiedSize: results.reduce((sum, r) => sum + r.minifiedSize, 0),
        totalSavings: 0,
        averageSavings: 0
      },
      files: results
    };

    report.summary.totalSavings = report.summary.totalOriginalSize - report.summary.totalMinifiedSize;
    report.summary.averageSavings = report.summary.totalSavings / report.summary.totalOriginalSize * 100;

    const reportPath = path.join(this.outputDir, 'minification-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`Minification report saved to: ${reportPath}`, 'info');
    return report;
  }

  async run() {
    this.log('Starting Pleading Sanity HTML Minification...', 'info');
    this.log('==============================================', 'info');

    try {
      // Ensure output directory exists
      await this.ensureDirectory(this.outputDir);

      // Get all HTML files
      const htmlFiles = await this.getHTMLFiles();
      
      if (htmlFiles.length === 0) {
        this.log('No HTML files found to minify', 'warning');
        return;
      }

      this.log(`Found ${htmlFiles.length} HTML files to minify`, 'info');

      // Process each HTML file
      const results = [];
      for (const file of htmlFiles) {
        const result = await this.minifyFile(file);
        results.push(result);
      }

      // Copy static assets
      this.log('Copying static assets...', 'info');
      await this.copyStaticAssets();

      // Generate report
      const report = await this.generateReport(results);

      // Summary
      this.log('==============================================', 'info');
      this.log(`HTML Minification Complete!`, 'success');
      this.log(`  Files processed: ${report.summary.totalFiles}`, 'info');
      this.log(`  Successful: ${report.summary.successfulFiles}`, 'success');
      this.log(`  Failed: ${report.summary.failedFiles}`, report.summary.failedFiles > 0 ? 'error' : 'info');
      this.log(`  Original size: ${(report.summary.totalOriginalSize / 1024).toFixed(1)}KB`, 'info');
      this.log(`  Minified size: ${(report.summary.totalMinifiedSize / 1024).toFixed(1)}KB`, 'info');
      this.log(`  Total savings: ${(report.summary.totalSavings / 1024).toFixed(1)}KB (${report.summary.averageSavings.toFixed(1)}%)`, 'success');

    } catch (error) {
      this.log(`HTML minification failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Run minification if called directly
if (require.main === module) {
  const minifier = new HTMLMinifier();
  minifier.run().catch(error => {
    console.error('HTML minification failed:', error);
    process.exit(1);
  });
}

module.exports = HTMLMinifier;