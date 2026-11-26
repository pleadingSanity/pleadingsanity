// P.S Prints shop (prints.html). Live items, delivery settings and the PayPal
// client ID come from /api/prints (Netlify env), never from this file. After
// PayPal captures, the server checks the order with PayPal (amount, payee, item,
// delivery) and records it. Reviews: verified buyers only, moderated. No tracking.
import { api } from '/js/auth.js';

const $ = (id) => document.getElementById(id);
const show = (id, on = true) => { const el = $(id); if (el) el.hidden = !on; };
const fmt = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
const pence = (gbp) => Math.round(gbp * 100);
const state = { info: null, item: null, ref: null, captured: null, pending: null, checking: false, sdk: null, buttons: null };

function message(text) { const m = $('pr-msg'); if (!m) return; m.textContent = text; m.hidden = !text; }
function newRef() {
  const a = new Uint8Array(12);
  crypto.getRandomValues(a);
  return 'ps' + Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
}
const safePhoto = (u) => (typeof u === 'string' && /^(\/images\/3d-prints\/[a-z0-9._-]+\.(webp|jpe?g|png|svg)|\/api\/prints\/photo\/[a-z0-9._-]+\.(webp|jpe?g|png))$/i.test(u) ? u : null);

const method = () => ($('pr-form').elements.delivery.value === 'collect' ? 'collect' : 'post');
function readAddress() {
  const f = $('pr-form');
  const v = (n) => (f.elements[n]?.value || '').trim();
  return { name: v('name'), line1: v('line1'), line2: v('line2'), city: v('city'), postcode: v('postcode').toUpperCase(), email: v('email') };
}
function addressProblem(a, m) {
  if (a.name.length < 2) return 'Please add your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(a.email)) return 'Please add an email so we can send order updates.';
  if (m === 'collect') return null;
  if (a.line1.length < 3) return 'Please add the first line of the address.';
  if (a.city.length < 2) return 'Please add the town or city.';
  if (!/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(a.postcode)) return 'Please add a UK postcode.';
  return null;
}
const qty = () => Math.min(5, Math.max(1, Number($('pr-qty').value) || 1));
const postP = () => pence(state.info.delivery.post_gbp);
const totalP = (q, m) => pence(state.item.price_gbp) * q + (m === 'post' ? postP() : 0);

function updateTotal() {
  if (!state.item) return;
  const m = method();
  for (const el of document.querySelectorAll('.pr-post')) el.hidden = m === 'collect';
  const extra = m === 'post' ? ` + ${fmt.format(state.info.delivery.post_gbp)} UK post` : ' + free Leicester collection';
  $('pr-total').textContent = `Total ${fmt.format(totalP(qty(), m) / 100)} (${qty()} x ${fmt.format(state.item.price_gbp)}${extra})`;
}

async function confirmPayment() {
  if (state.checking || !state.captured) return;
  state.checking = true;
  show('pr-retry', false);
  message('Confirming your payment. Please wait.');
  try {
    const r = await api('/api/prints/verify', { method: 'POST', body: state.captured });
    if (r && r.verified === true) {
      show('pr-paypal', false); show('pr-form', false); show('pr-cancel', false);
      const how = r.delivery === 'collect' ? 'We will message you to arrange collection in Leicester.' : 'Shane prints it and emails you when it is posted.';
      message(`Thank you. Your order is in. Order reference: ${r.ref} (keep it: you need it to leave a review). ${how} Keep your PayPal receipt.`);
    } else throw new Error('not verified');
  } catch {
    message('PayPal has your payment, but we could not confirm the order yet. Do not pay again. Choose Check again, or message us on WhatsApp or email shop@pleadingsanity.co.uk with your PayPal receipt.');
    show('pr-retry');
  } finally {
    state.checking = false;
  }
}

function loadSdk(clientId) {
  if (state.sdk) return state.sdk;
  state.sdk = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://www.paypal.com/sdk/js?client-id=' + encodeURIComponent(clientId) + '&currency=GBP&intent=capture';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return state.sdk;
}

async function openCheckout(item) {
  state.item = item;
  state.ref = newRef();
  state.captured = null;
  message('');
  show('pr-retry', false); show('pr-form'); show('pr-paypal'); show('pr-cancel');
  $('pr-summary').textContent = `${item.name} · ${item.material}`;
  updateTotal();
  show('pr-check');
  $('pr-check').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  if (!state.info.configured) { message('Card payments are switching on soon. Nothing can be charged yet. Message us to order.'); show('pr-paypal', false); return; }
  try {
    await loadSdk(state.info.clientId);
  } catch {
    message('Card payments could not load just now. Nothing has been charged. Please try again later or message us.');
    show('pr-paypal', false);
    return;
  }
  if (!window.paypal || !window.paypal.Buttons) { message('Card payments are not available right now. Nothing has been charged.'); return; }
  if (state.buttons) { try { state.buttons.close(); } catch { /* already closed */ } }
  $('pr-paypal').replaceChildren();
  state.buttons = window.paypal.Buttons({
    style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay', height: 48 },
    onClick: (data, actions) => {
      const problem = addressProblem(readAddress(), method());
      if (problem) { message(problem); return actions.reject(); }
      message('');
      return actions.resolve();
    },
    createOrder: (data, actions) => {
      const a = readAddress();
      const m = method();
      const it = state.item;
      state.pending = { itemId: it.id, qty: qty(), delivery: m, ref: state.ref, address: a };
      const unit = {
        custom_id: `ps-print:${it.id}:${state.pending.qty}:${m}:${state.ref}`,
        description: `P.S Print: ${it.name}`.slice(0, 127),
        amount: { value: (totalP(state.pending.qty, m) / 100).toFixed(2), currency_code: 'GBP' },
      };
      if (m === 'post') {
        unit.shipping = { name: { full_name: a.name }, address: { address_line_1: a.line1, address_line_2: a.line2 || undefined, admin_area_2: a.city, postal_code: a.postcode, country_code: 'GB' } };
      }
      return actions.order.create({ purchase_units: [unit], application_context: { shipping_preference: m === 'post' ? 'SET_PROVIDED_ADDRESS' : 'NO_SHIPPING' } });
    },
    onApprove: (data, actions) => actions.order.capture().then(() => {
      state.captured = { orderID: data.orderID, ...state.pending };
      show('pr-paypal', false);
      return confirmPayment();
    }),
    onError: () => message('PayPal could not finish. If you were charged, do not pay again: message us or email shop@pleadingsanity.co.uk.'),
  });
  state.buttons.render('#pr-paypal');
}

// ─── Reviews ───
const STAR = (on) => `<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 20 20"><path d="M10 1.8l2.5 5.1 5.6.8-4 3.9.9 5.6L10 14.6l-5 2.6.9-5.6-4-3.9 5.6-.8z" fill="${on ? '#f59e0b' : 'none'}" stroke="#f59e0b" stroke-width="1.4"/></svg>`;
const stars = (n) => Array.from({ length: 5 }, (_, i) => STAR(i < n)).join('');
async function openReviews(item) {
  state.reviewItem = item;
  $('pr-rev-title').textContent = `Reviews: ${item.name}`;
  $('pr-rev-msg').textContent = '';
  const list = $('pr-rev-list');
  list.textContent = 'Loading reviews...';
  show('pr-reviews');
  $('pr-reviews').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  try {
    const r = await api(`/api/prints/reviews?item=${encodeURIComponent(item.id)}`);
    list.replaceChildren();
    if (!r.reviews.length) { list.textContent = 'No reviews yet. Buyers can leave the first one below.'; return; }
    const avg = document.createElement('p');
    avg.className = 'pr-amber';
    avg.textContent = `${r.average} out of 5 from ${r.count} verified buyer${r.count === 1 ? '' : 's'}`;
    list.append(avg);
    for (const rv of r.reviews) {
      const p = document.createElement('blockquote');
      p.style.cssText = 'margin:.6rem 0;padding:.6rem .9rem;border-left:3px solid #00fff0;background:rgba(0,255,240,.04)';
      const s = document.createElement('span'); s.className = 'pr-amber'; s.setAttribute('aria-label', `${rv.rating} out of 5 stars`); s.innerHTML = stars(Math.max(1, Math.min(5, Number(rv.rating) || 0)));
      const t = document.createElement('p'); t.style.margin = '.3rem 0'; t.textContent = rv.text;
      const by = document.createElement('small'); by.className = 'pr-small'; by.textContent = `${rv.name} · verified buyer · ${rv.date}`;
      p.append(s, t, by);
      list.append(p);
    }
  } catch {
    list.textContent = 'Reviews could not load just now.';
  }
}

$('pr-rev-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const body = { itemId: state.reviewItem?.id, rating: Number(f.elements.rating.value), name: f.elements.name.value, text: f.elements.text.value, ref: f.elements.ref.value.trim(), email: f.elements.email.value.trim() };
  $('pr-rev-msg').textContent = 'Sending...';
  try {
    await api('/api/prints/reviews', { method: 'POST', body });
    f.reset();
    $('pr-rev-msg').textContent = 'Thank you. Your review is waiting for a quick check and will appear once approved.';
  } catch (error) {
    $('pr-rev-msg').textContent = error.message || 'Could not send the review. Please try again.';
  }
});

function card(item) {
  const el = document.createElement('article');
  el.className = 'pr-card';
  const img = document.createElement('img');
  img.src = safePhoto(item.photo) || '';
  img.alt = item.photo_alt || item.name;
  img.loading = 'lazy'; img.width = 600; img.height = 600;
  const body = document.createElement('div');
  body.className = 'pr-body';
  const tag = document.createElement('p');
  tag.className = 'pr-tag'; tag.style.margin = '0';
  tag.textContent = [item.first_batch ? 'First batch' : '', item.colour, item.category === 'toy' ? `Age ${item.age_rating}` : `${item.age_rating} · not a toy`].filter(Boolean).join(' · ');
  const h = document.createElement('h2'); h.textContent = item.name;
  const d = document.createElement('p'); d.className = 'pr-small'; d.style.margin = '0'; d.textContent = item.description;
  const mat = document.createElement('p'); mat.className = 'pr-small'; mat.style.margin = '0';
  mat.textContent = `Material: ${item.material}. ${item.material_note || ''}`;
  const warn = document.createElement('p');
  warn.style.cssText = 'margin:0;font-size:.85rem;color:#f5d9a8;border-left:3px solid #f59e0b;padding-left:8px';
  warn.textContent = item.warnings || '';
  const batch = document.createElement('p'); batch.className = 'pr-small'; batch.style.margin = '0';
  batch.textContent = `Made in Leicester by ${state.info.maker?.name || 'Pleading Sanity'} · batch ${item.batch}`;
  const match = document.createElement('p'); match.className = 'pr-small'; match.style.margin = '0';
  if (item.matches) { match.textContent = 'Matches: '; const a = document.createElement('a'); a.href = '/shop.html'; a.textContent = item.matches; a.style.color = '#38bdf8'; match.append(a); }
  const p = document.createElement('p'); p.className = 'pr-price'; p.textContent = fmt.format(item.price_gbp);
  const delivered = document.createElement('p'); delivered.className = 'pr-small'; delivered.style.margin = '0';
  delivered.textContent = `${fmt.format(item.price_gbp + state.info.delivery.post_gbp)} delivered (UK post ${fmt.format(state.info.delivery.post_gbp)} per order) · ${fmt.format(item.price_gbp)} with free Leicester collection`;
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'pr-btn';
  b.textContent = item.in_stock ? 'Buy' : 'Sold out';
  b.disabled = !item.in_stock;
  b.setAttribute('aria-label', `Buy ${item.name} for ${fmt.format(item.price_gbp)}`);
  b.addEventListener('click', () => openCheckout(item));
  const rv = document.createElement('button');
  rv.type = 'button'; rv.className = 'pr-btn';
  rv.style.cssText = 'background:transparent;color:#38bdf8;border:1px solid #38bdf8';
  rv.textContent = 'Reviews';
  rv.addEventListener('click', () => openReviews(item));
  body.append(tag, h, d, ...(item.matches ? [match] : []), mat, warn, batch, p, delivered, b, rv);
  if (img.src) el.append(img);
  el.append(body);
  return el;
}

async function start() {
  const grid = $('pr-grid');
  try {
    state.info = await api('/api/prints');
  } catch {
    // Leave any server-rendered static cards in place; only show the
    // fallback when the grid has no cards at all.
    if (!grid.querySelector('.pr-card')) {
      grid.innerHTML = '<p class="pr-empty">Prints are temporarily unavailable. Please check back soon.</p>';
    }
    return;
  }
  const d = state.info.delivery || { post_gbp: 0, collect: false };
  $('pr-post-label').textContent = `UK post (${fmt.format(d.post_gbp)} per order)`;
  if (!d.collect) { $('pr-collect-wrap').hidden = true; }
  grid.replaceChildren();
  const items = Array.isArray(state.info.items) ? state.info.items : [];
  if (!items.length) {
    const p = document.createElement('p');
    p.className = 'pr-empty'; p.setAttribute('role', 'status');
    p.textContent = 'First prints coming soon. Every print is test-printed and checked before it is listed.';
    grid.append(p);
    return;
  }
  for (const item of items) grid.append(card(item));
}

$('pr-qty').addEventListener('change', updateTotal);
for (const r of document.querySelectorAll('input[name="delivery"]')) r.addEventListener('change', updateTotal);
$('pr-retry').addEventListener('click', confirmPayment);
$('pr-cancel').addEventListener('click', () => { show('pr-check', false); state.item = null; });
start();
