// Free on-device Speak for Arron. Web Speech API only. No audio stored or sent.
// Crisis numbers stay on screen in the reply text; speaking only reads it aloud.
(function () {
  const KEY = "ps-arron-speak";
  const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
  const btn = document.getElementById("arron-sound");
  if (!btn || !synth || typeof SpeechSynthesisUtterance === "undefined") return;
  let on = false;
  try { on = localStorage.getItem(KEY) === "1"; } catch (e) {}
  const speakBtn = document.createElement("button");
  speakBtn.type = "button";
  speakBtn.className = "arron-icon-btn";
  speakBtn.id = "arron-speak";
  const paint = () => {
    speakBtn.setAttribute("aria-pressed", on ? "true" : "false");
    speakBtn.setAttribute("aria-label", on ? "Speak replies: on" : "Speak replies: off");
    speakBtn.title = on ? "Speak replies on (free, on this device)" : "Speak replies off";
    speakBtn.textContent = on ? "🔊" : "🔇";
  };
  paint();
  btn.after(speakBtn);
  speakBtn.addEventListener("click", () => {
    on = !on;
    try { localStorage.setItem(KEY, on ? "1" : "0"); } catch (e) {}
    paint();
    if (!on) synth.cancel();
  });
  function speak(text) {
    if (!on || !text) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const uk = voices.find(v => /en-GB/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang));
    if (uk) u.voice = uk;
    u.rate = 0.95;
    u.pitch = 1;
    synth.speak(u);
  }
  // Speak each finished Arron reply once (not the "Thinking…" dots, not on re-renders).
  let lastSpoken = null;
  const log = document.getElementById("arron-conversation");
  if (log) {
    // Replies already on screen from last time are not read out again on load.
    lastSpoken = log.querySelector(".arron-message:not(.typing):last-child");
    const obs = new MutationObserver(() => {
      const msg = log.querySelector(".arron-message:not(.typing):last-child");
      const p = msg && msg.querySelector("p");
      if (!p || msg === lastSpoken) return;
      lastSpoken = msg;
      speak(p.textContent || "");
    });
    obs.observe(log, { childList: true, subtree: true });
  }
  // Starting to type stops the voice, so the person is never talked over.
  const input = document.getElementById("arron-input");
  if (input) input.addEventListener("input", () => synth.cancel());
  window.addEventListener("pagehide", () => synth.cancel());
})();
