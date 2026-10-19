/**
 * Northbeam Consulting shared form validation (UMD-style).
 * - In Node (unit tests): module.exports = Validators
 * - In the browser: window.Validators, plus automatic wiring of every form[data-validate-form]
 *
 * Field hooks: data-validate="name|email|phone|required", data-error="Custom message" (optional)
 * Form hooks:  data-success="Message shown on a valid submit". No network calls are made.
 */
const Validators = {
  /** Trimmed, at least 2 characters, letters / spaces / apostrophes / hyphens only (no digits). */
  name(value) {
    const v = String(value == null ? '' : value).trim();
    if (v.length < 2) return false;
    if (!/^[A-Za-zÀ-ÖØ-öø-ɏ' -]+$/.test(v)) return false;
    return (v.match(/[A-Za-zÀ-ÖØ-öø-ɏ]/g) || []).length >= 2;
  },
  /** local@domain.tld, no spaces. */
  email(value) {
    const v = String(value == null ? '' : value).trim();
    return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/.test(v);
  },
  /** Digits only, 10 to 15 of them. */
  phone(value) {
    const v = String(value == null ? '' : value).trim();
    return /^\d{10,15}$/.test(v);
  }
};

if (typeof module !== 'undefined' && module.exports) module.exports = Validators;
else window.Validators = Validators;

(function () {
  if (typeof document === 'undefined') return;

  const MESSAGES = {
    name: 'Please enter your name (at least 2 letters, no numbers).',
    email: 'Please enter a valid work email, like name@company.com.',
    phone: 'Please enter 10 to 15 digits, numbers only.',
    required: 'This field is required.'
  };

  function check(field) {
    const value = (field.value || '').trim();
    switch (field.getAttribute('data-validate')) {
      case 'name': return Validators.name(value);
      case 'email': return Validators.email(value);
      case 'phone': return Validators.phone(value);
      default: return value.length > 0;
    }
  }

  function errorEl(field) {
    const host = field.closest('[data-field]') || field.parentElement;
    let el = host.querySelector(':scope > .field-error');
    if (!el) {
      el = document.createElement('p');
      el.className = 'field-error hidden';
      el.id = (field.id || field.name || 'field') + '-error';
      el.setAttribute('aria-live', 'polite');
      host.appendChild(el);
      field.setAttribute('aria-describedby', ((field.getAttribute('aria-describedby') || '') + ' ' + el.id).trim());
    }
    return el;
  }

  function show(field, ok) {
    const el = errorEl(field);
    el.textContent = ok ? '' : (field.getAttribute('data-error') || MESSAGES[field.getAttribute('data-validate')] || MESSAGES.required);
    el.classList.toggle('hidden', ok);
    field.setAttribute('aria-invalid', ok ? 'false' : 'true');
    return ok;
  }

  function validateField(field) {
    if (field.disabled || field.closest('[hidden]')) return true;
    return show(field, check(field));
  }

  function successEl(form) {
    let el = form.querySelector('[data-form-success]');
    if (!el) {
      el = document.createElement('p');
      el.setAttribute('data-form-success', '');
      el.setAttribute('role', 'status');
      el.className = 'form-success hidden';
      form.appendChild(el);
    }
    return el;
  }

  function wire(form) {
    const fields = () => [...form.querySelectorAll('[data-validate]')];

    // Phone: digits only, stripped as you type.
    form.querySelectorAll('input[type="tel"], [data-validate="phone"]').forEach((input) => {
      input.setAttribute('inputmode', 'numeric');
      input.addEventListener('input', (e) => {
        const raw = input.value;
        const clean = raw.replace(/\D/g, '').slice(0, 15);
        if (clean === raw) return;
        input.value = clean;
        if (/\D/.test(raw)) {
          e.phoneBlocked = true;
          const el = errorEl(input);
          el.textContent = 'Numbers only: letters and symbols are removed.';
          el.classList.remove('hidden');
          input.setAttribute('aria-invalid', 'true');
        }
      });
    });

    fields().forEach((field) => {
      const evt = field.tagName === 'SELECT' ? 'change' : 'blur';
      field.addEventListener(evt, () => {
        if (evt === 'blur' && !field.value && field.getAttribute('aria-invalid') !== 'true') return;
        validateField(field);
      });
      field.addEventListener('input', (e) => {
        if (e.phoneBlocked) return;
        if (field.getAttribute('aria-invalid') === 'true') validateField(field);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const success = successEl(form);
      success.classList.add('hidden');
      const bad = fields().filter((f) => !validateField(f));
      if (bad.length) { bad[0].focus(); return; }
      success.textContent = form.getAttribute('data-success') || 'Thank you. We have received your message.';
      success.classList.remove('hidden');
      form.reset();
      fields().forEach((f) => f.removeAttribute('aria-invalid'));
    });
  }

  function init() { document.querySelectorAll('form[data-validate-form]').forEach(wire); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
