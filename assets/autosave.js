const Autosave = (() => {
  'use strict';

  const PREFIX = 'ap-draft-';
  const TTL = 7 * 24 * 60 * 60 * 1000;

  function key(formId){
    return PREFIX + (formId || location.pathname);
  }

  function save(formId, data){
    try{
      const payload = { data, savedAt: Date.now() };
      localStorage.setItem(key(formId), JSON.stringify(payload));
      return true;
    }catch(e){
      return false;
    }
  }

  function load(formId){
    try{
      const raw = localStorage.getItem(key(formId));
      if(!raw) return null;
      const parsed = JSON.parse(raw);
      if(Date.now() - (parsed.savedAt || 0) > TTL){
        localStorage.removeItem(key(formId));
        return null;
      }
      return parsed;
    }catch(e){
      return null;
    }
  }

  function clear(formId){
    try{ localStorage.removeItem(key(formId)); }catch(e){}
  }

  function getFormData(form){
    const data = {};
    form.querySelectorAll('input, textarea, select').forEach(el => {
      if(!el.name && !el.id) return;
      const name = el.name || el.id;
      if(el.type === 'checkbox') data[name] = el.checked;
      else if(el.type === 'radio'){ if(el.checked) data[name] = el.value; }
      else if(el.type === 'file'){ /* ignore */ }
      else data[name] = el.value;
    });
    return data;
  }

  function applyFormData(form, data){
    if(!data || typeof data !== 'object') return false;
    let applied = false;
    Object.entries(data).forEach(([name, value]) => {
      const el = form.querySelector(`[name="${name}"], #${CSS.escape(name)}`);
      if(!el) return;
      if(el.type === 'checkbox') el.checked = !!value;
      else if(el.type === 'radio'){ if(el.value === value) el.checked = true; }
      else if(el.type === 'file'){ /* skip */ }
      else el.value = value || '';
      applied = true;
    });
    return applied;
  }

  function attach(form, opts = {}){
    if(!form) return;
    const formId = opts.formId || form.id || location.pathname;
    const delay = opts.delay || 800;

    const existing = load(formId);
    if(existing && existing.data && opts.autoRestore !== false){
      setTimeout(() => {
        const applied = applyFormData(form, existing.data);
        if(applied && typeof opts.onRestore === 'function'){
          opts.onRestore(existing);
        }else if(applied && typeof UI !== 'undefined'){
          const when = new Date(existing.savedAt).toLocaleString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
          UI.toast('Brouillon restauré (' + when + ')', 'info', 4000);
        }
      }, 300);
    }

    let timer = null;
    const triggerSave = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const data = getFormData(form);
        save(formId, data);
        if(typeof opts.onSave === 'function') opts.onSave(data);
      }, delay);
    };

    form.addEventListener('input', triggerSave);
    form.addEventListener('change', triggerSave);

    form.addEventListener('submit', () => {
      setTimeout(() => clear(formId), 100);
    });

    const resetBtn = form.querySelector('[type="reset"]');
    if(resetBtn){
      resetBtn.addEventListener('click', () => clear(formId));
    }
  }

  return { attach, save, load, clear, getFormData, applyFormData };
})();

window.Autosave = Autosave;