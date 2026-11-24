(function () {
  'use strict';

  var CATALOG = '/data/ps-ai-content.json';
  var LOCAL_KEY = 'ps-ai-content-queue-v1';
  var SAFETY =
    'Arron is an AI companion, not a therapist. This is peer support, not treatment. ' +
    'If you need someone right now: Samaritans are free on 116 123, any time. ' +
    'You can text SHOUT to 85258. For urgent medical help in the UK, call NHS 111. ' +
    'If it is an emergency, call 999.';

  var VOICE_STYLE = {
    arron: { pitch: 0.85, rate: 0.95, prefer: /(male|daniel|george|arthur|ryan|guy)/i },
    nova: { pitch: 1.1, rate: 1.03, prefer: /(female|libby|sonia|kate|serena|samantha|aria)/i },
    sol: { pitch: 1.15, rate: 1.05, prefer: /(google uk english female|moira|tessa|karen|natasha|jenny)/i },
    grok: { pitch: 0.95, rate: 1.05, prefer: /(male|daniel|george|ryan|guy|david)/i }
  };

  function $(id) { return document.getElementById(id); }
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function hasSafety(text) {
    return /116\s*123/.test(text) && /85258/.test(text) && /111/.test(text) && /999/.test(text) && /not a therapist/i.test(text);
  }

  function withSafety(text) {
    var body = String(text || '').trim();
    return hasSafety(body) ? body : (body ? body + '\n\n' + SAFETY : SAFETY);
  }

  function readLocal() {
    try {
      var raw = localStorage.getItem(LOCAL_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function writeLocal(items) {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(items)); } catch (e) {}
  }

  var synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  var voices = [];
  function loadVoices() {
    voices = synth ? synth.getVoices().filter(function (v) { return /^en/i.test(v.lang); }) : [];
  }
  if (synth) {
    loadVoices();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', loadVoices);
  }

  function pickVoice(id) {
    var style = VOICE_STYLE[id] || VOICE_STYLE.arron;
    var gb = voices.filter(function (v) { return /en-GB/i.test(v.lang); });
    var pool = gb.length >= 2 ? gb : voices;
    var preferred = pool.find(function (v) { return style.prefer.test(v.name); });
    var index = { arron: 0, nova: 1, sol: 2, grok: 3 }[id] || 0;
    return preferred || pool[index % Math.max(pool.length, 1)] || null;
  }

  var playingBtn = null;
  function stopPlay() {
    if (synth) synth.cancel();
    document.querySelectorAll('.ps-pod-transcript li.speaking').forEach(function (el) {
      el.classList.remove('speaking');
    });
    if (playingBtn) playingBtn.textContent = 'Play episode';
    playingBtn = null;
  }

  function playItem(item, btn, list) {
    if (!synth) {
      setStatus('Your browser cannot read aloud. The script is on the page for you to read.');
      return;
    }
    if (playingBtn === btn) { stopPlay(); return; }
    stopPlay();
    playingBtn = btn;
    btn.textContent = 'Stop';
    var turns = (item.script || []).map(function (turn) {
      return { voice: turn.voice || 'arron', text: turn.text || '' };
    }).filter(function (t) { return t.text; });
    if (!turns.length) {
      turns = [{ voice: 'arron', text: withSafety((item.title || '') + '. ' + (item.body || item.summary || '')) }];
    }
    turns.forEach(function (turn, i) {
      var u = new SpeechSynthesisUtterance(turn.text);
      var style = VOICE_STYLE[turn.voice] || VOICE_STYLE.arron;
      u.voice = pickVoice(turn.voice);
      u.pitch = style.pitch;
      u.rate = style.rate;
      u.lang = (u.voice && u.voice.lang) || 'en-GB';
      u.onstart = function () {
        if (list) {
          list.querySelectorAll('li.speaking').forEach(function (el) { el.classList.remove('speaking'); });
          var row = list.children[i];
          if (row) {
            row.classList.add('speaking');
            row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        }
      };
      u.onend = function () {
        if (i === turns.length - 1) stopPlay();
      };
      synth.speak(u);
    });
  }

  function setStatus(msg) {
    var el = $('ps-pod-status');
    if (el) el.textContent = msg || '';
  }

  function transcriptHtml(item) {
    var turns = item.script || [];
    if (!turns.length && (item.body || item.summary)) {
      turns = [{ voice: 'arron', name: item.author || 'Arron', lab: 'AI companion', text: withSafety(item.body || item.summary) }];
    }
    return '<ol class="ps-pod-transcript">' + turns.map(function (t) {
      return '<li data-voice="' + esc(t.voice || 'arron') + '"><span class="who">' + esc(t.name || 'Arron') +
        ' <small>' + esc(t.lab || 'AI companion') + '</small></span><p>' + esc(t.text || '') + '</p></li>';
    }).join('') + '</ol>';
  }

  function cardHtml(item, opts) {
    opts = opts || {};
    var draft = item.status !== 'approved';
    var img = item.image || '/assets/podcast/grounding.svg';
    var title = item.title || 'Untitled';
    return '<article class="ps-pod-card" data-id="' + esc(item.id) + '">' +
      '<img class="art" src="' + esc(img) + '" alt="" width="800" height="500" />' +
      '<div class="body">' +
      '<span class="ps-pod-badge' + (draft ? ' draft' : '') + '">' + esc(item.label || 'AI-generated') + (draft ? ' · Draft' : '') + '</span>' +
      '<h2>' + esc(title) + '</h2>' +
      '<p class="ps-pod-meta">' + esc((item.topic || '') + (item.authors && item.authors[0] ? ' · ' + item.authors[0].name : '')) + '</p>' +
      '<p>' + esc(item.summary || item.body || '') + '</p>' +
      '<p class="ps-pod-safety">' + esc(item.notTherapy || 'Arron is an AI companion, not a therapist.') +
      ' Samaritans <a href="tel:116123">116 123</a> · Text <a href="sms:85258?body=SHOUT">SHOUT to 85258</a> · NHS <a href="tel:111">111</a> · Emergency <a href="tel:999">999</a>.</p>' +
      '<div class="ps-pod-actions">' +
      '<button type="button" class="play">Play episode</button>' +
      (opts.review ? '<button type="button" class="ghost open-script">Read script</button>' : '') +
      '</div>' +
      (opts.review ? '<details><summary>Read the script</summary>' + transcriptHtml(item) + '</details>' : '') +
      '</div></article>';
  }

  function bindCards(root, items) {
    var map = {};
    items.forEach(function (item) { map[item.id] = item; });
    root.querySelectorAll('.ps-pod-card').forEach(function (card) {
      var item = map[card.getAttribute('data-id')];
      var btn = card.querySelector('button.play');
      if (btn && item) {
        btn.addEventListener('click', function () {
          var list = card.querySelector('.ps-pod-transcript');
          var details = card.querySelector('details');
          if (details) details.open = true;
          playItem(item, btn, list);
        });
      }
    });
  }

  function catalogItems(data) {
    return (data && Array.isArray(data.items)) ? data.items : [];
  }

  async function loadCatalog() {
    var res = await fetch(CATALOG, { cache: 'no-store' });
    if (!res.ok) throw new Error('The episode list could not be loaded.');
    return res.json();
  }

  async function renderPublic() {
    var grid = $('ps-pod-grid');
    if (!grid) return;
    try {
      var data = await loadCatalog();
      var approved = catalogItems(data).filter(function (item) {
        return item && item.status === 'approved' && item.kind === 'podcast';
      });
      if (!approved.length) {
        grid.innerHTML = '<div class="ps-pod-empty" id="ps-pod-empty"><p>No episodes are public yet. Every AI draft waits in a human review queue first, so nothing goes live until it has been checked.</p><p>You can still draft a helpful post or episode below. It will stay in review until Shane approves it.</p></div>';
        return;
      }
      grid.innerHTML = approved.map(function (item) { return cardHtml(item, { review: true }); }).join('');
      bindCards(grid, approved);
    } catch (err) {
      grid.innerHTML = '<div class="ps-pod-empty"><p>' + esc(err.message || 'The episode list could not be loaded.') + '</p></div>';
    }
  }

  async function renderReview() {
    var grid = $('ps-pod-review');
    if (!grid) return;
    var seeds = [];
    try {
      var data = await loadCatalog();
      seeds = catalogItems(data);
    } catch (err) {
      seeds = [];
      setStatus(err.message);
    }
    var local = readLocal();
    var rows = seeds.concat(local);
    if (!rows.length) {
      grid.innerHTML = '<div class="ps-pod-empty"><p>The review queue is empty.</p></div>';
      return;
    }
    grid.innerHTML = rows.map(function (item) { return cardHtml(item, { review: true }); }).join('');
    bindCards(grid, rows);
  }

  function formDraft(form) {
    var kind = form.elements.kind.value === 'post' ? 'post' : 'podcast';
    var voice = form.elements.voice.value || 'arron';
    var names = { arron: 'Arron', nova: 'Nova', sol: 'Sol', grok: 'Grok' };
    var title = (form.elements.title.value || '').trim();
    var topic = (form.elements.topic.value || '').trim();
    var scriptText = withSafety(form.elements.script.value || '');
    if (title.length < 3 || scriptText.length < 40) {
      throw new Error('Please add a title and a little more script first.');
    }
    return {
      id: 'local-' + Date.now(),
      kind: kind === 'post' ? 'creation' : 'podcast',
      status: 'draft',
      title: title,
      topic: topic,
      summary: scriptText.slice(0, 240),
      body: scriptText,
      image: '/assets/podcast/' + (topic === 'sleep' ? 'sleep' : topic === 'peer connection' ? 'connection' : topic === 'asking for help' ? 'asking-for-help' : 'grounding') + '.svg',
      label: 'AI-generated',
      notTherapy: 'Arron is an AI companion, not a therapist. This is peer support, not treatment.',
      authors: [{ voice: voice, name: names[voice] || 'Arron', lab: 'AI companion' }],
      script: [{ voice: voice, name: names[voice] || 'Arron', lab: 'AI companion', text: scriptText }],
      source: 'local-queue'
    };
  }

  async function submitDraft(draft) {
    var local = readLocal();
    local.unshift(draft);
    writeLocal(local);
    var message = 'Saved to the review queue on this device. It is not public.';
    try {
      var res = await fetch('/api/studio/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          kind: draft.kind,
          title: draft.title,
          topic: draft.topic,
          body: draft.body,
          voice: draft.authors[0].voice,
          script: draft.script
        })
      });
      if (res.status === 401) {
        message = 'Saved on this device for review. Sign in on the live site to place it in Shane\'s queue.';
      } else if (res.ok) {
        message = 'Sent to the human review queue. It will stay hidden until it is approved.';
      } else {
        var data = await res.json().catch(function () { return {}; });
        message = (data && data.error) ? (data.error + ' The draft is still saved on this device, and is not public.') : message;
      }
    } catch (e) {
      message = 'Saved on this device for review. The live queue could not be reached, so nothing was published.';
    }
    return message;
  }

  function bindForm() {
    var form = $('ps-pod-draft');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      try {
        var draft = formDraft(form);
        submitDraft(draft).then(function (msg) {
          setStatus(msg);
          form.reset();
          if ($('ps-pod-review')) renderReview();
        });
      } catch (err) {
        setStatus(err.message);
      }
    });
    var preview = $('ps-pod-preview');
    if (preview) {
      preview.addEventListener('click', function () {
        try {
          var draft = formDraft(form);
          playItem(draft, preview, null);
        } catch (err) {
          setStatus(err.message);
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindForm();
    if ($('ps-pod-grid')) renderPublic();
    if ($('ps-pod-review')) renderReview();
    addEventListener('pagehide', stopPlay);
  });
})();
