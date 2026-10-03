(function () {
  if (!/\/games\.html$|\/games$/.test(location.pathname)) return;
  var grid = document.querySelector('.games-grid');
  if (!grid) return;
  var old = grid.querySelector('[data-game="sanity-solitaire"]');
  if (old) old.remove();
  var card = document.createElement('article');
  card.className = 'game-card';
  card.setAttribute('data-game', 'sanity-solitaire');
  card.innerHTML = '<div class="game-thumb" aria-hidden="true" style="font-size:2.4rem;line-height:1">A&#9824;<span class="badge new">NEW</span></div><div class="game-content"><h3>Sanity Solitaire</h3><p class="game-desc">Three peaks. Clear them. Levels open new tables.</p><div class="game-stats"><span>Peaks</span><span>4 levels</span><span>Free</span></div><p class="game-pb">Play Now opens the deal</p><div class="btn-wrap"><a href="/sanity-solitaire.html" class="btn primary">&#9654; Play Now</a></div></div>';
  grid.insertBefore(card, grid.firstChild);
})();
