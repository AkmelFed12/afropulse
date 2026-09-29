const Wallet = (() => {
  'use strict';

  const WITHDRAWAL_DELAY_HOURS = 72;
  const METHODS = {
    wave:   { label:'Wave',   icon:'fa-bolt',              color:'#1dc3f1', fields:['account_name','account_number'] },
    orange: { label:'Orange Money', icon:'fa-mobile-screen', color:'#ff6600', fields:['account_name','account_number'] },
    bank:   { label:'Virement bancaire', icon:'fa-building-columns', color:'#0b5fff', fields:['account_name','bank_name','bank_iban','bank_swift'] },
    paypal: { label:'PayPal', icon:'fa-paypal',            color:'#003087', fields:['account_name','account_number'] }
  };

  function getMethods(){ return METHODS; }

  async function getBalance(){
    if(typeof DB === 'undefined') return 0;
    try{
      const bal = await DB.getWalletBalance();
      return parseInt(bal, 10) || 0;
    }catch(e){ return 0; }
  }

  async function getTransactions(limit = 50){
    if(typeof DB === 'undefined') return [];
    try{ return await DB.getWalletTransactions(limit); }
    catch(e){ return []; }
  }

  function validateWithdrawal({ amount, method, balance, info }){
    const errors = [];
    if(!amount || amount <= 0) errors.push('Le montant doit être supérieur à 0.');
    if(amount > balance) errors.push('Montant supérieur à votre solde.');
    if(amount < 1000) errors.push('Le retrait minimum est de 1 000 FCFA.');
    if(!METHODS[method]) errors.push('Moyen de paiement invalide.');
    else {
      const required = METHODS[method].fields;
      required.forEach(f => {
        if(!info || !info[f] || !String(info[f]).trim()) errors.push('Champ obligatoire manquant : ' + f);
      });
    }
    return { ok: errors.length === 0, errors };
  }

  function buildInfo(method, source){
    const fields = METHODS[method]?.fields || [];
    const out = {};
    fields.forEach(f => { out[f] = (source?.[f] || '').trim(); });
    return out;
  }

  async function requestWithdrawal({ amount, method, info }){
    const balance = await getBalance();
    const v = validateWithdrawal({ amount, method, balance, info });
    if(!v.ok) throw new Error(v.errors[0]);

    const ref = 'AP-WD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase();
    const payload = {
      ref,
      user_id: (typeof Auth !== 'undefined') ? Auth.getUser()?.id : null,
      amount,
      method,
      status: 'pending',
      ...info
    };

    const saved = await DB.createWithdrawal(payload);

    try{
      await DB.addWalletTransaction({
        user_id: payload.user_id,
        type: 'withdrawal',
        amount: -amount,
        reason: 'Demande de retrait ' + ref,
        ref
      });
    }catch(e){}

    try{ await DB.notifyAdmin({ type:'withdrawal', ref, amount, method }); }catch(e){}
    try{ await DB.createNotification({
      userId: payload.user_id,
      type: 'system',
      title: 'Demande de retrait reçue',
      body: `Vous recevrez vos fonds sous ${WITHDRAWAL_DELAY_HOURS}h maximum.`,
      link: 'portefeuille.html',
      icon: 'fa-money-bill-transfer'
    }); }catch(e){}

    return saved;
  }

  async function getWithdrawals(limit = 30){
    try{ return await DB.getMyWithdrawals(limit); }
    catch(e){ return []; }
  }

  async function getContracts(){
    try{ return await DB.getMyContracts(); }
    catch(e){ return []; }
  }

  function statusInfo(status){
    const map = {
      pending:    { label:'En attente',   color:'var(--gd)', icon:'fa-clock' },
      approved:   { label:'Approuvé',     color:'var(--ac)', icon:'fa-check' },
      processing: { label:'En traitement',color:'var(--ac)', icon:'fa-spinner' },
      completed:  { label:'Terminé',      color:'var(--ok)', icon:'fa-circle-check' },
      rejected:   { label:'Rejeté',       color:'var(--er)', icon:'fa-circle-xmark' },
      cancelled:  { label:'Annulé',       color:'var(--mu)', icon:'fa-ban' }
    };
    return map[status] || map.pending;
  }

  return { getBalance, getTransactions, requestWithdrawal, getWithdrawals, getContracts, getMethods, validateWithdrawal, buildInfo, statusInfo, WITHDRAWAL_DELAY_HOURS };
})();

window.Wallet = Wallet;