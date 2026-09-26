/* ═══════════════════════════════════════════════════════════════════════
   Clés Supabase, lues depuis window.ENV (généré au build par Netlify)
   ═══════════════════════════════════════════════════════════════════════ */
const ENV = (typeof window !== 'undefined' && window.ENV) || {};
const SUPABASE_URL = ENV.SUPABASE_URL || '';
const SUPABASE_KEY = ENV.SUPABASE_KEY || '';

const DB=(()=>{
  const ready=!!SUPABASE_URL&&!!SUPABASE_KEY;
  let client=null;
  if(ready){
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    s.onload=()=>{client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);window.__sb=client};
    document.head.appendChild(s);
  }
  const wait=()=>new Promise(r=>{
    if(!ready||client)return r();
    const t=setInterval(()=>{if(client){clearInterval(t);r()}},50);
  });
  const ls={get:k=>JSON.parse(localStorage.getItem(k)||'[]'),set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};

  return{
    /* ─── Abonnements ─── */
    async saveSubscription(d){
      if(!ready){const a=ls.get('ap_subscriptions');a.push(d);ls.set('ap_subscriptions',a);return d}
      await wait();
      const {data,error}=await client.from('subscriptions').insert({
        user_name:d.name,plan_name:d.plan,
        billing_cycle:d.cycle==='monthly'||d.cycle==='m'?'monthly':'yearly',
        amount:d.amount,gateway:d.gateway,tx_reference:d.ref,status:'en_attente'
      }).select().single();
      if(error)throw error;return data;
    },
    async getSubscriptions(){
      if(!ready)return ls.get('ap_subscriptions');
      await wait();
      const {data,error}=await client.from('subscriptions').select('*').order('created_at',{ascending:false});
      if(error)return [];
      return data.map(x=>({id:x.id,ref:x.tx_reference,plan:x.plan_name,cycle:x.billing_cycle,amount:x.amount,gateway:x.gateway,name:x.user_name,status:x.status,createdAt:x.created_at}));
    },
    async updateSubscriptionStatus(id,status){
      if(!ready){const a=ls.get('ap_subscriptions');const i=a.findIndex(x=>x.ref===id||x.id===id);if(i>=0)a[i].status=status;ls.set('ap_subscriptions',a);return}
      await wait();
      await client.from('subscriptions').update({status}).eq('id',id);
    },

    /* ─── RCCM ─── */
    async saveRccm(d){
      if(!ready){
        const a=ls.get('ap_rccm_queue');
        a.push(d);
        ls.set('ap_rccm_queue',a);
        return d;
      }
      await wait();

      let documentPath = d.fileName || null;

      if(d.file){
        if(d.file.type !== 'application/pdf'){
          throw new Error('Seul le format PDF est accepté.');
        }
        if(d.file.size > 5 * 1024 * 1024){
          throw new Error('Fichier trop volumineux (5 Mo maximum).');
        }

        const ext = (d.file.name.split('.').pop() || 'pdf').toLowerCase();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;

        const { error: upErr } = await client.storage
          .from('rccm')
          .upload(path, d.file, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'application/pdf'
          });

        if(upErr) throw new Error('Upload RCCM échoué : ' + upErr.message);
        documentPath = path;
      }

      const { data, error } = await client.from('businesses').insert({
        company_name: d.company,
        rccm_number: d.rccm,
        cc_number: d.cc,
        document_url: documentPath,
        status: 'en_attente'
      }).select().single();

      if(error) throw error;
      return data;
    },

    async getRccm(){
      if(!ready) return ls.get('ap_rccm_queue');
      await wait();
      const { data, error } = await client.from('businesses')
        .select('*').order('created_at',{ascending:false});
      if(error) return [];
      return data.map(x => ({
        id: x.id,
        ref: 'AP-RCCM-' + x.id.slice(0,6).toUpperCase(),
        company: x.company_name,
        rccm: x.rccm_number,
        cc: x.cc_number,
        documentUrl: x.document_url,
        status: x.status,
        createdAt: x.created_at
      }));
    },

    async getRccmSignedUrl(pathOrUrl, expiresIn = 3600){
      if(!pathOrUrl) return null;
      if(/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
      if(!ready) return null;
      await wait();
      const { data, error } = await client.storage
        .from('rccm')
        .createSignedUrl(pathOrUrl, expiresIn);
      if(error) return null;
      return data?.signedUrl || null;
    },

    async updateRccmStatus(id,status){
      if(!ready){
        const a=ls.get('ap_rccm_queue');
        const i=a.findIndex(x=>x.ref===id||x.id===id);
        if(i>=0)a[i].status=status;
        ls.set('ap_rccm_queue',a);
        return;
      }
      await wait();
      await client.from('businesses').update({status}).eq('id',id);
    },

    /* ─── Stats publiques ─── */
    async getPublicStats(){
      if(!ready)return {profiles:0,businesses:0,missions:0,countries:0};
      await wait();
      try{
        const [p,b,m]=await Promise.all([
          client.from('profiles').select('id',{count:'exact',head:true}),
          client.from('businesses').select('id',{count:'exact',head:true}).eq('status','approuve'),
          client.from('missions').select('id',{count:'exact',head:true}).eq('status','active')
        ]);
        const {data:cities}=await client.from('profiles').select('city').not('city','is',null);
        const countries=new Set((cities||[]).map(c=>{
          const parts=(c.city||'').split(',').map(s=>s.trim());
          return parts[parts.length-1]||'';
        }).filter(Boolean));
        return {profiles:p.count||0,businesses:b.count||0,missions:m.count||0,countries:countries.size||0};
      }catch(e){return {profiles:0,businesses:0,missions:0,countries:0}}
    },

    /* ─── Activité récente ─── */
    async getRecentActivity(limit=5){
      if(!ready)return [];
      await wait();
      try{
        const {data,error}=await client.from('profiles')
          .select('full_name,city,role,created_at')
          .order('created_at',{ascending:false})
          .limit(limit);
        if(!error && data && data.length){
          return data;
        }
        const r2=await client.from('profiles')
          .select('full_name,city,created_at')
          .order('created_at',{ascending:false})
          .limit(limit);
        if(!r2.error && r2.data && r2.data.length){
          return r2.data.map(x=>({...x,role:'particulier'}));
        }
        return [];
      }catch(e){
        return [];
      }
    },

    /* ─── Compteur en ligne ─── */
    async getOnlineCount(){
      if(!ready)return {count:15,isReal:false};
      await wait();
      try{
        const since=new Date(Date.now()-24*3600*1000).toISOString();
        const {count,error}=await client.from('profiles')
          .select('id',{count:'exact',head:true})
          .gte('created_at',since);
        if(!error){
          const base=Math.max(8,Math.min(60,(count||0)*3+12));
          return {count:base,isReal:true};
        }
        return {count:15,isReal:false};
      }catch(e){return {count:15,isReal:false}}
    },

    /* ─── Stats admin ─── */
    async getAdminStats(){
      if(!ready)return {daily:[],revenue:[],topCities:[],topSkills:[]};
      await wait();
      try{
        const since=new Date(Date.now()-30*24*3600*1000).toISOString();
        const {data:profs}=await client.from('profiles').select('created_at,city,skills,role').gte('created_at',since);
        const byDay={};
        (profs||[]).forEach(p=>{
          const d=new Date(p.created_at).toISOString().slice(0,10);
          if(!byDay[d])byDay[d]={jour:d,particuliers:0,entreprises:0,total:0};
          byDay[d].total++;
          if(p.role==='entreprise')byDay[d].entreprises++;else byDay[d].particuliers++;
        });
        const daily=Object.values(byDay).sort((a,b)=>a.jour.localeCompare(b.jour));

        const {data:subs}=await client.from('subscriptions').select('created_at,amount,status').eq('status','actif');
        const byMonth={};
        (subs||[]).forEach(s=>{
          const m=new Date(s.created_at).toISOString().slice(0,7);
          if(!byMonth[m])byMonth[m]={mois:m,total:0,count:0};
          byMonth[m].total+=Number(s.amount||0);
          byMonth[m].count++;
        });
        const revenue=Object.values(byMonth).sort((a,b)=>a.mois.localeCompare(b.mois)).slice(-12);

        const cityCount={};
        (profs||[]).forEach(p=>{
          if(!p.city)return;
          const parts=p.city.split(',').map(s=>s.trim());
          const city=parts[0]||p.city;
          cityCount[city]=(cityCount[city]||0)+1;
        });
        const topCities=Object.entries(cityCount).map(([name,count])=>({name,count}))
          .sort((a,b)=>b.count-a.count).slice(0,10);

        const skillCount={};
        (profs||[]).forEach(p=>{
          if(!p.skills)return;
          p.skills.split(',').map(s=>s.trim()).filter(Boolean).forEach(s=>{
            skillCount[s]=(skillCount[s]||0)+1;
          });
        });
        const topSkills=Object.entries(skillCount).map(([name,count])=>({name,count}))
          .sort((a,b)=>b.count-a.count).slice(0,10);

        return {daily,revenue,topCities,topSkills};
      }catch(e){return {daily:[],revenue:[],topCities:[],topSkills:[]}}
    },

    /* ─── Profils ─── */
    async getMembers(limit=12){
      if(!ready)return (typeof DATA!=='undefined'?DATA.barters:[]).map((b,i)=>({
        id:'demo-'+i,full_name:b.n,city:b.c,avatar_url:null,job_title:b.o,skills:b.o,bio:b.d,role:'particulier'
      }));
      await wait();
      const {data,error}=await client.from('profiles')
        .select('id,full_name,city,avatar_url,job_title,skills,bio,role')
        .eq('role','particulier').order('created_at',{ascending:false}).limit(limit);
      if(error)return [];
      return (data||[]).filter(p=>p.full_name);
    },
    async getMentors(limit=12){
      if(!ready)return (typeof DATA!=='undefined'?DATA.mentors:[]).map((m,i)=>({
        id:'demo-mentor-'+i,full_name:m.n,city:m.c,avatar_url:null,job_title:m.r,experience:m.x,skills:m.t,bio:`${m.r} · ${m.o}`,role:'particulier'
      }));
      await wait();
      const {data,error}=await client.from('profiles')
        .select('id,full_name,city,avatar_url,job_title,experience,skills,bio,role')
        .eq('role','particulier').not('job_title','is',null).neq('job_title','')
        .order('created_at',{ascending:false}).limit(limit);
      if(error)return [];
      return (data||[]).filter(p=>p.full_name&&p.job_title);
    },
    async getProfileById(id){
      if(!ready)return null;
      await wait();
      const {data,error}=await client.from('profiles').select('*').eq('id',id).single();
      if(error)return null;return data;
    },
    async searchTalents({q='',country='',role='',limit=100}={}){
      if(!ready)return (typeof DATA!=='undefined'?DATA.barters:[]).map((b,i)=>({
        id:'demo-'+i,full_name:b.n,city:b.c,avatar_url:null,job_title:b.o,skills:b.o,bio:b.d,role:'particulier'
      }));
      await wait();
      let query=client.from('profiles').select('id,full_name,city,avatar_url,job_title,experience,skills,bio,role');
      if(role)query=query.eq('role',role);
      if(q){
        const term=`%${q}%`;
        query=query.or(`full_name.ilike.${term},job_title.ilike.${term},skills.ilike.${term},bio.ilike.${term}`);
      }
      if(country)query=query.ilike('city',`%${country}`);
      const {data,error}=await query.order('created_at',{ascending:false}).limit(limit);
      if(error)return [];
      return (data||[]).filter(p=>p.full_name);
    },

    /* ─── Candidatures ─── */
    async saveApplication(d){
      if(!ready){const a=ls.get('ap_applications');a.push({...d,id:Date.now().toString(),createdAt:new Date().toISOString()});ls.set('ap_applications',a);return d}
      await wait();
      const {data,error}=await client.from('applications').insert({
        user_id:d.userId,user_name:d.userName,user_email:d.userEmail,
        mission_id:d.missionId||null,business_id:d.businessId||null,
        mission_title:d.title,mission_company:d.company,mission_budget:d.budget,
        message:d.message||null,status:'envoyee'
      }).select().single();
      if(error)throw error;return data;
    },
    async getApplications(){
      if(!ready)return ls.get('ap_applications');
      await wait();
      const {data:{user}}=await client.auth.getUser();
      if(!user)return [];
      const {data,error}=await client.from('applications').select('*').eq('user_id',user.id).order('created_at',{ascending:false});
      if(error)return [];
      return data.map(x=>({id:x.id,title:x.mission_title,company:x.mission_company,budget:x.mission_budget,status:x.status,message:x.message,createdAt:x.created_at,businessId:x.business_id,missionId:x.mission_id}));
    },
    async getBusinessApplications(){
      if(!ready)return [];
      await wait();
      const {data:{user}}=await client.auth.getUser();
      if(!user)return [];
      const {data,error}=await client.from('applications').select('*').eq('business_id',user.id).order('created_at',{ascending:false});
      if(error)return [];
      return data.map(x=>({id:x.id,userId:x.user_id,userName:x.user_name,userEmail:x.user_email,title:x.mission_title,company:x.mission_company,budget:x.mission_budget,status:x.status,message:x.message,createdAt:x.created_at}));
    },
    async updateApplicationStatus(id,status){
      if(!ready){const a=ls.get('ap_applications');const i=a.findIndex(x=>x.id===id);if(i>=0)a[i].status=status;ls.set('ap_applications',a);return}
      await wait();
      await client.from('applications').update({status}).eq('id',id);
    },
    async deleteApplication(id){
      if(!ready){ls.set('ap_applications',ls.get('ap_applications').filter(x=>x.id!==id));return}
      await wait();
      await client.from('applications').delete().eq('id',id);
    },

    /* ─── Contacts ─── */
    async saveContact(d){
      if(!ready){const a=ls.get('ap_contacts');a.push({...d,id:Date.now().toString(),createdAt:new Date().toISOString()});ls.set('ap_contacts',a);return d}
      await wait();
      const {data,error}=await client.from('contacts').insert({
        user_id:d.userId,user_name:d.userName,
        contact_type:d.type,target_name:d.target,
        message:d.message||null,status:'envoyee'
      }).select().single();
      if(error)throw error;return data;
    },
    async getContacts(){
      if(!ready)return ls.get('ap_contacts');
      await wait();
      const {data:{user}}=await client.auth.getUser();
      if(!user)return [];
      const {data,error}=await client.from('contacts').select('*').eq('user_id',user.id).order('created_at',{ascending:false});
      if(error)return [];
      return data.map(x=>({id:x.id,type:x.contact_type,target:x.target_name,status:x.status,message:x.message,createdAt:x.created_at}));
    },
    async deleteContact(id){
      if(!ready){ls.set('ap_contacts',ls.get('ap_contacts').filter(x=>x.id!==id));return}
      await wait();
      await client.from('contacts').delete().eq('id',id);
    },

    /* ─── Missions ─── */
    async saveMission(d){
      if(!ready){const a=ls.get('ap_missions');a.push({...d,id:Date.now().toString(),createdAt:new Date().toISOString()});ls.set('ap_missions',a);return d}
      await wait();
      const {data,error}=await client.from('missions').insert({
        business_id:d.businessId,business_name:d.businessName,business_verified:d.businessVerified||false,
        title:d.title,category:d.category,description:d.description,
        budget:d.budget||null,duration:d.duration||null,location:d.location||null,status:'active'
      }).select().single();
      if(error)throw error;return data;
    },
    async updateMission(id, d){
      if(!ready) throw new Error('Supabase non disponible');
      await wait();
      const fields = {};
      if(d.title !== undefined) fields.title = d.title;
      if(d.category !== undefined) fields.category = d.category;
      if(d.description !== undefined) fields.description = d.description;
      if(d.budget !== undefined) fields.budget = d.budget;
      if(d.duration !== undefined) fields.duration = d.duration;
      if(d.location !== undefined) fields.location = d.location;
      if(d.status !== undefined) fields.status = d.status;
      const {data, error} = await client.from('missions').update(fields).eq('id', id).select().single();
      if(error) throw error;
      return data;
    },
    async getMissions(){
      if(!ready){
        const stored=ls.get('ap_missions');
        if(stored.length)return stored;
        return (typeof DATA!=='undefined'?DATA.missions:[]).map((m,i)=>({
          id:'demo-'+i,title:m.t,category:m.c,description:'Mission de démonstration.',
          business_name:m.co,business_verified:true,location:m.ci,budget:m.b,duration:m.d,createdAt:new Date().toISOString()
        }));
      }
      await wait();
      const {data,error}=await client.from('missions').select('*').eq('status','active').order('created_at',{ascending:false});
      if(error)return [];
      return data.map(x=>({id:x.id,title:x.title,category:x.category,description:x.description,business_name:x.business_name,business_verified:x.business_verified,budget:x.budget,duration:x.duration,location:x.location,business_id:x.business_id,createdAt:x.created_at}));
    },
    async getMyMissions(){
      if(!ready)return ls.get('ap_missions');
      await wait();
      const {data:{user}}=await client.auth.getUser();
      if(!user)return [];
      const {data,error}=await client.from('missions').select('*').eq('business_id',user.id).order('created_at',{ascending:false});
      if(error)return [];
      return data.map(x=>({id:x.id,title:x.title,category:x.category,description:x.description,budget:x.budget,duration:x.duration,location:x.location,status:x.status,createdAt:x.created_at}));
    },
    async getCompanyMissions(businessId){
      if(!ready)return [];
      await wait();
      const {data,error}=await client.from('missions').select('*')
        .eq('business_id',businessId).eq('status','active').order('created_at',{ascending:false});
      if(error)return [];
      return data.map(x=>({id:x.id,title:x.title,category:x.category,description:x.description,budget:x.budget,duration:x.duration,location:x.location,createdAt:x.created_at}));
    },
    async deleteMission(id){
      if(!ready){ls.set('ap_missions',ls.get('ap_missions').filter(x=>x.id!==id));return}
      await wait();
      await client.from('missions').delete().eq('id',id);
    },

    /* ─── Avis ─── */
    async saveReview(d){
      if(!ready){
        const a=ls.get('ap_reviews');
        a.push({...d,id:Date.now().toString(),createdAt:new Date().toISOString()});
        ls.set('ap_reviews',a);
        return d;
      }
      await wait();
      const {data,error}=await client.from('reviews').insert({
        author_id:d.authorId,author_name:d.authorName,author_role:d.authorRole,
        target_id:d.targetId,target_role:d.targetRole,
        rating:d.rating,comment:d.comment||null,mission_title:d.missionTitle||null
      }).select().single();
      if(error)throw error;return data;
    },
    async getReviews(targetId){
      if(!ready){
        return ls.get('ap_reviews').filter(r=>r.targetId===targetId)
          .sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
      }
      await wait();
      const {data,error}=await client.from('reviews')
        .select('*').eq('target_id',targetId).order('created_at',{ascending:false});
      if(error)return [];
      return data.map(x=>({
        id:x.id,authorId:x.author_id,authorName:x.author_name,authorRole:x.author_role,
        rating:x.rating,comment:x.comment,missionTitle:x.mission_title,createdAt:x.created_at
      }));
    },
    async getRating(targetId){
      if(!ready){
        const r=ls.get('ap_reviews').filter(x=>x.targetId===targetId);
        if(!r.length)return {count:0,average:0};
        return {count:r.length,average:Math.round(r.reduce((s,x)=>s+x.rating,0)/r.length*10)/10};
      }
      await wait();
      const {data,error}=await client.from('ratings').select('*').eq('target_id',targetId).single();
      if(error||!data)return {count:0,average:0};
      return {count:data.reviews_count||0,average:Number(data.average_rating)||0};
    },
    async hasReviewed(authorId,targetId){
      if(!ready)return false;
      await wait();
      const {data,error}=await client.from('reviews')
        .select('id').eq('author_id',authorId).eq('target_id',targetId).limit(1);
      if(error)return false;
      return (data||[]).length>0;
    },

    /* ─── Favoris ─── */
    async toggleFavorite({userId,targetType,targetId,targetData}){
      if(!ready)return {added:false};
      await wait();
      const {data:existing}=await client.from('favorites')
        .select('id').eq('user_id',userId).eq('target_type',targetType).eq('target_id',targetId).limit(1);
      if(existing&&existing.length){
        await client.from('favorites').delete().eq('id',existing[0].id);
        return {added:false};
      }
      await client.from('favorites').insert({
        user_id:userId,target_type:targetType,target_id:targetId,target_data:targetData||null
      });
      return {added:true};
    },
    async getFavorites(){
      if(!ready)return [];
      await wait();
      const {data:{user}}=await client.auth.getUser();
      if(!user)return [];
      const {data,error}=await client.from('favorites').select('*').eq('user_id',user.id).order('created_at',{ascending:false});
      if(error)return [];
      return data.map(x=>({id:x.id,type:x.target_type,targetId:x.target_id,data:x.target_data,createdAt:x.created_at}));
    },
    async getFavoriteIds(userId){
      if(!ready)return {missions:[],profiles:[]};
      await wait();
      const {data}=await client.from('favorites').select('target_type,target_id').eq('user_id',userId);
      const result={missions:[],profiles:[]};
      (data||[]).forEach(f=>{
        if(f.target_type==='mission')result.missions.push(f.target_id);
        if(f.target_type==='profile')result.profiles.push(f.target_id);
      });
      return result;
    },
    async deleteFavorite(id){
      if(!ready)return;
      await wait();
      await client.from('favorites').delete().eq('id',id);
    },

    /* ─── Notifications in-app ─── */
    async createNotification({userId,type,title,body,link,icon}){
      if(!ready||!userId)return;
      await wait();
      try{
        await client.from('user_notifications').insert({
          user_id:userId,type,title,body:body||null,link:link||null,icon:icon||null
        });
      }catch(e){}
    },
    async getNotifications(limit=15){
      if(!ready)return [];
      await wait();
      const {data:{user}}=await client.auth.getUser();
      if(!user)return [];
      const {data,error}=await client.from('user_notifications').select('*')
        .eq('user_id',user.id).order('created_at',{ascending:false}).limit(limit);
      if(error)return [];
      return data.map(x=>({id:x.id,type:x.type,title:x.title,body:x.body,link:x.link,icon:x.icon,read:x.read,createdAt:x.created_at}));
    },
    async getNotificationsUnreadCount(){
      if(!ready)return 0;
      await wait();
      const {data:{user}}=await client.auth.getUser();
      if(!user)return 0;
      const {count}=await client.from('user_notifications')
        .select('id',{count:'exact',head:true}).eq('user_id',user.id).eq('read',false);
      return count||0;
    },
    async markNotificationRead(id){
      if(!ready)return;
      await wait();
      await client.from('user_notifications').update({read:true}).eq('id',id);
    },
    async markAllNotificationsRead(){
      if(!ready)return;
      await wait();
      const {data:{user}}=await client.auth.getUser();
      if(!user)return;
      await client.from('user_notifications').update({read:true}).eq('user_id',user.id);
    },

    /* ─── Messages ─── */
    _convId(a,b){return [a,b].sort().join('__')},
    _convIdPublic(a,b){return this._convId(a,b)},

    async sendMessage(d){
      if(!ready){const a=ls.get('ap_messages');a.push({...d,id:Date.now().toString(),createdAt:new Date().toISOString(),read:false});ls.set('ap_messages',a);return d}
      await wait();
      const {data,error}=await client.from('messages').insert({
        sender_id:d.senderId,sender_name:d.senderName,
        recipient_id:d.recipientId,recipient_name:d.recipientName,
        conversation_id:this._convId(d.senderId,d.recipientId),
        content:d.content,read:false
      }).select().single();
      if(error)throw error;return data;
    },
    async getConversations(){
      if(!ready){
        const {data:{user}}=await client.auth.getUser().catch(()=>({data:{user:null}}));
        if(!user)return [];
        const all=ls.get('ap_messages').filter(m=>m.senderId===user.id||m.recipientId===user.id);
        const byConv={};
        all.forEach(m=>{
          const key=m.conversationId||this._convId(m.senderId,m.recipientId);
          const otherId=m.senderId===user.id?m.recipientId:m.senderId;
          const otherName=m.senderId===user.id?m.recipientName:m.senderName;
          if(!byConv[key]||new Date(m.createdAt)>new Date(byConv[key].lastAt)){
            byConv[key]={conversationId:key,otherId,otherName,lastMessage:m.content,lastAt:m.createdAt,unread:0};
          }
        });
        return Object.values(byConv).sort((a,b)=>new Date(b.lastAt)-new Date(a.lastAt));
      }
      await wait();
      const {data:{user}}=await client.auth.getUser();
      if(!user)return [];
      const {data,error}=await client.from('messages').select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at',{ascending:false});
      if(error)return [];
      const byConv={};
      data.forEach(m=>{
        const isMine=m.sender_id===user.id;
        if(!byConv[m.conversation_id]){
          byConv[m.conversation_id]={
            conversationId:m.conversation_id,
            otherId:isMine?m.recipient_id:m.sender_id,
            otherName:isMine?m.recipient_name:m.sender_name,
            lastMessage:m.content,lastAt:m.created_at,unread:0
          };
        }
        if(!isMine&&!m.read)byConv[m.conversation_id].unread++;
      });
      return Object.values(byConv).sort((a,b)=>new Date(b.lastAt)-new Date(a.lastAt));
    },
    async getMessages(conversationId){
      if(!ready){
        return ls.get('ap_messages').filter(m=>m.conversationId===conversationId)
          .sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
      }
      await wait();
      const {data,error}=await client.from('messages').select('*')
        .eq('conversation_id',conversationId).order('created_at',{ascending:true});
      if(error)return [];
      return data.map(x=>({id:x.id,senderId:x.sender_id,senderName:x.sender_name,recipientId:x.recipient_id,recipientName:x.recipient_name,content:x.content,read:x.read,createdAt:x.created_at}));
    },
    async markConversationRead(conversationId){
      if(!ready){
        ls.set('ap_messages',ls.get('ap_messages').map(m=>m.conversationId===conversationId?{...m,read:true}:m));
        return;
      }
      await wait();
      const {data:{user}}=await client.auth.getUser();
      if(!user)return;
      await client.from('messages').update({read:true})
        .eq('conversation_id',conversationId).eq('recipient_id',user.id);
    },
    async getUnreadCount(){
      if(!ready)return 0;
      await wait();
      const {data:{user}}=await client.auth.getUser();
      if(!user)return 0;
      const {count,error}=await client.from('messages').select('id',{count:'exact',head:true})
        .eq('recipient_id',user.id).eq('read',false);
      if(error)return 0;return count||0;
    },

    /* ─── Notifications email ─── */
    async notify({recipientId,to,toName,subject,htmlBody,type,metadata}){
      if(!ready)return;
      await wait();
      try{
        const {data:{session}}=await client.auth.getSession();
        if(!session)return;
        const resp=await fetch(`${SUPABASE_URL}/functions/v1/send-notification`,{
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':`Bearer ${session.access_token}`},
          body:JSON.stringify({recipientId,to,toName,subject,htmlBody,type,metadata})
        });
        return await resp.json();
      }catch(e){}
    },

    _emailWrapper(content){
      return `<div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fff">
        <div style="background:linear-gradient(135deg,#0b5fff,#3b82f6);padding:20px;border-radius:12px 12px 0 0;text-align:center">
          <span style="color:#fff;font-size:20px;font-weight:800">Afro<span style="color:#fbbf24">Pulse</span></span>
        </div>
        <div style="padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">${content}</div>
      </div>`;
    },

    templateCandidature({candidat,mission,company,budget}){
      return {subject:`Nouvelle candidature : ${mission}`,html:this._emailWrapper(`
        <h2 style="margin:0 0 12px;color:#0f172a;font-size:18px">Nouvelle candidature</h2>
        <p style="color:#475569;font-size:14px;line-height:1.6"><strong>${candidat}</strong> a postulé à votre mission <strong>${mission}</strong>.</p>
        ${budget?`<p style="color:#475569;font-size:14px;line-height:1.6">Budget : <strong>${budget} FCFA</strong></p>`:''}
        <a href="${location.origin}/candidatures.html" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#0b5fff;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">Voir les candidatures</a>
      `)};
    },
    templateCandidatureAcceptee({candidat,mission,company}){
      return {subject:`Candidature acceptée : ${mission}`,html:this._emailWrapper(`
        <h2 style="margin:0 0 12px;color:#059669;font-size:20px;text-align:center">Candidature acceptée</h2>
        <p style="color:#475569;font-size:14px;line-height:1.6">Bonjour ${candidat}, votre candidature pour <strong>${mission}</strong> chez <strong>${company}</strong> a été acceptée.</p>
        <div style="text-align:center;margin-top:20px">
          <a href="${location.origin}/messages.html" style="display:inline-block;padding:12px 24px;background:#059669;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">Ouvrir la messagerie</a>
        </div>
      `)};
    },
    templateCandidatureRefusee({candidat,mission,company}){
      return {subject:`Réponse à votre candidature : ${mission}`,html:this._emailWrapper(`
        <h2 style="margin:0 0 12px;color:#0f172a;font-size:18px">Bonjour ${candidat},</h2>
        <p style="color:#475569;font-size:14px;line-height:1.6">Votre candidature pour <strong>${mission}</strong> chez <strong>${company}</strong> n'a pas été retenue cette fois.</p>
        <p style="color:#475569;font-size:14px;line-height:1.6">D'autres missions vous attendent sur AfroPulse.</p>
        <a href="${location.origin}/particulier.html#missions" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#0b5fff;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">Voir les missions</a>
      `)};
    },
    templateMessage({sender,preview}){
      return {subject:`Nouveau message de ${sender}`,html:this._emailWrapper(`
        <h2 style="margin:0 0 12px;color:#0f172a;font-size:18px">Nouveau message</h2>
        <p style="color:#475569;font-size:14px;line-height:1.6"><strong>${sender}</strong> vous a envoyé un message.</p>
        <blockquote style="margin:16px 0;padding:12px 16px;background:#f1f5f9;border-left:3px solid #0b5fff;color:#475569;font-size:13px;font-style:italic">« ${preview} »</blockquote>
        <a href="${location.origin}/messages.html" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#0b5fff;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">Répondre</a>
      `)};
    },

    /* ─── Contenu dynamique : témoignages ─── */
    async getTestimonials(limit = 100){
      if(!ready) return [];
      await wait();
      const {data, error} = await client.from('testimonials')
        .select('*')
        .eq('published', true)
        .order('display_order', {ascending:true})
        .limit(limit);
      if(error) return [];
      return data.map(x => ({
        id: x.id, name: x.author_name, role: x.author_role, city: x.author_city,
        initials: x.author_initials, color: x.author_color, quote: x.quote,
        rating: x.rating, display_order: x.display_order, published: x.published
      }));
    },
    async getTestimonialsAll(){
      if(!ready) return [];
      await wait();
      const {data, error} = await client.from('testimonials')
        .select('*').order('display_order', {ascending:true});
      if(error) return [];
      return data.map(x => ({
        id: x.id, name: x.author_name, role: x.author_role, city: x.author_city,
        initials: x.author_initials, color: x.author_color, quote: x.quote,
        rating: x.rating, display_order: x.display_order, published: x.published
      }));
    },
    async createTestimonial(d){
      if(!ready) throw new Error('Supabase non disponible');
      await wait();
      const {data, error} = await client.from('testimonials').insert({
        author_name: d.name, author_role: d.role || null, author_city: d.city || null,
        author_initials: d.initials || null, author_color: d.color || 'var(--ac)',
        quote: d.quote, rating: d.rating || 5,
        display_order: d.display_order || 0, published: d.published !== false
      }).select().single();
      if(error) throw error;
      return data;
    },
    async updateTestimonial(id, d){
      if(!ready) throw new Error('Supabase non disponible');
      await wait();
      const fields = { updated_at: new Date().toISOString() };
      if(d.name !== undefined) fields.author_name = d.name;
      if(d.role !== undefined) fields.author_role = d.role;
      if(d.city !== undefined) fields.author_city = d.city;
      if(d.initials !== undefined) fields.author_initials = d.initials;
      if(d.color !== undefined) fields.author_color = d.color;
      if(d.quote !== undefined) fields.quote = d.quote;
      if(d.rating !== undefined) fields.rating = d.rating;
      if(d.display_order !== undefined) fields.display_order = d.display_order;
      if(d.published !== undefined) fields.published = d.published;
      const {data, error} = await client.from('testimonials').update(fields).eq('id', id).select().single();
      if(error) throw error;
      return data;
    },
    async deleteTestimonial(id){
      if(!ready) throw new Error('Supabase non disponible');
      await wait();
      const {error} = await client.from('testimonials').delete().eq('id', id);
      if(error) throw error;
    },

    /* ─── Contenu dynamique : formules ─── */
    async getPlans(){
      if(!ready) return [];
      await wait();
      const {data, error} = await client.from('plans')
        .select('*').eq('active', true).order('display_order', {ascending:true});
      if(error) return [];
      return data.map(x => ({
        slug: x.slug, name: x.name, description: x.description,
        monthly: x.monthly_price, yearly: x.yearly_price,
        features: x.features || [], recommended: x.recommended, display_order: x.display_order
      }));
    },
    async getPlansAll(){
      if(!ready) return [];
      await wait();
      const {data, error} = await client.from('plans')
        .select('*').order('display_order', {ascending:true});
      if(error) return [];
      return data.map(x => ({
        id: x.id, slug: x.slug, name: x.name, description: x.description,
        monthly: x.monthly_price, yearly: x.yearly_price,
        features: x.features || [], recommended: x.recommended,
        display_order: x.display_order, active: x.active
      }));
    },
    async createPlan(d){
      if(!ready) throw new Error('Supabase non disponible');
      await wait();
      const {data, error} = await client.from('plans').insert({
        slug: d.slug, name: d.name, description: d.description || null,
        monthly_price: d.monthly, yearly_price: d.yearly,
        features: d.features || [], recommended: d.recommended === true,
        display_order: d.display_order || 0, active: d.active !== false
      }).select().single();
      if(error) throw error;
      return data;
    },
    async updatePlan(id, d){
      if(!ready) throw new Error('Supabase non disponible');
      await wait();
      const fields = { updated_at: new Date().toISOString() };
      if(d.slug !== undefined) fields.slug = d.slug;
      if(d.name !== undefined) fields.name = d.name;
      if(d.description !== undefined) fields.description = d.description;
      if(d.monthly !== undefined) fields.monthly_price = d.monthly;
      if(d.yearly !== undefined) fields.yearly_price = d.yearly;
      if(d.features !== undefined) fields.features = d.features;
      if(d.recommended !== undefined) fields.recommended = d.recommended;
      if(d.display_order !== undefined) fields.display_order = d.display_order;
      if(d.active !== undefined) fields.active = d.active;
      const {data, error} = await client.from('plans').update(fields).eq('id', id).select().single();
      if(error) throw error;
      return data;
    },
    async deletePlan(id){
      if(!ready) throw new Error('Supabase non disponible');
      await wait();
      const {error} = await client.from('plans').delete().eq('id', id);
      if(error) throw error;
    },

    /* ─── Contenu dynamique : FAQ ─── */
    async getFaqs(){
      if(!ready) return [];
      await wait();
      const {data, error} = await client.from('faqs')
        .select('*').eq('active', true).order('display_order', {ascending:true});
      if(error) return [];
      return data.map(x => ({ id: x.id, question: x.question, answer: x.answer, display_order: x.display_order }));
    },
    async getFaqsAll(){
      if(!ready) return [];
      await wait();
      const {data, error} = await client.from('faqs')
        .select('*').order('display_order', {ascending:true});
      if(error) return [];
      return data.map(x => ({ id: x.id, question: x.question, answer: x.answer, display_order: x.display_order, active: x.active }));
    },
    async createFaq(d){
      if(!ready) throw new Error('Supabase non disponible');
      await wait();
      const {data, error} = await client.from('faqs').insert({
        question: d.question, answer: d.answer,
        display_order: d.display_order || 0, active: d.active !== false
      }).select().single();
      if(error) throw error;
      return data;
    },
    async updateFaq(id, d){
      if(!ready) throw new Error('Supabase non disponible');
      await wait();
      const fields = { updated_at: new Date().toISOString() };
      if(d.question !== undefined) fields.question = d.question;
      if(d.answer !== undefined) fields.answer = d.answer;
      if(d.display_order !== undefined) fields.display_order = d.display_order;
      if(d.active !== undefined) fields.active = d.active;
      const {data, error} = await client.from('faqs').update(fields).eq('id', id).select().single();
      if(error) throw error;
      return data;
    },
    async deleteFaq(id){
      if(!ready) throw new Error('Supabase non disponible');
      await wait();
      const {error} = await client.from('faqs').delete().eq('id', id);
      if(error) throw error;
    },

    /* ─── Analytics (Chantier N) ─── */
    async trackPageView(path){
      if(!ready) return;
      await wait();
      try{
        let sid = sessionStorage.getItem('ap-session-id');
        if(!sid){
          sid = 'sid-' + Date.now() + '-' + Math.random().toString(36).slice(2,8);
          sessionStorage.setItem('ap-session-id', sid);
        }
        const { data:{ user } } = await client.auth.getUser();
        await client.from('page_views').insert({
          path: path || location.pathname,
          referrer: document.referrer || null,
          user_id: user?.id || null,
          session_id: sid
        });
      }catch(e){}
    },
    async getAnalytics(days = 7){
      if(!ready) return { total:0, uniqueVisitors:0, topPages:[], daily:[] };
      await wait();
      try{
        const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
        const { data, error } = await client.from('page_views')
          .select('path, session_id, created_at')
          .gte('created_at', since);
        if(error) return { total:0, uniqueVisitors:0, topPages:[], daily:[] };

        const total = data.length;
        const uniqueVisitors = new Set(data.map(x => x.session_id)).size;

        const byPage = {};
        data.forEach(x => { byPage[x.path] = (byPage[x.path] || 0) + 1; });
        const topPages = Object.entries(byPage)
          .map(([path, count]) => ({ path, count }))
          .sort((a,b) => b.count - a.count)
          .slice(0, 8);

        const byDay = {};
        data.forEach(x => {
          const d = new Date(x.created_at).toISOString().slice(0, 10);
          if(!byDay[d]) byDay[d] = { jour: d, views: 0, visitors: new Set() };
          byDay[d].views++;
          byDay[d].visitors.add(x.session_id);
        });
        const daily = Object.values(byDay).map(x => ({
          jour: x.jour, views: x.views, visitors: x.visitors.size
        })).sort((a,b) => a.jour.localeCompare(b.jour));

        return { total, uniqueVisitors, topPages, daily };
      }catch(e){
        return { total:0, uniqueVisitors:0, topPages:[], daily:[] };
      }
    },

    /* ─── Badges (Chantier Q) ─── */
    async getBadges(){
      if(!ready) return [];
      await wait();
      const { data, error } = await client.from('badges')
        .select('*').order('display_order', { ascending: true });
      if(error) return [];
      return data.map(x => ({
        slug: x.slug, label: x.label, icon: x.icon,
        color: x.color, description: x.description
      }));
    },
    async getUserBadges(userId){
      if(!ready) return [];
      await wait();
      const { data, error } = await client.from('user_badges')
        .select('badge_slug, awarded_at').eq('user_id', userId);
      if(error) return [];
      return data;
    },
    async awardBadge(userId, badgeSlug){
      if(!ready) return;
      await wait();
      try{
        await client.from('user_badges').insert({ user_id: userId, badge_slug: badgeSlug });
      }catch(e){}
    },
    async removeBadge(userId, badgeSlug){
      if(!ready) return;
      await wait();
      await client.from('user_badges').delete().eq('user_id', userId).eq('badge_slug', badgeSlug);
    },

    /* ─── Nettoyage admin ─── */
    async clearAllSubscriptions(){
      if(!ready){localStorage.removeItem('ap_subscriptions');return}
      await wait();
      await client.from('subscriptions').delete().neq('id','00000000-0000-0000-0000-000000000000');
    },
    async clearAllRccm(){
      if(!ready){localStorage.removeItem('ap_rccm_queue');return}
      await wait();
      await client.from('businesses').delete().neq('id','00000000-0000-0000-0000-000000000000');
    },

    isRemote:()=>ready
  };
})();