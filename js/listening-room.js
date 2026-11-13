/* Genre discovery only; filtering never changes playback or saved playlists. */
(function () {
  'use strict';
  var buttons = document.querySelectorAll('.station-filters button[data-genre]');
  var cards = document.querySelectorAll('.station-card[data-genres]');
  var counter = document.getElementById('station-count');
  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var genre = button.getAttribute('data-genre'), count = 0;
      cards.forEach(function (card) {
        card.hidden = genre !== 'all' && card.getAttribute('data-genres').split(' ').indexOf(genre) < 0;
        if (!card.hidden) count++;
      });
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
      document.querySelectorAll('.station-group-title').forEach(function (title) {
        var grid = title.nextElementSibling;
        title.hidden = !!grid && !Array.from(grid.querySelectorAll('.station-card')).some(function (card) { return !card.hidden; });
      });
      if (counter) counter.textContent = count + ' station' + (count === 1 ? '' : 's') + ' · ' + button.textContent;
    });
  });
})();
