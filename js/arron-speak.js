// Free on-device Speak for Arron. Web Speech API only. No audio stored or sent.
(function () {
  const KEY = "ps-arron-speak";
  let on = localStorage.getItem(KEY) === "1";
  const btn = document.getElementById("arron-sound");
  if (!btn) return;
  const speakBtn = document.createElement("button");
  speakBtn.type = "button";
  speakBtn.className = "arron-icon-btn";
  speakBtn.setAttribute("aria-pressed", on ? "true" : "false");
  speakBtn.title = "Speak replies";
  speakBtn.textContent = on ? "🔊" : "🔇";
  btn.after(speakBtn);
  speakBtn.addEventListener("click", () => {
    on = !on;
    localStorage.setItem(KEY, on ? "1" : "0");
    speakBtn.setAttribute("aria-pressed", on ? "true" : "false");
    speakBtn.textContent = on ? "🔊" : "🔇";
    if (!on) speechSynthesis.cancel();
  });
  function speak(text) {
    if (!on || !window.speechSynthesis || !text) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();
    const uk = voices.find(v => /en-GB/i.test(v.lang)) || voices.find(v => /en/i.test(v.lang));
    if (uk) u.voice = uk;
    u.rate = 0.95;
    u.pitch = 1;
    speechSynthesis.speak(u);
  }
  const log = document.getElementById("arron-conversation");
  if (log) {
    const obs = new MutationObserver(() => {
      const last = log.querySelector(".arron-message:last-child p");
      if (last) speak(last.textContent || "");
    });
    obs.observe(log, { childList: true, subtree: true });
  }
  window.addEventListener("beforeunload", () => speechSynthesis.cancel());
})();
