// Free voice. Uses the phone's own speech. No paid voice service.
(function () {
  var KEY = 'ps-house-voice';
  function on() {
    try { return localStorage.getItem(KEY) !== 'off'; } catch (e) { return true; }
  }
  function speak(text) {
    if (!on() || !text || !window.speechSynthesis) return;
    var u = new SpeechSynthesisUtterance(String(text).slice(0, 280));
    u.lang = 'en-GB';
    u.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }
  window.PSVoice = {
    speak: speak,
    toggle: function () {
      try { localStorage.setItem(KEY, on() ? 'off' : 'on'); } catch (e) {}
      return on();
    },
    enabled: on
  };
})();
