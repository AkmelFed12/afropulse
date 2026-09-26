/* ═══ RENDU DES SECTIONS ═══ */
const Render=(()=>{
  const el=id=>document.getElementById(id);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const initials=n=>(n||'?').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase()||'?';
  const avatarHTML=(p,color='var(--ac)')=>{
    if(p.avatar_url)return `<img src="${p.avatar_url}" alt="${esc(p.full_name)}" class="w-11 h-11 rounded-full object-cover shrink-0" style="border:1px solid var(--bd)">`;
    return `<div class="w-11 h-11 rounded-full grid place-items-center font-bold text-sm shrink-0" style="background:color-mix(in srgb,${color} 15%,transparent);color:${color};border:1px solid color-mix(in srgb,${color} 25%,transparent)">${initials(p.full_name)}</div>`;
  };

  let favIds={missions:[],profiles:[]};

  async function loadFavs(){
    const me=Auth.getUser?.();
    if(!me)return;
    try{ favIds=await DB.getFavoriteIds(me.id) }
    catch(e){ favIds={missions:[],profiles:[]} }
  }

  async function toggleFav(btn,type,id,data){
    if(!Auth.requireLogin())return;
    const me=Auth.getUser();
    try{
      const {added}=await DB.toggleFavorite({userId:me.id,targetType:type,targetId:id,targetData:data});
      const arr=type==='mission'?favIds.missions:favIds.profiles;
      const i=arr.indexOf(id);
      if(added&&i===-1)arr.push(id);
      if(!added&&i>=0)arr.splice(i,1);
      const i2=btn.querySelector('i');
      if(added){
        i2.className='fa-solid fa-heart text-sm';
        btn.style.color='var(--er)';
        btn.style.borderColor='color-mix(in srgb,var(--er) 40%,transparent)';
      }else{
        i2.className='fa-regular fa-heart text-sm';
        btn.style.color='';
        btn.style.borderColor='';
      }
    }catch(e){console.error(e)}
  }

  const heartBtn=(isFav,type,id,data)=>`
    <button class="fav-btn w-8 h-8 rounded-lg grid place-items-center transition"
      data-fav-type="${type}" data-fav-id="${esc(id)}"
      style="border:1px solid ${isFav?'color-mix(in srgb,var(--er) 40%,transparent)':'var(--bd)'};background:var(--sf);cursor:pointer;color:${isFav?'var(--er)':'var(--mu)'}"
      title="${isFav?'Retirer des favoris':'Ajouter aux favoris'}">
      <i class="${isFav?'fa-solid':'fa-regular'} fa-heart text-sm"></i>
    </button>`;

  function bindHearts(container,dataMap){
    container.querySelectorAll('[data-fav-type]').forEach(b=>{
      b.addEventListener('click',e=>{
        e.preventDefault();e.stopPropagation();
        const type=b.dataset.favType;
        const id=b.dataset.favId;
        const data=dataMap[type+'__'+id]||null;
        toggleFav(b,type,id,data);
      });
    });
  }

  async function barters(){
    const g=el('gBarter');if(!g)return;

    await UI.load({
      container:g,
      skeletonHtml:UI.skeleton.cards(6),
      loader:async()=>{
        await loadFavs();
        return await DB.getMembers(12);
      },
      onRender:(list)=>{
        if(!list.length){
          g.innerHTML=UI.empty(
            'fa-users',
            'Aucun membre inscrit pour le moment',
            'Soyez le premier à rejoindre le réseau.',
            `<a href="signup.html" class="btn bp text-xs">Créer un compte</a>`
          );
          return;
        }
        const dataMap={};
        list.forEach(p=>{dataMap['profile__'+p.id]={full_name:p.full_name,job_title:p.job_title,city:p.city,avatar_url:p.avatar_url,skills:p.skills}});
        g.innerHTML=list.map(p=>{
          const skills=(p.skills||'').split(',').map(s=>s.trim()).filter(Boolean).slice(0,3);
          const isFav=favIds.profiles.includes(p.id);
          return `<article class="card p-5 flex flex-col">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3 min-w-0 flex-1">
                ${avatarHTML(p,'var(--ac)')}
                <div class="min-w-0 flex-1">
                  <div class="font-semibold text-sm truncate">${esc(p.full_name)}</div>
                  <div class="text-xs flex items-center gap-1" style="color:var(--mu)"><i class="fa-solid fa-location-dot text-[10px]"></i>${esc(p.city||'Afrique')}</div>
                </div>
              </div>
              ${heartBtn(isFav,'profile',p.id,dataMap['profile__'+p.id])}
            </div>
            ${p.job_title?`<div class="text-xs font-semibold mb-2" style="color:var(--ac)">${esc(p.job_title)}</div>`:''}
            ${skills.length?`<div class="flex flex-wrap gap-1 mb-3">${skills.map(s=>`<span class="text-[10px] px-2 py-0.5 rounded-md" style="background:color-mix(in srgb,var(--ok) 10%,transparent);color:var(--ok)">${esc(s)}</span>`).join('')}</div>`:''}
            <p class="text-xs leading-relaxed mb-4 flex-1" style="color:var(--mu);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${esc(p.bio||'Membre AfroPulse.')}</p>
            <div class="flex gap-2">
              <a href="profil-public.html?id=${encodeURIComponent(p.id)}" class="btn bo flex-1 text-xs">Voir le profil</a>
              <button class="btn bp text-xs" data-contact-id="${esc(p.id)}" data-contact-name="${esc(p.full_name)}" style="padding:.7rem .9rem"><i class="fa-solid fa-comment"></i></button>
            </div>
          </article>`;
        }).join('');
        bindHearts(g,dataMap);
        g.querySelectorAll('[data-contact-id]').forEach(b=>{
          b.addEventListener('click',()=>Action.contact(b.dataset.contactId,b.dataset.contactName));
        });
      }
    });
  }

  async function mentors(){
    const g=el('gMentor');if(!g)return;

    await UI.load({
      container:g,
      skeletonHtml:UI.skeleton.cards(6),
      loader:async()=>await DB.getMentors(12),
      onRender:(list)=>{
        if(!list.length){
          g.innerHTML=UI.empty(
            'fa-user-graduate',
            'Aucun mentor disponible',
            'Complétez votre profil pour devenir mentor à votre tour.',
            `<a href="profil.html" class="btn bp text-xs">Compléter mon profil</a>`
          );
          return;
        }
        const dataMap={};
        list.forEach(p=>{dataMap['profile__'+p.id]={full_name:p.full_name,job_title:p.job_title,city:p.city,avatar_url:p.avatar_url,skills:p.skills}});
        g.innerHTML=list.map(p=>{
          const isFav=favIds.profiles.includes(p.id);
          return `<article class="card p-5">
            <div class="flex items-start justify-between mb-4">
              ${avatarHTML(p,'var(--gd)')}
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold px-2 py-1 rounded-md uppercase" style="background:color-mix(in srgb,var(--gd) 12%,transparent);color:var(--gd)">Mentor</span>
                ${heartBtn(isFav,'profile',p.id,dataMap['profile__'+p.id])}
              </div>
            </div>
            <div class="font-semibold text-sm mb-0.5">${esc(p.full_name)}</div>
            <div class="text-xs mb-3" style="color:var(--mu)">${esc(p.job_title||'—')}</div>
            <div class="flex items-center justify-between text-xs pt-3 mb-4" style="border-top:1px solid var(--bd);color:var(--mu)">
              <span><i class="fa-solid fa-location-dot mr-1"></i>${esc(p.city||'—')}</span>
              <span><i class="fa-solid fa-briefcase mr-1"></i>${esc(p.experience||'—')}</span>
            </div>
            <div class="flex gap-2">
              <a href="profil-public.html?id=${encodeURIComponent(p.id)}" class="btn bo flex-1 text-xs">Voir</a>
              <button class="btn bp flex-1 text-xs" data-mentor-id="${esc(p.id)}" data-mentor-name="${esc(p.full_name)}"><i class="fa-regular fa-calendar text-xs"></i>Demander</button>
            </div>
          </article>`;
        }).join('');
        bindHearts(g,dataMap);
        g.querySelectorAll('[data-mentor-id]').forEach(b=>{
          b.addEventListener('click',()=>Action.mentor(b.dataset.mentorId,b.dataset.mentorName));
        });
      }
    });
  }

  async function missions(filter='all'){
    const g=el('gMission');if(!g)return;

    await UI.load({
      container:g,
      skeletonHtml:UI.skeleton.cards(6),
      loader:async()=>await DB.getMissions(),
      onRender:(real)=>{
        if(!real.length){
          g.innerHTML=UI.empty(
            'fa-briefcase',
            'Aucune mission disponible',
            'Les entreprises publient régulièrement de nouvelles missions.',
            `<a href="entreprise.html" class="btn bp text-xs">Publier une mission</a>`
          );
          return;
        }
        const CAT_LABEL_REAL={design:'Design',dev:'Développement',marketing:'Marketing',redaction:'Rédaction',autre:'Autre'};
        const list=filter==='all'?real:real.filter(m=>m.category===filter);
        if(!list.length){
          g.innerHTML=UI.empty('fa-filter','Aucune mission dans cette catégorie','Essayez une autre catégorie ou revenez plus tard.',`<button onclick="Render.init()" class="btn bo text-xs">Voir toutes</button>`);
          return;
        }
        const dataMap={};
        list.forEach(m=>{dataMap['mission__'+m.id]={title:m.title,business_name:m.business_name,budget:m.budget,duration:m.duration,location:m.location,category:m.category}});
        g.innerHTML=list.map(m=>{
          const label=CAT_LABEL_REAL[m.category]||CAT_LABEL[m.category]||m.category;
          const verified=m.business_verified!==false;
          const isFav=favIds.missions.includes(m.id);
          return `<article class="card p-5 flex flex-col">
            <div class="flex items-center justify-between mb-3">
              <span class="text-[10px] font-bold px-2 py-1 rounded-md uppercase" style="background:color-mix(in srgb,var(--ac) 10%,transparent);color:var(--ac)">${label}</span>
              <div class="flex items-center gap-2">
                ${verified?`<span class="text-[10px] flex items-center gap-1" style="color:var(--ok)"><i class="fa-solid fa-circle-check"></i>RCCM</span>`:''}
                ${heartBtn(isFav,'mission',m.id,dataMap['mission__'+m.id])}
              </div>
            </div>
            <h3 class="font-semibold text-sm mb-2 leading-snug">${esc(m.title)}</h3>
            <div class="text-xs mb-4 flex items-center gap-1" style="color:var(--mu)"><i class="fa-solid fa-building text-[10px]"></i>${esc(m.business_name)}${m.location?' · '+esc(m.location):''}</div>
            <div class="flex items-center justify-between text-xs mb-4 pt-3" style="border-top:1px solid var(--bd)">
              ${m.budget?`<span class="font-semibold" style="color:var(--ok)">${esc(m.budget)} FCFA</span>`:'<span></span>'}
              ${m.duration?`<span style="color:var(--mu)"><i class="fa-regular fa-clock mr-1"></i>${esc(m.duration)}</span>`:''}
            </div>
            <button class="btn bo w-full text-xs mt-auto" data-apply='${JSON.stringify({title:m.title,company:m.business_name,budget:m.budget||'',companyId:m.business_id||'',missionId:m.id||''}).replace(/'/g,"&#39;")}'>Envoyer ma candidature</button>
          </article>`;
        }).join('');
        bindHearts(g,dataMap);
        g.querySelectorAll('[data-apply]').forEach(b=>{
          b.addEventListener('click',()=>{
            try{
              const d=JSON.parse(b.dataset.apply.replace(/&#39;/g,"'"));
              Action.apply(d.title,d.company,d.budget,d.companyId,d.missionId);
            }catch(e){console.error(e)}
          });
        });
      }
    });
  }

  function testimonials(){
    const g=el('gTesti');if(!g)return;
    g.innerHTML=DATA.testimonials.map(t=>`<figure class="card p-6 flex flex-col">
      <div class="flex gap-1 mb-4" style="color:var(--gd)">${'<i class="fa-solid fa-star text-xs"></i>'.repeat(5)}</div>
      <blockquote class="text-sm leading-relaxed mb-5 flex-1">« ${esc(t.q)} »</blockquote>
      <figcaption class="flex items-center gap-3 pt-4" style="border-top:1px solid var(--bd)">
        <div class="w-11 h-11 rounded-full grid place-items-center font-bold text-sm shrink-0" style="background:color-mix(in srgb,${t.col} 15%,transparent);color:${t.col};border:1px solid color-mix(in srgb,${t.col} 25%,transparent)">${t.a}</div>
        <div class="text-xs min-w-0">
          <div class="font-semibold truncate">${esc(t.n)}</div>
          <div class="truncate" style="color:var(--mu)">${esc(t.r)}</div>
          <div class="flex items-center gap-1 mt-0.5" style="color:var(--mu)"><i class="fa-solid fa-location-dot text-[10px]"></i><span class="truncate">${esc(t.c)}</span></div>
        </div>
      </figcaption>
    </figure>`).join('');
  }

  return{
    init(){
      barters();mentors();missions();testimonials();
      const w=el('gFilters');
      w?.addEventListener('click',e=>{
        const b=e.target.closest('button[data-cat]');if(!b)return;
        w.querySelectorAll('button').forEach(x=>{x.style.background='';x.style.color='';x.style.borderColor=''});
        b.style.background='var(--ac)';b.style.color='#fff';b.style.borderColor='var(--ac)';
        missions(b.dataset.cat);
      });
    }
  };
})();

/* ═══ ACTIONS PROTÉGÉES ═══ */
const Action=(()=>{
  const need=()=>{
    if(typeof Auth==='undefined'){alert('Erreur : module auth indisponible.');return false}
    return Auth.requireLogin();
  };
  function toast(msg,ok=true){
    if(typeof UI!=='undefined') return UI.toast(msg, ok?'ok':'error');
    let t=document.getElementById('actionToast');
    if(!t){t=document.createElement('div');t.id='actionToast';document.body.appendChild(t)}
    t.innerHTML=`<i class="fa-solid ${ok?'fa-circle-check':'fa-circle-exclamation'}" style="color:${ok?'var(--ok)':'var(--er)'}"></i><span>${msg}</span>`;
    t.classList.add('on');
    clearTimeout(toast._t);
    toast._t=setTimeout(()=>t.classList.remove('on'),3500);
  }
  function askMessage(title,placeholder,callback){
    const m=document.createElement('div');
    m.className='fixed inset-0 z-[300] flex items-center justify-center p-4';
    m.style.cssText+='background:rgba(0,0,0,.55);backdrop-filter:blur(6px)';
    m.innerHTML=`<div class="card-static p-6 w-full max-w-md" style="background:var(--sf);border:1px solid var(--bd)">
      <div class="text-base font-bold mb-1" style="color:var(--ink)">${title}</div>
      <p class="text-xs mb-4" style="color:var(--mu)">Ajoutez un message (optionnel).</p>
      <textarea id="actionMsg" class="input" rows="4" placeholder="${placeholder||'Bonjour…'}"></textarea>
      <div class="flex gap-2 mt-4">
        <button id="actionCancel" class="btn bo flex-1">Annuler</button>
        <button id="actionConfirm" class="btn bp flex-1">Envoyer</button>
      </div>
    </div>`;
    document.body.appendChild(m);
    m.querySelector('#actionConfirm').onclick=()=>{const msg=m.querySelector('#actionMsg').value.trim();m.remove();callback(msg)};
    m.querySelector('#actionCancel').onclick=()=>m.remove();
    m.addEventListener('click',e=>{if(e.target===m)m.remove()});
  }

  async function startConversation(targetId,targetName,prefill){
    const p=Auth.getProfile(),u=Auth.getUser();
    if(!u)return;
    if(!targetId||targetId.startsWith('demo-')){toast('Ce profil est une démonstration.',false);return}
    try{
      await DB.sendMessage({
        senderId:u.id,senderName:p?.full_name||u.email,
        recipientId:targetId,recipientName:targetName,
        conversationId:DB._convIdPublic(u.id,targetId),
        content:prefill
      });
      try{
        const target=await DB.getProfileById(targetId);
        if(target?.email){
          const tpl=DB.templateMessage({sender:p?.full_name||u.email,preview:prefill.slice(0,100)});
          DB.notify({recipientId:targetId,to:target.email,toName:target.full_name,subject:tpl.subject,htmlBody:tpl.html,type:'message'});
        }
        DB.createNotification({
          userId:targetId,type:'message',
          title:`Nouveau message de ${p?.full_name||u.email}`,
          body:prefill.slice(0,80),
          link:'messages.html',
          icon:'fa-comment'
        });
      }catch(e){}
      toast('Message envoyé. Ouverture…');
      setTimeout(()=>{location.href=`messages.html?with=${encodeURIComponent(targetId)}&name=${encodeURIComponent(targetName)}`},700);
    }catch(e){console.error(e);toast('Erreur : '+e.message,false)}
  }

  return{
    async contact(targetId,name){
      if(!need())return;
      askMessage(`Contacter ${name}`,`Bonjour ${name.split(' ')[0]}, je souhaite échanger avec vous.`,async message=>{
        await startConversation(targetId,name,message||`Bonjour ${name.split(' ')[0]}, je souhaite échanger avec vous.`);
      });
    },
    async mentor(targetId,name){
      if(!need())return;
      askMessage(`Demander un créneau à ${name}`,`Bonjour ${name.split(' ')[0]}, j'aimerais bénéficier de votre accompagnement.`,async message=>{
        await startConversation(targetId,name,message||`Bonjour ${name.split(' ')[0]}, j'aimerais bénéficier de votre accompagnement.`);
      });
    },
    async apply(title,company,budget,companyId,missionId){
      if(!need())return;
      askMessage(`Postuler — ${title}`,`Bonjour, je souhaite postuler à cette mission. Voici ma motivation…`,async message=>{
        const p=Auth.getProfile(),u=Auth.getUser();
        try{
          await DB.saveApplication({
            userId:u.id,userName:p?.full_name||u.email,userEmail:u.email,
            title,company,budget,message,
            businessId:companyId,missionId
          });
          if(companyId){
            try{
              const target=await DB.getProfileById(companyId);
              if(target?.email){
                const tpl=DB.templateCandidature({candidat:p?.full_name||u.email,mission:title,company,budget});
                DB.notify({recipientId:companyId,to:target.email,toName:target.full_name,subject:tpl.subject,htmlBody:tpl.html,type:'candidature',metadata:{title,company,budget}});
              }
              DB.createNotification({
                userId:companyId,type:'candidature',
                title:`Nouvelle candidature — ${title}`,
                body:`${p?.full_name||u.email} a postulé`,
                link:'candidatures.html',
                icon:'fa-paper-plane'
              });
            }catch(e){}
          }
          toast(`Candidature envoyée à ${company}.`);
        }catch(e){console.error(e);toast('Erreur : '+e.message,false)}
      });
    }
  };
})();