const Geo = (() => {
  'use strict';

  const CITY_COORDS = {
    'abidjan': [5.35, -4.02],
    'yamoussoukro': [6.82, -5.28],
    'bouaké': [7.69, -5.03],
    'bouake': [7.69, -5.03],
    'dakar': [14.72, -17.47],
    'thiès': [14.79, -16.93],
    'thies': [14.79, -16.93],
    'saint-louis': [16.02, -16.49],
    'bamako': [12.65, -8.0],
    'sikasso': [11.32, -5.66],
    'ouagadougou': [12.37, -1.52],
    'bobo-dioulasso': [11.18, -4.29],
    'cotonou': [6.37, 2.42],
    'porto-novo': [6.48, 2.62],
    'lomé': [6.13, 1.22],
    'lome': [6.13, 1.22],
    'accra': [5.6, -0.19],
    'kumasi': [6.69, -1.62],
    'lagos': [6.52, 3.37],
    'abuja': [9.06, 7.49],
    'kano': [12.0, 8.52],
    'nairobi': [-1.28, 36.82],
    'mombasa': [-4.04, 39.66],
    'casablanca': [33.57, -7.59],
    'rabat': [34.02, -6.83],
    'marrakech': [31.63, -7.99],
    'tanger': [35.76, -5.83],
    'tunis': [36.8, 10.18],
    'sfax': [34.74, 10.76],
    'alger': [36.75, 3.06],
    'oran': [35.7, -0.63],
    'constantine': [36.37, 6.61],
    'le caire': [30.04, 31.24],
    'cairo': [30.04, 31.24],
    'alexandrie': [31.2, 29.92],
    'kinshasa': [-4.44, 15.27],
    'lubumbashi': [-11.66, 27.48],
    'brazzaville': [-4.27, 15.28],
    'pointe-noire': [-4.79, 11.86],
    'douala': [4.05, 9.7],
    'yaoundé': [3.87, 11.52],
    'yaounde': [3.87, 11.52],
    'libreville': [0.42, 9.47],
    'kigali': [-1.94, 30.06],
    'addis-abeba': [9.02, 38.75],
    'addis abeba': [9.02, 38.75],
    'johannesburg': [-26.2, 28.04],
    'le cap': [-33.92, 18.42],
    'cape town': [-33.92, 18.42],
    'durban': [-29.86, 31.02],
    'pretoria': [-25.75, 28.19],
    'paris': [48.85, 2.35],
    'lyon': [45.76, 4.83],
    'marseille': [43.3, 5.37],
    'londres': [51.5, -0.13],
    'london': [51.5, -0.13],
    'manchester': [53.48, -2.24],
    'bruxelles': [50.85, 4.35],
    'brussels': [50.85, 4.35],
    'anvers': [51.22, 4.4],
    'genève': [46.2, 6.14],
    'geneve': [46.2, 6.14],
    'zurich': [47.38, 8.54],
    'berlin': [52.52, 13.4],
    'madrid': [40.42, -3.7],
    'barcelone': [41.39, 2.17],
    'rome': [41.9, 12.5],
    'milan': [45.46, 9.19],
    'montréal': [45.5, -73.57],
    'montreal': [45.5, -73.57],
    'québec': [46.81, -71.21],
    'quebec': [46.81, -71.21],
    'toronto': [43.65, -79.38],
    'vancouver': [49.28, -123.12],
    'ottawa': [45.42, -75.7],
    'new york': [40.71, -74.0],
    'washington': [38.9, -77.04],
    'boston': [42.36, -71.06],
    'chicago': [41.88, -87.63],
    'los angeles': [34.05, -118.24],
    'san francisco': [37.77, -122.42],
    'atlanta': [33.75, -84.39],
    'miami': [25.76, -80.19],
    'houston': [29.76, -95.37],
    'dubai': [25.2, 55.27],
    'abu dhabi': [24.45, 54.38],
    'riyad': [24.71, 46.67],
    'riyadh': [24.71, 46.67],
    'doha': [25.28, 51.53],
    'istanbul': [41.01, 28.98],
    'beijing': [39.9, 116.41],
    'shanghai': [31.23, 121.47],
    'tokyo': [35.68, 139.69],
    'séoul': [37.57, 126.98],
    'seoul': [37.57, 126.98],
    'mumbai': [19.08, 72.88],
    'delhi': [28.7, 77.1],
    'singapour': [1.35, 103.82],
    'sydney': [-33.87, 151.21],
    'melbourne': [-37.81, 144.96],
    'são paulo': [-23.55, -46.63],
    'sao paulo': [-23.55, -46.63],
    'rio de janeiro': [-22.91, -43.17],
    'buenos aires': [-34.6, -58.38]
  };

  const COUNTRY_CENTER = {
    "côte d'ivoire": [7.54, -5.55],
    "cote d'ivoire": [7.54, -5.55],
    'sénégal': [14.5, -14.45],
    'senegal': [14.5, -14.45],
    'mali': [17.57, -3.99],
    'burkina faso': [12.24, -1.56],
    'bénin': [9.31, 2.32],
    'benin': [9.31, 2.32],
    'togo': [8.62, 0.82],
    'ghana': [7.95, -1.03],
    'nigeria': [9.08, 8.68],
    'kenya': [-0.02, 37.91],
    'maroc': [31.79, -7.09],
    'tunisie': [33.89, 9.54],
    'algérie': [28.03, 1.66],
    'algerie': [28.03, 1.66],
    'égypte': [26.82, 30.8],
    'egypte': [26.82, 30.8],
    'congo': [-0.23, 15.83],
    'congo (rdc)': [-4.04, 21.76],
    'rdc': [-4.04, 21.76],
    'cameroun': [7.37, 12.35],
    'gabon': [-0.8, 11.61],
    'rwanda': [-1.94, 29.87],
    'éthiopie': [9.15, 40.49],
    'ethiopie': [9.15, 40.49],
    'afrique du sud': [-30.56, 22.94],
    'france': [46.6, 2.21],
    'royaume-uni': [55.38, -3.44],
    'belgique': [50.5, 4.47],
    'suisse': [46.82, 8.23],
    'allemagne': [51.17, 10.45],
    'espagne': [40.46, -3.75],
    'italie': [41.87, 12.57],
    'canada': [56.13, -106.35],
    'états-unis': [37.09, -95.71],
    'etats-unis': [37.09, -95.71],
    'usa': [37.09, -95.71],
    'émirats arabes unis': [23.42, 53.85],
    'emirats arabes unis': [23.42, 53.85],
    'arabie saoudite': [23.89, 45.08],
    'chine': [35.86, 104.2],
    'japon': [36.2, 138.25],
    'inde': [20.59, 78.96],
    'brésil': [-14.24, -51.93],
    'bresil': [-14.24, -51.93],
    'australie': [-25.27, 133.78]
  };

  function getCoords(cityFull){
    if(!cityFull) return null;
    const lower = String(cityFull).toLowerCase();
    const parts = lower.split(',').map(s => s.trim()).filter(Boolean);
    for(const p of parts){
      if(CITY_COORDS[p]) return { coords: CITY_COORDS[p], match: 'city', name: p };
    }
    const firstPart = parts[0];
    for(const [city, coords] of Object.entries(CITY_COORDS)){
      if(firstPart && (firstPart.includes(city) || city.includes(firstPart))){
        return { coords, match: 'city', name: city };
      }
    }
    const lastPart = parts[parts.length-1];
    if(lastPart && COUNTRY_CENTER[lastPart]){
      return { coords: COUNTRY_CENTER[lastPart], match: 'country', name: lastPart };
    }
    for(const [country, coords] of Object.entries(COUNTRY_CENTER)){
      if(lower.includes(country)) return { coords, match: 'country', name: country };
    }
    return null;
  }

  function getCountryCenter(countryName){
    if(!countryName) return null;
    const lower = String(countryName).toLowerCase();
    return COUNTRY_CENTER[lower] || null;
  }

  return { getCoords, getCountryCenter, CITY_COORDS, COUNTRY_CENTER };
})();

window.Geo = Geo;