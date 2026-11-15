// Quiet offline note. Shows only when the network is gone; never blocks play.
// Sits at the top of the page in the normal flow, so it never covers text.
(function () {
  if (window.__psOfflineNote) return;
  window.__psOfflineNote = true;
  let note = null;
  function show() {
    if (note || !document.body) return;
    note = document.createElement("p");
    note.className = "ps-offline-note";
    note.setAttribute("role", "status");
    note.textContent = "You’re offline — last copy still works.";
    note.style.cssText = "margin:0;padding:8px 14px;text-align:center;font:600 14px/1.4 system-ui,-apple-system,sans-serif;color:#eef6ff;background:#0d1b2a;border-bottom:1px solid rgba(0,255,240,.45)";
    document.body.prepend(note);
  }
  function hide() { if (note) { note.remove(); note = null; } }
  window.addEventListener("offline", show);
  window.addEventListener("online", hide);
  if (navigator.onLine === false) {
    if (document.body) show(); else document.addEventListener("DOMContentLoaded", show);
  }
})();
