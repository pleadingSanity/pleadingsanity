// Supporter / Full Depth — optional one-off 99p (supporter.html).
// The PayPal client ID comes from /api/supporter (Netlify env), never from this file.
// After PayPal captures, the server checks the order with PayPal and adds the
// "supporter" role. Nothing essential on the site is ever behind it.
import { api, currentUser } from '/js/auth.js';

const $ = (id) => document.getElementById(id);
const show = (id, on = true) => { const el = $(id); if (el) el.hidden = !on; };
let captured = null;
let checking = false;

function message(text) {
  const m = $('sup-msg');
  if (!m) return;
  m.textContent = text;
  m.hidden = !text;
}

function done() {
  show('sup-buy', false);
  show('sup-retry', false);
  message('');
  show('sup-done');
}

async function confirmPayment(orderID) {
  if (checking) return;
  checking = true;
  show('sup-retry', false);
  message('Confirming your payment. Please wait.');
  try {
    const r = await api('/api/supporter/verify', { method: 'POST', body: { orderID } });
    if (r && r.verified === true) done();
    else throw new Error('not verified');
  } catch {
    message('PayPal has your payment, but we could not confirm it yet. Do not pay again. Choose Check again, or email support@pleadingsanity.co.uk with your PayPal receipt.');
    show('sup-retry');
  } finally {
    checking = false;
  }
}

function loadSdk(clientId) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://www.paypal.com/sdk/js?client-id=' + encodeURIComponent(clientId) + '&currency=GBP&intent=capture';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function start() {
  let info;
  try {
    await currentUser(); // refreshes the session token so the Authorization header is fresh
    info = await api('/api/supporter');
  } catch {
    info = null;
  }
  show('sup-loading', false);
  if (!info || !info.configured || !info.clientId) { show('sup-off'); return; }
  if (!info.signedIn || !info.userId) { show('sup-guest'); return; }
  if (info.supporter) { show('sup-done'); return; }

  try {
    await loadSdk(info.clientId);
  } catch {
    show('sup-off');
    return;
  }
  if (!window.paypal || !window.paypal.Buttons) { show('sup-off'); return; }
  show('sup-buy');
  window.paypal.Buttons({
    style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay', height: 48 },
    createOrder: (data, actions) => actions.order.create({
      purchase_units: [{
        custom_id: 'ps-supporter:' + info.userId,
        description: 'Pleading Sanity Supporter (one-off)',
        amount: { value: '0.99', currency_code: 'GBP' },
      }],
    }),
    onApprove: (data, actions) => actions.order.capture().then(() => {
      captured = data.orderID;
      show('sup-buy', false);
      return confirmPayment(data.orderID);
    }),
  }).render('#sup-paypal');
}

const retry = $('sup-retry');
if (retry) retry.addEventListener('click', () => { if (captured) confirmPayment(captured); });
start();
