/* Kavach shared behaviour: theme toggle, RTL toggle, Home dropdown, mobile menu, footer year. */
(function () {
  'use strict';
  var root = document.documentElement;
  var THEME_KEY = 'kavach-theme';
  var DIR_KEY = 'kavach-dir';

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* storage blocked: keep the in-page state only */ }
  }

  // ---- Theme ----
  function syncTheme() {
    var dark = root.classList.contains('dark');
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(dark));
      btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      btn.setAttribute('title', dark ? 'Light theme' : 'Dark theme');
    });
  }
  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dark = !root.classList.contains('dark');
      document.documentElement.classList.toggle('dark', dark);
      store(THEME_KEY, dark ? 'dark' : 'light');
      syncTheme();
    });
  });
  syncTheme();

  // ---- Text direction ----
  function syncDir() {
    var rtl = root.getAttribute('dir') === 'rtl';
    document.querySelectorAll('[data-rtl-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(rtl));
      btn.setAttribute('aria-label', rtl ? 'Switch to left-to-right layout' : 'Switch to right-to-left layout');
      btn.setAttribute('title', rtl ? 'Left-to-right' : 'Right-to-left');
    });
  }
  document.querySelectorAll('[data-rtl-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = root.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl';
      document.documentElement.setAttribute('dir', next);
      store(DIR_KEY, next);
      syncDir();
    });
  });
  syncDir();

  // ---- Home dropdown (click, Esc, outside click) ----
  var dropdowns = Array.prototype.slice.call(document.querySelectorAll('[data-home-dropdown]'));
  function setOpen(dd, open) {
    var btn = dd.querySelector('[data-dropdown-button]');
    var panel = dd.querySelector('[data-dropdown-panel]');
    if (!btn || !panel) return;
    dd.classList.toggle('is-open', open);
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  }
  dropdowns.forEach(function (dd) {
    var btn = dd.querySelector('[data-dropdown-button]');
    if (!btn) return;
    setOpen(dd, false);
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(dd, btn.getAttribute('aria-expanded') !== 'true');
    });
  });
  document.addEventListener('click', function (e) {
    dropdowns.forEach(function (dd) { if (!dd.contains(e.target)) setOpen(dd, false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    dropdowns.forEach(function (dd) {
      if (!dd.classList.contains('is-open')) return;
      setOpen(dd, false);
      var btn = dd.querySelector('[data-dropdown-button]');
      if (btn) btn.focus();
    });
    closeMenu(true);
  });

  // ---- Mobile menu ----
  var menuBtn = document.querySelector('[data-menu-button]');
  var menu = document.getElementById('mobile-menu');
  function closeMenu(focusButton) {
    if (!menuBtn || !menu || menu.hidden) return;
    menu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
    if (focusButton) menuBtn.focus();
  }
  if (menuBtn && menu) {
    menu.hidden = true;
    menuBtn.addEventListener('click', function () {
      var open = menu.hidden;
      menu.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(false); });
    var mq = window.matchMedia('(min-width: 1024px)');
    var onMq = function () { if (mq.matches) closeMenu(false); };
    if (mq.addEventListener) mq.addEventListener('change', onMq); else mq.addListener(onMq);
  }

  // ---- Footer year ----
  var year = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = year; });
})();
