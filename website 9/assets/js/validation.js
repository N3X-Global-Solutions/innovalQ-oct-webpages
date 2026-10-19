/**
 * Hisaab shared form validation (UMD-style).
 * - In Node (unit tests): module.exports = Validators
 * - In the browser: window.Validators, plus automatic wiring of every form[data-validate-form]
 *
 * Field hooks: data-validate="name|email|phone|required|password|match|future-date|radio"
 *   data-match="#otherFieldId" (for match), data-error="Custom message" (optional)
 * Form hooks: data-success="Message shown on a valid submit"
 *   The form also receives a "validated-submit" CustomEvent when everything is valid,
 *   so pages can add their own behaviour (e.g. a booking confirmation). No network calls.
 */
const Validators = {
  name(value) {
    const v = String(value == null ? '' : value).trim();
    if (v.length < 2) return false;
    if (!/^[A-Za-zÀ-ɏ' -]+$/.test(v)) return false;
    return (v.match(/[A-Za-zÀ-ɏ]/g) || []).length >= 2;
  },
  email(value) {
    const v = String(value == null ? '' : value).trim();
    return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/.test(v);
  },
  phone(value) {
    const v = String(value == null ? '' : value).trim();
    return /^\d{10,15}$/.test(v);
  }
};

if (typeof module !== 'undefined') module.exports = Validators;
else window.Validators = Validators;

(function () {
  if (typeof document === 'undefined') return;

  const MESSAGES = {
    name: 'Please enter a valid name (at least 2 letters, no numbers).',
    email: 'Please enter a valid email, like you@business.in.',
    phone: 'Please enter 10 to 15 digits, numbers only.',
    required: 'This field is required.',
    password: 'Use at least 8 characters.',
    match: 'The two passwords do not match.',
    'future-date': 'Please pick today or a later date.',
    radio: 'Please choose one option.'
  };

  function today() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  function check(field) {
    const rule = field.getAttribute('data-validate');
    if (rule === 'radio') return !!field.querySelector('input[type="radio"]:checked');
    const value = (field.value || '').trim();
    switch (rule) {
      case 'name': return Validators.name(value);
      case 'email': return Validators.email(value);
      case 'phone': return Validators.phone(value);
      case 'password': return value.length >= 8;
      case 'match': {
        const other = document.querySelector(field.getAttribute('data-match'));
        return !!value && !!other && other.value === field.value;
      }
      case 'future-date': return !!value && value >= today();
      case 'required':
      default: return value.length > 0;
    }
  }

  function errorEl(field) {
    const host = field.closest('[data-field]') || field.parentElement;
    let el = host.querySelector(':scope > .field-error');
    if (!el) {
      el = document.createElement('p');
      el.className = 'field-error hidden';
      el.id = (field.id || field.name || 'field') + '-error-' + Math.random().toString(36).slice(2, 7);
      el.setAttribute('aria-live', 'polite');
      host.appendChild(el);
      field.setAttribute('aria-describedby', ((field.getAttribute('aria-describedby') || '') + ' ' + el.id).trim());
    }
    return el;
  }

  function show(field, ok) {
    const el = errorEl(field);
    const msg = field.getAttribute('data-error') || MESSAGES[field.getAttribute('data-validate')] || MESSAGES.required;
    el.textContent = ok ? '' : msg;
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

    form.querySelectorAll('input[type="tel"], [data-validate="phone"]').forEach((input) => {
      input.setAttribute('inputmode', 'numeric');
      input.addEventListener('input', (e) => {
        const raw = input.value;
        const clean = raw.replace(/\D/g, '').slice(0, 15);
        if (clean === raw) return;
        input.value = clean;
        if (/\D/.test(raw)) {
          // Letters / symbols are stripped straight away and the user is told why.
          e.phoneBlocked = true;
          const el = errorEl(input);
          el.textContent = 'Numbers only: letters and symbols are not allowed.';
          el.classList.remove('hidden');
          input.setAttribute('aria-invalid', 'true');
        }
      });
    });

    fields().forEach((field) => {
      const evt = field.getAttribute('data-validate') === 'radio' ? 'change' : 'blur';
      field.addEventListener(evt, () => {
        if (evt === 'blur' && !field.value && field.getAttribute('aria-invalid') !== 'true') return;
        validateField(field);
      }, true);
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
      if (bad.length) {
        const first = bad[0];
        const target = first.getAttribute('data-validate') === 'radio' ? first.querySelector('input') : first;
        if (target) target.focus();
        return;
      }
      const detail = Object.fromEntries(new FormData(form).entries());
      const evt = new CustomEvent('validated-submit', { detail, cancelable: true });
      const proceed = form.dispatchEvent(evt);
      if (!proceed) return; // page handled it (e.g. redirect or custom confirmation)
      success.textContent = form.getAttribute('data-success') || 'Thanks! We received your message.';
      success.classList.remove('hidden');
      form.reset();
      fields().forEach((f) => f.removeAttribute('aria-invalid'));
    });
  }

  function init() {
    document.querySelectorAll('form[data-validate-form]').forEach(wire);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
