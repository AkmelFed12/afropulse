const Referral = (() => {
  'use strict';

  const BATCH = 20;
  const REWARD = 7;

  function buildShareUrl(code){
    const base = location.origin + location.pathname.replace(/[^/]*$/, '');
    return `${base}index.html?ref=${encodeURIComponent(code)}`;
  }

  function buildMessage(code){
    const url = buildShareUrl(code);
    return `Rejoins AfroPulse, le réseau des talents africains 🌍\nInscris-toi avec mon lien : ${url}\nTu bénéficies de 3 jours Premium offerts !`;
  }

  async function getMyCode(){
    try{ return await DB.getOrCreateReferralCode(); }
    catch(e){ return null; }
  }

  async function getStats(){
    try{
      const [code, list] = await Promise.all([
        DB.getOrCreateReferralCode(),
        DB.getMyReferrals()
      ]);
      const total = list.length;
      const qualified = list.filter(r => r.status === 'qualified' || r.status === 'rewarded').length;
      const batches = Math.floor(qualified / BATCH);
      const rewardDays = batches * REWARD;
      const progress = qualified % BATCH;
      const nextAt = BATCH - progress;
      return {
        code,
        total,
        qualified,
        pending: total - qualified,
        batches,
        rewardDays,
        progress,
        nextAt,
        canEarn: qualified > 0,
        list
      };
    }catch(e){
      return { code:null, total:0, qualified:0, pending:0, batches:0, rewardDays:0, progress:0, nextAt:BATCH, canEarn:false, list:[] };
    }
  }

  async function applyCode(code){
    if(!code) return { ok:false, error:'Code manquant.' };
    const user = (typeof Auth !== 'undefined') ? Auth.getUser() : null;
    if(!user) return { ok:false, error:'Connectez-vous d\'abord.' };
    try{
      const result = await DB.applyReferralCode(code.trim().toUpperCase(), user.id);
      return result;
    }catch(e){
      return { ok:false, error: e.message };
    }
  }

  function readUrlCode(){
    const p = new URLSearchParams(location.search);
    const c = p.get('ref');
    if(c){
      try{ sessionStorage.setItem('ap-ref-code', c.toUpperCase()); }catch(e){}
    }
    return c;
  }

  function pendingCode(){
    try{ return sessionStorage.getItem('ap-ref-code'); }catch(e){ return null; }
  }

  function clearPendingCode(){
    try{ sessionStorage.removeItem('ap-ref-code'); }catch(e){}
  }

  function share(channel, code){
    const url = buildShareUrl(code);
    const msg = buildMessage(code);
    if(channel === 'whatsapp'){
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }else if(channel === 'telegram'){
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Rejoins AfroPulse 🌍')}`, '_blank');
    }else if(channel === 'linkedin'){
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    }else if(channel === 'twitter'){
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Rejoins AfroPulse 🌍')}&url=${encodeURIComponent(url)}`, '_blank');
    }else{
      copyMessage(msg);
    }
  }

  async function copyMessage(text){
    try{
      await navigator.clipboard.writeText(text);
      if(typeof UI !== 'undefined') UI.toast('Message copié', 'success');
      return true;
    }catch(e){
      if(typeof UI !== 'undefined') UI.toast('Impossible de copier', 'error');
      return false;
    }
  }

  function getRules(){ return { batch: BATCH, reward: REWARD }; }

  return { getMyCode, getStats, applyCode, readUrlCode, pendingCode, clearPendingCode, share, copyMessage, buildShareUrl, buildMessage, getRules };
})();

window.Referral = Referral;