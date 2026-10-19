/**
 * ApexVanguard Capital - shared form validation.
 * UMD-style: the validators are exported for Node (unit tests) and exposed as window.Validators in the browser.
 *
 * Markup contract:
 *   <form novalidate data-validate-form>            every form on the site
 *     data-validate="name|email|phone|password|required" on fields (fields with `required` are checked too)
 *     data-optional            field may be left empty; validated only when filled
 *     data-submit="native"     let the browser submit (GET to another page) once valid
 *     data-custom-submit       a page script handles the valid submit (validation still blocks invalid ones)
 *     data-redirect="page"     after the success message, go to this page
 *     data-success="text"      custom success message
 */

const Validators = {
  // At least 2 characters, letters with optional spaces, apostrophes or hyphens. No digits.
  name(value) {
    const v = String(value == null ? '' : value).trim();
    return v.length >= 2 && /^[\p{L}][\p{L}' -]*[\p{L}]$/u.test(v);
  },
  // local@domain.tld, no spaces
  email(value) {
    const v = String(value == null ? '' : value).trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/.test(v) && !/\.\./.test(v);
  },
  // Digits only, 10 to 15 digits
  phone(value) {
    const v = String(value == null ? '' : value).trim();
    return /^\d{10,15}$/.test(v);
  },
};

if (typeof module !== 'undefined') module.exports = Validators; else window.Validators = Validators;

if (typeof document !== 'undefined') {
  (function () {
    'use strict';

    const MESSAGES = {
      name: 'Please enter a name of at least 2 letters (no numbers).',
      email: 'Please enter a valid email address, e.g. name@company.com.',
      phone: 'Please enter a phone number using digits only (10 to 15 digits).',
      password: 'Password must be at least 8 characters.',
      required: 'This field is required.',
      checkbox: 'Please tick this box to continue.',
    };
    let uid = 0;

    const fieldsOf = (form) => Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'))
      .filter((el) => !el.disabled && el.type !== 'hidden' && el.type !== 'submit' && el.type !== 'button');

    function ruleFor(el) {
      if (el.dataset.validate) return el.dataset.validate;
      if (el.required) return el.type === 'checkbox' ? 'checkbox' : 'required';
      return null;
    }

    function isValid(el, rule) {
      const value = el.value || '';
      if (rule === 'checkbox') return el.checked;
      if (el.hasAttribute('data-optional') && !value.trim()) return true;
      if (rule === 'name' || rule === 'email' || rule === 'phone') return Validators[rule](value);
      if (rule === 'password') return value.length >= 8;
      return value.trim().length > 0;
    }

    function errorHost(el) {
      return el.closest('[data-field]') || el.parentElement;
    }

    function setError(el, message) {
      if (!el.id) el.id = 'av-field-' + (++uid);
      const host = errorHost(el);
      let err = host.querySelector('.field-error[data-for="' + el.id + '"]');
      if (message) {
        if (!err) {
          err = document.createElement('p');
          err.className = 'field-error';
          err.id = el.id + '-error';
          err.setAttribute('data-for', el.id);
          host.appendChild(err);
        }
        err.textContent = message;
        el.setAttribute('aria-invalid', 'true');
        el.setAttribute('aria-describedby', err.id);
      } else {
        if (err) err.remove();
        el.removeAttribute('aria-invalid');
        if (el.getAttribute('aria-describedby') === el.id + '-error') el.removeAttribute('aria-describedby');
      }
    }

    function check(el) {
      const rule = ruleFor(el);
      if (!rule) return true;
      const ok = isValid(el, rule);
      const empty = !String(el.value || '').trim();
      const msg = rule === 'checkbox' ? MESSAGES.checkbox
        : empty ? MESSAGES.required
        : (el.dataset.error || MESSAGES[rule] || MESSAGES.required);
      setError(el, ok ? '' : msg);
      return ok;
    }

    function showSuccess(form) {
      let box = form.querySelector('[data-form-success]');
      if (!box) {
        box = document.createElement('p');
        box.setAttribute('data-form-success', '');
        form.appendChild(box);
      }
      box.className = 'form-success';
      box.setAttribute('role', 'status');
      box.setAttribute('tabindex', '-1');
      box.hidden = false;
      box.textContent = form.dataset.success || 'Thank you! Your details were received. An ApexVanguard advisor will contact you within one business day.';
      return box;
    }

    // Capture phase on document: runs before any page-level submit handlers on the form itself.
    document.addEventListener('submit', function (e) {
      const form = e.target;
      if (!(form instanceof HTMLFormElement) || !form.hasAttribute('data-validate-form')) return;

      let firstInvalid = null;
      fieldsOf(form).forEach(function (el) {
        if (!check(el) && !firstInvalid) firstInvalid = el;
      });

      if (firstInvalid) {
        e.preventDefault();
        e.stopPropagation();
        const old = form.querySelector('[data-form-success]');
        if (old) old.hidden = true;
        firstInvalid.focus();
        return;
      }

      if (form.dataset.submit === 'native') return;       // browser navigates (e.g. GET to calculator)
      if (form.hasAttribute('data-custom-submit')) return; // page script takes over

      e.preventDefault();
      const box = showSuccess(form);
      form.reset();
      fieldsOf(form).forEach(function (el) { setError(el, ''); });
      box.focus({ preventScroll: true });
      if (form.dataset.redirect) {
        const to = form.dataset.redirect;
        setTimeout(function () { window.location.href = to; }, 1200);
      }
    }, true);

    // Validate on blur (only once the user has typed something or the field was already flagged)
    document.addEventListener('focusout', function (e) {
      const el = e.target;
      if (!(el instanceof HTMLElement) || !el.form || !el.form.hasAttribute('data-validate-form')) return;
      if (!ruleFor(el)) return;
      if (String(el.value || '').trim() || el.getAttribute('aria-invalid') === 'true') check(el);
    });

    // Phone fields keep digits only while typing; flagged fields re-check live so errors clear as soon as fixed
    document.addEventListener('input', function (e) {
      const el = e.target;
      if (!(el instanceof HTMLInputElement) && !(el instanceof HTMLTextAreaElement)) return;
      if (el.dataset.validate === 'phone' || el.type === 'tel') {
        const digits = el.value.replace(/\D+/g, '').slice(0, 15);
        if (digits !== el.value) el.value = digits;
      }
      if (el.getAttribute('aria-invalid') === 'true') check(el);
    });

    document.addEventListener('change', function (e) {
      const el = e.target;
      if (el instanceof HTMLElement && el.getAttribute('aria-invalid') === 'true') check(el);
    });
  })();
}
