// Add a print (creator-prints.html). The server (/api/prints/admin) decides who
// gets in and refuses any toy without compliance; this page only reflects that.
import { api, esc } from '/js/auth.js';

const $ = (id) => document.getElementById(id);
const fmt = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
let items = [];

async function gate() {
  try {
    await api('/api/prints/admin').then(render);
    $('gate').hidden = true;
    $('app').hidden = false;
    loadOrders();
  } catch (error) {
    if (error.status === 401) {
      $('gateText').textContent = 'This page is private. Sign in with your creator account.';
      $('gateSignIn').hidden = false;
    } else if (error.status === 403) {
      $('gateText').textContent = 'This page is for the Pleading Sanity creator team only.';
    } else {
      $('gateText').textContent = 'Could not reach the print studio just now. Please try again shortly.';
    }
  }
}

function render(data) {
  items = Array.isArray(data.items) ? data.items : [];
  const pick = $('cpPick');
  pick.replaceChildren(new Option('New print', ''));
  for (const i of items) pick.append(new Option(`${i.name} (${i.status})`, i.id));
  if (!items.length) { $('cpList').innerHTML = '<p>No prints yet.</p>'; return; }
  const rows = items.map((i) => `<tr><td>${esc(i.name)}<br><small>${esc(i.id)} · ${esc(i.category)}</small></td><td>${fmt.format(i.price_gbp)}</td><td>${esc(i.status)}</td><td>${i.sellable ? '<span class="ok">On sale</span>' : `<span class="no">Not on sale${i.blockers.length ? ': needs ' + esc(i.blockers.join(', ')) : ''}</span>`}</td></tr>`).join('');
  $('cpList').innerHTML = `<table><thead><tr><th>Print</th><th>Price</th><th>Status</th><th>Shop</th></tr></thead><tbody>${rows}</tbody></table>${data.paypal ? '' : '<p class="no">PayPal is not configured, so nothing can be bought yet.</p>'}`;
}

async function loadOrders() {
  try {
    const { orders = [] } = await api('/api/prints/admin/orders');
    if (!orders.length) { $('cpOrders').innerHTML = '<p>No orders yet.</p>'; return; }
    $('cpOrders').innerHTML = `<table><thead><tr><th>When</th><th>Print</th><th>Total</th><th>Post to</th></tr></thead><tbody>${orders.map((o) => {
      const a = o.address || {};
      return `<tr><td>${esc(String(o.createdAt || '').slice(0, 16).replace('T', ' '))}<br><small>${esc(o.ref || '')}</small></td><td>${esc(o.itemName || o.itemId)} x ${esc(String(o.qty))}</td><td>${esc(o.total)}</td><td>${esc(a.name)}<br>${esc(a.line1)}${a.line2 ? '<br>' + esc(a.line2) : ''}<br>${esc(a.city)} ${esc(a.postcode)}<br><small>${esc(a.email)}</small></td></tr>`;
    }).join('')}</tbody></table>`;
  } catch {
    $('cpOrders').innerHTML = '<p>Orders could not load.</p>';
  }
}

function fill(item) {
  const f = $('cpForm');
  f.reset();
  if (!item) return;
  for (const [k, v] of Object.entries(item)) {
    const el = f.elements[k];
    if (!el || el.type === 'file') continue;
    if (el.type === 'checkbox') el.checked = v === true;
    else el.value = v ?? '';
  }
}

$('cpPick').addEventListener('change', (e) => fill(items.find((i) => i.id === e.target.value)));
$('cpForm').elements.name.addEventListener('input', (e) => {
  const id = $('cpForm').elements.id;
  if (!$('cpPick').value) id.value = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
});
$('cpForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const form = new FormData(f);
  for (const k of ['made_to_order', 'mockup', 'compliance']) form.set(k, f.elements[k].checked ? 'true' : 'false');
  if (!f.elements.photo_file.files.length) form.delete('photo_file');
  $('cpStatus').textContent = 'Saving...';
  try {
    const { item } = await api('/api/prints/admin', { method: 'POST', form });
    $('cpStatus').textContent = item.sellable ? `Saved. ${item.name} is on sale now.` : `Saved as ${item.status}. Not on sale yet${item.blockers.length ? ': needs ' + item.blockers.join(', ') : ''}.`;
    render(await api('/api/prints/admin'));
    $('cpPick').value = item.id;
  } catch (error) {
    $('cpStatus').textContent = 'Not saved: ' + (error.message || 'please try again.');
  }
});
gate();
