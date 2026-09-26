/* ═══════════════════════════════════════════════════════════════════════
   AfroPulse — UI Module
   ────────────────────────────────────────────────────────────────────
   • UI.toast()          → toast unifié (ok/error/warn/info)
   • UI.skeleton.*       → skeletons de chargement
   • UI.error()          → bloc d'erreur avec bouton Réessayer
   • UI.empty()          → état vide réutilisable
   • UI.load()           → helper chargement + skeleton + erreur
   ═══════════════════════════════════════════════════════════════════════ */

const UI = (() => {
  'use strict';

  /* ─────── Utilitaires ─────── */
  const escapeHtml = (str) => String(str == null ? '' : str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');

  /* ─────── Toast unifié ─────── */
  function toast(msg, type = 'ok', duration = 3200){
    let t = document.getElementById('uiToast');
    if(!t){
      t = document.createElement('div');
      t.id = 'uiToast';
      t.className = 'ui-toast';
      document.body.appendChild(t);
    }
    const icons = { ok:'fa-circle-check', error:'fa-circle-exclamation', info:'fa-circle-info', warn:'fa-triangle-exclamation' };
    const colors = { ok:'var(--ok)', error:'var(--er)', info:'var(--ac)', warn:'var(--gd)' };
    t.innerHTML = `
      <i class="fa-solid ${icons[type] || icons.ok}" style="color:${colors[type] || colors.ok}"></i>
      <span>${escapeHtml(msg)}</span>
    `;
    t.className = 'ui-toast on ' + type;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('on'), duration);
  }

  /* ─────── Skeletons ─────── */
  const skeleton = {
    line(width = '100%', height = 10){
      return `<div class="sk-line" style="width:${width};height:${height}px"></div>`;
    },
    card(){
      return `<div class="sk-card">
        <div class="sk-line" style="width:40%"></div>
        <div class="sk-line" style="width:80%"></div>
        <div class="sk-line" style="width:65%"></div>
        <div class="sk-line" style="width:30%"></div>
      </div>`;
    },
    cards(n = 6){
      return Array.from({length:n}, () => skeleton.card()).join('');
    },
    listItem(){
      return `<div class="sk-item">
        <div class="sk-avatar"></div>
        <div class="sk-lines">
          <div class="sk-line" style="width:60%"></div>
          <div class="sk-line" style="width:40%"></div>
        </div>
      </div>`;
    },
    list(n = 5){
      return Array.from({length:n}, () => skeleton.listItem()).join('');
    },
    statBox(){
      return `<div class="sk-stat">
        <div class="sk-line" style="width:50%;height:22px;margin:0 auto .5rem"></div>
        <div class="sk-line" style="width:70%;height:8px;margin:0 auto"></div>
      </div>`;
    },
    statBoxes(n = 4){
      return Array.from({length:n}, () => skeleton.statBox()).join('');
    }
  };

  /* ─────── Bloc d'erreur avec retry ─────── */
  function error(message, retryFn){
    const id = 'uiErr' + Math.random().toString(36).slice(2, 8);
    if(retryFn) window[`__uiRetry_${id}`] = retryFn;
    const offline = !navigator.onLine;
    return `<div class="ui-error">
      <div class="ui-error-icon">
        <i class="fa-solid ${offline ? 'fa-wifi' : 'fa-triangle-exclamation'}"></i>
      </div>
      <div class="ui-error-title">${offline ? 'Vous semblez hors ligne' : 'Erreur de chargement'}</div>
      <div class="ui-error-msg">${escapeHtml(message || (offline ? 'Vérifiez votre connexion internet.' : 'Impossible de charger les données.'))}</div>
      ${retryFn ? `<button class="ui-error-btn" onclick="window['__uiRetry_${id}'] && window['__uiRetry_${id}']()">
        <i class="fa-solid fa-rotate-right"></i>Réessayer
      </button>` : ''}
    </div>`;
  }

  /* ─────── État vide ─────── */
  function empty(icon, title, sub, actionsHtml){
    return `<div class="ui-empty">
      <i class="fa-solid ${icon || 'fa-inbox'}"></i>
      <div class="ui-empty-title">${escapeHtml(title || 'Aucun élément')}</div>
      ${sub ? `<div class="ui-empty-sub">${escapeHtml(sub)}</div>` : ''}
      ${actionsHtml ? `<div class="ui-empty-actions">${actionsHtml}</div>` : ''}
    </div>`;
  }

  /* ─────── Helper : charge + skeleton + erreur ─────── */
  async function load({ container, skeletonHtml, loader, onRender, onError, minDelay = 250 }){
    if(!container) return;

    // Affiche le skeleton
    if(skeletonHtml) container.innerHTML = skeletonHtml;

    const start = Date.now();
    try{
      const data = await loader();
      const elapsed = Date.now() - start;
      // Petit délai pour éviter le flash si le réseau est très rapide
      if(elapsed < minDelay && skeletonHtml){
        await new Promise(r => setTimeout(r, minDelay - elapsed));
      }
      onRender(data);
    }catch(e){
      console.error('[UI.load]', e);
      const retry = () => load({ container, skeletonHtml, loader, onRender, onError, minDelay });
      if(onError) onError(e, retry);
      else container.innerHTML = error(e.message || 'Erreur', retry);
    }
  }

  /* ─────── Timeout wrapper ─────── */
  function withTimeout(promise, ms = 12000){
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Délai dépassé (réseau lent)')), ms))
    ]);
  }

  /* ─────── Watcher online/offline ─────── */
  function initNetworkWatcher(){
    window.addEventListener('offline', () => toast('Connexion perdue', 'warn'));
    window.addEventListener('online', () => toast('Connexion rétablie', 'ok'));
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initNetworkWatcher);
  }else{
    initNetworkWatcher();
  }

  return { toast, skeleton, error, empty, load, escapeHtml, withTimeout };
})();

window.UI = UI;