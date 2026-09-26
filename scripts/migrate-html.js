/* ═══════════════════════════════════════════════════════════════════════
   Migration automatique des HTML : CDN Tailwind → CSS buildé + env.js
   À exécuter UNE FOIS : node scripts/migrate-html.js
   ═══════════════════════════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const htmlFiles = fs.readdirSync(root)
  .filter(f => f.endsWith('.html') && fs.statSync(path.join(root, f)).isFile());

console.log('\n📄 ' + htmlFiles.length + ' fichier(s) HTML à examiner\n');

let modified = 0;

htmlFiles.forEach(file => {
  const full = path.join(root, file);
  let html = fs.readFileSync(full, 'utf8');
  const original = html;

  // 1. Retirer le CDN Tailwind
  html = html.replace(
    /<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>\s*/g,
    ''
  );

  // 2. Retirer la config Tailwind inline
  html = html.replace(
    /<script>tailwind\.config=\{darkMode:'class'\}<\/script>\s*/g,
    ''
  );

  // 3. Ajouter le link vers le CSS buildé si pas déjà présent
  if(!html.includes('assets/tailwind.css')){
    html = html.replace(
      /(<link rel="stylesheet" href="assets\/style\.css">)/,
      '<link rel="stylesheet" href="assets/tailwind.css">\n$1'
    );
  }

  // 4. Ajouter env.js avant db.js si pas déjà présent
  if(!html.includes('assets/env.js') && html.includes('assets/db.js')){
    html = html.replace(
      /<script src="assets\/db\.js"><\/script>/,
      '<script src="assets/env.js"></script>\n<script src="assets/db.js"></script>'
    );
  }

  if(html !== original){
    fs.writeFileSync(full, html, 'utf8');
    console.log('✅ ' + file);
    modified++;
  } else {
    console.log('⚪ ' + file + ' (déjà OK ou rien à faire)');
  }
});

console.log('\n🎉 ' + modified + ' fichier(s) modifié(s)\n');