// Additive only. Injects a clear Add to Home Screen note on the games shelf.
// Evolution Not Erasure. No new manifests. No paid store.
(function () {
  if (document.getElementById("ps-home-note")) return;
  const intro = document.querySelector(".intro");
  if (!intro) return;
  const note = document.createElement("p");
  note.id = "ps-home-note";
  note.style.cssText = "margin-bottom:12px;color:#00fff0;font-weight:700;font-size:.95rem;";
  note.innerHTML = "<strong>Add to Home Screen</strong> — On your phone, open the browser menu and choose “Add to Home Screen” or “Install app”. Free, works offline, same games. No store needed.";
  intro.parentNode.insertBefore(note, intro);
})();
