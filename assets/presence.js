const Presence = (() => {
  'use strict';

  let channel = null;
  let sb = null;
  let ready = false;
  let currentUser = null;
  let currentProfile = null;
  let users = [];
  const listeners = { users: [], join: [], leave: [] };

  const getPage = () => location.pathname.split('/').pop() || 'index.html';
  const isAnon = () => !currentUser;

  function buildMeta(){
    return {
      user_id: currentUser?.id || null,
      name: currentProfile?.full_name || currentUser?.email || 'Visiteur',
      city: currentProfile?.city || null,
      role: currentProfile?.role || 'visiteur',
      job_title: currentProfile?.job_title || null,
      avatar_url: currentProfile?.avatar_url || null,
      page: getPage(),
      referrer: document.referrer ? document.referrer.slice(0, 120) : null,
      is_anon: isAnon(),
      joined_at: new Date().toISOString(),
      user_agent: navigator.userAgent.slice(0, 100)
    };
  }

  function flattenState(state){
    const out = [];
    const seen = new Set();
    Object.entries(state || {}).forEach(([key, metas]) => {
      (metas || []).forEach(m => {
        const id = m.user_id || key;
        const dedup = id + ':' + (m.joined_at || '');
        if (seen.has(dedup)) return;
        seen.add(dedup);
        out.push({
          presence_id: key,
          user_id: m.user_id || null,
          name: m.name || 'Visiteur',
          city: m.city || null,
          role: m.role || 'visiteur',
          job_title: m.job_title || null,
          avatar_url: m.avatar_url || null,
          page: m.page || '/',
          referrer: m.referrer || null,
          is_anon: !!m.is_anon,
          joined_at: m.joined_at || null,
          user_agent: m.user_agent || null
        });
      });
    });
    return out;
  }

  function emit(event, payload){
    (listeners[event] || []).forEach(fn => {
      try { fn(payload); } catch (e) {}
    });
  }

  function emitUsers(){
    emit('users', users.slice());
  }

  async function init(){
    if (ready) return;

    // Récupère le client Supabase
    sb = window.__sb || (typeof DB !== 'undefined' && DB.client) || window.sb;

    if (!sb) {
      if (typeof DB !== 'undefined' && !DB.isRemote()) {
        try {
          await DB.wait();
          sb = DB.client;
        } catch (e) {}
      }
    }

    if (!sb) {
      console.warn('Presence: Supabase indisponible');
      return;
    }

    try {
      const { data } = await sb.auth.getSession();
      currentUser = data?.session?.user || null;
      if (currentUser) {
        try {
          const { data: p } = await sb.from('profiles')
            .select('full_name,city,role,job_title,avatar_url')
            .eq('id', currentUser.id)
            .maybeSingle();
          currentProfile = p || null;
        } catch (e) {}
      }
    } catch (e) {}

    try {
      channel = sb.channel('online-presence', {
        config: {
          presence: {
            key: currentUser?.id || ('anon-' + Math.random().toString(36).slice(2, 10))
          }
        }
      });

      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        users = flattenState(state);
        emitUsers();
      });

      channel.on('presence', { event: 'join' }, ({ newPresences }) => {
        const added = (newPresences || []).map(m => ({
          user_id: m.user_id || null,
          name: m.name || 'Visiteur',
          city: m.city || null,
          role: m.role || 'visiteur',
          page: m.page || '/',
          is_anon: !!m.is_anon,
          joined_at: m.joined_at || new Date().toISOString()
        }));
        emit('join', { presences: added });
      });

      channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const left = (leftPresences || []).map(m => ({
          user_id: m.user_id || null,
          name: m.name || 'Visiteur',
          page: m.page || '/',
          is_anon: !!m.is_anon
        }));
        emit('leave', { presences: left });
      });

      await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          try {
            await channel.track(buildMeta());
            ready = true;
          } catch (e) {}
        }
      });

      // Mise à jour de la présence quand on change de page
      let lastPage = getPage();
      setInterval(async () => {
        const p = getPage();
        if (p !== lastPage) {
          lastPage = p;
          try { await channel.track(buildMeta()); } catch (e) {}
        }
      }, 4000);

      // Réagir au login/logout
      sb.auth.onAuthStateChange(async (_ev, session) => {
        currentUser = session?.user || null;
        currentProfile = null;
        if (currentUser) {
          try {
            const { data: p } = await sb.from('profiles')
              .select('full_name,city,role,job_title,avatar_url')
              .eq('id', currentUser.id)
              .maybeSingle();
            currentProfile = p || null;
          } catch (e) {}
        }
        try { await channel.track(buildMeta()); } catch (e) {}
      });
    } catch (e) {
      console.warn('Presence init échoué :', e);
    }
  }

  function on(event, fn){
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
    if (event === 'users' && users.length) fn(users.slice());
    return () => {
      listeners[event] = listeners[event].filter(f => f !== fn);
    };
  }

  function getUsers(){ return users.slice(); }
  function getCount(){ return users.length; }
  function isOnline(userId){
    if (!userId) return false;
    return users.some(u => u.user_id === userId && !u.is_anon);
  }

  async function updateMeta(partial){
    if (!channel || !ready) return;
    try {
      await channel.track({ ...buildMeta(), ...partial });
    } catch (e) {}
  }

  async function leave(){
    if (!channel) return;
    try { await channel.untrack(); } catch (e) {}
  }

  return {
    init, on,
    getUsers, getCount, isOnline,
    updateMeta, leave
  };
})();

window.Presence = Presence;