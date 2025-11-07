#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const newVersion = process.argv[2];

if (!newVersion || !/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error('❌ Morate navesti validnu verziju (npr. 1.2.3)');
  console.log('Usage: npm run quick-release 1.2.3');
  process.exit(1);
}

console.log(`🚀 Brzi release verzije ${newVersion}...\n`);

try {
  // 1. Bump version
  console.log('1️⃣ Menjam verziju...');
  execSync(`node scripts/bump-version.js ${newVersion}`, { stdio: 'inherit' });

  // 2. Git add
  console.log('\n2️⃣ Git add...');
  execSync('git add .', { stdio: 'inherit' });

  // 3. Git commit
  console.log('\n3️⃣ Git commit...');
  execSync(`git commit -m "chore: bump version to ${newVersion}"`, { stdio: 'inherit' });

  // 4. Build
  console.log('\n4️⃣ Building aplikaciju...');
  execSync('npm run tauri:build', { stdio: 'inherit' });

  // 5. Git tag
  console.log('\n5️⃣ Kreiram tag...');
  execSync(`git tag v${newVersion}`, { stdio: 'inherit' });

  // 6. Git push
  console.log('\n6️⃣ Pushing na GitHub...');
  execSync('git push origin main --tags', { stdio: 'inherit' });

  console.log('\n🎉 Sve gotovo!');
  console.log(`\n✨ GitHub Actions će automatski kreirati release za v${newVersion}`);
  console.log(`🌐 Proveri: https://github.com/screenfun012/magacin-mr-engines/actions`);
} catch (error) {
  console.error('\n❌ Greška:', error.message);
  process.exit(1);
}

