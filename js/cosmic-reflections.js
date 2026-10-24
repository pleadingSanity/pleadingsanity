const SYSTEMS = { both: 'Both Western tropical and Vedic sidereal astrology', western: 'Western tropical astrology', vedic: 'Vedic sidereal astrology' };
const clean = (value, max) => String(value || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
export function buildChartBrief(input, today) {
  const date = clean(input.date, 10), place = clean(input.place, 120), name = clean(input.name, 80), question = clean(input.question, 350);
  if (!SYSTEMS[input.system]) throw new Error('Choose Western, Vedic, or both.');
  const parsed = new Date(date + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || date < '1800-01-01' || date > today) throw new Error('Enter a valid birth date that is not in the future.');
  if (!place) throw new Error('Enter your birth town and country.');
  if (!input.unknown && !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time || '')) throw new Error('Enter your local birth time, or choose “I do not know”.');
  return [
    `Please prepare a reflective reading using ${SYSTEMS[input.system]}.`,
    name ? `Name: ${name}` : 'Name: not supplied; ask only if required.',
    `Birth date: ${date}`,
    input.unknown ? 'Birth time: unknown. Do not invent a precise Ascendant, houses or timing.' : `Local birth time: ${input.time}`,
    `Birth town and country: ${place}`,
    'Confirm the location and its historical timezone/daylight-saving offset before calculating. If the place is ambiguous, ask me.',
    input.system === 'western' ? 'Declare the house system and calculation settings.' : 'Declare the ayanamsa and calculation settings; use Lahiri only if explicitly chosen and supported. Keep each system’s results separate.',
    `My question: ${question || 'Help me reflect on strengths, relationships and everyday choices.'}`,
    'Explain uncertainty and distinguish tradition from verified facts. Keep interpretation grounded and leave decisions to me. Do not diagnose health conditions or guarantee future events.',
  ].join('\n\n');
}

if (typeof document !== 'undefined') {
  const byId = id => document.getElementById(id);
  const form = byId('chart-form'), status = byId('form-status'), output = byId('brief-text'), result = byId('brief-result');
  const now = new Date(), today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  byId('birth-date').max = today;
  function clear() { form.reset(); byId('birth-time').disabled = false; byId('birth-time').required = true; output.textContent = ''; result.hidden = true; status.textContent = ''; }
  form.addEventListener('submit', event => event.preventDefault());
  byId('time-unknown').addEventListener('change', event => {
    byId('birth-time').disabled = event.target.checked; byId('birth-time').required = !event.target.checked;
    if (event.target.checked) byId('birth-time').value = '';
  });
  byId('build-brief').addEventListener('click', () => {
    if (!form.reportValidity()) return;
    try {
      output.textContent = buildChartBrief({ system: form.querySelector('input[name="system"]:checked').value, name: byId('birth-name').value, date: byId('birth-date').value, time: byId('birth-time').value, unknown: byId('time-unknown').checked, place: byId('birth-place').value, question: byId('birth-question').value }, today);
      result.hidden = false; status.textContent = 'Your brief is ready. Choose whether to copy it.'; output.focus();
    } catch (error) { status.textContent = error.message; }
  });
  byId('copy-brief').addEventListener('click', async () => {
    if (!output.textContent) return;
    try { await navigator.clipboard.writeText(output.textContent); status.textContent = 'Copied to your clipboard. Nothing was sent.'; }
    catch { const range = document.createRange(); range.selectNodeContents(output); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); output.focus(); status.textContent = 'Copy was blocked. Your brief is selected so you can copy it manually.'; }
  });
  byId('clear-details').addEventListener('click', () => { clear(); status.textContent = 'Details cleared from this page. Your clipboard is separate.'; });
  window.addEventListener('pagehide', clear);
  const prompts = ['What is one small thing I can choose today?', 'What helps me feel steady when life gets loud?', 'Who can I reach out to without having to perform?', 'What am I learning about my own boundaries?', 'What would kindness to myself look like this evening?', 'Which part of today can I let be good enough?'];
  let prompt = 0;
  byId('next-reflection').addEventListener('click', () => { prompt = (prompt + 1) % prompts.length; byId('reflection-prompt').textContent = prompts[prompt]; });
}
