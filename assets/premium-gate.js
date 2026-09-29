const PremiumGate = (() => {
  'use strict';

  function lock(el, slug){
    if(el.querySelector('.premium-lock-overlay')) return;
    const meta = (Premium.getFeatures().find(f => f.slug === slug)) || {};
    const plan = meta.min_plan || 'pro';
    const title = meta.label || 'Fonctionnalité Premium';
    const desc = meta.description || 'Cette fonctionnalité est réservée aux abonnés.';

    el.classList.add('premium-locked');
    el.style.position = 'relative';

    const overlay = document.createElement('div');
    overlay.className = 'premium-lock-overlay';
    overlay.innerHTML = `
      <div class="premium-lock-card">
        <div class="premium-lock-icon"><i class="fa-solid fa-crown"></i></div>
        <div class="premium-lock-title">${title}</div>
        <div class="premium-lock-desc">${desc}</div>
        <a href="abonnement.html?plan=${plan}" class="btn bp premium-lock-cta">
          <i class="fa-solid fa-crown text-xs"></i>Débloquer
        </a>
      </div>`;
    el.appendChild(overlay);
  }

  function unlock(el){
    el.classList.remove('premium-locked');
    el.style.position = '';
    el.querySelector('.premium-lock-overlay')?.remove();
  }

  function applyAll(){
    if(typeof Premium === 'undefined') return;
    document.querySelectorAll('[data-premium]').forEach(el => {
      const slug = el.dataset.premium;
      if(!slug) return;
      if(Premium.hasFeature(slug)) unlock(el);
      else lock(el, slug);
    });
  }

  function init(){
    if(typeof Premium === 'undefined') return;
    Premium.onChange(() => applyAll());
    if(document.readyState !== 'loading') applyAll();
    else document.addEventListener('DOMContentLoaded', applyAll);
  }

  return { init, applyAll };
})();

window.PremiumGate = PremiumGate;

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', () => PremiumGate.init());
}else{
  PremiumGate.init();
}