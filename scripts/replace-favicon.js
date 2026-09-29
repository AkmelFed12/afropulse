/* Corrige les favicons cassés par l'échappement PowerShell `n dans tous les .html */
const fs = require('fs');
const path = require('path');

const dir = process.cwd();
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let fixed = 0;
let already = 0;
const log = [];

for (const file of files) {
  const filepath = path.join(dir, file);
  let content = fs.readFileSync(filepath, 'utf8');
  const original = content;

  // Cas 1 : la ligne contient `n littéral (backtick + n)
  // On remplace le `n par un vrai saut de ligne + indentation
  if (content.includes('`n<link rel="icon"')) {
    content = content.replace(
      /`n<link rel="icon"/g,
      '\n  <link rel="icon"'
    );
    fs.writeFileSync(filepath, content, 'utf8');
    log.push(`✓ Corrigé : ${file}`);
    fixed++;
    continue;
  }

  // Cas 2 : les 2 lignes sont collées sans saut (format `` bizarre)
  if (/<link rel="icon" type="image\/svg\+xml"[^>]*><link rel="icon"/.test(content)) {
    content = content.replace(
      /<link rel="icon" type="image\/svg\+xml" href="([^"]+)"><link rel="icon" type="image\/png" href="([^"]+)">/g,
      '<link rel="icon" type="image/svg+xml" href="$1">\n  <link rel="icon" type="image/png" href="$2">'
    );
    fs.writeFileSync(filepath, content, 'utf8');
    log.push(`✓ Corrigé : ${file}`);
    fixed++;
    continue;
  }

  // Cas 3 : déjà propre
  if (content.includes('rel="icon"')) {
    log.push(`  OK      : ${file}`);
    already++;
    continue;
  }

  log.push(`  Ignoré  : ${file}`);
}

log.forEach(l => console.log(l));
console.log('\n──────────────');
console.log(`✓ ${fixed} fichier(s) corrigé(s)`);
console.log(`  ${already} fichier(s) déjà OK`);