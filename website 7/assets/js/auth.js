/**
 * ApexVanguard Capital - login page: sign-in / sign-up tabs, social buttons, forgot password.
 * Form validation and the success redirect are handled by validation.js.
 */
document.addEventListener('DOMContentLoaded', () => {
  const tabs = Array.from(document.querySelectorAll('[data-auth-tab]'));
  if (!tabs.length) return;

  function select(name, focus) {
    tabs.forEach((t) => {
      const on = t.dataset.authTab === name;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    document.querySelectorAll('[data-auth-panel]').forEach((p) => { p.hidden = p.dataset.authPanel !== name; });
    if (history.replaceState) history.replaceState(null, '', name === 'signup' ? '#signup' : location.pathname + location.search);
  }

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t.dataset.authTab, false));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      select(tabs[(i + 1) % tabs.length].dataset.authTab, true);
    });
  });
  if (location.hash === '#signup') select('signup', false);

  const status = document.querySelector('[data-social-status]');
  document.querySelectorAll('[data-social-provider]').forEach((btn) => {
    btn.addEventListener('click', () => {
      status.textContent = `Connecting to ${btn.dataset.socialProvider}... (demo: opening your dashboard)`;
      status.classList.remove('hidden');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
    });
  });

  const forgot = document.querySelector('[data-forgot]');
  const forgotStatus = document.querySelector('[data-forgot-status]');
  if (forgot && forgotStatus) {
    forgot.addEventListener('click', () => {
      const email = document.getElementById('si-email');
      const ok = window.Validators && window.Validators.email(email.value);
      forgotStatus.textContent = ok
        ? `A password reset link has been sent to ${email.value.trim()}.`
        : 'Enter your email above first, then choose "Forgot password?" again.';
      forgotStatus.classList.remove('hidden');
      if (!ok) email.focus();
    });
  }
});
