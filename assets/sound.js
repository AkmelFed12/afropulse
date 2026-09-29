const Sound = (() => {
  'use strict';

  let ctx = null;
  let enabled = true;

  function init(){
    try{
      const stored = localStorage.getItem('ap-sound-enabled');
      if(stored !== null) enabled = stored === '1';
    }catch(e){}
  }

  function getCtx(){
    if(!ctx){
      try{
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      }catch(e){
        return null;
      }
    }
    if(ctx.state === 'suspended'){
      try{ ctx.resume(); }catch(e){}
    }
    return ctx;
  }

  function tone({ freq = 440, duration = 0.15, type = 'sine', volume = 0.1, fadeOut = true }){
    if(!enabled) return;
    const c = getCtx();
    if(!c) return;

    try{
      const osc = c.createOscillator();
      const gain = c.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, c.currentTime);

      gain.gain.setValueAtTime(volume, c.currentTime);
      if(fadeOut){
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
      }

      osc.connect(gain);
      gain.connect(c.destination);

      osc.start(c.currentTime);
      osc.stop(c.currentTime + duration);
    }catch(e){}
  }

  function chord(notes, opts = {}){
    notes.forEach((freq, i) => {
      setTimeout(() => tone({ freq, ...opts }), i * 40);
    });
  }

  /* ─── Notifications ─── */
  function message(){
    tone({ freq: 660, duration: 0.08, type: 'sine', volume: 0.08 });
    setTimeout(() => tone({ freq: 880, duration: 0.12, type: 'sine', volume: 0.06 }), 70);
  }

  function notification(){
    tone({ freq: 523, duration: 0.1, type: 'sine', volume: 0.08 });
    setTimeout(() => tone({ freq: 659, duration: 0.1, type: 'sine', volume: 0.08 }), 90);
    setTimeout(() => tone({ freq: 784, duration: 0.15, type: 'sine', volume: 0.06 }), 180);
  }

  function success(){
    chord([523, 659, 784], { duration: 0.12, type: 'sine', volume: 0.08 });
  }

  function error(){
    tone({ freq: 200, duration: 0.2, type: 'sawtooth', volume: 0.06 });
  }

  function click(){
    tone({ freq: 800, duration: 0.04, type: 'sine', volume: 0.05 });
  }

  function send(){
    tone({ freq: 587, duration: 0.08, type: 'sine', volume: 0.07 });
    setTimeout(() => tone({ freq: 880, duration: 0.1, type: 'sine', volume: 0.05 }), 60);
  }

  function receive(){
    tone({ freq: 700, duration: 0.1, type: 'sine', volume: 0.07 });
    setTimeout(() => tone({ freq: 900, duration: 0.1, type: 'sine', volume: 0.06 }), 80);
  }

  /* ─── Toggle ─── */
  function toggle(){
    enabled = !enabled;
    try{ localStorage.setItem('ap-sound-enabled', enabled ? '1' : '0'); }catch(e){}
    if(enabled) success();
    return enabled;
  }

  function isEnabled(){ return enabled; }

  return {
    init, toggle, isEnabled,
    message, notification, success, error, click, send, receive,
    tone, chord
  };
})();

window.Sound = Sound;