// onboarding.html — page script (kept out of the HTML so the strict Content-Security-Policy allows it)
import { clearMe, requireMember, safeNext, toast } from '/js/auth.js';
import { mountProfileForm } from '/js/profile-form.js';

const me = await requireMember({ allowUnonboarded: true });
if (me.profile?.onboarded) location.replace(safeNext());

mountProfileForm(document.getElementById('form-root'), {
  profile: me.profile,
  submitLabel: 'Enter the community →',
  onSaved: () => {
    clearMe();
    toast('Welcome in 💙');
    location.replace(safeNext());
  },
});
document.querySelector('#form-root input')?.focus();
