/**
 * ApexVanguard Capital - client portal (UI only, dummy data from data.js).
 * Renders applications, active loans and documents; handles the new-application form and uploads.
 */
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('applications-list')) return;

  const user = DataStore.getUser();
  let applications = DataStore.getApplications();
  let documents = DataStore.getDocuments();
  const contracts = DataStore.getContracts();

  const esc = (str) => {
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  };
  const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };

  setText('user-first-name', user.name.split(' ')[0]);
  setText('user-company', user.company);
  setText('user-credit', user.creditTier);
  if (user.accountOfficer) setText('broker-name', user.accountOfficer.name);

  const badge = (stage) => (stage === 'Funded' || stage === 'Approved'
    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
    : 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300');

  function renderStats() {
    setText('stat-apps', applications.length);
    setText('stat-total', formatCurrency(applications.reduce((s, a) => s + (Number(a.amount) || 0), 0)));
    setText('stat-emi', formatCurrency(contracts.reduce((s, c) => s + c.monthlyPayment, 0)));
    setText('stat-docs', documents.length);
  }

  function renderApplications() {
    const list = document.getElementById('applications-list');
    if (!applications.length) {
      list.innerHTML = '<p class="p-5 text-sm text-slate-500 dark:text-slate-400">No applications yet.</p>';
      return;
    }
    list.innerHTML = applications.map((app) => `
      <div class="p-5">
        <div class="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div class="min-w-0">
            <p class="font-semibold text-slate-900 dark:text-white">${esc(app.title)}</p>
            <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">${esc(app.id)} &middot; ${esc(app.termMonths)} months &middot; Submitted ${esc(app.submissionDate)}</p>
          </div>
          <div class="flex shrink-0 items-center gap-3">
            <span class="font-bold font-mono-numbers text-slate-900 dark:text-white">${formatCurrency(app.amount)}</span>
            <span class="rounded-full px-2.5 py-1 text-xs font-semibold ${badge(app.stage)}">${esc(app.stage)}</span>
          </div>
        </div>
        <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-label="Application progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Number(app.progressPercent) || 0}">
          <div class="h-full rounded-full bg-emerald-500" style="width:${Number(app.progressPercent) || 0}%"></div>
        </div>
      </div>`).join('');
  }

  function renderContracts() {
    const list = document.getElementById('contracts-list');
    if (!list) return;
    list.innerHTML = contracts.map((c) => {
      const paidPct = Math.round(((c.termMonths - c.remainingMonths) / c.termMonths) * 100);
      return `
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-semibold text-slate-900 dark:text-white">${esc(c.equipmentName)}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">${esc(c.id)} &middot; ${esc(c.contractType)}</p>
          </div>
          ${c.autopay ? '<span class="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">e-NACH</span>' : ''}
        </div>
        <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div><dt class="text-xs text-slate-500 dark:text-slate-400">EMI</dt><dd class="font-bold font-mono-numbers text-slate-900 dark:text-white">${formatCurrency(c.monthlyPayment)}</dd></div>
          <div><dt class="text-xs text-slate-500 dark:text-slate-400">Next due</dt><dd class="font-bold text-slate-900 dark:text-white">${esc(c.nextDueDate)}</dd></div>
          <div><dt class="text-xs text-slate-500 dark:text-slate-400">Outstanding</dt><dd class="font-bold font-mono-numbers text-slate-900 dark:text-white">${formatCurrency(c.currentBalance)}</dd></div>
          <div><dt class="text-xs text-slate-500 dark:text-slate-400">EMIs left</dt><dd class="font-bold text-slate-900 dark:text-white">${esc(c.remainingMonths)} of ${esc(c.termMonths)}</dd></div>
        </dl>
        <div class="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div class="h-full rounded-full bg-emerald-500" style="width:${paidPct}%"></div></div>
        <p class="mt-1.5 text-xs text-slate-500 dark:text-slate-400">${paidPct}% repaid</p>
      </div>`;
    }).join('');
  }

  function renderDocuments() {
    const list = document.getElementById('documents-list');
    if (!documents.length) {
      list.innerHTML = '<p class="p-5 text-sm text-slate-500 dark:text-slate-400">No documents uploaded yet.</p>';
      return;
    }
    list.innerHTML = documents.map((doc) => `
      <div class="flex items-center justify-between gap-3 p-4">
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-slate-900 dark:text-white">${esc(doc.name)}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">${esc(doc.uploadedAt)} &middot; ${esc(doc.fileSize)}</p>
        </div>
        <span class="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${doc.status === 'Verified' ? badge('Funded') : badge('Pending')}">${esc(doc.status)}</span>
      </div>`).join('');
  }

  // New application (validation.js blocks invalid submits before this runs)
  const form = document.getElementById('new-application-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('app-amount').value) || 0;
    const termMonths = parseInt(document.getElementById('app-term').value, 10) || 60;
    const app = {
      id: `APP-${Math.floor(8100 + Math.random() * 800)}`,
      title: document.getElementById('app-equipment').value.trim(),
      category: 'Equipment loan',
      amount,
      termMonths,
      submissionDate: 'Just now',
      stage: 'Submitted',
      progressPercent: 15,
    };
    applications = DataStore.addApplication(app);
    renderApplications();
    renderStats();
    form.reset();
    showToast(`Application ${app.id} submitted. Your advisor will call you shortly.`, 'success');
    document.getElementById('applications').scrollIntoView({ behavior: 'smooth' });
  });

  // Document upload (stored as metadata only)
  document.getElementById('doc-file-input').addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      documents = DataStore.addDocument({
        id: `DOC-${Date.now()}`,
        name: file.name,
        uploadedAt: 'Just now',
        fileSize: file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`,
        status: 'Under review',
      });
    });
    renderDocuments();
    renderStats();
    if (files.length) showToast(`${files.length} file${files.length > 1 ? 's' : ''} uploaded for review.`, 'success');
    e.target.value = '';
  });

  // Deep links: ?tab=new-app, ?tab=vault, ?from_quote=true
  const params = new URLSearchParams(window.location.search);
  if (params.get('from_quote') === 'true') {
    try {
      const q = JSON.parse(localStorage.getItem('apexvanguard_saved_quote'));
      if (q) {
        document.getElementById('app-amount').value = q.amount;
        const term = document.getElementById('app-term');
        if (term.querySelector(`option[value="${q.term}"]`)) term.value = q.term;
      }
    } catch (err) { /* ignore */ }
  }
  const tab = params.get('tab');
  if (tab === 'new-app' || params.get('from_quote')) document.getElementById('apply').scrollIntoView();
  else if (tab === 'vault') document.getElementById('documents').scrollIntoView();

  renderStats();
  renderApplications();
  renderContracts();
  renderDocuments();
});
