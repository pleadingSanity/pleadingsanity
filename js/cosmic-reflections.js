const SYSTEMS = {
  both: 'both Western tropical and Vedic sidereal astrology',
  western: 'Western tropical astrology',
  vedic: 'Vedic sidereal astrology',
};
const clean = (value, max) => String(value || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
function localDay() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function buildChartBrief(input, today = localDay()) {
  if (!input || typeof input !== 'object' || !Object.hasOwn(SYSTEMS, input.system)) throw new Error('Choose Western, Vedic, or both.');
  const date = typeof input.date === 'string' ? input.date.trim() : '';
  const place = clean(input.place, 120), name = clean(input.name, 80), question = clean(input.question, 350);
  const parsed = new Date(date + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || date < '1800-01-01' || date > today) throw new Error('Enter a valid birth date that is not in the future.');
  if (!place) throw new Error('Enter your birth town and country.');
  const unknown = input.unknown === true;
  if (!unknown && !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time || '')) throw new Error('Enter your local birth time, or choose “I do not know”.');
  return [
    `Please prepare a reflective reading using ${SYSTEMS[input.system]}.`,
    name ? `Name: ${name}` : 'Name: not supplied; ask only if required.',
    `Birth date: ${date}`,
    unknown ? 'Birth time: unknown. Do not invent a precise Ascendant, houses or timing.' : `Local birth time: ${input.time}`,
    `Birth town and country: ${place}`,
    'Confirm the location and its historical timezone/daylight-saving offset before calculating. If the place is ambiguous, ask me.',
    input.system !== 'vedic' ? 'For the Western reading: declare the house system and calculation settings.' : null,
    input.system !== 'western' ? 'For the Vedic reading: declare the ayanamsa and calculation settings; use Lahiri only if explicitly chosen and supported.' : null,
    input.system === 'both' ? 'Present each system separately, then explain differences without forcing agreement.' : null,
    `My question: ${question || 'Help me reflect on strengths, relationships and everyday choices.'}`,
    'Explain uncertainty and distinguish tradition from verified facts. Keep interpretation grounded and leave decisions to me. Do not diagnose health conditions or guarantee future events.',
  ].filter(Boolean).join('\n\n');
}

if (typeof document !== 'undefined') {
  const byId = id => document.getElementById(id);
  const form = byId('chart-form'), status = byId('form-status'), output = byId('brief-text'), result = byId('brief-result'), copyButton = byId('copy-brief');
  let revision = 0, copying = false;
  const setStatus = (text, tone = 'info') => { status.textContent = text; status.dataset.tone = tone; };
  function updateTimeField() {
    const unknown = byId('time-unknown').checked;
    byId('birth-time').disabled = unknown;
    byId('birth-time').required = !unknown;
    if (unknown) byId('birth-time').value = '';
  }
  function invalidateBrief() {
    const hadBrief = Boolean(output.textContent);
    revision += 1;
    output.textContent = '';
    result.hidden = true;
    setStatus(hadBrief || copying ? 'Details changed. Create a fresh brief before copying.' : '');
  }
  function clear() {
    revision += 1;
    form.reset(); updateTimeField();
    output.textContent = ''; result.hidden = true; setStatus('');
  }
  byId('birth-date').max = localDay();
  form.addEventListener('input', invalidateBrief);
  form.addEventListener('invalid', () => setStatus('Check the highlighted field, then try again.', 'error'), true);
  byId('time-unknown').addEventListener('change', updateTimeField);
  form.addEventListener('submit', event => {
    event.preventDefault();
    byId('birth-date').max = localDay();
    if (!form.reportValidity()) return;
    try {
      const brief = buildChartBrief({ system: form.querySelector('input[name="system"]:checked').value, name: byId('birth-name').value, date: byId('birth-date').value, time: byId('birth-time').value, unknown: byId('time-unknown').checked, place: byId('birth-place').value, question: byId('birth-question').value });
      revision += 1;
      output.textContent = brief;
      result.hidden = false;
      setStatus('Your brief is ready. Choose whether to copy it.');
      output.focus();
    } catch (error) {
      invalidateBrief();
      setStatus(error.message, 'error');
    }
  });
  copyButton.addEventListener('click', async () => {
    if (!output.textContent || copying) return;
    const text = output.textContent, copiedRevision = revision;
    copying = true; copyButton.disabled = true; copyButton.textContent = 'Copying…';
    try {
      await navigator.clipboard.writeText(text);
      if (revision === copiedRevision) setStatus('Copied to your clipboard. Nothing was sent.');
    } catch {
      if (revision !== copiedRevision) return;
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange(); range.selectNodeContents(output);
        selection.removeAllRanges(); selection.addRange(range);
      }
      output.focus();
      setStatus('Copy was blocked. Select and copy the brief manually.');
    } finally {
      copying = false; copyButton.disabled = false; copyButton.textContent = 'Copy my brief';
    }
  });
  byId('clear-details').addEventListener('click', () => { clear(); setStatus('Details cleared from this page. Your clipboard is separate.'); });
  window.addEventListener('pagehide', clear);
  window.addEventListener('pageshow', () => { byId('birth-date').max = localDay(); });
  const prompts = ['What is one small thing I can choose today?', 'What helps me feel steady when life gets loud?', 'Who can I reach out to without having to perform?', 'What am I learning about my own boundaries?', 'What would kindness to myself look like this evening?', 'Which part of today can I let be good enough?'];
  let prompt = 0;
  byId('next-reflection').addEventListener('click', () => { prompt = (prompt + 1) % prompts.length; byId('reflection-prompt').textContent = prompts[prompt]; });
}
