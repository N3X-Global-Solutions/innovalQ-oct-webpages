/**
 * ApexVanguard Capital - Commercial Equipment & Business Loan Calculator
 * Features: Standard Amortization, Section 179 Tax Advantage, CSV Exporter, Quote Saver
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check if we are on calculator page
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

  // Outputs
  const outMonthlyPayment = document.getElementById('out-monthly-payment');
  const outLoanPrincipal = document.getElementById('out-loan-principal');
  const outTotalInterest = document.getElementById('out-total-interest');
  const outTotalPaid = document.getElementById('out-total-paid');
  const outSection179Deduction = document.getElementById('out-sec179-deduction');
  const outTaxSavings = document.getElementById('out-tax-savings');
  const outNetEquipmentCost = document.getElementById('out-net-equipment-cost');
  const scheduleTableBody = document.getElementById('schedule-table-body');
  const saveQuoteBtn = document.getElementById('btn-save-quote');
  const exportCsvBtn = document.getElementById('btn-export-csv');

  let currentAmortization = [];

  function formatDollar(val) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  }

  function calculate() {
    const cost = parseFloat(costInput.value) || 150000;
    const downPercent = parseFloat(downSlider.value) || 0;
    const downAmount = cost * (downPercent / 100);
    const principal = Math.max(0, cost - downAmount);
    const months = parseInt(termSelect.value, 10) || 60;
    const annualRate = (parseFloat(rateInput.value) || 6.5) / 100;
    const monthlyRate = annualRate / 12;
    const taxBracket = (parseFloat(taxBracketSelect.value) || 25) / 100;
    const isLeaseFMV = loanTypeSelect.value === 'fmv_lease';

    // Monthly payment formula
    let monthlyPayment = 0;
    if (monthlyRate === 0) {
      monthlyPayment = principal / months;
    } else {
      monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    }

    // FMV lease factor reduction estimate (approx 12-15% residual)
    if (isLeaseFMV) {
      monthlyPayment = monthlyPayment * 0.88;
    }

    const totalPaid = (monthlyPayment * months) + downAmount;
    const totalInterest = Math.max(0, (monthlyPayment * months) - principal);

    // Section 179 Calculation
    // Equipment qualifies for 100% deduction up to IRS limit (₹12,20,000 for 2026)
    const sec179Cap = 1220000;
    const eligibleDeduction = Math.min(cost, sec179Cap);
    const estimatedTaxSavings = eligibleDeduction * taxBracket;
    const netEquipmentCost = Math.max(0, cost - estimatedTaxSavings);

    // Update UI Cards
    if (outMonthlyPayment) outMonthlyPayment.textContent = formatDollar(monthlyPayment);
    if (outLoanPrincipal) outLoanPrincipal.textContent = formatDollar(principal);
    if (outTotalInterest) outTotalInterest.textContent = formatDollar(totalInterest);
    if (outTotalPaid) outTotalPaid.textContent = formatDollar(totalPaid);

    if (outSection179Deduction) outSection179Deduction.textContent = formatDollar(eligibleDeduction);
    if (outTaxSavings) outTaxSavings.textContent = formatDollar(estimatedTaxSavings);
    if (outNetEquipmentCost) outNetEquipmentCost.textContent = formatDollar(netEquipmentCost);

    // Generate Schedule
    generateSchedule(principal, monthlyRate, monthlyPayment, months);
  }

  function generateSchedule(principal, monthlyRate, monthlyPayment, totalMonths) {
    currentAmortization = [];
    let balance = principal;
    let totalInterestAccrued = 0;

    for (let m = 1; m <= totalMonths; m++) {
      const interestForMonth = balance * monthlyRate;
      const principalForMonth = Math.min(balance, monthlyPayment - interestForMonth);
      balance = Math.max(0, balance - principalForMonth);
      totalInterestAccrued += interestForMonth;

      currentAmortization.push({
        month: m,
        payment: monthlyPayment,
        principal: principalForMonth,
        interest: interestForMonth,
        balance: balance
      });
    }

    // Render first 12 months & highlights in table
    if (scheduleTableBody) {
      scheduleTableBody.innerHTML = '';
      const displayRows = currentAmortization.slice(0, 12);
      
      displayRows.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm';
        tr.innerHTML = `
          <td class="py-3 px-4 font-medium text-slate-800">Month ${row.month}</td>
          <td class="py-3 px-4 font-mono-numbers text-slate-900">${formatDollar(row.payment)}</td>
          <td class="py-3 px-4 font-mono-numbers text-emerald-700">${formatDollar(row.principal)}</td>
          <td class="py-3 px-4 font-mono-numbers text-slate-600">${formatDollar(row.interest)}</td>
          <td class="py-3 px-4 font-mono-numbers text-slate-900 font-semibold">${formatDollar(row.balance)}</td>
        `;
        scheduleTableBody.appendChild(tr);
      });

      if (totalMonths > 12) {
        const noteTr = document.createElement('tr');
        noteTr.innerHTML = `
          <td colspan="5" class="py-3 px-4 text-center text-xs text-slate-500 bg-slate-50 italic">
            Displaying initial 12 of ${totalMonths} monthly installments. Click "Download Complete CSV" for the full breakdown.
          </td>
        `;
        scheduleTableBody.appendChild(noteTr);
      }
    }
  }

  // Cost Slider & Input sync
  costSlider.addEventListener('input', (e) => {
    costInput.value = e.target.value;
    calculate();
  });
  costInput.addEventListener('input', (e) => {
    costSlider.value = e.target.value;
    calculate();
  });

  // Down Payment sync
  downSlider.addEventListener('input', (e) => {
    downInput.value = e.target.value;
    calculate();
  });
  downInput.addEventListener('input', (e) => {
    downSlider.value = e.target.value;
    calculate();
  });

  // Rate Slider sync
  rateSlider.addEventListener('input', (e) => {
    rateInput.value = e.target.value;
    calculate();
  });
  rateInput.addEventListener('input', (e) => {
    rateSlider.value = e.target.value;
    calculate();
  });

  // Select changes
  termSelect.addEventListener('change', calculate);
  taxBracketSelect.addEventListener('change', calculate);
  loanTypeSelect.addEventListener('change', calculate);

  // Quick Down Payment buttons
  document.querySelectorAll('[data-down-quick]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-down-quick');
      downSlider.value = val;
      downInput.value = val;
      calculate();
    });
  });

  // Quick Credit Tier buttons
  document.querySelectorAll('[data-rate-quick]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-rate-quick');
      rateSlider.value = val;
      rateInput.value = val;
      calculate();
    });
  });

  // Export Amortization Schedule to CSV
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      if (!currentAmortization.length) return;
      
      let csvContent = "data:text/csv;charset=utf-8,Month,Monthly Payment,Principal Component,Interest Component,Remaining Balance\n";
      currentAmortization.forEach(row => {
        csvContent += `${row.month},${row.payment.toFixed(2)},${row.principal.toFixed(2)},${row.interest.toFixed(2)},${row.balance.toFixed(2)}\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `ApexVanguard_Loan_Amortization_${costInput.value}_${termSelect.value}Mo.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      showToast('Amortization schedule exported to CSV!', 'success');
    });
  }

  // Save Quote and Navigate to Application
  if (saveQuoteBtn) {
    saveQuoteBtn.addEventListener('click', () => {
      const quote = {
        amount: parseFloat(costInput.value),
        downPaymentPct: parseFloat(downSlider.value),
        term: termSelect.value,
        rate: rateInput.value,
        type: loanTypeSelect.options[loanTypeSelect.selectedIndex].text,
        monthly: outMonthlyPayment.textContent,
        savedAt: new Date().toISOString()
      };

      localStorage.setItem('apexvanguard_saved_quote', JSON.stringify(quote));
      showToast('Quote saved to your account! Transferring to loan application...', 'success');
      
      setTimeout(() => {
        window.location.href = `dashboard.html?tab=new-app&from_quote=true`;
      }, 1000);
    });
  }

  // Initial calculation run
  calculate();
});
