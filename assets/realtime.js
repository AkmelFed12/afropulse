/* ═══════════════════════════════════════════════════════════════════════
   AfroPulse — Module Realtime v4
   Channels :
     • notif:<userId>       → notifications utilisateur
     • content:public       → témoignages, plans, FAQ
     • messages:<userId>    → nouveaux messages reçus en direct
   ═══════════════════════════════════════════════════════════════════════ */

(function(){
  'use strict';

  const RT_STYLES = `
    .rt-toast{
      position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;
      background:var(--sf);border:1px solid var(--bd);border-radius:.85rem;
      padding:.85rem 1rem;box-shadow:0 16px 40px -12px rgba(0,0,0,.3);
      display:flex;gap:.75rem;align-items:flex-start;
      max-width:340px;transform:translateY(150%);opacity:0;
      transition:transform .35s cubic-bezier(.4,0,.2,1),opacity .35s;
    }
    .rt-toast.on{transform:translateY(0);opacity:1}
    .rt-toast-ic{
      width:32px;height:32px;border-radius:.55rem;flex-shrink:0;
      display:grid;place-items:center;
      background:color-mix(in srgb,var(--ac) 12%,transparent);
      color:var(--ac);font-size:.85rem;
    }
    .rt-toast-txt{flex:1;min-width:0;font-size:.78rem;line-height:1.4;color:var(--mu)}
    .rt-toast-txt strong{color:var(--ink);font-size:.82rem;display:block;margin-bottom:.15rem}
    .rt-toast-close{
      width:22px;height:22px;border-radius:.35rem;border:none;background:transparent;
      color:var(--mu);cursor:pointer;flex-shrink:0;font-size:.7rem;display:grid;place-items:center;
    }
    .rt-toast-close:hover{background:var(--bg);color:var(--ink)}
    @keyframes rtBadgePop{0%{transform:scale(.5);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
    #bellBadge.rt-on{animation:rtBadgePop .3s ease-out}
  `;

  function injectStyles(){
    if(document.getElementById('rt-styles')) return;
    const s = document.createElement('style');
    s.id = 'rt-styles';
    s.textContent = RT_STYLES;
    document.head.appendChild(s);
  }

  const escapeHtml = (str) => String(str == null ? '' : str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');

  const waitForSb = () => new Promise(resolve => {
    if(window.__sb) return resolve(window.__sb);
    const t = setInterval(() => {
      if(window.__sb){ clearInterval(t); resolve(window.__sb); }
    }, 60);
    setTimeout(() => { clearInterval(t); resolve(window.__sb || null); }, 8000);
  });

  function showToast(n){
    let t = document.getElementById('rtToast');
    if(!t){
      t = document.createElement('div');
      t.id = 'rtToast';
      t.className = 'rt-toast';
      document.body.appendChild(t);
    }
    t.innerHTML = `
      <div class="rt-toast-ic"><i class="fa-solid ${n.icon || 'fa-bell'}"></i></div>
      <div class="rt-toast-txt">
        <strong>${escapeHtml(n.title || 'Nouvelle notification')}</strong>
        ${n.body ? `<div>${escapeHtml(n.body)}</div>` : ''}
      </div>
      <button class="rt-toast-close" aria-label="Fermer"><i class="fa-solid fa-xmark"></i></button>
    `;
    t.classList.add('on');
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove('on'), 5000);
    t.querySelector('.rt-toast-close').onclick = () => t.classList.remove('on');
  }

  function bumpBadge(delta){
    const badge = document.getElementById('bellBadge');
    if(!badge) return;
    const cur = parseInt(badge.textContent, 10) || 0;
    const next = Math.max(0, cur + delta);
    badge.textContent = next > 9 ? '9+' : String(next);
    badge.style.display = next > 0 ? 'grid' : 'none';
    if(next > 0){
      badge.classList.remove('rt-on');
      void badge.offsetWidth;
      badge.classList.add('rt-on');
    }
  }

  function prependToPanel(n){
    const panel = document.getElementById('notifPanel');
    if(!panel || panel.classList.contains('hidden')) return;
    if(typeof Bell !== 'undefined' && typeof Bell.refresh === 'function'){
      Bell.refresh();
    }
  }

  const Realtime = (() => {
    let notifChannel = null;
    let contentChannel = null;
    let messagesChannel = null;
    let currentUserId = null;
    const listeners = {
      notification: [], unread: [], ready: [], error: [],
      'content:testimonials': [], 'content:plans': [], 'content:faqs': [],
      'message': []
    };

    const on = (evt, cb) => {
      if(!listeners[evt]) listeners[evt] = [];
      listeners[evt].push(cb);
      return () => { listeners[evt] = listeners[evt].filter(fn => fn !== cb); };
    };
    const emit = (evt, payload) => {
      (listeners[evt] || []).forEach(cb => {
        try { cb(payload); } catch(e){}
      });
    };

    const initNotif = async (sb, user) => {
      if(notifChannel) return;
      currentUserId = user.id;
      notifChannel = sb.channel('notif:' + user.id, { config: { broadcast: { self: false } } });
      notifChannel
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_notifications', filter: `user_id=eq.${user.id}` }, (payload) => {
          const n = payload.new;
          bumpBadge(+1);
          prependToPanel(n);
          showToast({ id: n.id, type: n.type, title: n.title, body: n.body, link: n.link, icon: n.icon, read: n.read, createdAt: n.created_at });
          emit('notification', n);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_notifications', filter: `user_id=eq.${user.id}` }, (payload) => {
          const n = payload.new;
          if(payload.old && payload.old.read !== n.read){ bumpBadge(n.read ? -1 : +1); }
          prependToPanel(n);
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'user_notifications', filter: `user_id=eq.${user.id}` }, () => {
          if(typeof Bell !== 'undefined' && typeof Bell.refresh === 'function'){ Bell.refresh(); }
        })
        .subscribe(() => {});
    };

    const initMessages = async (sb, user) => {
      if(messagesChannel) return;
      messagesChannel = sb.channel('messages:' + user.id, { config: { broadcast: { self: false } } });
      messagesChannel
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${user.id}` }, (payload) => {
          const m = payload.new;
          emit('message', {
            id: m.id, senderId: m.sender_id, senderName: m.sender_name,
            recipientId: m.recipient_id, recipientName: m.recipient_name,
            conversationId: m.conversation_id, content: m.content, createdAt: m.created_at
          });
        })
        .subscribe(() => {});
    };

    const initContent = async (sb) => {
      if(contentChannel) return;
      contentChannel = sb.channel('content:public', { config: { broadcast: { self: false } } });
      contentChannel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => emit('content:testimonials'))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'plans' }, () => emit('content:plans'))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'faqs' }, () => emit('content:faqs'))
        .subscribe(() => {});
    };

    const init = async () => {
      const sb = await waitForSb();
      if(!sb) return;
      initContent(sb);
      const { data:{ user } } = await sb.auth.getUser();
      if(user){
        initNotif(sb, user);
        initMessages(sb, user);
        emit('ready', true);
      }
    };

    const destroy = async () => {
      const sb = await waitForSb();
      if(notifChannel){ try { await sb.removeChannel(notifChannel); } catch(e){} notifChannel = null; emit('unread', 0); }
      if(messagesChannel){ try { await sb.removeChannel(messagesChannel); } catch(e){} messagesChannel = null; }
      currentUserId = null;
    };

    (async () => {
      const sb = await waitForSb();
      if(!sb) return;
      sb.auth.onAuthStateChange((evt) => {
        if(evt === 'SIGNED_OUT') destroy();
        if(evt === 'SIGNED_IN') setTimeout(init, 300);
      });
    })();

    return {
      init, destroy, on,
      getUserId: () => currentUserId,
      isConnected: () => !!notifChannel
    };
  })();

  window.Realtime = Realtime;

  function start(){
    injectStyles();
    setTimeout(() => {
      Realtime.init();
      if(typeof Auth !== 'undefined' && Auth.onChange){
        Auth.onChange((u) => { if(u) Realtime.init(); else Realtime.destroy(); });
      }
    }, 1200);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();