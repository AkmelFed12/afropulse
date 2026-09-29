const Premium = (() => {
  'use strict';

  const TRIAL_DAYS = 3;
  const REFERRAL_BATCH = 20;
  const REFERRAL_REWARD = 7;

  let state = null;
  let plans = [];
  let features = [];
  let listeners = [];

  function emit(){
    listeners.forEach(fn => { try{ fn(state); }catch(e){} });
  }

  function computeState(row){
    if(!row) return { active:false, plan:null, status:'free', expiresAt:null, daysLeft:0, isTrial:false, features:[] };
    const now = Date.now();
    const exp = row.expires_at ? new Date(row.expires_at).getTime() : null;
    const active = (row.status === 'trial' || row.status === 'active') && (!exp || exp > now);
    const daysLeft = exp ? Math.max(0, Math.ceil((exp - now) / 86400000)) : 0;
    const planObj = plans.find(p => p.id === row.plan_id);
    const feats = planObj?.features || [];
    return {
      active,
      plan: planObj || null,
      planId: row.plan_id,
      status: active ? row.status : 'expired',
      expiresAt: row.expires_at,
      daysLeft,
      isTrial: row.status === 'trial',
      features: active ? feats : [],
      trialUsed: !!row.trial_used
    };
  }

  async function load(){
    if(typeof DB === 'undefined') return;
    try{
      const [plansData, featsData] = await Promise.all([
        DB.getPremiumPlans(),
        DB.getPremiumFeatures()
      ]);
      plans = plansData || [];
      features = featsData || [];

      const user = (typeof Auth !== 'undefined') ? Auth.getUser() : null;
      if(!user){
        state = computeState(null);
        emit();
        return state;
      }
      const row = await DB.getUserPremium(user.id);
      state = computeState(row);
      emit();
      return state;
    }catch(e){
      state = computeState(null);
      emit();
      return state;
    }
  }

  async function startTrial(){
    const user = (typeof Auth !== 'undefined') ? Auth.getUser() : null;
    if(!user) throw new Error('Connectez-vous d\'abord.');
    const current = await DB.getUserPremium(user.id);
    if(current?.trial_used){
      throw new Error('Période d\'essai déjà utilisée.');
    }
    const now = new Date();
    const expires = new Date(now.getTime() + TRIAL_DAYS * 86400000);
    await DB.upsertUserPremium({
      user_id: user.id,
      plan_id: 'starter',
      status: 'trial',
      started_at: now.toISOString(),
      expires_at: expires.toISOString(),
      trial_used: true,
      trial_started_at: now.toISOString()
    });
    await load();
    return state;
  }

  function isActive(){ return !!(state && state.active); }
  function daysLeft(){ return state ? state.daysLeft : 0; }
  function isTrial(){ return !!(state && state.isTrial); }
  function currentPlan(){ return state?.plan || null; }
  function getPlans(){ return plans.slice(); }
  function getFeatures(){ return features.slice(); }

  function hasFeature(slug){
    if(!state || !state.active) return false;
    return (state.features || []).includes(slug);
  }

  function requireFeature(slug, opts = {}){
    if(hasFeature(slug)) return true;
    const onBlock = opts.onBlock || (() => {});
    onBlock({
      slug,
      reason: state?.active ? 'upgrade' : 'subscribe',
      planRequired: features.find(f => f.slug === slug)?.min_plan || 'pro'
    });
    return false;
  }

  function onChange(fn){
    listeners.push(fn);
    if(state) fn(state);
    return () => { listeners = listeners.filter(f => f !== fn); };
  }

  function wrapHTML(html, opts = {}){
    if(isActive()) return html;
    const msg = state?.trialUsed
      ? 'Abonnez-vous pour débloquer cette fonctionnalité.'
      : 'Activez votre essai gratuit de 3 jours pour commencer.';
    return `
      <div class="premium-lock" style="position:relative">
        <div style="filter:blur(6px);pointer-events:none;user-select:none">${html}</div>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,.05);backdrop-filter:blur(2px);border-radius:inherit;padding:1.5rem;text-align:center">
          <div style="width:48px;height:48px;border-radius:50%;background:var(--gd);display:grid;place-items:center;color:#fff;margin-bottom:.75rem;box-shadow:0 8px 24px -8px rgba(184,134,11,.5)">
            <i class="fa-solid fa-crown"></i>
          </div>
          <div style="font-weight:800;color:var(--ink);margin-bottom:.35rem">${opts.title || 'Fonctionnalité Premium'}</div>
          <div style="font-size:.8rem;color:var(--mu);max-width:320px;margin-bottom:1rem">${opts.message || msg}</div>
          <a href="abonnement.html" class="btn bp" style="padding:.6rem 1.2rem;font-size:.8rem">
            <i class="fa-solid fa-crown text-xs"></i>${opts.cta || 'Voir les offres'}
          </a>
        </div>
      </div>`;
  }

  function daysToAdd(days){
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
  }

  function getReferralRules(){
    return { batch: REFERRAL_BATCH, reward: REFERRAL_REWARD, trialDays: TRIAL_DAYS };
  }

  return {
    load, startTrial, isActive, daysLeft, isTrial, currentPlan,
    getPlans, getFeatures, hasFeature, requireFeature, onChange, wrapHTML,
    daysToAdd, getReferralRules,
    get state(){ return state; }
  };
})();

window.Premium = Premium;