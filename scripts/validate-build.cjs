const fs = require('fs');
const path = require('path');
console.log('Sanctuary Pre-Build Integrity Guard running...');
const arronPath = path.join(__dirname, '../arron-knowledge.json');
if (!fs.existsSync(arronPath)) { console.error('FATAL: arron-knowledge.json missing'); process.exit(1); }
const content = fs.readFileSync(arronPath, 'utf8');
if (content.includes('PLACEHOLDER') || content.trim().length < 100) { console.error('FATAL: arron-knowledge.json contains placeholder or is truncated'); process.exit(1); }
try { JSON.parse(content); } catch (e) { console.error('FATAL: arron-knowledge.json invalid JSON:', e.message); process.exit(1); }
const { execSync } = require('child_process');
console.log('arron-knowledge.json validated.');
console.log('Build safety checks passed.');
