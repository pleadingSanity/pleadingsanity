/* Pleading Socially playlists: Shane's own voice and the P.S AI playlist, kept separate.
   Loads /data/ps-playlists.json. Only approved tracks with a local /music/audio/ file play.
   Text is set with textContent only. No autoplay. */
(function () {
  'use strict';
  var root = document.getElementById('ps-playlists-list');
  if (!root) return;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function playable(track) {
    return track && track.approved === true && typeof track.src === 'string' &&
      /^\/music\/audio\/[\w.-]+\.(?:mp3|m4a|ogg|opus|wav)$/i.test(track.src) && typeof track.title === 'string';
  }

  function render(data) {
    root.textContent = '';
    (data.playlists || []).forEach(function (list) {
      var card = el('article', 'ps-pl-card ps-pl-' + (list.kind === 'ai' ? 'ai' : 'human'));
      card.setAttribute('aria-labelledby', 'ps-pl-' + list.id);
      var badge = el('span', 'ps-pl-badge', list.kind === 'ai' ? 'AI-generated' : (list.label || "Shane's own voice"));
      var h = el('h3', null, list.title);
      h.id = 'ps-pl-' + list.id;
      card.appendChild(badge);
      card.appendChild(h);
      if (list.description) card.appendChild(el('p', 'ps-pl-desc', list.description));
      var tracks = (list.tracks || []).filter(playable);
      if (tracks.length) {
        var ol = el('ol', 'ps-pl-tracks');
        tracks.forEach(function (t) {
          var li = el('li');
          li.appendChild(el('span', 'ps-pl-title', t.title + (list.kind === 'ai' ? ' (AI-generated)' : '')));
          var a = document.createElement('audio');
          a.controls = true;
          a.preload = 'none';
          a.src = t.src;
          a.setAttribute('aria-label', 'Play ' + t.title);
          li.appendChild(a);
          ol.appendChild(li);
        });
        card.appendChild(ol);
      } else {
        card.appendChild(el('p', 'ps-pl-soon', 'Coming soon. Nothing is published here until Shane approves it.'));
        var studio = list.in_the_studio || [];
        if (studio.length) {
          card.appendChild(el('p', 'ps-pl-studio-label', 'In the studio'));
          var ul = el('ul', 'ps-pl-studio');
          studio.forEach(function (name) { ul.appendChild(el('li', null, String(name))); });
          card.appendChild(ul);
        }
      }
      root.appendChild(card);
    });
  }

  fetch('/data/ps-playlists.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(render)
    .catch(function () {
      root.textContent = '';
      root.appendChild(el('p', 'ps-pl-soon', 'The playlists could not load right now. Try again later.'));
    });
})();
