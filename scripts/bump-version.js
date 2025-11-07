#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const newVersion = process.argv[2];

if (!newVersion || !/^\d+\.\d+\.\d+[a-z]?$/.test(newVersion)) {
  console.error('❌ Morate navesti validnu verziju (npr. 1.2.3 ili 1.2.3b)');
  console.log('Usage: npm run version-bump 1.2.3');
  process.exit(1);
}

console.log(`🔄 Menjam verziju na ${newVersion}...`);

// 1. Update package.json
const cwd = process.cwd();
const packageJsonPath = path.join(cwd, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('✅ package.json updated');

// 2. Update tauri.conf.json
const tauriConfPath = path.join(cwd, 'src-tauri', 'tauri.conf.json');
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
tauriConf.version = newVersion;
fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');
console.log('✅ tauri.conf.json updated');

// 3. Update customUpdateService.js
const updateServicePath = path.join(cwd, 'src', 'lib', 'services', 'customUpdateService.js');
let updateServiceContent = fs.readFileSync(updateServicePath, 'utf8');
updateServiceContent = updateServiceContent.replace(
  /const CURRENT_VERSION = ['"][\d.]+[a-z]?['"]/,
  `const CURRENT_VERSION = '${newVersion}'`
);
fs.writeFileSync(updateServicePath, updateServiceContent);
console.log('✅ customUpdateService.js updated');

console.log(`\n🎉 Verzija je promenjena na ${newVersion}!`);
console.log('\n📋 Sledeći koraci:');
console.log('1. git add .');
console.log(`2. git commit -m "chore: bump version to ${newVersion}"`);
console.log('3. npm run tauri:build');
console.log(`4. git tag v${newVersion}`);
console.log(`5. git push origin main --tags`);
console.log('\n✨ GitHub Actions će automatski kreirati release!');

