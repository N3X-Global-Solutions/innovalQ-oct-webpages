/**
 * ApexVanguard Capital - shared UI behaviour for every page.
 * Theme toggle (persisted), RTL toggle (persisted), Home dropdown, mobile menu, footer year.
 * The inline <head> snippet applies the saved theme/dir before first paint; this file keeps them in sync.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var THEME_KEY = 'av-theme';
  var DIR_KEY = 'av-dir';

  function save(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* storage blocked: setting still applies for this page */ }
  }

  /* ---------- Theme ---------- */
  function syncThemeButtons() {
    var dark = root.classList.contains('dark');
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(dark));
      btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      btn.setAttribute('title', dark ? 'Light theme' : 'Dark theme');
    });
  }

  function toggleTheme() {
    var dark = document.documentElement.classList.toggle('dark', !root.classList.contains('dark'));
    save(THEME_KEY, dark ? 'dark' : 'light');
    syncThemeButtons();
  }

  /* ---------- Direction (LTR / RTL) ---------- */
  function syncDirButtons() {
    var rtl = root.getAttribute('dir') === 'rtl';
    document.querySelectorAll('[data-rtl-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(rtl));
      btn.setAttribute('aria-label', rtl ? 'Switch to left-to-right layout' : 'Switch to right-to-left layout');
      btn.setAttribute('title', rtl ? 'Left-to-right' : 'Right-to-left');
    });
  }

  function toggleDir() {
    var next = root.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl';
    document.documentElement.setAttribute('dir', next);
    save(DIR_KEY, next);
    syncDirButtons();
  }

  /* ---------- Home dropdown ---------- */
  function dropdowns() { return Array.prototype.slice.call(document.querySelectorAll('[data-home-dropdown]')); }

  function setDropdown(dd, open) {
    var trigger = dd.querySelector('[data-dropdown-trigger]');
    var menu = dd.querySelector('[data-dropdown-menu]');
    if (!trigger || !menu) return;
    dd.classList.toggle('is-open', open);
    menu.classList.toggle('hidden', !open);
    trigger.setAttribute('aria-expanded', String(open));
  }

  function closeDropdowns(except) {
    dropdowns().forEach(function (dd) { if (dd !== except) setDropdown(dd, false); });
  }

  /* ---------- Mobile menu ---------- */
  function setMobileMenu(open) {
    var menu = document.querySelector('[data-mobile-menu]');
    var btn = document.querySelector('[data-menu-toggle]');
    if (!menu || !btn) return;
    menu.classList.toggle('hidden', !open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    var openIcon = btn.querySelector('[data-icon-open]');
    var closeIcon = btn.querySelector('[data-icon-close]');
    if (openIcon) openIcon.classList.toggle('hidden', open);
    if (closeIcon) closeIcon.classList.toggle('hidden', !open);
  }

  /* ---------- Delegated events ---------- */
  document.addEventListener('click', function (e) {
    var target = e.target;
    if (!(target instanceof Element)) return;

    if (target.closest('[data-theme-toggle]')) { toggleTheme(); return; }
    if (target.closest('[data-rtl-toggle]')) { toggleDir(); return; }

    var trigger = target.closest('[data-dropdown-trigger]');
    if (trigger) {
      var dd = trigger.closest('[data-home-dropdown]');
      var isOpen = dd.classList.contains('is-open');
      closeDropdowns(dd);
      setDropdown(dd, !isOpen);
      if (!isOpen) {
        var first = dd.querySelector('[data-dropdown-menu] a');
        if (first && e.detail === 0) first.focus(); // keyboard activation
      }
      return;
    }

    // Outside click closes any open dropdown
    if (!target.closest('[data-home-dropdown]')) closeDropdowns(null);

    var menuBtn = target.closest('[data-menu-toggle]');
    if (menuBtn) {
      setMobileMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
      return;
    }
    // Following an in-page link from the mobile menu closes it
    if (target.closest('[data-mobile-menu] a')) setMobileMenu(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = dropdowns().filter(function (dd) { return dd.classList.contains('is-open'); });
    if (open.length) {
      closeDropdowns(null);
      var t = open[0].querySelector('[data-dropdown-trigger]');
      if (t) t.focus();
      return;
    }
    var menuBtn = document.querySelector('[data-menu-toggle][aria-expanded="true"]');
    if (menuBtn) { setMobileMenu(false); menuBtn.focus(); }
  });

  // Close the dropdown when keyboard focus leaves it
  document.addEventListener('focusin', function (e) {
    dropdowns().forEach(function (dd) {
      if (dd.classList.contains('is-open') && !dd.contains(e.target)) setDropdown(dd, false);
    });
  });

  // Close the mobile menu when the viewport grows to desktop layout
  if (window.matchMedia) {
    var desktop = window.matchMedia('(min-width: 1024px)');
    var onChange = function (mq) { if (mq.matches) setMobileMenu(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  }

  /* ---------- Init ---------- */
  function init() {
    syncThemeButtons();
    syncDirButtons();
    var year = String(new Date().getFullYear());
    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = year; });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
