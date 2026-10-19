/**
 * ApexVanguard Capital - Equipment loan / lease EMI calculator
 * Features: EMI amortisation, Section 32 depreciation tax shield, CSV export, quote saver,
 * prefill from the home page quick quote (?amount=&type=&tier=).
 */

document.addEventListener('DOMContentLoaded', () => {
  const costSlider = document.getElementById('calc-cost-slider');
  if (!costSlider) return;

  const costInput = document.getElementById('calc-cost-input');
  const downSlider = document.getElementById('calc-down-slider');
  const downInput = document.getElementById('calc-down-input');
  const termSelect = document.getElementById('calc-term-select');
  const rateSlider = document.getElementById('calc-rate-slider');
  const rateInput = document.getElementById('calc-rate-input');
  const taxBracketSelect = document.getElementById('calc-tax-bracket');
  const loanTypeSelect = document.getElementById('calc-type-select');

  const outMonthlyPayment = document.getElementById('out-monthly-payment');
  const outLoanPrincipal = document.getElementById('out-loan-principal');
  const outTotalInterest = document.getElementById('out-total-interest');
  const outTotalPaid = document.getElementById('out-total-paid');
  const outDeduction = document.getElementById('out-sec179-deduction');
  const outTaxSavings = document.getElementById('out-tax-savings');
  const outNetEquipmentCost = document.getElementById('out-net-equipment-cost');
  const scheduleTableBody = document.getElementById('schedule-table-body');
  const saveQuoteBtn = document.getElementById('btn-save-quote');
  const exportCsvBtn = document.getElementById('btn-export-csv');

  let currentAmortization = [];

  function formatRupee(val) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  }

  function calculate() {
    const cost = Math.max(0, parseFloat(costInput.value) || 0);
    const downPercent = Math.min(30, Math.max(0, parseFloat(downInput.value) || 0));
    const downAmount = cost * (downPercent / 100);
    const principal = Math.max(0, cost - downAmount);
    const months = parseInt(termSelect.value, 10) || 60;
    const annualRate = Math.max(0, parseFloat(rateInput.value) || 0) / 100;
    const monthlyRate = annualRate / 12;
    const taxRatePct = parseFloat(taxBracketSelect.value) || 31.2;
    const isLease = loanTypeSelect.value === 'fmv_lease';

    let monthlyPayment = monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);

    // Operating lease: lessor keeps ~12% residual value, so the rental is lower
    if (isLease) monthlyPayment *= 0.88;

    const totalPaid = monthlyPayment * months + downAmount;
    const totalInterest = Math.max(0, monthlyPayment * months - principal);

    // Year-1 tax shield. Loan: Section 32 depreciation, 15% WDV + 20% additional on new plant & machinery
    // (additional depreciation not available under Section 115BAA). Lease: year-1 rentals are expensed.
    const deduction = isLease
      ? monthlyPayment * Math.min(12, months)
      : cost * (taxRatePct === 25.17 ? 0.15 : 0.35);
    const taxSavings = deduction * (taxRatePct / 100);
    const netCost = Math.max(0, cost - taxSavings);

    outMonthlyPayment.textContent = formatRupee(monthlyPayment);
    outLoanPrincipal.textContent = formatRupee(principal);
    outTotalInterest.textContent = formatRupee(totalInterest);
    outTotalPaid.textContent = formatRupee(totalPaid);
    if (outDeduction) outDeduction.textContent = formatRupee(deduction);
    if (outTaxSavings) outTaxSavings.textContent = formatRupee(taxSavings);
    if (outNetEquipmentCost) outNetEquipmentCost.textContent = formatRupee(netCost);

    generateSchedule(principal, monthlyRate, monthlyPayment, months);
  }

  function generateSchedule(principal, monthlyRate, monthlyPayment, totalMonths) {
    currentAmortization = [];
    let balance = principal;
    for (let m = 1; m <= totalMonths; m++) {
      const interest = balance * monthlyRate;
      const principalPart = Math.min(balance, monthlyPayment - interest);
      balance = Math.max(0, balance - principalPart);
      currentAmortization.push({ month: m, payment: monthlyPayment, principal: principalPart, interest, balance });
    }

    if (!scheduleTableBody) return;
    const rows = currentAmortization.slice(0, 12).map((row) => `
      <tr class="border-b border-slate-100 text-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
        <td class="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">Month ${row.month}</td>
        <td class="px-4 py-3 font-mono-numbers text-slate-900 dark:text-white">${formatRupee(row.payment)}</td>
        <td class="px-4 py-3 font-mono-numbers text-emerald-700 dark:text-emerald-400">${formatRupee(row.principal)}</td>
        <td class="px-4 py-3 font-mono-numbers text-slate-600 dark:text-slate-400">${formatRupee(row.interest)}</td>
        <td class="px-4 py-3 font-mono-numbers font-semibold text-slate-900 dark:text-white">${formatRupee(row.balance)}</td>
      </tr>`);
    if (totalMonths > 12) {
      rows.push(`<tr><td colspan="5" class="bg-slate-50 px-4 py-3 text-center text-xs italic text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">Showing the first 12 of ${totalMonths} EMIs. Export the CSV for the full schedule.</td></tr>`);
    }
    scheduleTableBody.innerHTML = rows.join('');
  }

  // Keep number inputs and sliders in sync
  const pair = (slider, input) => {
    slider.addEventListener('input', () => { input.value = slider.value; calculate(); });
    input.addEventListener('input', () => { slider.value = input.value; calculate(); });
  };
  pair(costSlider, costInput);
  pair(downSlider, downInput);
  pair(rateSlider, rateInput);

  [termSelect, taxBracketSelect, loanTypeSelect].forEach((el) => el.addEventListener('change', calculate));

  document.querySelectorAll('[data-down-quick]').forEach((btn) => {
    btn.addEventListener('click', () => {
      downSlider.value = downInput.value = btn.getAttribute('data-down-quick');
      calculate();
    });
  });
  document.querySelectorAll('[data-rate-quick]').forEach((btn) => {
    btn.addEventListener('click', () => {
      rateSlider.value = rateInput.value = btn.getAttribute('data-rate-quick');
      calculate();
    });
  });

  // CSV export
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      if (!currentAmortization.length) return;
      let csv = 'Month,EMI,Principal,Interest,Balance\n';
      currentAmortization.forEach((r) => {
        csv += `${r.month},${r.payment.toFixed(2)},${r.principal.toFixed(2)},${r.interest.toFixed(2)},${r.balance.toFixed(2)}\n`;
      });
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `ApexVanguard_Amortisation_${costInput.value}_${termSelect.value}m.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      if (typeof showToast === 'function') showToast('Amortisation schedule downloaded.', 'success');
    });
  }
  document.querySelectorAll('[data-export-proxy]').forEach((btn) => {
    btn.addEventListener('click', () => { if (exportCsvBtn) exportCsvBtn.click(); });
  });

  // Save quote and continue to the application in the client portal
  if (saveQuoteBtn) {
    saveQuoteBtn.addEventListener('click', () => {
      const quote = {
        amount: parseFloat(costInput.value),
        downPaymentPct: parseFloat(downInput.value),
        term: termSelect.value,
        rate: rateInput.value,
        type: loanTypeSelect.options[loanTypeSelect.selectedIndex].text,
        monthly: outMonthlyPayment.textContent,
        savedAt: new Date().toISOString(),
      };
      try { localStorage.setItem('apexvanguard_saved_quote', JSON.stringify(quote)); } catch (e) { /* storage blocked */ }
      if (typeof showToast === 'function') showToast('Quote saved. Taking you to your application...', 'success');
      setTimeout(() => { window.location.href = 'dashboard.html?tab=new-app&from_quote=true'; }, 900);
    });
  }

  // Prefill from the home page quick quote
  const params = new URLSearchParams(window.location.search);
  const qAmount = parseFloat(params.get('amount'));
  if (qAmount > 0) {
    const v = Math.min(parseFloat(costInput.max), Math.max(parseFloat(costInput.min), qAmount));
    costInput.value = costSlider.value = v;
  }
  const qType = params.get('type');
  if (qType && [...loanTypeSelect.options].some((o) => o.value === qType)) loanTypeSelect.value = qType;
  const tierRates = { prime: 9.5, good: 11.5, fair: 14 };
  const qTier = params.get('tier');
  if (tierRates[qTier]) rateInput.value = rateSlider.value = tierRates[qTier];

  calculate();
});
