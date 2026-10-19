/* Kavach shared form validation.
 * - Validators.name / email / phone return booleans (also used by the unit tests via module.exports).
 * - In the browser it wires every form[data-validate-form]: validates on blur and submit, shows inline
 *   errors, sets aria-invalid, focuses the first error and shows a success message (no network request).
 *   Fields opt in with data-validate="name|email|phone|required|password|match|message|positive".
 *   A form can listen for the cancelable "form:valid" event to handle success itself.
 */
const Validators = {
  name: function (value) {
    var v = String(value == null ? '' : value).trim();
    if (v.length < 2) return false;
    if (!/^[A-Za-zÀ-ɏऀ-ॿ][A-Za-zÀ-ɏऀ-ॿ\s'’-]*$/.test(v)) return false;
    return (v.match(/[A-Za-zÀ-ɏऀ-ॿ]/g) || []).length >= 2;
  },
  email: function (value) {
    var v = String(value == null ? '' : value).trim();
    return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/.test(v);
  },
  phone: function (value) {
    var v = String(value == null ? '' : value).trim();
    return /^\d{10,15}$/.test(v);
  }
};

if (typeof module !== 'undefined') module.exports = Validators; else window.Validators = Validators;

if (typeof document !== 'undefined') {
  (function () {
    'use strict';

    var MESSAGES = {
      name: 'Please enter a name of at least 2 letters (no numbers).',
      email: 'Please enter a valid email, e.g. name@company.in.',
      phone: 'Please enter 10 to 15 digits, numbers only.',
      required: 'This field is required.',
      password: 'Password must be at least 8 characters.',
      match: 'Passwords do not match.',
      message: 'Please write at least 10 characters.',
      positive: 'Please enter an amount greater than zero.'
    };

    function fieldValue(el) {
      if (el.type === 'checkbox') return el.checked ? 'on' : '';
      return String(el.value || '').trim();
    }

    function check(el) {
      var rule = el.getAttribute('data-validate');
      var v = fieldValue(el);
      var optional = el.hasAttribute('data-optional');
      if (!v) return optional ? '' : (el.getAttribute('data-required-message') || emptyMessage(el));
      var ok = true;
      switch (rule) {
        case 'name': ok = Validators.name(v); break;
        case 'email': ok = Validators.email(v); break;
        case 'phone': ok = Validators.phone(v); break;
        case 'password': ok = v.length >= 8; break;
        case 'match': {
          var other = el.form && el.form.querySelector(el.getAttribute('data-match'));
          ok = !!other && other.value === el.value; break;
        }
        case 'message': ok = v.length >= 10; break;
        case 'positive': ok = Number(v) > 0; break;
        default: ok = true;
      }
      return ok ? '' : (el.getAttribute('data-error') || MESSAGES[rule] || MESSAGES.required);
    }

    function emptyMessage(el) {
      var label = el.id && el.form ? el.form.querySelector('label[for="' + el.id + '"]') : null;
      var text = label ? label.textContent.replace(/\*/g, '').trim() : '';
      if (!text || el.type === 'checkbox') return MESSAGES.required;
      return (el.tagName === 'SELECT' ? 'Please select ' : 'Please enter ') + text.charAt(0).toLowerCase() + text.slice(1) + '.';
    }

    function errorEl(el) {
      var id = (el.id || el.name || 'field') + '-error';
      var existing = document.getElementById(id);
      if (existing) return existing;
      var p = document.createElement('p');
      p.id = id;
      p.className = 'field-error';
      p.setAttribute('aria-live', 'polite');
      p.hidden = true;
      var host = el.closest('[data-field]') || el.parentElement;
      host.appendChild(p);
      var described = (el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
      if (described.indexOf(id) === -1) described.push(id);
      el.setAttribute('aria-describedby', described.join(' '));
      return p;
    }

    function show(el, msg) {
      var err = errorEl(el);
      err.textContent = msg;
      err.hidden = !msg;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }

    function validate(el) { return show(el, check(el)); }

    function fields(form) {
      return Array.prototype.slice.call(form.querySelectorAll('[data-validate]')).filter(function (el) {
        return !el.disabled && !el.closest('[hidden]');
      });
    }

    function successBox(form) {
      var sel = form.getAttribute('data-success');
      var box = sel ? document.querySelector(sel) : form.querySelector('[data-form-success]');
      if (!box) {
        box = document.createElement('p');
        box.className = 'form-success';
        box.setAttribute('role', 'status');
        box.setAttribute('data-form-success', '');
        form.appendChild(box);
      }
      return box;
    }

    function wire(form) {
      form.setAttribute('novalidate', '');
      Array.prototype.slice.call(form.querySelectorAll('[data-validate]')).forEach(function (el) {
        if (el.getAttribute('data-validate') === 'phone') {
          el.setAttribute('inputmode', 'numeric');
          el.addEventListener('input', function () {
            var digits = el.value.replace(/\D+/g, '').slice(0, 15);
            if (digits !== el.value) el.value = digits;
          });
        }
        el.addEventListener('blur', function () {
          if (fieldValue(el) || el.getAttribute('aria-invalid') === 'true') validate(el);
        });
        var evt = (el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'date') ? 'change' : 'input';
        el.addEventListener(evt, function () { if (el.getAttribute('aria-invalid') === 'true') validate(el); });
      });

      form.addEventListener('submit', function (e) {
        var list = fields(form);
        var firstBad = null;
        list.forEach(function (el) { if (!validate(el) && !firstBad) firstBad = el; });
        var box = form.getAttribute('data-success') ? document.querySelector(form.getAttribute('data-success')) : form.querySelector('[data-form-success]');
        if (firstBad) {
          e.preventDefault();
          if (box) box.hidden = true;
          firstBad.focus();
          return;
        }
        if (form.hasAttribute('data-native-submit')) return; // e.g. quick quote -> contact.html?…
        e.preventDefault();
        var data = {};
        Array.prototype.forEach.call(form.elements, function (el) { if (el.name) data[el.name] = el.type === 'checkbox' ? el.checked : el.value; });
        var evt = new CustomEvent('form:valid', { detail: data, cancelable: true });
        if (!form.dispatchEvent(evt)) return; // page handled success itself
        var msg = successBox(form);
        msg.textContent = form.getAttribute('data-success-message') || 'Thank you! Your details have been received. A Kavach advisor will contact you within 1 working day.';
        msg.hidden = false;
        form.reset();
        list.forEach(function (el) { show(el, ''); el.removeAttribute('aria-invalid'); });
      });
    }

    function init() {
      document.querySelectorAll('form[data-validate-form]').forEach(wire);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  })();
}
