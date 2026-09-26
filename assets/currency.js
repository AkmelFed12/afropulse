/* ═══════════════════════════════════════════════════════════════════════
   AfroPulse — Convertisseur de devises
   ═══════════════════════════════════════════════════════════════════════ */

const Currency = (() => {
  'use strict';

  const CACHE_KEY = 'ap-currency-rates';
  const CACHE_TTL = 24 * 60 * 60 * 1000;
  const API = 'https://api.frankfurter.app/latest?from=EUR&to=USD,XOF';

  const FALLBACK = { EUR: 1, USD: 1.08, XOF: 655.957 };
  let rates = { ...FALLBACK };

  try{
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if(cached && Date.now() - cached.fetchedAt < CACHE_TTL){
      rates = cached.rates;
    }
  }catch(e){}

  async function fetchRates(){
    try{
      const r = await fetch(API);
      if(!r.ok) throw new Error('HTTP ' + r.status);
      const d = await r.json();
      if(d && d.rates && d.rates.XOF && d.rates.USD){
        rates = { EUR: 1, USD: d.rates.USD, XOF: d.rates.XOF };
        try{
          localStorage.setItem(CACHE_KEY, JSON.stringify({ rates, fetchedAt: Date.now() }));
        }catch(e){}
      }
    }catch(e){}
  }

  (async () => {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if(!cached || Date.now() - cached.fetchedAt >= CACHE_TTL){
      await fetchRates();
    }
  })();

  function convert(amount, from = 'XOF', to = 'EUR'){
    if(!amount || isNaN(amount)) return 0;
    const inEUR = amount / rates[from];
    return inEUR * rates[to];
  }

  function format(amount, from = 'XOF', to = 'EUR'){
    const value = convert(amount, from, to);
    if(!value) return '';
    let symbol;
    if(to === 'EUR') symbol = '€';
    else if(to === 'USD') symbol = '$';
    else symbol = 'FCFA';
    const rounded = Math.round(value);
    const formatted = rounded.toLocaleString('fr-FR').replace(/\u202f|\u00a0/g,' ');
    return `≈ ${formatted} ${symbol}`;
  }

  function formatAlt(amountXOF){
    return format(amountXOF, 'XOF', 'EUR');
  }

  return {
    convert, format, formatAlt,
    getRates: () => ({ ...rates }),
    refresh: fetchRates
  };
})();

window.Currency = Currency;