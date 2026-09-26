/* ═══════════════════════════════════════════════════════════════════════
   AfroPulse — Fuseaux horaires
   ═══════════════════════════════════════════════════════════════════════ */

const Timezone = (() => {
  'use strict';

  const CITY_TZ = {
    'abidjan': 'Africa/Abidjan',
    'dakar': 'Africa/Dakar',
    'bamako': 'Africa/Bamako',
    'ouagadougou': 'Africa/Ouagadougou',
    'cotonou': 'Africa/Porto-Novo',
    'lome': 'Africa/Lome',
    'accra': 'Africa/Accra',
    'lagos': 'Africa/Lagos',
    'nairobi': 'Africa/Nairobi',
    'casablanca': 'Africa/Casablanca',
    'tunis': 'Africa/Tunis',
    'alger': 'Africa/Algiers',
    'le caire': 'Africa/Cairo',
    'cairo': 'Africa/Cairo',
    'kinshasa': 'Africa/Kinshasa',
    'brazzaville': 'Africa/Brazzaville',
    'yaounde': 'Africa/Douala',
    'douala': 'Africa/Douala',
    'libreville': 'Africa/Libreville',
    'kigali': 'Africa/Kigali',
    'addis-abeba': 'Africa/Addis_Ababa',
    'johannesburg': 'Africa/Johannesburg',
    'le cap': 'Africa/Johannesburg',
    'cape town': 'Africa/Johannesburg',
    'paris': 'Europe/Paris',
    'londres': 'Europe/London',
    'london': 'Europe/London',
    'bruxelles': 'Europe/Brussels',
    'geneve': 'Europe/Zurich',
    'montreal': 'America/Toronto',
    'toronto': 'America/Toronto',
    'new york': 'America/New_York',
    'washington': 'America/New_York',
    'los angeles': 'America/Los_Angeles',
    'dubai': 'Asia/Dubai',
    'riyad': 'Asia/Riyadh',
    'riyadh': 'Asia/Riyadh'
  };

  const TZ_TO_FLAG = {
    'Africa/Abidjan': '🇨🇮',
    'Africa/Dakar': '🇸🇳',
    'Africa/Bamako': '🇲🇱',
    'Africa/Ouagadougou': '🇧🇫',
    'Africa/Porto-Novo': '🇧🇯',
    'Africa/Lome': '🇹🇬',
    'Africa/Accra': '🇬🇭',
    'Africa/Lagos': '🇳🇬',
    'Africa/Nairobi': '🇰🇪',
    'Africa/Casablanca': '🇲🇦',
    'Africa/Tunis': '🇹🇳',
    'Africa/Algiers': '🇩🇿',
    'Africa/Cairo': '🇪🇬',
    'Africa/Kinshasa': '🇨🇩',
    'Africa/Brazzaville': '🇨🇬',
    'Africa/Douala': '🇨🇲',
    'Africa/Libreville': '🇬🇦',
    'Africa/Kigali': '🇷🇼',
    'Africa/Addis_Ababa': '🇪🇹',
    'Africa/Johannesburg': '🇿🇦',
    'Europe/Paris': '🇫🇷',
    'Europe/London': '🇬🇧',
    'Europe/Brussels': '🇧🇪',
    'Europe/Zurich': '🇨🇭',
    'America/Toronto': '🇨🇦',
    'America/New_York': '🇺🇸',
    'America/Los_Angeles': '🇺🇸',
    'Asia/Dubai': '🇦🇪',
    'Asia/Riyadh': '🇸🇦'
  };

  function detectFromCity(cityFull){
    if(!cityFull) return null;
    const lower = cityFull.toLowerCase();
    for(const [city, tz] of Object.entries(CITY_TZ)){
      if(lower.includes(city)) return tz;
    }
    if(lower.includes('côte') || lower.includes('ivoire')) return 'Africa/Abidjan';
    if(lower.includes('sénégal') || lower.includes('senegal')) return 'Africa/Dakar';
    if(lower.includes('mali')) return 'Africa/Bamako';
    if(lower.includes('burkina')) return 'Africa/Ouagadougou';
    if(lower.includes('bénin') || lower.includes('benin')) return 'Africa/Porto-Novo';
    if(lower.includes('togo')) return 'Africa/Lome';
    if(lower.includes('ghana')) return 'Africa/Accra';
    if(lower.includes('nigeria')) return 'Africa/Lagos';
    if(lower.includes('kenya')) return 'Africa/Nairobi';
    if(lower.includes('maroc') || lower.includes('morocco')) return 'Africa/Casablanca';
    if(lower.includes('france')) return 'Europe/Paris';
    if(lower.includes('royaume') || lower.includes('uk')) return 'Europe/London';
    if(lower.includes('belgique')) return 'Europe/Brussels';
    if(lower.includes('suisse')) return 'Europe/Zurich';
    if(lower.includes('canada')) return 'America/Toronto';
    if(lower.includes('états') || lower.includes('etats') || lower.includes('usa')) return 'America/New_York';
    return null;
  }

  function getHour(tz){
    if(!tz) return new Date().getHours();
    try{
      const parts = new Intl.DateTimeFormat('fr-FR', {
        hour: 'numeric',
        hour12: false,
        timeZone: tz
      }).formatToParts(new Date());
      const h = parts.find(p => p.type === 'hour');
      return h ? parseInt(h.value, 10) : new Date().getHours();
    }catch(e){
      return new Date().getHours();
    }
  }

  function describe(tz){
    if(!tz) return '';
    const h = getHour(tz);
    const flag = TZ_TO_FLAG[tz] || '🌍';
    return `${flag} Il est ${h}h là-bas`;
  }

  function status(tz){
    const h = getHour(tz);
    if(h >= 8 && h < 18){
      return { label: 'Probablement disponible', color: 'var(--ok)', dot: '🟢' };
    }
    if(h >= 18 && h < 22){
      return { label: 'Disponible en soirée', color: 'var(--gd)', dot: '🟡' };
    }
    if(h >= 22 || h < 6){
      return { label: 'Probablement endormi', color: 'var(--mu)', dot: '🌙' };
    }
    return { label: 'Tôt le matin', color: 'var(--mu)', dot: '🌅' };
  }

  function badge(tz){
    if(!tz) return '';
    const h = getHour(tz);
    const flag = TZ_TO_FLAG[tz] || '🌍';
    const st = status(tz);
    return `<span class="tz-badge" title="${st.label}">${flag} ${h}h</span>`;
  }

  return {
    detectFromCity,
    getHour,
    describe,
    status,
    badge,
    getLocalTimezone: () => Intl.DateTimeFormat().resolvedOptions().timeZone
  };
})();

window.Timezone = Timezone;