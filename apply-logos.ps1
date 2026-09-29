# ═══════════════════════════════════════════════════════════════════
# AFROPULSE — REMPLACEMENT AUTOMATIQUE DES LOGOS
# ═══════════════════════════════════════════════════════════════════

$base = "C:\Users\DELL\Desktop\AfroPulse"
$siteUrl = "https://afro-pulse.netlify.app"

# ═══════════════════════════════════════════════════════════════════
# VÉRIFICATION DES IMAGES
# ═══════════════════════════════════════════════════════════════════
$requiredImages = @(
  "assets\favicon-16.png",
  "assets\favicon-32.png",
  "assets\icon-152.png",
  "assets\icon-192.png",
  "assets\icon-512.png",
  "assets\logo.png",
  "assets\logo-sm.png",
  "assets\og-image.jpg"
)

Write-Host ""
Write-Host "=== VERIFICATION DES IMAGES ===" -ForegroundColor Cyan
Write-Host ""

foreach ($img in $requiredImages) {
  $full = Join-Path $base $img
  if (Test-Path $full) {
    Write-Host "  OK  $img" -ForegroundColor Green
  } else {
    Write-Host "  MANQUANT  $img" -ForegroundColor Red
  }
}

# ═══════════════════════════════════════════════════════════════════
# 1. NETTOYER ET REMPLACER LES FAVICONS DANS TOUS LES HTML
# ═══════════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "=== NETTOYAGE DES FAVICONS ===" -ForegroundColor Cyan
Write-Host ""

$htmlFiles = Get-ChildItem -Path $base -Filter "*.html" -File

$newHeadBlock = @"
<!-- Favicons + PWA -->
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16.png">
<link rel="apple-touch-icon" sizes="152x152" href="/assets/icon-152.png">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0b5fff">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="AfroPulse">
"@

foreach ($file in $htmlFiles) {
  try {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content

    # Supprimer favicon SVG inline
    $content = [regex]::Replace($content, '(?i)<link\s+rel="icon"[^>]*data:image/svg\+xml[^>]*>\s*', '')

    # Supprimer anciens favicons PNG
    $content = [regex]::Replace($content, '(?i)<link\s+rel="icon"[^>]*favicon-\d+\.png[^>]*>\s*', '')
    $content = [regex]::Replace($content, '(?i)<link\s+rel="apple-touch-icon"[^>]*>\s*', '')
    $content = [regex]::Replace($content, '(?i)<link\s+rel="manifest"[^>]*>\s*', '')
    $content = [regex]::Replace($content, '(?i)<meta\s+name="theme-color"[^>]*>\s*', '')
    $content = [regex]::Replace($content, '(?i)<meta\s+name="apple-mobile-web-app[^"]*"[^>]*>\s*', '')
    $content = [regex]::Replace($content, '(?i)<!--\s*Favicons \+ PWA\s*-->', '')

    # Insérer le nouveau bloc avant </head>
    if ($content -match '(?i)</head>') {
      $content = [regex]::Replace($content, '(?i)(</head>)', "$newHeadBlock`r`n`r`n`$1", 1)
    }

    if ($content -ne $original) {
      Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
      Write-Host "  OK  $($file.Name)" -ForegroundColor Green
    } else {
      Write-Host "  --  $($file.Name)" -ForegroundColor DarkGray
    }
  } catch {
    Write-Host "  ERR  $($file.Name)" -ForegroundColor Red
  }
}

# ═══════════════════════════════════════════════════════════════════
# 2. REMPLACER BRAND_SVG DANS app.js
# ═══════════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "=== MISE A JOUR DU LOGO DANS app.js ===" -ForegroundColor Cyan
Write-Host ""

$appJsPath = Join-Path $base "assets\app.js"

if (Test-Path $appJsPath) {
  try {
    $content = Get-Content $appJsPath -Raw -Encoding UTF8
    $original = $content

    $newBrandSvg = "const BRAND_SVG = '<img src=`"assets/logo-sm.png`" alt=`"AfroPulse`" style=`"height:32px;width:auto;display:block`">';"

    if ($content -match "const\s+BRAND_SVG\s*=") {
      $content = [regex]::Replace($content, "const\s+BRAND_SVG\s*=\s*'[^']*';", $newBrandSvg, 1)
      Write-Host "  OK  BRAND_SVG remplace" -ForegroundColor Green
    } else {
      Write-Host "  !!  BRAND_SVG introuvable" -ForegroundColor Yellow
    }

    # Supprimer les <span class="site-brand-icon">...</span> autour
    $content = [regex]::Replace($content, '<span\s+class="site-brand-icon">\$\{BRAND_SVG\}</span>', '${BRAND_SVG}')

    if ($content -ne $original) {
      Set-Content -Path $appJsPath -Value $content -NoNewline -Encoding UTF8
      Write-Host "  OK  app.js mis a jour" -ForegroundColor Green
    } else {
      Write-Host "  --  app.js inchange" -ForegroundColor DarkGray
    }
  } catch {
    Write-Host "  ERR  $($_.Exception.Message)" -ForegroundColor Red
  }
} else {
  Write-Host "  ERR  app.js introuvable" -ForegroundColor Red
}

# ═══════════════════════════════════════════════════════════════════
# 3. CORRIGER LES META OG
# ═══════════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "=== MISE A JOUR DES META OG ===" -ForegroundColor Cyan
Write-Host ""

foreach ($file in $htmlFiles) {
  try {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content

    $content = [regex]::Replace($content, '(?i)<meta\s+property="og:image"\s+content="[^"]*"', "<meta property=`"og:image`" content=`"$siteUrl/assets/og-image.jpg`"")
    $content = [regex]::Replace($content, '(?i)<meta\s+name="twitter:image"\s+content="[^"]*"', "<meta name=`"twitter:image`" content=`"$siteUrl/assets/og-image.jpg`"")

    if ($content -ne $original) {
      Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
      Write-Host "  OK  $($file.Name)" -ForegroundColor Green
    }
  } catch {}
}

# ═══════════════════════════════════════════════════════════════════
# 4. NETTOYAGE
# ═══════════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "=== NETTOYAGE ===" -ForegroundColor Cyan
Write-Host ""

$generator = Join-Path $base "_generate-images.html"
if (Test-Path $generator) {
  Remove-Item $generator -Force
  Write-Host "  OK  _generate-images.html supprime" -ForegroundColor Green
}

$gitignore = Join-Path $base ".gitignore"
if (Test-Path $gitignore) {
  $giContent = Get-Content $gitignore -Raw -Encoding UTF8
  if ($giContent -notmatch "_generate-images") {
    Add-Content $gitignore "`n# Generateur temporaire`n_generate-images.html" -Encoding UTF8
    Write-Host "  OK  .gitignore mis a jour" -ForegroundColor Green
  }
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  TERMINE" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Ouvre http://192.168.1.87:3000/index.html" -ForegroundColor White
Write-Host "  Puis Ctrl+Shift+R" -ForegroundColor White
Write-Host ""
