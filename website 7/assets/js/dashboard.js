/**
 * ApexVanguard Capital - Client Dashboard Script
 * Handles: Application Tracker, New Loan Application Flow, Document Vault Upload, Contract Details, Messaging
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check if we are on dashboard page
  const dashboardRoot = document.getElementById('dashboard-app');
  if (!dashboardRoot) return;

  // Load state from DataStore
  const user = DataStore.getUser();
  let applications = DataStore.getApplications();
  let documents = DataStore.getDocuments();
  let contracts = DataStore.getContracts();
  let messages = DataStore.getMessages();

  // Populate User Info in Dashboard Header
  const userNameEl = document.getElementById('user-display-name');
  const userCompanyEl = document.getElementById('user-company-name');
  const userCreditBadgeEl = document.getElementById('user-credit-badge');
  const brokerNameEl = document.getElementById('broker-name');
  const brokerPhoneEl = document.getElementById('broker-phone');

  if (userNameEl) userNameEl.textContent = user.name;
  if (userCompanyEl) userCompanyEl.textContent = user.company;
  if (userCreditBadgeEl) userCreditBadgeEl.textContent = user.creditTier;
  if (brokerNameEl) brokerNameEl.textContent = user.accountOfficer.name;
  if (brokerPhoneEl) brokerPhoneEl.textContent = user.accountOfficer.directPhone;

  // Setup Tab Navigation
  const tabButtons = document.querySelectorAll('[data-dash-tab]');
  const tabPanes = document.querySelectorAll('.dash-tab-pane');

  function switchTab(tabId) {
    tabButtons.forEach(btn => {
      const active = btn.getAttribute('data-dash-tab') === tabId;
      if (active) {
        btn.classList.add('bg-slate-900', 'text-white', 'shadow-sm');
        btn.classList.remove('text-slate-600', 'hover:bg-slate-100');
      } else {
        btn.classList.remove('bg-slate-900', 'text-white', 'shadow-sm');
        btn.classList.add('text-slate-600', 'hover:bg-slate-100');
      }
    });

    tabPanes.forEach(pane => {
      if (pane.id === `tab-${tabId}`) {
        pane.classList.remove('hidden');
      } else {
        pane.classList.add('hidden');
      }
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-dash-tab');
      switchTab(targetTab);
    });
  });

  // Handle URL Query Params (e.g. ?tab=new-app&from_quote=true)
  const urlParams = new URLSearchParams(window.location.search);
  const requestedTab = urlParams.get('tab');
  if (requestedTab) {
    switchTab(requestedTab);
  }

  // Pre-fill from saved quote if present
  if (urlParams.get('from_quote') === 'true') {
    const rawQuote = localStorage.getItem('apexvanguard_saved_quote');
    if (rawQuote) {
      try {
        const q = JSON.parse(rawQuote);
        const appAmountInput = document.getElementById('app-amount');
        const appTypeSelect = document.getElementById('app-category');
        const appTermInput = document.getElementById('app-term');
        if (appAmountInput) appAmountInput.value = q.amount;
        if (appTypeSelect) appTypeSelect.value = 'Equipment Financing';
        if (appTermInput) appTermInput.value = q.term;
        showToast(`Loaded pre-calculated quote: $${q.amount.toLocaleString()} on ${q.term} mo term.`, 'success');
      } catch(e) {}
    }
  }

  // RENDER: Applications List & Tracker
  function renderApplications() {
    const container = document.getElementById('applications-list');
    if (!container) return;

    if (applications.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p class="text-slate-500 mb-4">No loan applications yet.</p>
          <button onclick="document.querySelector('[data-dash-tab=\\'new-app\\']').click()" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm">
            Start First Application
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    applications.forEach((app, idx) => {
      const isExpanded = idx === 0; // First application expanded by default
      const appCard = document.createElement('div');
      appCard.className = 'bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden mb-5';

      // Status pill color
      let badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
      if (app.stage === 'Funded' || app.stage === 'Approved') {
        badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      }

      appCard.innerHTML = `
        <div class="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <span class="text-xs font-mono font-semibold px-2.5 py-1 bg-slate-200 text-slate-800 rounded">${app.id}</span>
              <span class="text-xs font-medium px-2.5 py-1 rounded-full border ${badgeBg}">${app.statusBadge}</span>
              <span class="text-xs text-slate-500">Submitted: ${app.submissionDate}</span>
            </div>
            <h3 class="text-xl font-bold text-slate-900">${app.title}</h3>
            <p class="text-xs text-slate-500 mt-0.5">Dealer / Vendor: <span class="text-slate-800 font-medium">${app.vendorName || 'Direct Commercial Capital'}</span> &bull; Program: <span class="text-slate-800 font-medium">${app.category}</span></p>
          </div>
          <div class="flex items-center gap-6">
            <div class="text-right">
              <div class="text-xs text-slate-500 font-medium uppercase tracking-wider">Facility Amount</div>
              <div class="text-2xl font-extrabold text-slate-900 font-mono-numbers">$${app.amount.toLocaleString()}</div>
              <div class="text-xs text-emerald-600 font-semibold">${app.rateEstimate || 'Fixed APR'} &bull; ${app.termMonths} Months</div>
            </div>
          </div>
        </div>

        <div class="p-6">
          <!-- Multi-Step Progress Tracker Bar -->
          <div class="mb-6">
            <div class="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
              <span>Application Milestones (${app.progressPercent}% Completed)</span>
              <span class="text-emerald-600 font-bold">Estimated Closing: 24 - 48 Hours</span>
            </div>
            <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div class="bg-emerald-600 h-2.5 rounded-full transition-all duration-500" style="width: ${app.progressPercent}%"></div>
            </div>
            <div class="grid grid-cols-5 text-center text-xs mt-3 gap-1">
              <div class="font-medium ${app.stageIndex >= 1 ? 'text-emerald-700 font-bold' : 'text-slate-400'}">1. Submitted</div>
              <div class="font-medium ${app.stageIndex >= 2 ? 'text-emerald-700 font-bold' : 'text-slate-400'}">2. Docs Verified</div>
              <div class="font-medium ${app.stageIndex >= 3 ? 'text-emerald-700 font-bold' : 'text-slate-400'}">3. Underwriting</div>
              <div class="font-medium ${app.stageIndex >= 4 ? 'text-emerald-700 font-bold' : 'text-slate-400'}">4. Approved</div>
              <div class="font-medium ${app.stageIndex >= 5 ? 'text-emerald-700 font-bold' : 'text-slate-400'}">5. Funded</div>
            </div>
          </div>

          <!-- Timeline & Conditions Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <h4 class="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Real-Time Underwriting Timeline
              </h4>
              <div class="space-y-3 timeline-stem pl-2">
                ${(app.timeline || []).map(tl => `
                  <div class="flex items-start gap-3 relative z-10">
                    <div class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${tl.done ? 'bg-emerald-100 text-emerald-700 ring-4 ring-white' : 'bg-slate-100 text-slate-400 ring-4 ring-white'}">
                      ${tl.done 
                        ? `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>`
                        : `<span class="w-2 h-2 rounded-full bg-slate-400"></span>`}
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-slate-900">${tl.title}</span>
                        <span class="text-[10px] text-slate-400">${tl.date}</span>
                      </div>
                      <p class="text-xs text-slate-500 mt-0.5">${tl.desc}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div>
              <h4 class="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Underwriting Clearing Checklist
              </h4>
              <div class="space-y-2.5">
                ${(app.conditions && app.conditions.length > 0) ? app.conditions.map(c => `
                  <div class="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 text-xs">
                    <span class="font-medium text-slate-800">${c.item}</span>
                    <span class="px-2 py-0.5 rounded font-semibold text-[11px] ${c.status === 'Cleared' ? 'bg-emerald-100 text-emerald-800' : c.status === 'Action Required' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}">
                      ${c.status}
                    </span>
                  </div>
                `).join('') : `
                  <p class="text-xs text-slate-500">All preliminary lender conditions have been satisfied.</p>
                `}
              </div>

              <!-- Lender Syndication Matches -->
              ${(app.lenderMatches && app.lenderMatches.length > 0) ? `
                <div class="mt-4 pt-3 border-t border-slate-100">
                  <div class="text-xs font-bold text-slate-700 mb-2">Broker Matched Lenders:</div>
                  <div class="space-y-1.5">
                    ${app.lenderMatches.map(lm => `
                      <div class="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-50">
                        <span class="text-slate-700 font-medium">${lm.lender}</span>
                        <div class="flex items-center gap-2">
                          <span class="font-mono-numbers text-slate-900 font-semibold">${lm.apr}</span>
                          <span class="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded">${lm.status}</span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;

      container.appendChild(appCard);
    });
  }

  // RENDER: Documents Vault
  function renderDocuments() {
    const tableBody = document.getElementById('documents-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    documents.forEach(doc => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm';
      tr.innerHTML = `
        <td class="py-3 px-4 font-medium text-slate-900 flex items-center gap-2.5">
          <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
          <span class="truncate max-w-xs">${doc.name}</span>
        </td>
        <td class="py-3 px-4 text-slate-600 text-xs">${doc.category}</td>
        <td class="py-3 px-4 text-slate-500 text-xs">${doc.uploadedAt}</td>
        <td class="py-3 px-4 text-slate-500 text-xs font-mono-numbers">${doc.fileSize}</td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded text-xs font-semibold ${doc.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
            ${doc.status}
          </span>
        </td>
        <td class="py-3 px-4 text-right">
          <button onclick="showToast('Downloading verified copy of ${doc.name}...', 'success')" class="text-xs text-slate-600 hover:text-emerald-700 font-semibold p-1">
            Download
          </button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // RENDER: Active Equipment & Loan Contracts
  function renderContracts() {
    const container = document.getElementById('contracts-container');
    if (!container) return;

    container.innerHTML = '';
    contracts.forEach(contract => {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-xl border border-slate-200 p-6 shadow-sm';
      card.innerHTML = `
        <div class="flex items-start justify-between mb-4">
          <div>
            <span class="text-xs font-mono font-semibold text-slate-500 uppercase">${contract.id} &bull; ${contract.lender}</span>
            <h4 class="text-lg font-bold text-slate-900 mt-0.5">${contract.equipmentName}</h4>
            <p class="text-xs text-slate-500">${contract.contractType} (S/N: ${contract.equipmentSerial})</p>
          </div>
          <span class="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
            Active AutoPay
          </span>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-slate-100 my-4 bg-slate-50/50 rounded-lg px-4">
          <div>
            <div class="text-[11px] text-slate-500 font-medium">Monthly Installment</div>
            <div class="text-lg font-bold text-slate-900 font-mono-numbers">$${contract.monthlyPayment.toLocaleString()}</div>
          </div>
          <div>
            <div class="text-[11px] text-slate-500 font-medium">Principal Payoff Balance</div>
            <div class="text-lg font-bold text-slate-900 font-mono-numbers">$${contract.currentBalance.toLocaleString()}</div>
          </div>
          <div>
            <div class="text-[11px] text-slate-500 font-medium">Next Due Date</div>
            <div class="text-sm font-semibold text-slate-800 mt-1">${contract.nextDueDate}</div>
          </div>
          <div>
            <div class="text-[11px] text-slate-500 font-medium">Remaining Term</div>
            <div class="text-sm font-semibold text-slate-800 mt-1">${contract.remainingMonths} of ${contract.termMonths} Mo</div>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-500">Tax write-off schedule ready for CPA</span>
          <div class="flex gap-3">
            <button onclick="showToast('Requesting official lender payoff letter for ${contract.id}...', 'success')" class="text-slate-700 hover:text-slate-900 font-medium">
              Request Payoff Letter
            </button>
            <button onclick="showToast('Generating amortization statement...', 'success')" class="text-emerald-700 hover:text-emerald-800 font-bold">
              Download Statement
            </button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // RENDER: Broker Messaging
  function renderMessages() {
    const msgContainer = document.getElementById('chat-messages-container');
    if (!msgContainer) return;

    msgContainer.innerHTML = '';
    messages.forEach(m => {
      const bubble = document.createElement('div');
      bubble.className = `flex gap-3 max-w-xl ${m.isStaff ? 'self-start' : 'self-end flex-row-reverse'}`;
      bubble.innerHTML = `
        <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${m.isStaff ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white'}">
          ${m.avatar}
        </div>
        <div>
          <div class="flex items-center gap-2 mb-1 ${m.isStaff ? '' : 'justify-end'}">
            <span class="text-xs font-semibold text-slate-900">${m.sender}</span>
            <span class="text-[10px] text-slate-400">${m.time}</span>
          </div>
          <div class="p-3.5 rounded-2xl text-sm leading-relaxed ${m.isStaff ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm' : 'bg-slate-900 text-white rounded-tr-none'}">
            ${m.text}
          </div>
        </div>
      `;
      msgContainer.appendChild(bubble);
    });
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  // Handle New Message Send
  const chatForm = document.getElementById('chat-send-form');
  const chatInput = document.getElementById('chat-text-input');
  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      const newMsg = {
        id: Date.now(),
        sender: user.name,
        role: 'Client',
        time: 'Just now',
        avatar: 'JS',
        isStaff: false,
        text: text
      };

      messages = DataStore.addMessage(newMsg);
      renderMessages();
      chatInput.value = '';

      // Auto reply from Broker Marcus Reynolds after 1.5 seconds
      setTimeout(() => {
        const reply = {
          id: Date.now() + 1,
          sender: 'Marcus Reynolds',
          role: 'SVP Underwriting',
          time: 'Just now',
          avatar: 'MR',
          isStaff: true,
          text: `Thank you, John. I've noted this regarding your application. I am actively monitoring the funding window with the credit syndicate and will update you directly.`
        };
        messages = DataStore.addMessage(reply);
        renderMessages();
      }, 1500);
    });
  }

  // Handle Document Upload Drag & Drop and File Input
  const dropZone = document.getElementById('doc-drop-zone');
  const fileInput = document.getElementById('doc-file-input');
  const docCategorySelect = document.getElementById('doc-category-select');

  function handleFiles(files) {
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const category = docCategorySelect ? docCategorySelect.value : 'Bank Statements';
      const newDoc = {
        id: `DOC-${Math.floor(100 + Math.random() * 900)}`,
        name: file.name,
        category: category,
        uploadedAt: 'Today, Just now',
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        status: 'Under Review',
        statusColor: 'amber',
        associatedApp: 'APP-8042'
      };

      documents = DataStore.addDocument(newDoc);
    }
    renderDocuments();
    showToast(`Successfully uploaded ${files.length} document(s) to secure broker vault!`, 'success');
  }

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
      }, false);
    });

    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      handleFiles(files);
    });
  }

  // Handle New Application Form Submission
  const newAppForm = document.getElementById('new-application-form');
  if (newAppForm) {
    newAppForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = document.getElementById('app-equipment-name')?.value || 'Commercial Equipment Expansion';
      const category = document.getElementById('app-category')?.value || 'Heavy Equipment Financing';
      const amount = parseFloat(document.getElementById('app-amount')?.value) || 250000;
      const downPayment = parseFloat(document.getElementById('app-down')?.value) || 0;
      const termMonths = parseInt(document.getElementById('app-term')?.value, 10) || 60;
      const vendorName = document.getElementById('app-vendor')?.value || 'Commercial Equipment Dealer';

      const newId = `APP-${Math.floor(8100 + Math.random() * 800)}`;
      
      const newApp = {
        id: newId,
        title: title,
        category: category,
        amount: amount,
        downPayment: downPayment,
        termMonths: termMonths,
        rateEstimate: '6.49% Fixed (Syndicated)',
        estimatedMonthly: Math.round((amount - downPayment) / termMonths * 1.08),
        vendorName: vendorName,
        submissionDate: 'Just now',
        stage: 'Submitted',
        stageIndex: 1,
        progressPercent: 25,
        statusBadge: 'Underwriting Queue',
        statusColor: 'amber',
        lenderMatches: [
          { lender: 'KeyBank Commercial Credit', status: 'Submitted', apr: '6.49%', term: `${termMonths} Mo`, maxAmount: `$${amount.toLocaleString()}` }
        ],
        timeline: [
          { date: 'Today, Just now', title: 'Application Submitted', desc: 'Application received and assigned to Marcus Reynolds.', done: true },
          { date: 'Pending', title: 'Document Verification', desc: 'Financial desk verifying bank cash flows.', done: false }
        ],
        conditions: [
          { item: '6 Months Operating Bank Statements', status: 'Cleared', required: true },
          { item: 'Equipment Dealer Formal Quotation', status: 'Under Review', required: true }
        ]
      };

      applications = DataStore.addApplication(newApp);
      renderApplications();

      newAppForm.reset();
      showToast(`Application ${newId} created successfully! Our credit desk is reviewing.`, 'success');
      
      // Switch back to Applications tracker tab
      switchTab('tracker');
    });
  }

  // Initial renders
  renderApplications();
  renderDocuments();
  renderContracts();
  renderMessages();
});
