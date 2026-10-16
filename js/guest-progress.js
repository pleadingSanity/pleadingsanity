// Guest progress. No account needed to play or keep levels.
// When the person later signs up, the same device memory is adopted.
// Nothing is deleted. Evolution Not Erasure.

(function () {
  const KEY = "ps-guest-progress";
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || { levels: {}, chips: 1000, name: "" }; }
    catch { return { levels: {}, chips: 1000, name: "" }; }
  }
  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }
  function name() {
    const d = load();
    if (!d.name) {
      d.name = "Friend " + Math.random().toString(36).slice(2, 6);
      save(d);
    }
    return d.name;
  }
  function record(game, level) {
    const d = load();
    d.levels[game] = Math.max(d.levels[game] || 1, level || 1);
    save(d);
  }
  function chips() {
    return load().chips;
  }
  function setChips(n) {
    const d = load();
    d.chips = Math.max(0, n);
    save(d);
  }
  window.PSGuest = { name, record, chips, setChips, load };
})();
