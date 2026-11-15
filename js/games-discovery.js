/* Filter the existing games shelf. No accounts, tracking or save writes. */
const categories = {
  'sanity-solitaire': 'cards', 'night-table': 'cards',
  'cosmic-focus': 'puzzles', 'number-nebula': 'puzzles',
  'pattern-galaxy': 'puzzles', 'memory-ocean': 'puzzles',
  'rhythm-resonance': 'rhythm', 'stardust-dash': 'rhythm',
  'healing-hz': 'calm', 'sanity-stories': 'calm',
  'mind-mode': 'calm', 'cosmic-connect': 'puzzles',
  'truth-tag': 'puzzles', 'mood-journey': 'calm'
};

export function matchingGames(games, query = '', category = 'all') {
  const words = query.trim().toLocaleLowerCase('en-GB').split(/\s+/).filter(Boolean);
  return games.filter(game => (category === 'all' || categories[game.id] === category)
    && words.every(word => game.text.toLocaleLowerCase('en-GB').includes(word)));
}

export function initGameDiscovery(doc = document) {
  const controls = doc.getElementById('games-discovery');
  if (!controls || controls.dataset.ready) return;
  const search = doc.getElementById('games-search');
  const count = doc.getElementById('games-count');
  const empty = doc.getElementById('games-empty');
  const reset = doc.getElementById('games-reset');
  const buttons = Array.from(controls.querySelectorAll('[data-game-filter]'));
  const cards = Array.from(doc.querySelectorAll('.games-grid > .game-card')).map(node => ({
    id: node.querySelector('[data-mark]')?.dataset.mark || '',
    text: node.textContent, node
  }));
  if (!search || !count || !empty || !reset || !cards.length) return;
  let category = 'all';
  function render() {
    const visible = new Set(matchingGames(cards, search.value, category));
    cards.forEach(card => { card.node.hidden = !visible.has(card); });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.gameFilter === category)));
    count.textContent = visible.size + ' of ' + cards.length + ' games and quiet tools';
    empty.hidden = visible.size > 0;
    reset.hidden = category === 'all' && !search.value;
    doc.querySelectorAll('.sg-hub').forEach(section => {
      section.hidden = !cards.some(card => section.contains(card.node) && visible.has(card));
    });
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.gameFilter;
    render();
  }));
  search.addEventListener('input', render);
  reset.addEventListener('click', () => {
    category = 'all';
    search.value = '';
    render();
    search.focus();
  });
  controls.dataset.ready = 'true';
  controls.hidden = false;
  const challenges = doc.querySelector('a[href="#psg-hub"]');
  const progress = doc.getElementById('games-progress');
  if (challenges && progress) challenges.addEventListener('click', () => { progress.open = true; });
  render();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initGameDiscovery());
  else initGameDiscovery();
}
