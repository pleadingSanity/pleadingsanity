// P.S Prints shop (prints.html). Live items and the PayPal client ID come from
// /api/prints (Netlify env), never from this file. After PayPal captures, the
// server checks the order with PayPal (amount, payee, item) and records it.
const $ = (id) => document.getElementById(id);
const show = (id, on = true) => { const el = $(id); if (el) el.hidden = !on; };
const fmt = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
const pence = (gbp) => Math.round(gbp * 100);
const state = { info: null, item: null, ref: null, captured: null, checking: false, sdk: null, buttons: null };

function message(text) { const m = $('pr-msg'); if (!m) return; m.textContent = text; m.hidden = !text; }
function newRef() {
  const a = new Uint8Array(12);
  crypto.getRandomValues(a);
  return 'ps' + Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
}
const safePhoto = (u) => (typeof u === 'string' && /^(\/images\/3d-prints\/[a-z0-9._-]+\.(webp|jpe?g|png|svg)|\/api\/prints\/photo\/[a-z0-9._-]+\.(webp|jpe?g|png))$/i.test(u) ? u : null);

function readAddress() {
  const f = $('pr-form');
  const v = (n) => (f.elements[n]?.value || '').trim();
  return { name: v('name'), line1: v('line1'), line2: v('line2'), city: v('city'), postcode: v('postcode').toUpperCase(), email: v('email') };
}
function addressProblem(a) {
  if (a.name.length < 2) return 'Please add the name for delivery.';
  if (a.line1.length < 3) return 'Please add the first line of the address.';
  if (a.city.length < 2) return 'Please add the town or city.';
  if (!/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(a.postcode)) return 'Please add a UK postcode.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(a.email)) return 'Please add an email so we can tell you when it ships.';
  return null;
}
const qty = () => Math.min(5, Math.max(1, Number($('pr-qty').value) || 1));
const total = () => (pence(state.item.price_gbp) * qty() + pence(state.info.delivery_gbp)) / 100;

function updateTotal() {
  if (!state.item) return;
  $('pr-total').textContent = `Total ${fmt.format(total())} (${qty()} x ${fmt.format(state.item.price_gbp)} + ${fmt.format(state.info.delivery_gbp)} UK delivery)`;
}

async function confirmPayment() {
  if (state.checking || !state.captured) return;
  state.checking = true;
  show('pr-retry', false);
  message('Confirming your payment. Please wait.');
  try {
    const res = await fetch('/api/prints/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state.captured),
    });
    const r = await res.json().catch(() => ({}));
    if (r && r.verified === true) {
      show('pr-paypal', false); show('pr-form', false); show('pr-cancel', false);
      message(`Thank you. Your order is in (reference ${r.ref}). Shane prints it and emails you when it is posted. Keep your PayPal receipt.`);
    } else throw new Error('not verified');
  } catch {
    message('PayPal has your payment, but we could not confirm the order yet. Do not pay again. Choose Check again, or email support@pleadingsanity.co.uk with your PayPal receipt.');
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
  $('pr-summary').textContent = `${item.name} · ${item.colour} ${item.material}`;
  updateTotal();
  show('pr-check');
  $('pr-check').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  try {
    await loadSdk(state.info.clientId);
  } catch {
    message('Card payments could not load just now. Nothing has been charged. Please try again later.');
    show('pr-paypal', false);
    return;
  }
  if (!window.paypal || !window.paypal.Buttons) { message('Card payments are not available right now. Nothing has been charged.'); return; }
  if (state.buttons) { try { state.buttons.close(); } catch { /* already closed */ } }
  $('pr-paypal').replaceChildren();
  state.buttons = window.paypal.Buttons({
    style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay', height: 48 },
    onClick: (data, actions) => {
      const problem = addressProblem(readAddress());
      if (problem) { message(problem); return actions.reject(); }
      message('');
      return actions.resolve();
    },
    createOrder: (data, actions) => {
      const a = readAddress();
      const it = state.item;
      state.pending = { itemId: it.id, qty: qty(), ref: state.ref, address: a };
      return actions.order.create({
        purchase_units: [{
          custom_id: `ps-print:${it.id}:${state.pending.qty}:${state.ref}`,
          description: `P.S Print: ${it.name}`.slice(0, 127),
          amount: { value: ((pence(it.price_gbp) * state.pending.qty + pence(state.info.delivery_gbp)) / 100).toFixed(2), currency_code: 'GBP' },
          shipping: {
            name: { full_name: a.name },
            address: { address_line_1: a.line1, address_line_2: a.line2 || undefined, admin_area_2: a.city, postal_code: a.postcode, country_code: 'GB' },
          },
        }],
        application_context: { shipping_preference: 'SET_PROVIDED_ADDRESS' },
      });
    },
    onApprove: (data, actions) => actions.order.capture().then(() => {
      state.captured = { orderID: data.orderID, ...state.pending };
      show('pr-paypal', false);
      return confirmPayment();
    }),
    onError: () => message('PayPal could not finish. If you were charged, do not pay again: email support@pleadingsanity.co.uk.'),
  });
  state.buttons.render('#pr-paypal');
}

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
  tag.textContent = [item.colour, item.material, item.category === 'toy' ? `Age ${item.age_rating}` : `${item.age_rating} · not a toy`].join(' · ');
  const h = document.createElement('h2'); h.textContent = item.name;
  const d = document.createElement('p'); d.className = 'pr-small'; d.style.margin = '0'; d.textContent = item.description;
  const p = document.createElement('p'); p.className = 'pr-price'; p.textContent = fmt.format(item.price_gbp);
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'pr-btn';
  b.textContent = item.in_stock ? 'Buy' : 'Sold out';
  b.disabled = !item.in_stock || !state.info.configured;
  b.setAttribute('aria-label', `Buy ${item.name} for ${fmt.format(item.price_gbp)}`);
  b.addEventListener('click', () => openCheckout(item));
  body.append(tag, h, d, p, b);
  if (!img.src) el.append(body); else el.append(img, body);
  return el;
}

async function start() {
  const grid = $('pr-grid');
  try {
    const res = await fetch('/api/prints', { cache: 'no-store' });
    if (!res.ok) throw new Error('unavailable');
    state.info = await res.json();
  } catch {
    grid.innerHTML = '<p class="pr-empty">Prints are temporarily unavailable. Please check back soon.</p>';
    return;
  }
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
  if (!state.info.configured) {
    const n = document.createElement('p'); n.className = 'pr-small';
    n.textContent = 'Card payments are switching on soon. Nothing can be charged yet.';
    grid.after(n);
  }
}

$('pr-qty').addEventListener('change', updateTotal);
$('pr-retry').addEventListener('click', confirmPayment);
$('pr-cancel').addEventListener('click', () => { show('pr-check', false); state.item = null; });
start();
