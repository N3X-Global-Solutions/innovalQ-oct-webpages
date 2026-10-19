/**
 * ApexVanguard Capital - dummy data for the client portal (UI only, no backend).
 * Stored in localStorage so new applications and uploads persist in the browser.
 */

const STORAGE_KEYS = {
  USER: 'apexvanguard_v3_user',
  APPLICATIONS: 'apexvanguard_v2_applications',
  DOCUMENTS: 'apexvanguard_v2_documents',
  CONTRACTS: 'apexvanguard_v2_contracts',
};

const DEFAULT_USER = {
  id: 'usr_9841',
  name: 'Rohan Mehta',
  title: 'Managing Director',
  company: 'Mehta Precision Engineering Pvt. Ltd., Pune',
  email: 'rohan@mehtaprecision.in',
  creditTier: 'Prime (CIBIL 781)',
  accountOfficer: {
    name: 'Vikas Menon',
    title: 'Senior Relationship Manager',
    phone: '+91 22 4890 2214',
    email: 'vikas.menon@apexvanguard.in',
  },
};

const DEFAULT_APPLICATIONS = [
  { id: 'APP-8042', title: '5-axis CNC vertical machining centre', category: 'Equipment loan', amount: 3850000, termMonths: 60,
    rate: '9.9% fixed', lender: 'Private sector bank', submissionDate: '12 Oct 2026', stage: 'Underwriting review', progressPercent: 70 },
  { id: 'APP-7619', title: 'Fleet expansion: 2 Tata Signa tippers', category: 'Commercial vehicle loan', amount: 4600000, termMonths: 48,
    rate: '10.4% fixed', lender: 'NBFC', submissionDate: '4 Sep 2026', stage: 'Funded', progressPercent: 100 },
  { id: 'APP-7350', title: 'Working capital line for steel inventory', category: 'Working capital', amount: 1500000, termMonths: 12,
    rate: '12.5% floating', lender: 'Small finance bank', submissionDate: '19 Aug 2026', stage: 'Approved', progressPercent: 90 },
];

const DEFAULT_DOCUMENTS = [
  { id: 'DOC-101', name: 'HDFC_Current_Account_Statements_Apr-Sep_2026.pdf', uploadedAt: '12 Oct 2026', fileSize: '4.8 MB', status: 'Verified' },
  { id: 'DOC-102', name: 'ITR_and_Audited_Financials_FY2024-25_FY2025-26.pdf', uploadedAt: '12 Oct 2026', fileSize: '8.2 MB', status: 'Verified' },
  { id: 'DOC-103', name: 'Dealer_Proforma_Invoice_VMC_850.pdf', uploadedAt: '13 Oct 2026', fileSize: '1.4 MB', status: 'Verified' },
  { id: 'DOC-104', name: 'GSTR-3B_Returns_12_Months.pdf', uploadedAt: '15 Oct 2026', fileSize: '850 KB', status: 'Under review' },
];

const DEFAULT_CONTRACTS = [
  { id: 'LN-5521', equipmentName: 'JCB 3DX backhoe loader', contractType: 'Equipment loan', originalAmount: 3200000, currentBalance: 2078000,
    termMonths: 60, remainingMonths: 38, monthlyPayment: 68200, nextDueDate: '5 Nov 2026', autopay: true },
  { id: 'LN-4890', equipmentName: 'CNC turning centre', contractType: 'Operating lease', originalAmount: 1650000, currentBalance: 594000,
    termMonths: 48, remainingMonths: 16, monthlyPayment: 39400, nextDueDate: '10 Nov 2026', autopay: true },
];

function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return JSON.parse(JSON.stringify(fallback));
    }
    return JSON.parse(raw);
  } catch (e) {
    return JSON.parse(JSON.stringify(fallback));
  }
}

function writeStore(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage blocked: keep in memory only */ }
}

const DataStore = {
  getUser() { return readStore(STORAGE_KEYS.USER, DEFAULT_USER); },
  setUser(user) { writeStore(STORAGE_KEYS.USER, user); },
  getApplications() { return readStore(STORAGE_KEYS.APPLICATIONS, DEFAULT_APPLICATIONS); },
  addApplication(app) {
    const apps = this.getApplications();
    apps.unshift(app);
    writeStore(STORAGE_KEYS.APPLICATIONS, apps);
    return apps;
  },
  getDocuments() { return readStore(STORAGE_KEYS.DOCUMENTS, DEFAULT_DOCUMENTS); },
  addDocument(doc) {
    const docs = this.getDocuments();
    docs.unshift(doc);
    writeStore(STORAGE_KEYS.DOCUMENTS, docs);
    return docs;
  },
  getContracts() { return readStore(STORAGE_KEYS.CONTRACTS, DEFAULT_CONTRACTS); },
  resetDefaults() {
    writeStore(STORAGE_KEYS.USER, DEFAULT_USER);
    writeStore(STORAGE_KEYS.APPLICATIONS, DEFAULT_APPLICATIONS);
    writeStore(STORAGE_KEYS.DOCUMENTS, DEFAULT_DOCUMENTS);
    writeStore(STORAGE_KEYS.CONTRACTS, DEFAULT_CONTRACTS);
  },
};
