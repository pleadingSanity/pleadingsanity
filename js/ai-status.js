// ==============================================================
// 🤝 AI FAMILY STATUS — reads /api/ai-status and lists the chain.
// Shows only what the live deploy reports. No guessing, no keys.
// ==============================================================
(function () {
  var box = document.getElementById('ai-status');
  if (!box) return;
  var esc = function (v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  fetch('/api/ai-status', { headers: { Accept: 'application/json' } })
    .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then(function (data) {
      var rows = (data.chain || []).map(function (l) {
        return '<li><strong>' + esc(l.order) + '. ' + esc(l.name) + '</strong> (' + esc(l.model) + '): ' + esc(l.role) + '. ' +
          (l.configured ? '<span class="ok">✅ Configured: ' + esc(l.route) + '</span>' : '<span>⏸️ Not configured on this deploy</span>') + '</li>';
      });
      (data.notConnected || []).forEach(function (n) { rows.push('<li><strong>' + esc(n.name) + '</strong>: ' + esc(n.why) + '</li>'); });
      var backups = data.backups ? '<p><small>OpenRouter backups: ' + (data.backups.configured ? 'configured' : 'not configured') + '.</small></p>' : '';
      box.innerHTML = '<ul>' + rows.join('') + '</ul>' + backups;
    })
    .catch(function () {
      box.innerHTML = '<p>The live list could not be read just now, so nothing is claimed here. Try again later.</p>';
    });
})();
