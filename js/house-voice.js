// Free voice. The phone's own speech. British English. No paid voice.
// Mute is stored on the device. If it is off, nothing is spoken.
(function () {
  var KEY = 'ps-house-voice';
  var pending = '';
  function on() {
    try { return localStorage.getItem(KEY) !== 'off'; } catch (e) { return true; }
  }
  function trySpeak() {
    if (!pending || !on() || !window.speechSynthesis) return;
    var text = pending;
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-GB';
    u.rate = 0.94;
    u.onstart = function () { if (pending === text) pending = ''; };
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch (e) { /* a blocked voice stays queued until a tap */ }
  }
  function speak(text) {
    if (!on() || !text || !window.speechSynthesis) { pending = ''; return; }
    pending = String(text).replace(/\s+/g, ' ').trim().slice(0, 280);
    trySpeak();
  }
  document.addEventListener('pointerdown', trySpeak, { passive: true });
  document.addEventListener('keydown', trySpeak);
  window.PSVoice = {
    speak: speak,
    open: speak,
    won: speak,
    toggle: function () {
      var nextOn = !on();
      try { localStorage.setItem(KEY, nextOn ? 'on' : 'off'); } catch (e) {}
      if (!nextOn) {
        pending = '';
        if (window.speechSynthesis) window.speechSynthesis.cancel();
      }
      return on();
    },
    enabled: on
  };
})();
