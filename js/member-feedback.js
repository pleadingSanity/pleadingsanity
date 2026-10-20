// Soft optional feedback invite for members. Dismissible, frequency-limited.
// Never appears on Arron pages. Never blocks. Local only until submitted.
(function () {
  if (/arron/.test(location.pathname)) return;
  const KEY = "ps-feedback-seen";
  const LAST = localStorage.getItem(KEY);
  const now = Date.now();
  if (LAST && now - Number(LAST) < 7 * 24 * 60 * 60 * 1000) return; // once a week

  function show() {
    if (document.getElementById("ps-feedback-invite")) return;
    const box = document.createElement("aside");
    box.id = "ps-feedback-invite";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", "Share an idea");
    box.style.cssText = "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:999;max-width:min(92vw,420px);background:#0d1b2a;color:#eef6ff;border:1px solid #00fff0;border-radius:16px;padding:16px 18px;box-shadow:0 8px 32px rgba(0,255,240,.25);font:inherit;text-align:center;";
    box.innerHTML = `
      <p style="margin:0 0 8px;font-weight:700;color:#00fff0">You're part of something we're building together.</p>
      <p style="margin:0 0 12px;font-size:.9rem;line-height:1.4">Pleading Sanity is still growing. What have you enjoyed? Anything confusing or that we could make better?</p>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <button type="button" id="ps-feedback-share" style="min-height:48px;padding:0 16px;border-radius:999px;background:#00fff0;color:#000103;border:none;font-weight:700">Share an idea</button>
        <button type="button" id="ps-feedback-later" style="min-height:48px;padding:0 16px;border-radius:999px;background:transparent;color:#eef6ff;border:1px solid #00fff0">Maybe later</button>
      </div>
    `;
    document.body.appendChild(box);
    document.getElementById("ps-feedback-later").addEventListener("click", dismiss);
    document.getElementById("ps-feedback-share").addEventListener("click", function () {
      dismiss();
      // Soft local note only — no auto-post, no account required
      alert("Thank you. Your idea stays with you for now. Open Support or the feed when you are ready to share it with the house.");
    });
    function dismiss() {
      try { localStorage.setItem(KEY, String(now)); } catch (e) {}
      box.remove();
    }
  }
  // Appear after a short quiet time
  setTimeout(show, 45000);
})();
