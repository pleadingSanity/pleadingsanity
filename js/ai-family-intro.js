// A private, in-memory introduction draft. No API, storage, bot execution or automatic sending.
const KINDS = ['AI assistant', 'Bot', 'Creative project', 'Human contributor'];
export function buildIntroduction(values) {
  function field(key, limit) {
    const value = typeof values[key] === 'string' ? values[key].trim() : '';
    if (!value || value.length > limit) throw new Error('Complete the required fields within their displayed limits.');
    return value;
  }
  const project = field('project', 80), operator = field('operator', 80);
  const tool = field('tool', 100), contribution = field('contribution', 1200);
  if (!KINDS.includes(values.kind)) throw new Error('Choose a project type from the list.');
  if (values.charter !== true || values.authority !== true) throw new Error('Read and confirm both statements before preparing a draft.');
  let link = typeof values.link === 'string' ? values.link.trim() : '';
  if (link) {
    let url;
    try { url = new URL(link); } catch { throw new Error('Use a plain public HTTPS project link.'); }
    if (link.length > 300 || url.protocol !== 'https:' || !url.hostname || url.username || url.password || url.search || url.hash) {
      throw new Error('Use a plain HTTPS project link without login details, query parameters or fragments.');
    }
    link = url.href;
  }
  return [
    'Pleading Sanity — AI family introduction', '',
    `Project: ${project}`, `Type: ${values.kind}`, `Human operator / public alias: ${operator}`,
    `Model / tool: ${tool}`, ...(link ? [`Public project link: ${link}`] : []), '',
    'Proposed contribution and limits:', contribution, '',
    'I have read the voluntary human–AI cooperation charter and will follow it in this community.',
    'I operate this project or have permission to introduce it.',
    'For human review only. No automatic membership, friendship, verification or technical access requested.'
  ].join('\n');
}

if (typeof document !== 'undefined') {
  const form = document.getElementById('family-intro-form');
  if (form) {
    const preview = document.getElementById('family-preview');
    const draft = document.getElementById('family-draft');
    const status = document.getElementById('family-status');
    const email = document.getElementById('family-email');
    let revision = 0;
    function invalidate() {
      revision++; preview.hidden = true; draft.value = ''; email.removeAttribute('href');
      status.textContent = '';
    }
    form.addEventListener('input', invalidate);
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      invalidate();
      const data = new FormData(form);
      try {
        draft.value = buildIntroduction({ ...Object.fromEntries(data), charter: data.has('charter'), authority: data.has('authority') });
        email.href = 'mailto:pleadingsanity1@gmail.com?subject=' + encodeURIComponent('AI family introduction') + '&body=' + encodeURIComponent(draft.value);
        preview.hidden = false;
        status.textContent = 'Draft ready for your review. Nothing has been submitted.';
        draft.focus();
      } catch (error) { status.textContent = error.message; }
    });
    document.getElementById('family-clear').addEventListener('click', () => {
      form.reset(); invalidate(); status.textContent = 'Draft cleared from this page. Any copy already shared stays in your clipboard or email app.';
      form.elements.project.focus();
    });
    document.getElementById('family-copy').addEventListener('click', async () => {
      if (preview.hidden || !draft.value) return;
      const current = revision, value = draft.value;
      try {
        await navigator.clipboard.writeText(value);
        if (current === revision) status.textContent = 'Draft copied. Nothing has been sent.';
      } catch {
        if (current === revision) { status.textContent = 'Copy is unavailable here. Select and copy the draft yourself.'; draft.focus(); draft.select(); }
      }
    });
    window.addEventListener('pagehide', () => { form.reset(); invalidate(); });
    form.hidden = false;
  }
}
