/* ═══ THÈME ═══ */
const Theme=(()=>{
  const K='ap-theme',r=document.documentElement;
  const apply=m=>{
    r.classList.toggle('dark',m==='dark');
    document.querySelectorAll('[data-theme-icon]').forEach(i=>{
      i.className=m==='dark'?'fa-solid fa-sun text-sm':'fa-solid fa-moon text-sm';
    });
  };
  return{
    toggle(){const n=r.classList.contains('dark')?'light':'dark';localStorage.setItem(K,n);apply(n)},
    init(){apply(localStorage.getItem(K)||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'))}
  };
})();

/* ═══ PWA ═══ */
const PWA=(()=>{
  return{
    init(){
      if(!document.querySelector('link[rel="manifest"]')){
        const link=document.createElement('link');
        link.rel='manifest';
        link.href='manifest.json';
        document.head.appendChild(link);
      }
      if(!document.querySelector('meta[name="theme-color"]')){
        const meta=document.createElement('meta');
        meta.name='theme-color';
        meta.content='#0b5fff';
        document.head.appendChild(meta);
      }
      if(!document.querySelector('link[rel="apple-touch-icon"]')){
        const apple=document.createElement('link');
        apple.rel='apple-touch-icon';
        apple.href='assets/icon-192.png';
        document.head.appendChild(apple);
      }
      if(!document.querySelector('meta[name="mobile-web-app-capable"]')){
        const m1=document.createElement('meta');
        m1.name='mobile-web-app-capable';
        m1.content='yes';
        document.head.appendChild(m1);
      }
      if(!document.querySelector('meta[name="apple-mobile-web-app-capable"]')){
        const m2=document.createElement('meta');
        m2.name='apple-mobile-web-app-capable';
        m2.content='yes';
        document.head.appendChild(m2);
      }
      if('serviceWorker' in navigator){
        window.addEventListener('load',()=>{
          navigator.serviceWorker.register('/sw.js').catch(()=>{});
        });
      }
    }
  };
})();

/* ═══ LAYOUT (Header + Footer + Drawer) ═══ */
const Layout=(()=>{
  const NAV=[
    {id:'index',url:'index.html',label:'Accueil',icon:'fa-house'},
    {id:'particulier',url:'particulier.html',label:'Particulier',icon:'fa-user'},
    {id:'entreprise',url:'entreprise.html',label:'Entreprise',icon:'fa-building'},
    {id:'talents',url:'talents.html',label:'Talents',icon:'fa-star'},
    {id:'tarifs',url:'tarifs.html',label:'Tarifs',icon:'fa-tags'},
    {id:'a-propos',url:'a-propos.html',label:'À propos',icon:'fa-circle-info'},
    {id:'contact',url:'contact.html',label:'Contact',icon:'fa-headset'}
  ];
  const page=(location.pathname.split('/').pop()||'index.html').replace('.html','')||'index';
  const active=id=>page===id?'active':'';

  const header=`<header class="sticky top-0 z-50 backdrop-blur-xl" style="background:color-mix(in srgb,var(--bg) 85%,transparent);border-bottom:1px solid var(--bd)">
  <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
    <a href="index.html" id="logoLink" class="flex items-center gap-2.5 shrink-0" style="text-decoration:none;color:inherit">
      <img id="logoImg" src="assets/logo.svg" alt="AfroPulse" class="h-9 w-auto" onerror="this.style.display='none';var f=document.getElementById('logoFallback');if(f)f.style.display='grid'">
      <span id="logoFallback" style="display:none;width:2.25rem;height:2.25rem;border-radius:.5rem;place-items:center;background:color-mix(in srgb,var(--ac) 10%,transparent);border:1px solid color-mix(in srgb,var(--ac) 20%,transparent)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ac)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h3l2-5 3 10 3-12 3 8 2-3h3"/></svg>
      </span>
      <span class="leading-none text-left">
        <span class="block text-lg font-extrabold">Afro<span style="color:var(--ac)">Pulse</span></span>
        <span class="hidden sm:block text-[10px] mt-0.5" style="color:var(--mu)">Réseau &amp; Innovation</span>
      </span>
    </a>
    <nav class="hidden md:flex gap-1 p-1 rounded-xl" style="background:var(--bg);border:1px solid var(--bd)">
      ${NAV.map(n=>`<a href="${n.url}" class="nav-link ${active(n.id)}">${n.label}</a>`).join('')}
    </nav>
    <div class="flex items-center gap-2">
      <div id="bellWrap" class="relative hidden sm:block" style="display:none">
        <button id="bellBtn" onclick="Bell.toggle()" aria-label="Notifications" class="w-9 h-9 rounded-lg grid place-items-center relative" style="border:1px solid var(--bd);background:var(--sf);cursor:pointer">
          <i class="fa-solid fa-bell text-sm"></i>
          <span id="bellBadge" style="display:none;position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;padding:0 4px;border-radius:999px;background:var(--er);color:#fff;font-size:9px;font-weight:700;place-items:center;line-height:1">0</span>
        </button>
        <div id="notifPanel" class="hidden absolute right-0 mt-2 w-80 rounded-xl shadow-xl overflow-hidden z-50" style="background:var(--sf);border:1px solid var(--bd)"></div>
      </div>
      <button onclick="Theme.toggle()" aria-label="Thème" class="w-9 h-9 rounded-lg grid place-items-center" style="border:1px solid var(--bd);background:var(--sf);cursor:pointer"><i data-theme-icon class="fa-solid fa-moon text-sm"></i></button>
      <div id="authSlot" class="hidden sm:flex items-center gap-2">
        <a href="login.html" class="btn bo text-xs">Connexion</a>
        <a href="signup.html" class="btn bp text-xs">Inscription</a>
      </div>
      <button onclick="Layout.openDrawer()" aria-label="Ouvrir le menu" aria-controls="apDrawer" class="md:hidden w-9 h-9 rounded-lg grid place-items-center" style="border:1px solid var(--bd);background:var(--sf);cursor:pointer"><i class="fa-solid fa-bars text-sm"></i></button>
    </div>
  </div>
</header>`;

  const drawer=`<div id="apDrawer" class="ap-drawer" aria-hidden="true">
    <div class="ap-drawer-backdrop" id="apDrawerBackdrop"></div>
    <aside class="ap-drawer-panel" role="dialog" aria-modal="true" aria-label="Menu principal">
      <div class="ap-drawer-head">
        <div class="ap-drawer-brand">
          <span class="ap-drawer-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h3l2-5 3 10 3-12 3 8 2-3h3"/></svg>
          </span>
          <span class="ap-drawer-brand-text">Afro<span>Pulse</span></span>
        </div>
        <button id="apDrawerClose" class="ap-drawer-close" type="button" aria-label="Fermer le menu">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div id="apDrawerUser" class="ap-drawer-user"></div>

      <nav class="ap-drawer-nav" aria-label="Navigation principale">
        <div class="ap-drawer-section">Navigation</div>
        ${NAV.map(n=>`<a href="${n.url}" class="ap-drawer-link ${active(n.id)}" data-nav="${n.id}"><i class="fa-solid ${n.icon}"></i><span>${n.label}</span></a>`).join('')}
      </nav>

      <div id="apDrawerActions" class="ap-drawer-actions"></div>
    </aside>
  </div>`;

  const footer=`<footer class="mt-16" style="border-top:1px solid var(--bd)">
  <div class="max-w-6xl mx-auto px-4 py-10">
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
      <div>
        <div class="text-sm font-bold mb-3">Afro<span style="color:var(--ac)">Pulse</span></div>
        <p class="text-xs leading-relaxed" style="color:var(--mu)">Le réseau du talent africain, continent et diaspora.</p>
      </div>
      <div>
        <div class="text-xs font-bold uppercase tracking-wider mb-3" style="color:var(--mu)">Plateforme</div>
        <ul class="space-y-2 text-xs" style="list-style:none;padding:0;margin:0">
          <li><a href="particulier.html" class="hover:underline" style="color:var(--ink);text-decoration:none">Particulier</a></li>
          <li><a href="entreprise.html" class="hover:underline" style="color:var(--ink);text-decoration:none">Entreprise</a></li>
          <li><a href="talents.html" class="hover:underline" style="color:var(--ink);text-decoration:none">Talents</a></li>
          <li><a href="favoris.html" class="hover:underline" style="color:var(--ink);text-decoration:none">Mes favoris</a></li>
          <li><a href="tarifs.html" class="hover:underline" style="color:var(--ink);text-decoration:none">Tarifs</a></li>
        </ul>
      </div>
      <div>
        <div class="text-xs font-bold uppercase tracking-wider mb-3" style="color:var(--mu)">Entreprise</div>
        <ul class="space-y-2 text-xs" style="list-style:none;padding:0;margin:0">
          <li><a href="a-propos.html" class="hover:underline" style="color:var(--ink);text-decoration:none">À propos</a></li>
          <li><a href="contact.html" class="hover:underline" style="color:var(--ink);text-decoration:none">Contact</a></li>
        </ul>
      </div>
      <div>
        <div class="text-xs font-bold uppercase tracking-wider mb-3" style="color:var(--mu)">Support</div>
        <ul class="space-y-2 text-xs" style="list-style:none;padding:0;margin:0">
          <li><a href="https://wa.me/2250150070083" target="_blank" rel="noopener" class="hover:underline" style="color:var(--ink);text-decoration:none"><i class="fa-brands fa-whatsapp mr-1"></i>+225 01 50 07 00 83</a></li>
          <li><a href="https://wa.me/2250574724233" target="_blank" rel="noopener" class="hover:underline" style="color:var(--ink);text-decoration:none"><i class="fa-brands fa-whatsapp mr-1"></i>+225 05 74 72 42 33</a></li>
        </ul>
      </div>
    </div>
    <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style="border-top:1px solid var(--bd);color:var(--mu)">
      <p>© 2026 AfroPulse. Tous droits réservés.</p>
      <p>Développé par <a href="https://lmoportfolio.vercel.app" target="_blank" rel="noopener noreferrer" class="font-semibold hover:underline" style="color:var(--ink)">LMO SERVICES</a></p>
    </div>
  </div>
</footer>`;

  const inject=()=>{
    document.body.insertAdjacentHTML('afterbegin',header);
    document.body.insertAdjacentHTML('beforeend',footer);
    document.body.insertAdjacentHTML('beforeend',drawer);
    bindDrawer();
  };

  function bindDrawer(){
    const d=document.getElementById('apDrawer');
    const backdrop=document.getElementById('apDrawerBackdrop');
    const close=document.getElementById('apDrawerClose');
    if(!d)return;

    backdrop?.addEventListener('click',closeDrawer);
    close?.addEventListener('click',closeDrawer);

    d.querySelectorAll('.ap-drawer-link, .ap-drawer-cta-primary, .ap-drawer-cta-secondary').forEach(a=>{
      a.addEventListener('click',()=>setTimeout(closeDrawer,80));
    });

    document.addEventListener('keydown',e=>{
      if(e.key==='Escape' && d.classList.contains('open'))closeDrawer();
    });

    let startX=null,currentX=null;
    const panel=d.querySelector('.ap-drawer-panel');
    panel?.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;currentX=startX},{passive:true});
    panel?.addEventListener('touchmove',e=>{
      if(startX===null)return;
      currentX=e.touches[0].clientX;
      const dx=currentX-startX;
      if(dx>0)panel.style.transform=`translateX(${dx}px)`;
    },{passive:true});
    panel?.addEventListener('touchend',()=>{
      if(startX===null)return;
      const dx=currentX-startX;
      panel.style.transform='';
      if(dx>80)closeDrawer();
      startX=null;currentX=null;
    });
  }

  function openDrawer(){
    const d=document.getElementById('apDrawer');
    if(!d)return;
    document.getElementById('authMenu')?.classList.add('hidden');
    try{Bell?.close?.()}catch(e){}
    d.classList.add('open');
    d.setAttribute('aria-hidden','false');
    document.body.classList.add('ap-drawer-open');
  }

  function closeDrawer(){
    const d=document.getElementById('apDrawer');
    if(!d)return;
    d.classList.remove('open');
    d.setAttribute('aria-hidden','true');
    document.body.classList.remove('ap-drawer-open');
  }

  return{inject,openDrawer,closeDrawer};
})();

/* ═══ AUTH SLOT + DRAWER USER ═══ */
const AuthSlot=(()=>{
  const initials=n=>(n||'?').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase();
  const loggedOut=`<a href="login.html" class="btn bo text-xs">Connexion</a><a href="signup.html" class="btn bp text-xs">Inscription</a>`;

  const loggedIn=(profile,user)=>{
    const name=profile?.full_name||user?.email||'Utilisateur';
    const ini=initials(name);
    const avatar=profile?.avatar_url
      ?`<img src="${profile.avatar_url}" alt="${name}" class="w-7 h-7 rounded-full object-cover" style="border:1px solid var(--bd)">`
      :`<span class="w-7 h-7 rounded-full grid place-items-center font-bold text-xs" style="background:color-mix(in srgb,var(--ac) 15%,transparent);color:var(--ac)">${ini}</span>`;
    return `<div class="relative">
      <button onclick="AuthSlot.toggle()" class="flex items-center gap-2 px-1.5 py-1 rounded-lg" style="border:1px solid var(--bd);background:var(--sf);cursor:pointer">
        ${avatar}
        <span class="text-xs font-semibold max-w-[100px] truncate">${name}</span>
        <i class="fa-solid fa-chevron-down text-[10px]" style="color:var(--mu)"></i>
      </button>
      <div id="authMenu" class="hidden absolute right-0 mt-2 w-52 rounded-xl shadow-xl overflow-hidden z-50" style="background:var(--sf);border:1px solid var(--bd)">
        <div class="px-4 py-3" style="border-bottom:1px solid var(--bd)">
          <div class="text-xs font-bold truncate">${name}</div>
          <div class="text-[10px] truncate" style="color:var(--mu)">${profile?.email||user?.email||''}</div>
        </div>
        <a href="dashboard.html" class="block px-4 py-2.5 text-xs hover:bg-gray-100 dark:hover:bg-slate-800" style="color:var(--ink);text-decoration:none"><i class="fa-solid fa-gauge w-4 mr-2"></i>Tableau de bord</a>
        <a href="profil.html" class="block px-4 py-2.5 text-xs hover:bg-gray-100 dark:hover:bg-slate-800" style="color:var(--ink);text-decoration:none"><i class="fa-solid fa-user w-4 mr-2"></i>Mon profil</a>
        <a href="messages.html" class="block px-4 py-2.5 text-xs hover:bg-gray-100 dark:hover:bg-slate-800" style="color:var(--ink);text-decoration:none"><i class="fa-solid fa-comments w-4 mr-2"></i>Messages</a>
        <a href="favoris.html" class="block px-4 py-2.5 text-xs hover:bg-gray-100 dark:hover:bg-slate-800" style="color:var(--ink);text-decoration:none"><i class="fa-solid fa-heart w-4 mr-2"></i>Mes favoris</a>
        <a href="mes-activites.html" class="block px-4 py-2.5 text-xs hover:bg-gray-100 dark:hover:bg-slate-800" style="color:var(--ink);text-decoration:none"><i class="fa-solid fa-list-check w-4 mr-2"></i>Mes activités</a>
        <button onclick="Auth.logout()" class="w-full text-left px-4 py-2.5 text-xs hover:bg-gray-100 dark:hover:bg-slate-800" style="color:var(--er);background:none;border:none;cursor:pointer;font-family:inherit;border-top:1px solid var(--bd)"><i class="fa-solid fa-right-from-bracket w-4 mr-2"></i>Déconnexion</button>
      </div>
    </div>`;
  };

  function renderDrawerUser(user,profile){
    const host=document.getElementById('apDrawerUser');
    if(!host)return;
    if(!user){
      host.innerHTML=`
        <div class="ap-drawer-guest">
          <div class="ap-drawer-guest-title">Bienvenue sur AfroPulse</div>
          <div class="ap-drawer-guest-sub">Rejoignez le réseau du talent africain.</div>
        </div>`;
      return;
    }
    const name=profile?.full_name||user?.email||'Utilisateur';
    const ini=initials(name);
    const role=profile?.role==='entreprise'?'entreprise':'particulier';
    const roleLabel=role==='entreprise'?'Entreprise':'Particulier';
    const roleIcon=role==='entreprise'?'fa-building':'fa-user';
    const avatar=profile?.avatar_url
      ?`<img src="${profile.avatar_url}" alt="${name}">`
      :ini;
    host.innerHTML=`
      <div class="ap-drawer-user-card">
        <div class="ap-drawer-user-avatar">${avatar}</div>
        <div class="ap-drawer-user-info">
          <div class="ap-drawer-user-name">${name}</div>
          <div class="ap-drawer-user-role">
            <span class="ap-drawer-user-role-badge ${role}">
              <i class="fa-solid ${roleIcon}"></i>${roleLabel}
            </span>
          </div>
        </div>
      </div>`;
  }

  function renderDrawerActions(user,profile){
    const host=document.getElementById('apDrawerActions');
    if(!host)return;
    if(!user){
      host.innerHTML=`
        <div class="ap-drawer-section">Mon compte</div>
        <a href="login.html" class="ap-drawer-cta-primary"><i class="fa-solid fa-arrow-right-to-bracket"></i>Se connecter</a>
        <a href="signup.html" class="ap-drawer-cta-secondary"><i class="fa-solid fa-user-plus"></i>Créer un compte</a>`;
      return;
    }
    host.innerHTML=`
      <div class="ap-drawer-section">Mon espace</div>
      <a href="dashboard.html" class="ap-drawer-link" data-nav="dashboard"><i class="fa-solid fa-gauge"></i><span>Tableau de bord</span></a>
      <a href="profil.html" class="ap-drawer-link" data-nav="profil"><i class="fa-solid fa-user"></i><span>Mon profil</span></a>
      <a href="messages.html" class="ap-drawer-link" data-nav="messages">
        <i class="fa-solid fa-comments"></i><span>Messages</span>
        <span class="ap-drawer-badge" data-badge="messages" hidden>0</span>
      </a>
      <a href="favoris.html" class="ap-drawer-link" data-nav="favoris"><i class="fa-solid fa-heart"></i><span>Mes favoris</span></a>
      <a href="mes-activites.html" class="ap-drawer-link" data-nav="mes-activites"><i class="fa-solid fa-list-check"></i><span>Mes activités</span></a>
      <button onclick="Auth.logout()" class="ap-drawer-logout"><i class="fa-solid fa-right-from-bracket"></i><span>Déconnexion</span></button>`;
    refreshMessagesBadge();
  }

  async function refreshMessagesBadge(){
    const badge=document.querySelector('[data-badge="messages"]');
    if(!badge)return;
    try{
      const count=await DB.getUnreadCount();
      if(count>0){
        badge.textContent=count>9?'9+':count;
        badge.hidden=false;
      }else{
        badge.hidden=true;
      }
    }catch(e){
      badge.hidden=true;
    }
  }

  return{
    update(user,profile){
      const slot=document.getElementById('authSlot');
      if(slot)slot.innerHTML=user?loggedIn(profile,user):loggedOut;

      const logo=document.getElementById('logoLink');
      if(logo)logo.setAttribute('href',user?'dashboard.html':'index.html');

      renderDrawerUser(user,profile);
      renderDrawerActions(user,profile);

      const page=(location.pathname.split('/').pop()||'index.html').replace('.html','')||'index';
      document.querySelectorAll('.ap-drawer-link').forEach(a=>{
        a.classList.toggle('active',a.dataset.nav===page);
      });
    },
    toggle(){document.getElementById('authMenu')?.classList.toggle('hidden')},
    refreshMessagesBadge
  };
})();

/* ═══ CLOCHE NOTIFICATIONS ═══ */
const Bell=(()=>{
  let interval=null;
  let notifications=[];
  let open=false;

  const timeAgo=iso=>{
    const d=new Date(iso),diff=(Date.now()-d)/1000;
    if(diff<60)return 'à l\'instant';
    if(diff<3600)return `il y a ${Math.floor(diff/60)} min`;
    if(diff<86400)return `il y a ${Math.floor(diff/3600)} h`;
    return d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
  };

  async function refresh(){
    try{
      const [list,count]=await Promise.all([DB.getNotifications(15),DB.getNotificationsUnreadCount()]);
      notifications=list;
      const badge=document.getElementById('bellBadge');
      if(badge){
        badge.textContent=count>9?'9+':count;
        badge.style.display=count>0?'grid':'none';
      }
      if(open)renderPanel();
    }catch(e){}
  }

  function renderPanel(){
    const panel=document.getElementById('notifPanel');
    if(!panel)return;
    if(!notifications.length){
      panel.innerHTML=`<div class="p-6 text-center text-xs" style="color:var(--mu)"><i class="fa-solid fa-bell-slash text-xl mb-2 block opacity-40"></i>Aucune notification</div>`;
      return;
    }
    panel.innerHTML=`
      <div class="flex items-center justify-between px-4 py-3" style="border-bottom:1px solid var(--bd)">
        <span class="text-xs font-bold" style="color:var(--ink)">Notifications</span>
        <button onclick="Bell.markAll()" class="text-[10px] font-semibold" style="color:var(--ac);background:none;border:none;cursor:pointer;font-family:inherit">Tout marquer lu</button>
      </div>
      <div style="max-height:400px;overflow-y:auto">
        ${notifications.map(n=>`
          <div class="px-4 py-3 cursor-pointer" data-nid="${n.id}" data-nlink="${n.link||''}" style="border-bottom:1px solid var(--bd);${!n.read?'background:color-mix(in srgb,var(--ac) 5%,transparent);':''}">
            <div class="flex gap-3">
              <div class="w-8 h-8 rounded-lg grid place-items-center shrink-0" style="background:color-mix(in srgb,var(--ac) 12%,transparent);color:var(--ac)"><i class="fa-solid ${n.icon||'fa-bell'} text-xs"></i></div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-semibold" style="color:var(--ink)">${n.title}</div>
                ${n.body?`<div class="text-[11px] mt-0.5" style="color:var(--mu)">${n.body}</div>`:''}
                <div class="text-[10px] mt-1" style="color:var(--mu);opacity:.7">${timeAgo(n.createdAt)}</div>
              </div>
              ${!n.read?'<span class="w-2 h-2 rounded-full shrink-0" style="background:var(--ac);margin-top:6px"></span>':''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    panel.querySelectorAll('[data-nid]').forEach(el=>{
      el.addEventListener('click',async()=>{
        const id=el.dataset.nid;
        const link=el.dataset.nlink;
        await DB.markNotificationRead(id);
        await refresh();
        if(link)location.href=link;
      });
    });
  }

  function show(s){
    const wrap=document.getElementById('bellWrap');
    if(wrap)wrap.style.display=s?'block':'none';
  }

  function toggle(){
    open=!open;
    const panel=document.getElementById('notifPanel');
    if(!panel)return;
    panel.classList.toggle('hidden',!open);
    if(open)renderPanel();
  }

  function close(){
    open=false;
    document.getElementById('notifPanel')?.classList.add('hidden');
  }

  return{
    init(user){
      if(interval){clearInterval(interval);interval=null}
      if(!user){show(false);return}
      show(true);
      refresh();
      interval=setInterval(refresh,30000);
    },
    toggle,close,refresh,
    async markAll(){await DB.markAllNotificationsRead();await refresh()}
  };
})();

document.addEventListener('click',e=>{
  const m=document.getElementById('authMenu');
  if(m&&!m.classList.contains('hidden')&&!e.target.closest('#authSlot'))m.classList.add('hidden');
  const panel=document.getElementById('notifPanel');
  if(panel&&!panel.classList.contains('hidden')&&!e.target.closest('#bellWrap'))Bell.close();
});

/* ═══ EFFETS DE VIE ═══ */
const Life={
  progressBar(){
    const bar=document.createElement('div');
    bar.className='readbar';
    document.body.appendChild(bar);
    const update=()=>{
      const h=document.documentElement.scrollHeight-window.innerHeight;
      bar.style.width=(h>0?Math.min(100,(window.scrollY/h)*100):0)+'%';
    };
    addEventListener('scroll',update,{passive:true});
    update();
  },
  cursorGlow(){
    if(matchMedia('(pointer:coarse)').matches)return;
    const g=document.createElement('div');
    g.className='cursor-glow';
    document.body.appendChild(g);
    let raf;
    document.addEventListener('mousemove',e=>{
      cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>{
        g.style.left=e.clientX+'px';
        g.style.top=e.clientY+'px';
        g.classList.add('on');
      });
    });
    document.addEventListener('mouseleave',()=>g.classList.remove('on'));
  },
  particles(count=18){
    const host=document.createElement('div');
    host.className='particles-host';
    document.body.appendChild(host);
    const colors=['var(--ac)','var(--gd)','var(--ok)'];
    for(let i=0;i<count;i++){
      const p=document.createElement('div');
      p.className='particle';
      p.style.left=Math.random()*100+'%';
      p.style.animationDuration=(8+Math.random()*8)+'s';
      p.style.animationDelay=(-Math.random()*12)+'s';
      p.style.background=colors[i%3];
      p.style.opacity=(0.1+Math.random()*0.25).toFixed(2);
      host.appendChild(p);
    }
  },
  scrollReveal(){
    const els=document.querySelectorAll('.reveal');
    if(!els.length||!('IntersectionObserver'in window))return;
    const io=new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
    },{threshold:.12,rootMargin:'0px 0px -60px 0px'});
    els.forEach(el=>io.observe(el));
  },
  counters(){
    const els=document.querySelectorAll('[data-count]');
    if(!els.length||!('IntersectionObserver'in window))return;
    const animate=el=>{
      const target=parseInt(el.dataset.count,10);
      if(!target){el.textContent='0';return}
      const dur=1600,start=performance.now();
      const ease=t=>1-Math.pow(1-t,3);
      const fmt=n=>n.toLocaleString('fr-FR').replace(/\u202f|\u00a0/g,' ');
      const tick=now=>{
        const t=Math.min(1,(now-start)/dur);
        el.textContent=fmt(Math.floor(target*ease(t)));
        if(t<1)requestAnimationFrame(tick);else el.textContent=fmt(target);
      };
      requestAnimationFrame(tick);
    };
    const io=new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(e.isIntersecting){animate(e.target);io.unobserve(e.target)}});
    },{threshold:.4});
    els.forEach(el=>io.observe(el));
  },
  onlineCount(){
    const el=document.getElementById('onlineCount');
    if(!el)return;
    let base=parseInt(el.textContent,10)||87;
    setInterval(()=>{
      base=Math.max(60,Math.min(150,base+Math.floor(Math.random()*7)-3));
      el.textContent=base;
    },5000);
  },
  parallax(){
    const hero=document.getElementById('hero');
    if(!hero)return;
    const floating=hero.querySelectorAll('.float-card');
    if(!floating.length)return;
    addEventListener('scroll',()=>{
      const y=window.scrollY;
      if(y>800)return;
      floating.forEach((el,i)=>{el.style.transform=`translateY(${y*(i===0?-0.08:-0.14)}px)`});
    },{passive:true});
  }
};

/* ═══ INIT ═══ */
addEventListener('DOMContentLoaded',async()=>{
  PWA.init();
  Theme.init();
  if(!document.body.dataset.noLayout) Layout.inject();

  if(!document.body.dataset.noLife){
    Life.progressBar();
    Life.cursorGlow();
    Life.particles();
    Life.scrollReveal();
    Life.counters();
    Life.onlineCount();
    Life.parallax();
  }

  if(typeof Auth!=='undefined'){
    Auth.onChange((u,p)=>{
      AuthSlot.update(u,p);
      Bell.init(u);
    });
    await Auth.init();
  }

  if(typeof DB !== 'undefined' && DB.trackPageView){
    DB.trackPageView();
  }
});