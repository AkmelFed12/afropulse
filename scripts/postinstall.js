/* ═══════════════════════════════════════════════════════════════════════
   Hook postinstall — vérifie que tout est en place après npm install
   ═══════════════════════════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const required = [
  'tailwind.config.js',
  'assets/tailwind-input.css'
];

let ok = true;
required.forEach(f => {
  const p = path.join(root, f);
  if(!fs.existsSync(p)){
    console.error('❌ Fichier manquant : ' + f);
    ok = false;
  }
});

if(ok){
  console.log('✅ Postinstall OK — npm run build pour générer env.js + tailwind.css');
}