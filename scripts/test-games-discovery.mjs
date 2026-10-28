import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { matchingGames, initGameDiscovery } from '../js/games-discovery.js';

const games = [
  { id: 'sanity-solitaire', text: 'Sanity Solitaire Four games Undo' },
  { id: 'cosmic-focus', text: 'Cosmic Focus Memory sequences' },
  { id: 'mind-mode', text: 'Mind Mode Guided breathing' }
];
test('game search combines words and categories without changing source records', () => {
  const before = structuredClone(games);
  assert.deepEqual(matchingGames(games, '  COSMIC   memory ', 'puzzles'), [games[1]]);
  assert.deepEqual(matchingGames(games, 'memory', 'cards'), []);
  assert.deepEqual(matchingGames(games, '', 'calm'), [games[2]]);
  assert.deepEqual(matchingGames(games, '<img src=x>'), []);
  assert.deepEqual(games, before);
});

function fixture() {
  const element = () => ({ hidden: false, value: '', textContent: '', dataset: {}, events: {}, attrs: {},
    addEventListener(type, fn) { this.events[type] = fn; },
    setAttribute(key, value) { this.attrs[key] = value; }, focus() { this.focused = true; } });
  const ids = new Map(['games-discovery', 'games-search', 'games-count', 'games-empty', 'games-reset', 'games-progress'].map(id => [id, element()]));
  const buttons = ['all', 'cards', 'puzzles', 'calm'].map(category => Object.assign(element(), { dataset: { gameFilter: category } }));
  const cards = games.map(game => Object.assign(element(), { textContent: game.text, querySelector: () => ({ dataset: { mark: game.id } }) }));
  const section = { hidden: false, contains: node => node === cards[2] };
  const challenges = element();
  ids.get('games-discovery').querySelectorAll = () => buttons;
  const doc = { getElementById: id => ids.get(id), querySelectorAll: selector => selector === '.sg-hub' ? [section] : cards, querySelector: () => challenges };
  initGameDiscovery(doc);
  return { ids, buttons, cards, section, challenges, doc };
}
test('filtering updates cards, selected state, counts and calm section; clearing restores them', () => {
  const f = fixture();
  f.buttons[1].events.click();
  assert.deepEqual(f.cards.map(card => card.hidden), [false, true, true]);
  assert.equal(f.buttons[1].attrs['aria-pressed'], 'true');
  assert.equal(f.section.hidden, true);
  assert.equal(f.ids.get('games-count').textContent, '1 of 3 games and quiet tools');
  f.ids.get('games-reset').events.click();
  assert.ok(f.cards.every(card => !card.hidden));
  assert.equal(f.section.hidden, false);
  assert.equal(f.ids.get('games-search').focused, true);
});
test('empty searches expose a recoverable state and challenge link opens existing progress', () => {
  const f = fixture();
  f.ids.get('games-search').value = 'missing';
  f.ids.get('games-search').events.input();
  assert.equal(f.ids.get('games-empty').hidden, false);
  assert.equal(f.ids.get('games-reset').hidden, false);
  f.challenges.events.click();
  assert.equal(f.ids.get('games-progress').open, true);
  initGameDiscovery(f.doc);
  assert.equal(f.ids.get('games-discovery').dataset.ready, 'true');
});
test('all fourteen existing shelf entries remain in source, with valid catalogue controls', () => {
  const html = readFileSync(new URL('../games.html', import.meta.url), 'utf8');
  const ids = [...html.matchAll(/class="game-thumb" data-mark="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, 14);
  const sourceGames = ids.map(id => ({ id, text: id }));
  const categories = ['cards', 'puzzles', 'rhythm', 'calm'];
  assert.equal(categories.reduce((n, category) => n + matchingGames(sourceGames, '', category).length, 0), 14);
  assert.match(html, /id="games-discovery"[^>]*hidden/);
  for (const id of ['games-catalogue', 'games-calm-catalogue']) assert.match(html, new RegExp(`id="${id}"`));
});
