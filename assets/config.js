/* ═══════════════════════════════════════════════════════════════════════
   config.js — Crée le client Supabase partagé
   ═══════════════════════════════════════════════════════════════════════ */

(function(){
  'use strict';

  if(window.sb){
    console.log('✅ Supabase client déjà prêt');
    return;
  }

  if(typeof supabase === 'undefined'){
    console.warn('⚠️ config.js : SDK Supabase non chargé');
    return;
  }

  const url = window.ENV?.SUPABASE_URL;
  const anon = window.ENV?.SUPABASE_KEY;

  if(!url || !anon){
    console.error('❌ config.js : SUPABASE_URL ou SUPABASE_KEY manquant');
    return;
  }

  try{
    const isSecure = window.isSecureContext === true;
    const isLocal = ['localhost', '127.0.0.1', ''].includes(location.hostname);

    const authConfig = {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    };
    if(isSecure || isLocal) authConfig.flowType = 'pkce';

    window.sb = supabase.createClient(url, anon, { auth: authConfig });
    console.log('✅ Supabase client prêt');
  }catch(e){
    console.error('❌ config.js — création client échouée :', e);
  }
})();