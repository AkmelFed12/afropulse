/* ═══════════════════════════════════════════════════════════════════════
   Locations — Base locale complète (Afrique + Diaspora)
   Aucune dépendance externe · Chargement instantané
═══════════════════════════════════════════════════════════════════════ */

const Locations=(()=>{
  const RAW={
    /* ══════════ AFRIQUE DE L'OUEST ══════════ */
    "Côte d'Ivoire":"Abidjan|Yamoussoukro|Bouaké|Daloa|San-Pédro|Korhogo|Man|Divo|Gagnoa|Abengourou|Grand-Bassam|Bondoukou|Séguéla|Odienné|Ferkessédougou|Bingerville|Agboville|Adzopé|Soubré|Duekoué|Guiglo|Toumodi|Tiassalé|Sinfra|Dabou|Bonoua|Sassandra|Tabou|Grand-Lahou|Abobo|Cocody|Yopougon|Marcory|Treichville|Port-Bouët|Koumassi|Adjamé|Plateau|Attécoubé|Anyama",
    "Sénégal":"Dakar|Thiès|Touba|Saint-Louis|Kaolack|Ziguinchor|Rufisque|Mbour|Diourbel|Louga|Tambacounda|Kolda|Matam|Fatick|Pikine|Guédiawaye|Bargny|Tivaouane|Mékhé|Joal-Fadiouth|Richard-Toll|Podor|Kédougou|Sédhiou",
    "Mali":"Bamako|Sikasso|Ségou|Mopti|Kayes|Gao|Koutiala|Tombouctou|Kati|San|Bougouni|Kidal|Nioro|Niono|Markala|Koulikoro",
    "Burkina Faso":"Ouagadougou|Bobo-Dioulasso|Koudougou|Ouahigouya|Banfora|Kaya|Dédougou|Tenkodogo|Fada N'Gourma|Dori|Ziniaré|Manga|Réo|Kombissiri|Zorgho",
    "Bénin":"Cotonou|Porto-Novo|Parakou|Djougou|Bohicon|Abomey|Natitingou|Lokossa|Ouidah|Kandi|Malanville|Savé|Nikki|Dassa-Zoumé|Come",
    "Togo":"Lomé|Sokodé|Kara|Kpalimé|Atakpamé|Dapaong|Tsévié|Aného|Bassar|Mango|Notsé|Badou|Vogan",
    "Niger":"Niamey|Zinder|Maradi|Agadez|Tahoua|Dosso|Diffa|Arlit|Birni-N'Konni|Tessaoua|Tillabéri|Gaya",
    "Guinée":"Conakry|Nzérékoré|Kankan|Kindia|Labé|Boké|Mamou|Kissidougou|Guéckédou|Siguiri|Faranah|Coyah|Dubréka|Forécariah",
    "Guinée-Bissau":"Bissau|Bafatá|Gabú|Bissorã|Bolama|Cacheu|Canchungo|Bubaque",
    "Mauritanie":"Nouakchott|Nouadhibou|Kiffa|Rosso|Zouérat|Atar|Kaédi|Sélibaby|Aleg|Tidjikja",
    "Cap-Vert":"Praia|Mindelo|Santa Maria|Assomada|Espargos|Tarrafal|São Filipe|Sal Rei",
    "Gambie":"Banjul|Serekunda|Brikama|Bakau|Farafenni|Lamin|Soma|Basse Santa Su",
    "Sierra Leone":"Freetown|Bo|Kenema|Makeni|Koidu|Lunsar|Port Loko|Kabala",
    "Liberia":"Monrovia|Gbarnga|Buchanan|Kakata|Harper|Zwedru|Yekepa|Robertsport",
    "Ghana":"Accra|Kumasi|Tamale|Takoradi|Cape Coast|Tema|Sunyani|Ho|Koforidua|Wa|Bolgatanga|Obuasi|Techiman|Sekondi",
    "Nigeria":"Lagos|Abuja|Kano|Ibadan|Port Harcourt|Benin City|Kaduna|Enugu|Onitsha|Jos|Ilorin|Aba|Maiduguri|Zaria|Sokoto|Calabar|Warri",

    /* ══════════ AFRIQUE CENTRALE ══════════ */
    "Cameroun":"Douala|Yaoundé|Garoua|Bamenda|Maroua|Bafoussam|Ngaoundéré|Bertoua|Kribi|Limbe|Buea|Ebolowa|Kumba|Edéa|Dschang|Foumban|Nkongsamba",
    "Gabon":"Libreville|Port-Gentil|Franceville|Oyem|Moanda|Lambaréné|Mouila|Tchibanga|Koulamoutou|Bitam",
    "Congo":"Brazzaville|Pointe-Noire|Dolisie|Nkayi|Ouesso|Owando|Impfondo|Madingou",
    "RDC":"Kinshasa|Lubumbashi|Mbuji-Mayi|Kisangani|Bukavu|Goma|Kananga|Likasi|Kolwezi|Matadi|Uvira|Butembo|Beni|Bunia|Tshikapa|Kikwit",
    "Tchad":"N'Djamena|Moundou|Sarh|Abéché|Kélo|Koumra|Pala|Am Timan|Bongor",
    "RCA":"Bangui|Bimbo|Berbérati|Carnot|Bambari|Bouar|Bossangoa|Bangassou",
    "Guinée équatoriale":"Malabo|Bata|Ebebiyín|Aconibe|Mongomo|Luba",

    /* ══════════ AFRIQUE DE L'EST ══════════ */
    "Rwanda":"Kigali|Butare|Gitarama|Ruhengeri|Gisenyi|Byumba|Cyangugu|Kibungo|Nyagatare|Rwamagana",
    "Burundi":"Bujumbura|Gitega|Muyinga|Ruyigi|Ngozi|Rutana|Bururi|Makamba",
    "Djibouti":"Djibouti|Ali Sabieh|Tadjourah|Obock|Dikhil|Arta",
    "Madagascar":"Antananarivo|Toamasina|Antsirabe|Fianarantsoa|Mahajanga|Toliara|Antsiranana|Ambovombe|Morondava|Nosy Be",
    "Comores":"Moroni|Mutsamudu|Fomboni|Domoni|Tsémbéhou",
    "Seychelles":"Victoria|Anse Boileau|Beau Vallon|Cascade",
    "Maurice":"Port-Louis|Beau-Bassin|Vacoas|Curepipe|Quatre Bornes|Triolet|Goodlands|Rose-Belle",
    "Kenya":"Nairobi|Mombasa|Kisumu|Nakuru|Eldoret|Thika|Malindi|Kitale|Garissa|Nyeri",
    "Tanzanie":"Dar es Salaam|Dodoma|Mwanza|Arusha|Mbeya|Morogoro|Tanga|Zanzibar|Kigoma|Mtwara",
    "Ouganda":"Kampala|Gulu|Lira|Mbarara|Jinja|Mbale|Entebbe|Masaka|Fort Portal|Arua",
    "Éthiopie":"Addis-Abeba|Dire Dawa|Mekele|Gondar|Bahir Dar|Hawassa|Adama|Jimma|Dessie|Harar",
    "Somalie":"Mogadiscio|Hargeisa|Bosaso|Kismayo|Baidoa|Garowe|Berbera",
    "Soudan":"Khartoum|Omdurman|Port-Soudan|Kassala|Nyala|El Obeid|Wad Madani|Atbara",
    "Soudan du Sud":"Djouba|Wau|Malakal|Yambio|Aweil|Bentiu|Torit",
    "Érythrée":"Asmara|Keren|Massawa|Assab|Mendefera|Barentu",

    /* ══════════ AFRIQUE AUSTRALE ══════════ */
    "Afrique du Sud":"Johannesburg|Le Cap|Durban|Pretoria|Port Elizabeth|Bloemfontein|East London|Pietermaritzburg|Polokwane|Nelspruit|Soweto|Stellenbosch",
    "Namibie":"Windhoek|Walvis Bay|Swakopmund|Oshakati|Rundu|Katima Mulilo|Ondangwa|Rehoboth",
    "Botswana":"Gaborone|Francistown|Molepolole|Maun|Serowe|Selebi-Phikwe|Kanye|Mahalapye",
    "Zimbabwe":"Harare|Bulawayo|Chitungwiza|Mutare|Gweru|Kwekwe|Kadoma|Masvingo|Chinhoyi",
    "Zambie":"Lusaka|Kitwe|Ndola|Kabwe|Chingola|Mufulira|Livingstone|Luanshya|Chipata|Kafue",
    "Malawi":"Lilongwe|Blantyre|Mzuzu|Zomba|Kasungu|Mangochi|Karonga|Salima",
    "Mozambique":"Maputo|Matola|Beira|Nampula|Chimoio|Nacala|Quelimane|Tete|Pemba|Xai-Xai",
    "Angola":"Luanda|Huambo|Lobito|Benguela|Lubango|Malanje|Namibe|Cabinda|Uíge|Soyo",
    "Lesotho":"Maseru|Teyateyaneng|Mafeteng|Hlotse|Mohale's Hoek|Maputsoe",
    "Eswatini":"Mbabane|Manzini|Lobamba|Siteki|Nhlangano|Piggs Peak",

    /* ══════════ MAGHREB ══════════ */
    "Maroc":"Casablanca|Rabat|Fès|Marrakech|Tanger|Agadir|Meknès|Oujda|Kénitra|Tétouan|Salé|Nador|Mohammedia|El Jadida|Béni Mellal|Safi",
    "Tunisie":"Tunis|Sfax|Sousse|Kairouan|Bizerte|Gabès|Ariana|Gafsa|Monastir|Nabeul|Kasserine|Médenine",
    "Algérie":"Alger|Oran|Constantine|Annaba|Blida|Batna|Djelfa|Sétif|Sidi Bel Abbès|Biskra|Tébessa|Tlemcen|Béjaïa|Tiaret",
    "Libye":"Tripoli|Benghazi|Misrata|Zawiya|Sabha|Tobrouk|Bayda|Derna|Sirte",
    "Égypte":"Le Caire|Alexandrie|Gizeh|Chubra el-Kheima|Port-Saïd|Suez|Louxor|Assouan|Ismaïlia|Tanta|Assiout|Fayoum",

    /* ══════════ DIASPORA — EUROPE ══════════ */
    "France":"Paris|Marseille|Lyon|Toulouse|Nice|Nantes|Montpellier|Strasbourg|Bordeaux|Lille|Rennes|Reims|Saint-Étienne|Toulon|Grenoble|Dijon|Angers|Nîmes|Villeurbanne|Clermont-Ferrand|Le Mans|Aix-en-Provence|Brest|Tours|Amiens|Limoges|Annecy|Perpignan|Besançon|Metz|Orléans|Rouen|Mulhouse|Caen|Nancy|Argenteuil|Montreuil|Roubaix|Tourcoing|Avignon",
    "Belgique":"Bruxelles|Anvers|Gand|Charleroi|Liège|Namur|Louvain|Mons|Alost|Malines|La Louvière|Courtrai|Hasselt|Ostende|Bruges|Tournai|Genk|Seraing",
    "Suisse":"Zurich|Genève|Bâle|Lausanne|Berne|Winterthour|Lucerne|Saint-Gall|Lugano|Bienne|Thoune|Köniz|Fribourg|Neuchâtel|Sion|Vevey",
    "Allemagne":"Berlin|Hambourg|Munich|Cologne|Francfort|Stuttgart|Düsseldorf|Leipzig|Dortmund|Essen|Brême|Dresde|Hanovre|Nuremberg|Duisbourg|Bochum|Wuppertal|Bielefeld|Bonn|Münster",
    "Royaume-Uni":"Londres|Birmingham|Manchester|Glasgow|Liverpool|Leeds|Sheffield|Édimbourg|Bristol|Cardiff|Belfast|Leicester|Coventry|Nottingham|Newcastle|Brighton|Southampton|Portsmouth|Aberdeen|Oxford|Cambridge",
    "Italie":"Rome|Milan|Naples|Turin|Palerme|Gênes|Bologne|Florence|Bari|Catane|Venise|Vérone|Messine|Padoue|Trieste|Tarente|Prato|Modène|Reggio de Calabre|Parme",
    "Espagne":"Madrid|Barcelone|Valence|Séville|Saragosse|Málaga|Murcie|Palma|Las Palmas|Bilbao|Alicante|Cordoue|Valladolid|Vigo|Gijón|L'Hospitalet|La Corogne|Grenade",
    "Portugal":"Lisbonne|Porto|Braga|Coimbra|Funchal|Amadora|Setúbal|Almada|Queluz|Rio Tinto|Aveiro|Faro|Guimarães|Viseu|Leiria",
    "Pays-Bas":"Amsterdam|Rotterdam|La Haye|Utrecht|Eindhoven|Tilburg|Groningue|Almere|Breda|Nimègue|Apeldoorn|Haarlem|Arnhem|Enschede|Amersfoort",
    "Luxembourg":"Luxembourg|Esch-sur-Alzette|Differdange|Dudelange|Ettelbruck|Diekirch|Wiltz",
    "Suède":"Stockholm|Göteborg|Malmö|Uppsala|Västerås|Örebro|Linköping|Helsingborg|Jönköping|Norrköping",
    "Norvège":"Oslo|Bergen|Trondheim|Stavanger|Drammen|Fredrikstad|Kristiansand|Sandnes|Tromsø",
    "Danemark":"Copenhague|Aarhus|Odense|Aalborg|Esbjerg|Randers|Kolding|Horsens|Vejle",
    "Irlande":"Dublin|Cork|Limerick|Galway|Waterford|Drogheda|Dundalk|Kilkenny",
    "Autriche":"Vienne|Graz|Linz|Salzbourg|Innsbruck|Klagenfurt|Villach|Wels",

    /* ══════════ DIASPORA — AMÉRIQUE DU NORD ══════════ */
    "Canada":"Montréal|Québec|Toronto|Ottawa|Vancouver|Calgary|Gatineau|Edmonton|Laval|Longueuil|Mississauga|Brampton|Winnipeg|Hamilton|Halifax|Victoria|Saskatoon|Regina|Sherbrooke|Trois-Rivières",
    "États-Unis":"New York|Los Angeles|Chicago|Houston|Phoenix|Philadelphie|San Antonio|San Diego|Dallas|San José|Austin|Jacksonville|San Francisco|Columbus|Charlotte|Indianapolis|Seattle|Denver|Boston|Nashville|Détroit|Portland|Las Vegas|Atlanta|Miami|Washington|Minneapolis|Baltimore|Newark|Oakland",
    "Mexique":"Mexico|Guadalajara|Monterrey|Puebla|Tijuana|León|Juárez|Zapopan|Cancún|Mérida|Querétaro|Toluca",

    /* ══════════ DIASPORA — MOYEN-ORIENT ══════════ */
    "Émirats arabes unis":"Dubaï|Abou Dabi|Charjah|Al Ain|Ajman|Ras el Khaïmah|Fujaïrah|Oumm al Qaïwaïn",
    "Arabie Saoudite":"Riyad|Djeddah|La Mecque|Médine|Dammam|Taëf|Tabuk|Buraydah|Khobar|Abha|Najran",
    "Qatar":"Doha|Al Rayyan|Al Wakrah|Al Khor|Lusail|Umm Salal",
    "Koweït":"Koweït|Al Ahmadi|Hawalli|Salmiya|Jahra|Farwaniya",
    "Bahreïn":"Manama|Riffa|Muharraq|Hamad|A'ali|Sitra",
    "Oman":"Mascate|Salalah|Sohar|Nizwa|Sour|Ibri|Barka",
    "Liban":"Beyrouth|Tripoli|Sidon|Tyr|Jounieh|Zahlé|Baalbek",
    "Jordanie":"Amman|Zarqa|Irbid|Aqaba|Salt|Madaba",

    /* ══════════ AUTRES ══════════ */
    "Chine":"Pékin|Shanghai|Canton|Shenzhen|Chengdu|Wuhan|Xi'an|Hangzhou|Tianjin|Nankin|Chongqing|Shenyang|Qingdao|Dalian",
    "Japon":"Tokyo|Osaka|Yokohama|Nagoya|Sapporo|Fukuoka|Kobe|Kyoto|Kawasaki|Hiroshima|Sendai|Chiba",
    "Inde":"Mumbai|Delhi|Bangalore|Hyderabad|Ahmedabad|Chennai|Kolkata|Pune|Jaipur|Surat|Lucknow|Kanpur",
    "Australie":"Sydney|Melbourne|Brisbane|Perth|Adélaïde|Gold Coast|Canberra|Newcastle|Wollongong|Hobart|Geelong|Townsville",
    "Brésil":"São Paulo|Rio de Janeiro|Brasília|Salvador|Fortaleza|Belo Horizonte|Manaus|Curitiba|Recife|Porto Alegre|Belém|Goiânia"
  };

  const DATA={};
  Object.keys(RAW).forEach(country=>{
    DATA[country]=RAW[country].split('|').map(s=>s.trim()).filter(Boolean);
  });

  const COUNTRIES=Object.keys(DATA).sort((a,b)=>a.localeCompare(b,'fr'));

  return{
    fillCountries(select,selected){
      if(!select)return;
      select.disabled=false;
      const opts=['<option value="">— Choisir un pays —</option>']
        .concat(COUNTRIES.map(c=>`<option value="${c}"${c===selected?' selected':''}>${c}</option>`));
      select.innerHTML=opts.join('');
    },

    fillCities(select,country,selected){
      if(!select)return;
      if(!country){
        select.disabled=true;
        select.innerHTML='<option value="">— Choisir un pays d\'abord —</option>';
        return;
      }
      const cities=DATA[country]||[];
      if(!cities.length){
        select.disabled=true;
        select.innerHTML='<option value="">— Aucune ville —</option>';
        return;
      }
      select.disabled=false;
      const opts=['<option value="">— Choisir une ville —</option>']
        .concat(cities.map(c=>`<option value="${c}"${c===selected?' selected':''}>${c}</option>`));
      select.innerHTML=opts.join('');
    },

    clearCities(select){
      if(!select)return;
      select.disabled=true;
      select.innerHTML='<option value="">— Choisir un pays d\'abord —</option>';
    },

    parse(stored){
      if(!stored)return {country:'',city:''};
      const parts=String(stored).split(',').map(s=>s.trim()).filter(Boolean);
      if(parts.length<2)return {country:'',city:parts[0]||''};
      return {
        country:parts[parts.length-1],
        city:parts.slice(0,-1).join(', ')
      };
    },

    format(country,city){
      if(!country&&!city)return '';
      if(!country)return city||'';
      if(!city)return country;
      return `${city}, ${country}`;
    },

    COUNTRIES,
    DATA
  };
})();