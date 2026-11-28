/* Hand-picked music discovery. Moods and genres match the genre string
   already published on a track. BPM matches only a real number on the
   track. This file does not rank, recommend, or invent a tempo. */
(function (root) {
  'use strict';

  var GENRES = [
    { id: 'uk-garage', label: 'UK garage', test: /uk garage/i },
    { id: 'bassline', label: 'Bassline', test: /bassline/i },
    { id: 'grime', label: 'Grime', test: /grime/i },
    { id: 'deep-house', label: 'Deep house', test: /deep house/i },
    { id: 'tech-house', label: 'Tech house', test: /tech house/i },
    { id: 'hip-hop', label: 'Hip-hop', test: /hip-?hop/i }
  ];

  var MOODS = [
    { id: 'low-light', label: 'Low light', test: /deep house/i },
    { id: 'locked-groove', label: 'Locked groove', test: /tech house/i },
    { id: 'two-step', label: '2-step', test: /uk garage/i },
    { id: 'late-words', label: 'Late words', test: /grime|hip-?hop/i },
    { id: 'clubland', label: 'Clubland', test: /clubland/i }
  ];

  var BPM = [
    { id: 'any', label: 'Any tempo' },
    { id: 'under-120', label: 'Under 120', min: 0, max: 119.999 },
    { id: '120', label: '120–129', min: 120, max: 129.999 },
    { id: '130', label: '130 and over', min: 130, max: 1000 },
    { id: 'unstamped', label: 'Not stamped' }
  ];

  function genreOf(track) {
    return String((track && track.genre) || '');
  }

  function isAi(track) {
    if (!track) return false;
    if (track.kind === 'human') return false;
    if (track.kind === 'ai') return true;
    return /ai-generated/i.test(String(track.label || ''));
  }

  function badge(track) {
    if (isAi(track)) {
      return { text: 'AI', cls: 'ps-origin-badge ps-badge-ai', name: 'AI-generated' };
    }
    return { text: 'Human', cls: 'ps-origin-badge ps-badge-human', name: "Shane's voice" };
  }

  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function matchesGenre(track, id) {
    if (!id || id === 'all') return true;
    var g = byId(GENRES, id);
    return !!(g && g.test.test(genreOf(track)));
  }

  function matchesMood(track, id) {
    if (!id || id === 'all') return true;
    var m = byId(MOODS, id);
    return !!(m && m.test.test(genreOf(track)));
  }

  function bpmValue(track) {
    var n = track && track.bpm;
    return typeof n === 'number' && isFinite(n) ? n : null;
  }

  function matchesBpm(track, id) {
    if (!id || id === 'any') return true;
    var n = bpmValue(track);
    if (id === 'unstamped') return n === null;
    var band = byId(BPM, id);
    if (!band || band.min == null) return true;
    return n !== null && n >= band.min && n <= band.max;
  }

  function playable(tracks) {
    return (tracks || []).filter(function (t) {
      return t && t.approved === true && typeof t.src === 'string' && t.src && t.title;
    });
  }

  function shelves(tracks) {
    var list = playable(tracks);
    return MOODS.map(function (m) {
      return {
        id: m.id,
        label: m.label,
        tracks: list.filter(function (t) { return m.test.test(genreOf(t)); })
      };
    });
  }

  function listenNext(tracks, currentId, moodId) {
    var list = playable(tracks);
    var current = null;
    for (var i = 0; i < list.length; i++) if (list[i].id === currentId) current = list[i];
    if (!current) return [];
    var mood = moodId && moodId !== 'all' ? byId(MOODS, moodId) : null;
    var tests = [];
    if (mood) tests.push(mood.test);
    else MOODS.forEach(function (m) { if (m.test.test(genreOf(current))) tests.push(m.test); });
    if (!tests.length) return [];
    return list.filter(function (t) {
      if (t.id === currentId) return false;
      for (var n = 0; n < tests.length; n++) if (tests[n].test(genreOf(t))) return true;
      return false;
    });
  }

  root.PSDiscover = {
    genres: GENRES.map(function (g) { return { id: g.id, label: g.label }; }),
    moods: MOODS.map(function (m) { return { id: m.id, label: m.label }; }),
    bpm: BPM.map(function (b) { return { id: b.id, label: b.label }; }),
    badge: badge,
    matchesGenre: matchesGenre,
    matchesMood: matchesMood,
    matchesBpm: matchesBpm,
    bpmValue: bpmValue,
    shelves: shelves,
    listenNext: listenNext,
    healingHref: '/frequencies.html'
  };
})(typeof window !== 'undefined' ? window : globalThis);
