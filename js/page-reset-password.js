// reset-password.html — page script (kept out of the HTML so the strict Content-Security-Policy allows it)
import { requestPasswordRecovery, updateUser } from '/js/vendor/netlify-identity.js';
import { MissingIdentityError, afterSignIn, currentUser, esc } from '/js/auth.js';

const msg = document.getElementById('msg');
const show = (text, kind = 'err') => { msg.innerHTML = `<p class="notice ${kind}">${text}</p>`; };
const requestForm = document.getElementById('request-form');
const setForm = document.getElementById('set-form');

if (new URLSearchParams(location.search).get('mode') === 'set') {
  if (await currentUser()) {
    requestForm.hidden = true;
    setForm.hidden = false;
    setForm.elements.password.focus();
  } else {
    show('That link has expired. Request a new one below.', 'info');
  }
}

requestForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = requestForm.elements.email;
  if (!email.value || !email.checkValidity()) return show('Please enter a valid email address.');
  try {
    await requestPasswordRecovery(email.value.trim());
  } catch (error) {
    if (error instanceof MissingIdentityError) return show('Accounts are being switched on right now. Please try again in a few minutes.');
  }
  requestForm.hidden = true;
  show(`💌 If <strong>${esc(email.value)}</strong> has an account, a reset link is on its way. Check your spam folder too.`, 'ok');
});

setForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const { password, confirm } = setForm.elements;
  if (password.value.length < 8) return show('Your password needs at least 8 characters.');
  if (password.value !== confirm.value) return show("Those passwords don't match.");
  try {
    await updateUser({ password: password.value });
    show('Password saved 💙 Taking you in…', 'ok');
    setTimeout(() => afterSignIn(), 900);
  } catch (error) {
    show(esc(error.message || 'Could not save your password. Please try again.'));
  }
});

document.getElementById('skip').addEventListener('click', () => afterSignIn());
