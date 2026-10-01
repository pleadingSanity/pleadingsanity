// ==============================================================
// PLEADING SANITY — VIDEO BLUEPRINT STUDIO
// Arron writes the whole production kit: timed script, storyboard,
// voiceover direction, shot list, captions (.srt), description,
// hashtags and a music guide. Download it, print it to PDF, or
// share the concept with the community.
// ==============================================================

import { api, esc, loadMe, toast } from '/js/auth.js';

const LAST = 'ps-blueprint-last';
const me = await loadMe();
const form = document.getElementById('bp-form');
const out = document.getElementById('bp-out');
const gate = document.getElementById('bp-gate');
let current = null;

if (!me) {
  gate.hidden = false;
  form.hidden = true;
}

const arr = (v) => (Array.isArray(v) ? v : []);

function toSRT(bp) {
  return arr(bp.captions)
    .map((c, i) => `${i + 1}\n${c.start} --> ${c.end}\n${c.text}\n`)
    .join('\n');
}

function toText(bp) {
  const line = '─'.repeat(48);
  const scenes = arr(bp.scenes)
    .map((s, i) => [
      `SCENE ${i + 1}  [${s.start}–${s.end}]`,
      `  Visual:      ${s.visual || ''}`,
      `  Voiceover:   ${s.voiceover || ''}`,
      `  On screen:   ${s.onScreenText || ''}`,
      `  Shot:        ${s.shot || ''}`,
      `  Lighting:    ${s.lighting || ''}`,
      `  Transition:  ${s.transition || ''}`,
      `  Emotion/pace: ${s.emotion || ''} · ${s.pace || ''}`,
    ].join('\n'))
    .join('\n\n');
  return [
    `🎬 VIDEO BLUEPRINT — ${bp.title}`,
    `Pleading Sanity · Evolution Not Erasure · Built with Arron`,
    `Topic: ${bp.topic} · Platform: ${bp.platform} · ${bp.seconds}s · Tone: ${bp.tone}`,
    line, 'HOOK', bp.hook || '',
    line, 'SCRIPT & STORYBOARD', scenes,
    line, 'VOICEOVER DIRECTION', bp.voiceoverNotes || '',
    line, 'MUSIC & MOOD GUIDE', arr(bp.music).map((m) => `• ${m.section}: ${m.mood} — ${m.suggestion}`).join('\n'),
    line, 'CAPTIONS (.srt)', toSRT(bp),
    line, 'DESCRIPTION', bp.description || '',
    '', arr(bp.hashtags).map((h) => '#' + String(h).replace(/^#/, '')).join(' '),
    line, 'CALL TO ACTION', bp.callToAction || '',
    line, 'ACCESSIBILITY', bp.accessibility || '',
    '', '🆘 UK support: Samaritans 116 123 · text SHOUT to 85258 · NHS 111 option 2 · 999 emergency',
  ].join('\n');
}

function save(name, text, type = 'text/plain') {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }));
  link.download = name;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => { URL.revokeObjectURL(link.href); link.remove(); }, 1000);
}

const slug = (s) => String(s || 'blueprint').toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

function render(bp) {
  current = bp;
  const scenes = arr(bp.scenes).map((s, i) => `
    <article class="sx-scene">
      <h3>Scene ${i + 1} · <time>${esc(s.start)}</time>–<time>${esc(s.end)}</time></h3>
      <dl>
        <dt>Visual</dt><dd>${esc(s.visual)}</dd>
        <dt>Voiceover</dt><dd>“${esc(s.voiceover)}”</dd>
        ${s.onScreenText ? `<dt>On screen</dt><dd>${esc(s.onScreenText)}</dd>` : ''}
        <dt>Emotion · pace</dt><dd>${esc(s.emotion)} · ${esc(s.pace)}</dd>
      </dl>
    </article>`).join('');
  const shots = arr(bp.scenes).map((s, i) => `
    <tr><td>${i + 1}</td><td>${esc(s.start)}–${esc(s.end)}</td><td>${esc(s.shot)}</td><td>${esc(s.lighting)}</td><td>${esc(s.transition)}</td></tr>`).join('');
  out.innerHTML = `
    <section class="panel" aria-labelledby="bp-title">
      <p class="post-time">🎬 ${esc(bp.platform)} · ${esc(bp.seconds)}s · ${esc(bp.tone)} · built with Arron</p>
      <h2 id="bp-title">${esc(bp.title)}</h2>
      <p><strong>Hook:</strong> ${esc(bp.hook)}</p>
      <div class="btn-row sx-noprint">
        <button type="button" class="sbtn primary small" data-bp="txt">⬇️ Download Blueprint</button>
        <button type="button" class="sbtn ghost small" data-bp="srt">💬 Captions (.srt)</button>
        <button type="button" class="sbtn ghost small" data-bp="pdf">🖨️ Save as PDF</button>
        <button type="button" class="sbtn ghost small" data-bp="copy">📋 Copy all</button>
        <button type="button" class="sbtn ghost small" data-bp="post">✍️ Share as post</button>
      </div>
    </section>
    <section class="panel" aria-labelledby="bp-script"><h2 id="bp-script">📝 Script &amp; storyboard</h2><div class="sx-scenes">${scenes}</div></section>
    <section class="panel" aria-labelledby="bp-shots"><h2 id="bp-shots">🎥 Shot list</h2>
      <div class="sx-table-wrap"><table class="sx-table"><thead><tr><th scope="col">#</th><th scope="col">Time</th><th scope="col">Camera</th><th scope="col">Lighting</th><th scope="col">Transition</th></tr></thead><tbody>${shots}</tbody></table></div>
    </section>
    <section class="panel" aria-labelledby="bp-vo"><h2 id="bp-vo">🎙️ Voiceover direction</h2><p>${esc(bp.voiceoverNotes)}</p></section>
    <section class="panel" aria-labelledby="bp-music"><h2 id="bp-music">🎵 Beat &amp; mood guide</h2>
      <ul>${arr(bp.music).map((m) => `<li><strong>${esc(m.section)}</strong> — ${esc(m.mood)}: ${esc(m.suggestion)}</li>`).join('')}</ul>
      <p class="post-time">Use royalty-free or properly licensed music only.</p>
    </section>
    <section class="panel" aria-labelledby="bp-cap"><h2 id="bp-cap">💬 Captions</h2><pre class="sx-pre">${esc(toSRT(bp))}</pre></section>
    <section class="panel" aria-labelledby="bp-desc"><h2 id="bp-desc">📣 Description &amp; hashtags</h2>
      <pre class="sx-pre">${esc(bp.description)}</pre>
      <div class="sx-hashtags" style="margin-top:10px">${arr(bp.hashtags).map((h) => `<span>#${esc(String(h).replace(/^#/, ''))}</span>`).join('')}</div>
      ${bp.callToAction ? `<p style="margin-top:10px"><strong>Call to action:</strong> ${esc(bp.callToAction)}</p>` : ''}
      ${bp.accessibility ? `<p><strong>Accessibility:</strong> ${esc(bp.accessibility)}</p>` : ''}
    </section>`;
  out.querySelector('#bp-title').setAttribute('tabindex', '-1');
}

out.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-bp]');
  if (!b || !current) return;
  const name = slug(current.title);
  if (b.dataset.bp === 'txt') save(`${name}-blueprint.txt`, toText(current));
  if (b.dataset.bp === 'srt') save(`${name}.srt`, toSRT(current), 'application/x-subrip');
  if (b.dataset.bp === 'pdf') window.print();
  if (b.dataset.bp === 'copy') {
    try { await navigator.clipboard.writeText(toText(current)); toast('Blueprint copied 📋'); } catch { toast("Couldn't copy — try Download instead."); }
  }
  if (b.dataset.bp === 'post') {
    const script = arr(current.scenes).map((s) => `[${s.start}] ${s.voiceover}`).join('\n');
    try {
      const { post } = await api('/api/posts', {
        method: 'POST',
        body: {
          kind: 'story',
          title: `🎬 ${current.title}`,
          body: `${current.hook}\n\n${script}\n\n${current.description || ''}`.slice(0, 19000),
          tags: ['VideoBlueprint', 'BuiltWithArron'],
          mood: 'rising',
          truthTag: 'experience',
        },
      });
      toast('Shared with the community 💙');
      setTimeout(() => { location.href = `/feed.html?post=${post.id}#community`; }, 900);
    } catch (error) {
      toast(error.data?.onboarding ? 'Finish your profile first, then you can post.' : error.message, 6000);
    }
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const topic = form.topic.value.trim();
  if (topic.length < 4) { out.innerHTML = '<p class="notice err">What\'s the video about? A sentence is plenty.</p>'; return; }
  const btn = form.querySelector('[type="submit"]');
  btn.disabled = true;
  btn.setAttribute('aria-busy', 'true');
  out.innerHTML = '<div class="sx-generating" style="aspect-ratio:auto;max-width:none"><div><div class="sx-orb" aria-hidden="true"></div><p><strong>Arron is storyboarding…</strong></p><p class="muted">Script, shots, captions, music — about 20–40 seconds.</p></div></div>';
  try {
    const { blueprint } = await api('/api/blueprint', {
      method: 'POST',
      body: { topic, platform: form.platform.value, length: form.length.value, tone: form.tone.value, notes: form.notes.value.trim() },
    });
    try { localStorage.setItem(LAST, JSON.stringify(blueprint)); } catch { /* storage full */ }
    render(blueprint);
    out.querySelector('#bp-title')?.focus();
  } catch (error) {
    out.innerHTML = `<p class="notice err">${esc(error.message)}${error.data?.reason ? ' ' + esc(error.data.reason) : ''}</p>`;
  } finally {
    btn.disabled = false;
    btn.removeAttribute('aria-busy');
  }
});

try {
  const last = JSON.parse(localStorage.getItem(LAST) || 'null');
  if (last && me) render(last);
} catch { /* nothing saved */ }
