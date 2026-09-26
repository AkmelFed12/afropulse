/* ═══════════════════════════════════════════════
   Locations — Pays & Villes via CountriesNow API
   Cache local 30 jours · Fallback intégré
═══════════════════════════════════════════════ */

const Locations=(()=>{
  const API='https://countriesnow.space/api/v0.1';
  const CACHE_KEY='ap_locations_cache';
  const TTL=30*24*60*60*1000; // 30 jours

  /* Fallback minimal si l'API est indisponible */
  const FALLBACK_COUNTRIES=[
    "Côte d'Ivoire","Sénégal","Mali","Burkina Faso","Bénin","Togo","Ghana","Nigeria",
    "Cameroun","Gabon","Congo","RDC","Maroc","Tunisie","Algérie","Égypte",
    "Kenya","Tanzanie","Ouganda","Rwanda","Éthiopie","Afrique du Sud",
    "France","Belgique","Suisse","Allemagne","Royaume-Uni","Italie","Espagne","Portugal",
    "Canada","États-Unis","Brésil","Mexique",
    "Émirats arabes unis","Arabie Saoudite","Qatar","Chine","Japon","Inde","Australie"
  ];

  let countries=[];
  let citiesCache={};

  /* ─── Restaure le cache ─── */
  try{
    const c=JSON.parse(localStorage.getItem(CACHE_KEY)||'{}');
    if(c.timestamp && Date.now()-c.timestamp<TTL){
      countries=c.countries||[];
      citiesCache=c.cities||{};
    }
  }catch(e){}

  const saveCache=()=>{
    try{
      localStorage.setItem(CACHE_KEY,JSON.stringify({
        timestamp:Date.now(),
        countries,
        cities:citiesCache
      }));
    }catch(e){console.warn('Cache locations indisponible',e)}
  };

  /* ─── Charge la liste des pays ─── */
  async function fetchCountries(){
    if(countries.length)return countries;
    try{
      const r=await fetch(`${API}/countries`);
      const d=await r.json();
      const list=(d.data||[])
        .map(x=>typeof x==='string'?x:x.country)
        .filter(Boolean);
      if(!list.length)throw new Error('Liste vide');
      countries=list.sort((a,b)=>a.localeCompare(b,'fr'));
      saveCache();
      return countries;
    }catch(e){
      console.error('Erreur chargement pays:',e);
      countries=FALLBACK_COUNTRIES.slice().sort((a,b)=>a.localeCompare(b,'fr'));
      return countries;
    }
  }

  /* ─── Charge les villes d'un pays ─── */
  async function fetchCities(country){
    if(citiesCache[country])return citiesCache[country];
    try{
      const r=await fetch(`${API}/countries/cities`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({country})
      });
      const d=await r.json();
      const list=(d.data||[]).filter(Boolean);
      citiesCache[country]=list.sort((a,b)=>a.localeCompare(b,'fr'));
      saveCache();
      return citiesCache[country];
    }catch(e){
      console.error('Erreur chargement villes pour '+country+':',e);
      return [];
    }
  }

  return{
    /* Remplit un select de pays */
    async fillCountries(select,selected){
      if(!select)return;
      select.disabled=true;
      select.innerHTML='<option value="">Chargement…</option>';
      const list=await fetchCountries();
      select.disabled=false;
      if(!list.length){
        select.innerHTML='<option value="">Erreur de chargement</option>';
        return;
      }
      const opts=['<option value="">— Choisir un pays —</option>']
        .concat(list.map(c=>`<option value="${c}"${c===selected?' selected':''}>${c}</option>`));
      select.innerHTML=opts.join('');
    },

    /* Remplit un select de villes selon le pays */
    async fillCities(select,country,selected){
      if(!select)return;
      if(!country){
        select.disabled=true;
        select.innerHTML='<option value="">— Choisir un pays d\'abord —</option>';
        return;
      }
      select.disabled=true;
      select.innerHTML='<option value="">Chargement…</option>';
      const list=await fetchCities(country);
      select.disabled=false;
      if(!list.length){
        select.innerHTML='<option value="">— Aucune ville disponible —</option>';
        return;
      }
      const opts=['<option value="">— Choisir une ville —</option>']
        .concat(list.map(c=>`<option value="${c}"${c===selected?' selected':''}>${c}</option>`));
      select.innerHTML=opts.join('');
    },

    /* Vide les villes */
    async clearCities(select){
      if(!select)return;
      select.disabled=true;
      select.innerHTML='<option value="">— Choisir un pays d\'abord —</option>';
    },

    /* Parse "Ville, Pays" → {country, city} */
    parse(stored){
      if(!stored)return {country:'',city:''};
      const parts=String(stored).split(',').map(s=>s.trim()).filter(Boolean);
      if(parts.length<2)return {country:'',city:parts[0]||''};
      return {
        country:parts[parts.length-1],
        city:parts.slice(0,-1).join(', ')
      };
    },

    /* Assemble ville + pays */
    format(country,city){
      if(!country&&!city)return '';
      if(!country)return city||'';
      if(!city)return country;
      return `${city}, ${country}`;
    }
  };
})();