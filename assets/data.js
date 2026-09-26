const DATA={
  barters:[
    {n:'Aïcha K.',c:'Abidjan, CI',a:'AK',o:'UI/UX Design',w:'Comptabilité',d:"Je conçois des interfaces mobiles pour des startups depuis 4 ans. J'ai besoin d'aide pour structurer ma comptabilité."},
    {n:'Moussa D.',c:'Dakar, SN',a:'MD',o:'Développement Web',w:'Anglais pro',d:"Je code en React et Node. Je cherche un partenaire anglophone pour viser des clients internationaux."},
    {n:'Fatou N.',c:'Bamako, ML',a:'FN',o:'Traduction FR/EN',w:'Community mgmt',d:"Bilingue, je traduis pour des ONG et des marques. J'aimerais apprendre à gérer une communauté en ligne."},
    {n:'Kwame A.',c:'Accra, GH',a:'KA',o:'Montage vidéo',w:'Motion design',d:"Je monte des vidéos courtes pour des créateurs Instagram. Je veux passer au motion design."},
    {n:'Nadia B.',c:'Casablanca, MA',a:'NB',o:'Copywriting',w:'SEO technique',d:"Je rédige du contenu long pour des startups SaaS. Je veux comprendre le SEO technique."},
    {n:'Yann T.',c:'Cotonou, BJ',a:'YT',o:'Photographie',w:'Branding',d:"Photo produit et portrait en studio. Je cherche un designer pour construire une identité visuelle."}
  ],
  mentors:[
    {n:'Dr. Samuel A.',r:'Data Scientist',o:'Ex-Google',c:'Paris, FR',a:'SA',x:'12 ans',t:'Data / IA'},
    {n:'Mariam S.',r:'Product Manager',o:'Orange Digital',c:'Londres, UK',a:'MS',x:'9 ans',t:'Produit'},
    {n:'Ibrahim K.',r:'Ingénieur Cloud',o:'AWS',c:'Toronto, CA',a:'IK',x:'11 ans',t:'Cloud'},
    {n:'Chidinma O.',r:"Avocate d'affaires",o:'Cabinet indépendant',c:'Lagos, NG',a:'CO',x:'8 ans',t:'Juridique'},
    {n:'Karim B.',r:'Directeur Marketing',o:'TotalEnergies',c:'Bruxelles, BE',a:'KB',x:'14 ans',t:'Marketing'},
    {n:'Awa D.',r:'Chef de projet IT',o:'Société Générale',c:'Montréal, CA',a:'AD',x:'10 ans',t:'IT / Projet'}
  ],
  missions:[
    {t:'Refonte landing page produit',c:'design',b:'75 000',d:'5 jours',co:'Maya Studio',ci:'Abidjan'},
    {t:'Intégration API Wave',c:'dev',b:'180 000',d:'2 sem.',co:'Fintech CI',ci:'Abidjan'},
    {t:'Campagne Instagram 30 jours',c:'marketing',b:'95 000',d:'1 mois',co:'AfroCosmetics',ci:'Dakar'},
    {t:'10 articles blog tech',c:'redaction',b:'60 000',d:'3 sem.',co:'DevHub Africa',ci:'Remote'},
    {t:'Maquettes app mobile santé',c:'design',b:'120 000',d:'10 jours',co:'Santé+',ci:'Bamako'},
    {t:'Correction bug dashboard React',c:'dev',b:'45 000',d:'3 jours',co:'Logix SARL',ci:'Remote'},
    {t:'Stratégie LinkedIn B2B',c:'marketing',b:'110 000',d:'2 sem.',co:'BTP Consulting',ci:'Casablanca'},
    {t:'Fiches produit e-commerce',c:'redaction',b:'40 000',d:'5 jours',co:'Wax & Co',ci:'Lomé'},
    {t:'Identité visuelle startup énergie',c:'design',b:'200 000',d:'3 sem.',co:'SolarBox',ci:'Abidjan'}
  ],
  testimonials:[
    {n:'Diarra Koubra',r:'UI/UX Designer',c:"Abidjan, Côte d'Ivoire",a:'DK',col:'var(--ac)',q:"J'ai trouvé mon premier client international via AfroPulse. Un directeur artistique à Montréal m'a proposé un troc : design contre comptabilité. En trois semaines, j'avais structuré ma micro-entreprise."},
    {n:'Diarra Sidi',r:'Rédacteur en Chef & Photographe pro',c:"Abidjan, Côte d'Ivoire",a:'DS',col:'var(--gd)',q:"Je publie chaque mois trois ou quatre missions sur AfroPulse — photoreportage, interviews, couvertures d'événements. Le badge RCCM me permet de trier en cinq secondes les entreprises sérieuses."},
    {n:'Gbane Karamoko',r:'Ingénieur en IA & Data Science',c:'Sudbury, Ontario, Canada',a:'GK',col:'var(--ac)',q:"Je suis la diaspora, mais je voulais rendre. AfroPulse m'a donné un cadre simple pour mentorer deux jeunes data scientists à Abidjan et Ouagadougou."},
    {n:'Bah Ali',r:'Footballeur professionnel · Al-Hilal',c:'Riyad, Arabie Saoudite',a:'BA',col:'var(--ok)',q:"Mon métier m'a éloigné du continent, mais pas de ses talents. J'utilise AfroPulse pour financer des micro-missions dans le sport et la santé au Mali et en Côte d'Ivoire."},
    {n:'Aïcha Koné',r:'Fondatrice · Studio Wax & Digital',c:"Abidjan, Côte d'Ivoire",a:'AK',col:'var(--gd)',q:"Nous avons recruté nos deux derniers graphistes via AfroPulse. Chaque profil est vérifié, chaque entreprise affiche son RCCM — gain de temps considérable."},
    {n:'Idriss Traoré',r:'Développeur fullstack indépendant',c:'Ouagadougou, Burkina Faso',a:'IT',col:'var(--ok)',q:"Avant AfroPulse, je dépendais d'une plateforme étrangère qui prenait 20% de commission. Ici, je garde tout. Trois missions en deux mois : 40% de revenus en plus."}
  ]
};

const CAT_LABEL={design:'Design',dev:'Développement',marketing:'Marketing',redaction:'Rédaction'};

/* Avatar helper — défini ICI et exposé globalement avant tout usage */
function avatar(init,color){
  return `<div class="w-11 h-11 rounded-full grid place-items-center font-bold text-sm shrink-0" style="background:color-mix(in srgb,${color} 15%,transparent);color:${color};border:1px solid color-mix(in srgb,${color} 25%,transparent)">${init}</div>`;
}