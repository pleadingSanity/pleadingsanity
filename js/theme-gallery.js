const assetRoot = '/images/themes/dola-2026/';

export function renderThemes(doc, themes) {
  const grid = doc.getElementById('artwork-grid');
  let count = 0;
  for (const theme of themes) {
    if (!theme || typeof theme.file !== 'string' || !/^[a-z0-9][a-z0-9-]*\.(png|jpg|webp)$/i.test(theme.file) || typeof theme.bestFor !== 'string') continue;
    const card = doc.createElement('article');
    card.className = 'card';
    const link = doc.createElement('a');
    link.className = 'artwork';
    link.href = assetRoot + theme.file;
    link.setAttribute('aria-label', 'View full artwork: ' + theme.bestFor);
    const image = doc.createElement('img');
    image.src = assetRoot + theme.file.replace(/\.(png|jpg)$/i, '.webp');
    image.alt = theme.bestFor;
    image.loading = 'lazy';
    image.decoding = 'async';
    // Keep the original artwork available if its optimized copy cannot load.
    image.addEventListener('error', () => { image.src = link.href; }, { once: true });
    link.append(image);
    const caption = doc.createElement('div');
    caption.className = 'caption';
    const title = doc.createElement('h2');
    title.textContent = theme.bestFor;
    const full = doc.createElement('a');
    full.className = 'full-art';
    full.href = link.href;
    full.textContent = 'View full artwork';
    full.setAttribute('aria-label', 'View full artwork: ' + theme.bestFor);
    caption.append(title, full);
    card.append(link, caption);
    grid.append(card);
    count++;
  }
  return count;
}

export async function loadGallery(doc, fetcher) {
  const status = doc.getElementById('gallery-status');
  try {
    const response = await fetcher(assetRoot + 'manifest.json');
    if (!response.ok) throw new Error('Artwork list unavailable');
    const manifest = await response.json();
    if (!Array.isArray(manifest.themes)) throw new Error('Invalid artwork list');
    const count = renderThemes(doc, manifest.themes);
    status.textContent = count ? `${count} artwork${count === 1 ? '' : 's'} · open a piece to see it in full.` : 'No artwork is available right now. Please try again later.';
  } catch {
    status.textContent = 'The artwork collection could not load. Please refresh to try again, or use the navigation to return to the sanctuary.';
  }
}

if (typeof document !== 'undefined') loadGallery(document, fetch);
