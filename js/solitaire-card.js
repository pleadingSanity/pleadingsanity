(function () {
  if (!/\/games\.html$|\/games$/.test(location.pathname)) return;
  var grid = document.querySelector('.games-grid');
  if (!grid) return;
  var old = grid.querySelector('[data-game="sanity-solitaire"]');
  if (old && old.querySelector('[data-mark="sanity-solitaire"]')) return;
  if (old) old.remove();
  var card = document.createElement('article');
  card.className = 'game-card';
  card.setAttribute('data-game', 'sanity-solitaire');
  card.innerHTML = '<div class="game-thumb" data-mark="sanity-solitaire"><span class="badge official">OFFICIAL</span></div><div class="game-content"><h3>Sanity Solitaire</h3><p class="game-desc">Three peaks. One rank up or down. The brain card on the back, the night sky on the table.</p><div class="game-stats"><span>Three peaks</span><span>Undo</span><span>Own install</span></div><div class="btn-wrap"><a href="/sanity-solitaire.html" class="btn primary">&#9654; Play Now</a></div></div>';
  grid.insertBefore(card, grid.firstChild);
})();
