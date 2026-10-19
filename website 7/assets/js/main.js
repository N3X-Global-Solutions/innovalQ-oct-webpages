/**
 * ApexVanguard Capital - small shared helpers used by the calculator and client portal.
 */

// Toast notifications
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const accent = type === 'success' ? 'border-emerald-500' : type === 'warning' ? 'border-amber-500' : 'border-rose-500';
  const toast = document.createElement('div');
  toast.className = `toast-msg flex max-w-md items-center justify-between gap-4 rounded-lg border border-slate-700/60 border-s-4 ${accent} bg-slate-900 px-4 py-3 text-white shadow-xl`;

  const text = document.createElement('span');
  text.className = 'text-sm font-medium text-slate-100';
  text.textContent = message;

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'p-1 text-slate-400 transition-colors hover:text-slate-200';
  close.setAttribute('aria-label', 'Dismiss notification');
  close.innerHTML = '<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>';
  close.addEventListener('click', () => toast.remove());

  toast.append(text, close);
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity .3s ease, transform .3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// Format numbers as Indian rupees
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}
