/* ═══════════════════════════════════════════════════════════════════════
   Currency — Taux de change EUR ↔ USD ↔ XOF (FCFA)
   
   Notes :
   - Le XOF (Franc CFA) est arrimé à l'EUR par traité à 655,957 XOF = 1 EUR.
     Ce taux est FIXE, il ne change jamais. Pas besoin d'API pour ça.
   - Seul l'USD fluctue, on le récupère depuis l'API Frankfurter (BCE).
   - Si l'API échoue, on garde un taux USD de secours.
   
   API : Frankfurter (api.frankfurter.dev)
   Cache 24h · Fallback intégré
═══════════════════════════════════════════════════════════════════════ */

const Currency=(()=>{
  const API='https://api.frankfurter.dev/v1';
  const CACHE_KEY='ap_currency_rates';
  const TTL=24*60*60*1000; // 24h

  /* Taux fixe garanti par traité (BCEAO / UEMOA) */
  const XOF_PER_EUR=655.957;

  /* Taux USD de secours (approximatif, sera remplacé par l'API) */
  const USD_FALLBACK=1.08;

  let usdPerEur=USD_FALLBACK;

  /* ─── Restaure le cache ─── */
  try{
    const c=JSON.parse(localStorage.getItem(CACHE_KEY)||'{}');
    if(c.timestamp && Date.now()-c.timestamp<TTL && c.usdPerEur){
      usdPerEur=c.usdPerEur;
    }
  }catch(e){}

  const saveCache=()=>{
    try{
      localStorage.setItem(CACHE_KEY,JSON.stringify({
        timestamp:Date.now(),
        usdPerEur
      }));
    }catch(e){}
  };

  /* ─── Charge le taux USD/EUR depuis l'API ─── */
  let fetchPromise=null;
  async function fetchRates(){
    if(fetchPromise)return fetchPromise;
    fetchPromise=(async()=>{
      try{
        /* Vérifier si le cache est encore frais */
        const c=JSON.parse(localStorage.getItem(CACHE_KEY)||'{}');
        if(c.timestamp && Date.now()-c.timestamp<TTL && c.usdPerEur){
          usdPerEur=c.usdPerEur;
          return;
        }

        const controller=new AbortController();
        const timeout=setTimeout(()=>controller.abort(),5000);

        /* La nouvelle API utilise base= et symbols= */
        const r=await fetch(`${API}/latest?base=EUR&symbols=USD`,{
          signal:controller.signal
        });
        clearTimeout(timeout);

        if(!r.ok)throw new Error('HTTP '+r.status);
        const d=await r.json();
        if(d?.rates?.USD){
          usdPerEur=d.rates.USD;
          saveCache();
        }
      }catch(e){
        /* Silencieux : on garde le taux de secours */
        console.info('[Currency] Utilisation du taux USD de secours');
      }
    })();
    return fetchPromise;
  }

  /* ─── Calcule les taux à la volée ─── */
  function getRate(from,to){
    if(from===to)return 1;

    // EUR → autres
    if(from==='EUR'){
      if(to==='USD')return usdPerEur;
      if(to==='XOF')return XOF_PER_EUR;
    }
    // Autres → EUR
    if(to==='EUR'){
      if(from==='USD')return 1/usdPerEur;
      if(from==='XOF')return 1/XOF_PER_EUR;
    }
    // USD ↔ XOF (passer par EUR)
    if(from==='USD'&&to==='XOF')return XOF_PER_EUR/usdPerEur;
    if(from==='XOF'&&to==='USD')return usdPerEur/XOF_PER_EUR;

    return null;
  }

  /* ─── Formate un montant ─── */
  function format(amount,from='XOF',to='EUR'){
    const rate=getRate(from,to);
    if(!rate)return '';
    const converted=Number(amount)*rate;
    if(to==='XOF'){
      return `${Math.round(converted).toLocaleString('fr-FR').replace(/\u202f|\u00a0/g,' ')} FCFA`;
    }
    if(to==='EUR'){
      return `${converted.toFixed(2)} €`;
    }
    if(to==='USD'){
      return `${converted.toFixed(2)} $`;
    }
    return `${converted.toFixed(2)} ${to}`;
  }

  /* ─── Conversion programmatique ─── */
  async function convert(amount,from,to){
    await fetchRates();
    const rate=getRate(from,to);
    if(!rate)throw new Error('Paire de devises non supportée');
    return Number(amount)*rate;
  }

  return{
    fetchRates,
    format,
    convert,
    getRate,
    getUsdPerEur:()=>usdPerEur,
    getXofPerEur:()=>XOF_PER_EUR
  };
})();