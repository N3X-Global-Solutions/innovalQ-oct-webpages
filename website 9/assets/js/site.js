/**
 * Hisaab site chrome: theme toggle, RTL toggle, Home dropdown, mobile menu and footer year.
 * Loaded with `defer` on every page. The tiny inline <head> script applies the saved
 * theme / direction before first paint; this file wires up the controls.
 */
(function () {
  const root = document.documentElement;
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* storage blocked */ } }
  };

  /* ---------- Theme ---------- */
  function paintTheme() {
    const dark = root.classList.contains('dark');
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(dark));
      btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      btn.setAttribute('title', dark ? 'Light theme' : 'Dark theme');
    });
  }
  function setTheme(dark) {
    root.classList.toggle('dark', dark);
    store.set('hisaab-theme', dark ? 'dark' : 'light');
    paintTheme();
    document.dispatchEvent(new CustomEvent('themechange', { detail: { dark } }));
  }

  /* ---------- Direction ---------- */
  function paintDir() {
    const rtl = root.getAttribute('dir') === 'rtl';
    document.querySelectorAll('[data-rtl-toggle]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(rtl));
      btn.setAttribute('aria-label', rtl ? 'Switch to left-to-right layout' : 'Switch to right-to-left layout');
      btn.setAttribute('title', rtl ? 'Left-to-right' : 'Right-to-left');
    });
  }
  function setDir(rtl) {
    root.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    store.set('hisaab-dir', rtl ? 'rtl' : 'ltr');
    paintDir();
  }

  /* ---------- Home dropdown ---------- */
  function initDropdowns() {
    document.querySelectorAll('[data-home-dropdown]').forEach((dd) => {
      const btn = dd.querySelector('[data-dropdown-toggle]');
      const menu = dd.querySelector('[data-dropdown-menu]');
      if (!btn || !menu) return;
      const open = (state) => {
        menu.classList.toggle('hidden', !state);
        btn.setAttribute('aria-expanded', String(state));
      };
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        open(menu.classList.contains('hidden'));
      });
      document.addEventListener('click', (e) => { if (!dd.contains(e.target)) open(false); });
      dd.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !menu.classList.contains('hidden')) { open(false); btn.focus(); }
      });
      dd.addEventListener('focusout', (e) => { if (e.relatedTarget && !dd.contains(e.relatedTarget)) open(false); });
    });
  }

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    const btn = document.querySelector('[data-menu-toggle]');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;
    const open = (state) => {
      menu.classList.toggle('hidden', !state);
      btn.setAttribute('aria-expanded', String(state));
      btn.setAttribute('aria-label', state ? 'Close menu' : 'Open menu');
      btn.querySelectorAll('[data-icon]').forEach((i) => i.classList.toggle('hidden', (i.dataset.icon === 'close') !== state));
    };
    btn.addEventListener('click', () => open(menu.classList.contains('hidden')));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.classList.contains('hidden')) { open(false); btn.focus(); } });
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => open(false)));
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e) => { if (e.matches) open(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
  }

  function init() {
    paintTheme();
    paintDir();
    document.querySelectorAll('[data-theme-toggle]').forEach((b) =>
      b.addEventListener('click', () => setTheme(!root.classList.contains('dark'))));
    document.querySelectorAll('[data-rtl-toggle]').forEach((b) =>
      b.addEventListener('click', () => setDir(root.getAttribute('dir') !== 'rtl')));
    initDropdowns();
    initMobileMenu();
    document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
