/**
 * ApexVanguard Capital - Global UI Scripts
 */

// Toast Notifications System
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgClass = type === 'success' 
    ? 'bg-slate-900 border-l-4 border-emerald-500 text-white' 
    : type === 'warning'
    ? 'bg-slate-900 border-l-4 border-amber-500 text-white'
    : 'bg-slate-900 border-l-4 border-rose-500 text-white';

  toast.className = `toast-msg flex items-center justify-between gap-4 px-4 py-3 rounded-lg shadow-xl border border-slate-700/60 max-w-md ${bgClass}`;
  
  const iconMarkup = type === 'success'
    ? `<svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`
    : `<svg class="w-5 h-5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;

  toast.innerHTML = `
    <div class="flex items-center gap-3">
      ${iconMarkup}
      <span class="text-sm font-medium text-slate-100">${message}</span>
    </div>
    <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-200 transition-colors p-1">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// Format numbers as currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Pre-qualify modal triggers if present
  const openPreQualModalBtns = document.querySelectorAll('[data-open-prequal]');
  const prequalModal = document.getElementById('prequal-modal');
  const closePrequalModalBtn = document.getElementById('close-prequal-modal');

  if (prequalModal) {
    openPreQualModalBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        prequalModal.classList.remove('hidden');
        prequalModal.classList.add('flex');
      });
    });

    if (closePrequalModalBtn) {
      closePrequalModalBtn.addEventListener('click', () => {
        prequalModal.classList.add('hidden');
        prequalModal.classList.remove('flex');
      });
    }

    prequalModal.addEventListener('click', (e) => {
      if (e.target === prequalModal) {
        prequalModal.classList.add('hidden');
        prequalModal.classList.remove('flex');
      }
    });

    // Handle Quick Pre-qualify submission
    const prequalForm = document.getElementById('prequal-form');
    if (prequalForm) {
      prequalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = document.getElementById('prequal-amount')?.value || '₹1,50,000';
        const type = document.getElementById('prequal-type')?.value || 'Equipment Financing';
        
        prequalModal.classList.add('hidden');
        prequalModal.classList.remove('flex');

        showToast(`Instant Pre-Qualification matched! Redirecting to Client Dashboard...`, 'success');
        setTimeout(() => {
          window.location.href = `dashboard.html?prefilled=true&amount=${encodeURIComponent(amount)}&type=${encodeURIComponent(type)}`;
        }, 900);
      });
    }
  }
});
