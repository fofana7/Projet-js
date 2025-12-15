#!/usr/bin/env node

/**
 * QUICK VALIDATION SCRIPT
 * Vérifie que le projet est propre et cohérent
 * Usage: node validate-project.js
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = __dirname;
const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(color, text) {
  console.log(`${COLORS[color]}${text}${COLORS.reset}`);
}

function checkFileExists(filepath) {
  return fs.existsSync(path.join(PROJECT_ROOT, filepath));
}

function checkFileDoesNotExist(filepath) {
  return !fs.existsSync(path.join(PROJECT_ROOT, filepath));
}

function findFiles(pattern) {
  const pattern_regex = new RegExp(pattern);
  const results = [];

  function walk(dir) {
    const items = fs.readdirSync(dir);
    items.forEach((item) => {
      const fullPath = path.join(dir, item);
      const relPath = path.relative(PROJECT_ROOT, fullPath);
      if (pattern_regex.test(relPath)) results.push(relPath);
      if (fs.statSync(fullPath).isDirectory()) walk(fullPath);
    });
  }

  walk(PROJECT_ROOT);
  return results;
}

console.log('\n' + '='.repeat(60));
log('blue', '🔍 VALIDATION DU PROJET - Audit de Nettoyage');
console.log('='.repeat(60) + '\n');

// Check 1: Doublons supprimés
log('blue', '1️⃣  Vérification des doublons supprimés:');
const duplicates = [
  'messages.html',
  'profil_utilisateur.html',
  'chat.html',
  'message.html', // à la racine
];

let duplicateCount = 0;
duplicates.forEach((file) => {
  const exists = checkFileExists(file);
  if (exists && file === 'message.html') {
    log('yellow', `   ⚠️  ${file} existe (à la racine - peut être OK si pas dans /)`);
  } else if (exists) {
    log('red', `   ❌ ${file} existe encore (devrait être supprimé)`);
    duplicateCount++;
  } else {
    log('green', `   ✅ ${file} supprimé`);
  }
});

// Check 2: Fichiers clés existants
log('blue', '\n2️⃣  Vérification des fichiers clés:');
const requiredFiles = [
  'index.html',
  'login.html',
  'profil.html',
  'ami.html',
  'constellation.html',
  'frontend/index.html',
  'frontend/pages/message.html',
  'backend/server.js',
];

let fileCount = 0;
requiredFiles.forEach((file) => {
  if (checkFileExists(file)) {
    log('green', `   ✅ ${file}`);
    fileCount++;
  } else {
    log('red', `   ❌ ${file} MANQUANT`);
  }
});

// Check 3: Documentation
log('blue', '\n3️⃣  Vérification de la documentation:');
const docFiles = [
  'README.md',
  'ARCHITECTURE.md',
  'IMPROVEMENTS.md',
  'STRUCTURE.md',
  'AUDIT_FINAL.md',
];

let docCount = 0;
docFiles.forEach((file) => {
  if (checkFileExists(file)) {
    log('green', `   ✅ ${file}`);
    docCount++;
  } else {
    log('yellow', `   ⚠️  ${file} manquant (recommandé)`);
  }
});

// Check 4: Backend structure
log('blue', '\n4️⃣  Vérification du backend:');
const backendDirs = [
  'backend/routes',
  'backend/controllers',
  'backend/middleware',
  'backend/config',
];

let backendOK = true;
backendDirs.forEach((dir) => {
  if (checkFileExists(dir)) {
    log('green', `   ✅ ${dir}/`);
  } else {
    log('red', `   ❌ ${dir}/ MANQUANT`);
    backendOK = false;
  }
});

// Check 5: Package.json
log('blue', '\n5️⃣  Vérification des fichiers de configuration:');
const configFiles = [
  'backend/package.json',
  'backend/config/db.js',
  '.gitignore',
];

let configCount = 0;
configFiles.forEach((file) => {
  if (checkFileExists(file)) {
    log('green', `   ✅ ${file}`);
    configCount++;
  } else {
    log('yellow', `   ⚠️  ${file}`);
  }
});

// Check 6: Compter les fichiers HTML
log('blue', '\n6️⃣  Comptage des fichiers HTML:');
const htmlFiles = findFiles('.*\\.html$');
log('green', `   ✅ ${htmlFiles.length} fichiers HTML trouvés:`);
htmlFiles.forEach((file) => {
  log('reset', `      - ${file}`);
});

// Summary
console.log('\n' + '='.repeat(60));
log('blue', '📊 RÉSUMÉ:');
console.log('='.repeat(60));

const checks = [
  [`Doublons supprimés`, duplicateCount === 0],
  [`Fichiers clés présents`, fileCount === requiredFiles.length],
  [`Documentation`, docCount >= 4],
  [`Backend structure`, backendOK],
  [`Fichiers HTML`, htmlFiles.length === 9],
];

let passCount = 0;
checks.forEach(([name, passed]) => {
  if (passed) {
    log('green', `✅ ${name}`);
    passCount++;
  } else {
    log('red', `❌ ${name}`);
  }
});

console.log('\n' + '='.repeat(60));
if (passCount === checks.length) {
  log('green', `\n🎉 SUCCÈS! Votre projet est propre et bien organisé.\n`);
} else {
  log('yellow', `\n⚠️  Certaines vérifications ont échoué. Vérifiez ci-dessus.\n`);
}
console.log('='.repeat(60) + '\n');
