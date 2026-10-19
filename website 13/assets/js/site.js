/**
 * Northbeam Consulting site chrome: theme toggle, RTL toggle, Home dropdown, mobile menu, footer year,
 * sticky-header shadow, reveal-on-scroll and list filters (case studies, insights).
 * Loaded with `defer` on every page. The inline <head> script applies the saved theme / direction before paint.
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
    store.set('northbeam-theme', dark ? 'dark' : 'light');
    paintTheme();
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
    store.set('northbeam-dir', rtl ? 'rtl' : 'ltr');
    paintDir();
  }

  /* ---------- Home dropdown ---------- */
  function initDropdowns() {
    document.querySelectorAll('[data-home-dropdown]').forEach((dd) => {
      const btn = dd.querySelector('[data-dropdown-button]');
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
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !menu.classList.contains('hidden')) { open(false); btn.focus(); }
      });
      dd.addEventListener('focusout', (e) => { if (e.relatedTarget && !dd.contains(e.relatedTarget)) open(false); });
    });
  }

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    const btn = document.querySelector('[data-menu-button]');
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

  /* ---------- Sticky header shadow (IntersectionObserver, no scroll handler) ---------- */
  function initHeaderShadow() {
    const header = document.querySelector('.site-header');
    if (!header || !('IntersectionObserver' in window)) return;
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none;';
    document.body.prepend(sentinel);
    new IntersectionObserver(([entry]) => header.classList.toggle('is-stuck', !entry.isIntersecting)).observe(sentinel);
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('is-visible')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  }

  /* ---------- Filters: [data-filter-group] buttons [data-filter] -> [data-filter-items] > [data-category] ---------- */
  function initFilters() {
    document.querySelectorAll('[data-filter-group]').forEach((group) => {
      const list = document.getElementById(group.getAttribute('data-filter-group'));
      if (!list) return;
      const items = [...list.querySelectorAll('[data-category]')];
      const status = document.querySelector(`[data-filter-status="${list.id}"]`);
      const empty = list.parentElement.querySelector('[data-filter-empty]');
      const buttons = [...group.querySelectorAll('[data-filter]')];
      function apply(value) {
        let shown = 0;
        items.forEach((item) => {
          const cats = item.getAttribute('data-category').split(' ');
          const match = value === 'all' || cats.includes(value);
          item.hidden = !match;
          if (match) { shown++; item.classList.add('is-visible'); }
        });
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === value)));
        if (status) status.textContent = `Showing ${shown} of ${items.length}`;
        if (empty) empty.hidden = shown !== 0;
      }
      buttons.forEach((b) => b.addEventListener('click', () => apply(b.getAttribute('data-filter'))));
      // Deep link: case-studies.html#automotive opens that case.
      const hash = decodeURIComponent(location.hash.slice(1));
      const target = hash && document.getElementById(hash);
      apply('all');
      if (target && list.contains(target)) {
        const det = target.querySelector('details');
        if (det) det.open = true;
      }
    });
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
    initHeaderShadow();
    initReveal();
    initFilters();
    document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
