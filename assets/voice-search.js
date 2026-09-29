const VoiceSearch = (() => {
  'use strict';

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  function isSupported(){
    return !!SR;
  }

  function create(opts = {}){
    if(!isSupported()) return null;
    const recognition = new SR();
    recognition.lang = opts.lang || 'fr-FR';
    recognition.interimResults = opts.interimResults !== false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    return recognition;
  }

  function attach(button, target, opts = {}){
    if(!button || !target) return;
    if(!isSupported()){
      button.style.display = 'none';
      return;
    }

    let recognition = null;
    let listening = false;
    let finalText = '';

    const setListening = (state) => {
      listening = state;
      const icon = button.querySelector('i');
      if(icon){
        icon.className = state ? 'fa-solid fa-stop text-sm' : 'fa-solid fa-microphone text-sm';
      }
      button.classList.toggle('voice-listening', state);
      button.title = state ? 'Arrêter' : 'Rechercher par la voix';
    };

    const start = () => {
      recognition = create(opts);
      if(!recognition) return;

      finalText = '';

      recognition.onstart = () => {
        setListening(true);
        if(typeof opts.onStart === 'function') opts.onStart();
      };

      recognition.onresult = (event) => {
        let interim = '';
        for(let i = event.resultIndex; i < event.results.length; i++){
          const transcript = event.results[i][0].transcript;
          if(event.results[i].isFinal) finalText += transcript;
          else interim += transcript;
        }
        const text = (finalText + interim).trim();
        target.value = text;
        target.dispatchEvent(new Event('input', { bubbles: true }));
      };

      recognition.onerror = (event) => {
        setListening(false);
        const err = event.error;
        if(err === 'not-allowed' || err === 'service-not-allowed'){
          if(typeof UI !== 'undefined') UI.toast('Micro non autorisé.', 'error');
        }else if(err === 'no-speech'){
          if(typeof UI !== 'undefined') UI.toast('Aucune parole détectée.', 'warn');
        }else if(err !== 'aborted'){
          if(typeof UI !== 'undefined') UI.toast('Erreur reconnaissance vocale.', 'error');
        }
      };

      recognition.onend = () => {
        setListening(false);
        if(typeof opts.onEnd === 'function') opts.onEnd(finalText);
      };

      try{
        recognition.start();
      }catch(e){
        setListening(false);
      }
    };

    const stop = () => {
      if(recognition){
        try{ recognition.stop(); }catch(e){}
      }
      setListening(false);
    };

    button.addEventListener('click', (e) => {
      e.preventDefault();
      if(listening) stop();
      else start();
    });

    return { start, stop, isSupported };
  }

  return { attach, isSupported, create };
})();

window.VoiceSearch = VoiceSearch;