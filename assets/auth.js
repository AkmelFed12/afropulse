/* ═══════════════════════════════════════════════
   Auth — Session · Profil · Upload · Reset password
═══════════════════════════════════════════════ */

const Auth=(()=>{
  const wait=()=>new Promise(r=>{
    if(window.__sb)return r();
    const t=setInterval(()=>{if(window.__sb){clearInterval(t);r()}},50);
  });

  let user=null,profile=null;
  const listeners=[];
  const notify=()=>listeners.forEach(fn=>fn(user,profile));

  async function loadProfile(){
    if(!user)return;
    try{
      const {data}=await window.__sb.from('profiles').select('*').eq('id',user.id).single();
      profile=data;
    }catch(e){console.error('Profil introuvable',e);profile=null}
  }

  return{
    onChange(fn){listeners.push(fn);fn(user,profile)},

    async init(){
      await wait();
      const {data}=await window.__sb.auth.getSession();
      if(data.session){
        user=data.session.user;
        await loadProfile();
      }
      notify();
      window.__sb.auth.onAuthStateChange(async(e,s)=>{
        user=s?.user||null;
        if(user)await loadProfile();else profile=null;
        notify();
      });
    },

    async signup({email,password,fullName,phone,role,companyName,companyRccm,companyCity,redirectTo}){
      await wait();
      const {data,error}=await window.__sb.auth.signUp({
        email,password,
        options:{
          emailRedirectTo: redirectTo || (location.origin + '/confirmation.html'),
          data:{
            full_name:fullName||null,
            phone:phone||null,
            role:role||'particulier',
            company_name:companyName||null,
            company_rccm:companyRccm||null,
            company_city:companyCity||null
          }
        }
      });
      if(error)throw error;
      return {user:data.user,needsConfirmation:!data.session};
    },

    async login(email,password){
      await wait();
      const {data,error}=await window.__sb.auth.signInWithPassword({email,password});
      if(error)throw error;
      return data;
    },

    async logout(){
      await wait();
      await window.__sb.auth.signOut();
      user=null;profile=null;
      location.href='index.html';
    },

    async updateProfile(fields){
      if(!user)throw new Error('Non connecté');
      const {data,error}=await window.__sb.from('profiles').update({
        ...fields,updated_at:new Date().toISOString()
      }).eq('id',user.id).select().single();
      if(error)throw error;
      profile=data;notify();
      return data;
    },

    async uploadFile(file,type){
      if(!user)throw new Error('Non connecté');
      await wait();
      const ext=file.name.split('.').pop().toLowerCase();
      const filename=`${type}-${Date.now()}.${ext}`;
      const path=`${user.id}/${filename}`;
      const {error:uploadError}=await window.__sb.storage
        .from('profiles')
        .upload(path,file,{cacheControl:'3600',upsert:true});
      if(uploadError)throw uploadError;
      const {data}=window.__sb.storage.from('profiles').getPublicUrl(path);
      return {url:data.publicUrl,filename:file.name,path};
    },

    /* ─── Réinitialisation mot de passe ─── */
    async sendResetEmail(email){
      await wait();
      const {error}=await window.__sb.auth.resetPasswordForEmail(email,{
        redirectTo: location.origin + '/reset-password.html'
      });
      if(error)throw error;
    },

    async updatePassword(newPassword){
      await wait();
      const {data,error}=await window.__sb.auth.updateUser({password:newPassword});
      if(error)throw error;
      return data;
    },

    getUser:()=>user,
    getProfile:()=>profile,
    isLogged:()=>!!user,

    requireLogin(){
      if(this.isLogged())return true;
      location.href='login.html?next='+encodeURIComponent(location.pathname+location.search);
      return false;
    }
  };
})();