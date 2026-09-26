/* ═══════════════════════════════════════════════════════════════════════
   Génère assets/env.js à partir des variables d'environnement Netlify.
   Exécuté au build : npm run build:env
   Version robuste : gère BOM UTF-8 + fins de ligne CRLF/LF
   ═══════════════════════════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');

// Charge le .env local si présent (dev)
try{
  const envPath = path.join(__dirname, '..', '.env');
  if(fs.existsSync(envPath)){
    let raw = fs.readFileSync(envPath, 'utf8');
    // ① Retire le BOM UTF-8 s'il existe
    raw = raw.replace(/^\uFEFF/, '');
    // ② Normalise les fins de ligne
    raw = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    raw.split('\n').forEach(line => {
      // Ignore commentaires et lignes vides
      if(!line || line.startsWith('#')) return;
      const m = line.match(/^([^=]+)=(.*)$/);
      if(m){
        const key = m[1].trim();
        const val = m[2].trim();
        // N'écrase pas une variable déjà définie par Netlify
        if(!process.env[key]) process.env[key] = val;
      }
    });
  }
}catch(e){
  console.warn('⚠️  Lecture .env échouée :', e.message);
}

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

if(!SUPABASE_URL || !SUPABASE_KEY){
  console.warn('⚠️  SUPABASE_URL ou SUPABASE_KEY manquante.');
  console.warn('   → Sur Netlify : Site configuration → Environment variables');
  console.warn('   → En local     : crée un fichier .env à la racine');
  console.warn('   → Debug        : ' + (SUPABASE_URL ? 'URL ✓' : 'URL ✗') + ' | ' + (SUPABASE_KEY ? 'KEY ✓' : 'KEY ✗'));
}

const content = `/* ═══════════════════════════════════════════════════════════════════════
   Auto-généré par scripts/build-env.js — NE PAS ÉDITER MANUELLEMENT
   Généré le ${new Date().toISOString()}
   ═══════════════════════════════════════════════════════════════════════ */

window.ENV = {
  SUPABASE_URL: ${JSON.stringify(SUPABASE_URL)},
  SUPABASE_KEY: ${JSON.stringify(SUPABASE_KEY)}
};
`;

const out = path.join(__dirname, '..', 'assets', 'env.js');
fs.writeFileSync(out, content, 'utf8');
console.log('✅ assets/env.js généré (' + content.length + ' octets)');