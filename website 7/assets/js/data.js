/**
 * ApexVanguard Capital - Mock Data & Local Storage Store
 * Equipment Financing & Business Loan Brokerage Engine
 */

const STORAGE_KEYS = {
  USER: 'apexvanguard_user',
  APPLICATIONS: 'apexvanguard_applications',
  DOCUMENTS: 'apexvanguard_documents',
  CONTRACTS: 'apexvanguard_contracts',
  MESSAGES: 'apexvanguard_messages',
  SAVED_QUOTES: 'apexvanguard_saved_quotes'
};

// Initial Default Mock State
const DEFAULT_USER = {
  id: 'usr_9841',
  name: 'John Sterling',
  title: 'Managing Director & Founder',
  company: 'Sterling Industrial Machining LLC',
  ein: 'XX-XXX4912',
  email: 'j.sterling@sterlingcnc.com',
  phone: '(415) 882-9304',
  establishedYear: 2017,
  annualRevenue: '₹38,50,000',
  creditTier: 'Tier 1 Prime (FICO 748)',
  accountOfficer: {
    name: 'Marcus Reynolds',
    title: 'Senior VP, Commercial Equipment Underwriting',
    directPhone: '(212) 550-9842',
    email: 'm.reynolds@apexvanguard.com',
    avatar: 'MR',
    status: 'Available Online'
  }
};

const DEFAULT_APPLICATIONS = [
  {
    id: 'APP-8042',
    title: '5-Axis CNC Precision Milling Center',
    category: 'Heavy Equipment Financing',
    amount: 385000,
    downPayment: 38500,
    termMonths: 60,
    rateEstimate: '6.45% Fixed',
    estimatedMonthly: 6712,
    vendorName: 'Haas Automation Inc. West Coast',
    submissionDate: 'Oct 12, 2026',
    stage: 'Underwriting Review', // 'Submitted' | 'Docs Verified' | 'Underwriting Review' | 'Approved' | 'Funded'
    stageIndex: 3, // 1 to 5
    progressPercent: 70,
    statusBadge: 'Under Review',
    statusColor: 'amber',
    lenderMatches: [
      { lender: 'KeyBank Commercial Credit', status: 'Offer Received', apr: '6.29%', term: '60 Mo', maxAmount: '₹4,00,000' },
      { lender: 'Stearns Bank Equipment Capital', status: 'In Review', apr: '6.50%', term: '60 Mo', maxAmount: '₹3,85,000' },
      { lender: 'First Western Equipment Credit', status: 'Approved', apr: '6.45%', term: '60 Mo', maxAmount: '₹3,85,000' }
    ],
    timeline: [
      { date: 'Oct 12, 09:14 AM', title: 'Application Submitted', desc: 'Application received via broker portal with initial financials.', done: true },
      { date: 'Oct 12, 11:30 AM', title: 'Documents Verified', desc: '6-Month commercial bank statements and corporate tax returns validated.', done: true },
      { date: 'Oct 13, 02:45 PM', title: 'Syndicated to Brokerage Credit Desk', desc: 'Application packaged with dealer quote and submitted to 3 Tier-1 equipment lenders.', done: true },
      { date: 'Oct 15, 10:20 AM', title: 'Senior Underwriting Review', desc: 'Debt-service coverage ratio (DSCR: 1.84x) cleared. Awaiting final dealer invoice confirmation.', done: true },
      { date: 'Estimated: Oct 18', title: 'Final Disbursement & Wire to Vendor', desc: 'Master lease agreement signed; direct funding wire dispatched to Haas Automation.', done: false }
    ],
    conditions: [
      { item: '6 Months Business Bank Statements', status: 'Cleared', required: true },
      { item: '2024 & 2025 Corporate Tax Returns (Form 1120-S)', status: 'Cleared', required: true },
      { item: 'Dealer Equipment Spec & Pro-Forma Invoice', status: 'Cleared', required: true },
      { item: 'Personal Guarantee / Driver License of Beneficial Owners', status: 'Action Required', required: true },
      { item: 'Certificate of Commercial Insurance (Listing Lender as Loss Payee)', status: 'Pending Underwriter Sign-off', required: true }
    ]
  },
  {
    id: 'APP-7619',
    title: 'Fleet Expansion: 2x Freightliner Cascadia Sleeper Trucks',
    category: 'Commercial Transportation',
    amount: 290000,
    downPayment: 29000,
    termMonths: 48,
    rateEstimate: '7.15% Fixed',
    estimatedMonthly: 6280,
    vendorName: 'Penske Commercial Truck Sales',
    submissionDate: 'Sep 04, 2026',
    stage: 'Funded',
    stageIndex: 5,
    progressPercent: 100,
    statusBadge: 'Funded & Active',
    statusColor: 'emerald',
    lenderMatches: [
      { lender: 'BMO Commercial Fleet Capital', status: 'Funded', apr: '7.15%', term: '48 Mo', maxAmount: '₹2,90,000' }
    ],
    timeline: [
      { date: 'Sep 04, 2026', title: 'Application Processed', desc: 'Fleet expansion application approved within 4 hours.', done: true },
      { date: 'Sep 05, 2026', title: 'Vendor Direct Funding Dispatched', desc: 'Full wire of ₹2,61,000 net disbursed directly to Penske Truck Sales.', done: true }
    ],
    conditions: []
  }
];

const DEFAULT_DOCUMENTS = [
  {
    id: 'DOC-101',
    name: 'Chase_Business_Operating_Statements_6Mo.pdf',
    category: 'Bank Statements',
    uploadedAt: 'Oct 12, 2026',
    fileSize: '4.8 MB',
    status: 'Verified',
    statusColor: 'emerald',
    associatedApp: 'APP-8042'
  },
  {
    id: 'DOC-102',
    name: 'Sterling_Machining_2024_2025_Tax_Returns_1120S.pdf',
    category: 'Tax Documents',
    uploadedAt: 'Oct 12, 2026',
    fileSize: '8.2 MB',
    status: 'Verified',
    statusColor: 'emerald',
    associatedApp: 'APP-8042'
  },
  {
    id: 'DOC-103',
    name: 'Haas_VF4_ProForma_Dealer_Invoice_Quote.pdf',
    category: 'Equipment Invoice',
    uploadedAt: 'Oct 13, 2026',
    fileSize: '1.4 MB',
    status: 'Verified',
    statusColor: 'emerald',
    associatedApp: 'APP-8042'
  },
  {
    id: 'DOC-104',
    name: 'Commercial_Liability_Insurance_COI.pdf',
    category: 'Insurance Certificate',
    uploadedAt: 'Oct 15, 2026',
    fileSize: '850 KB',
    status: 'Under Review',
    statusColor: 'amber',
    associatedApp: 'APP-8042'
  }
];

const DEFAULT_CONTRACTS = [
  {
    id: 'LN-5521',
    equipmentName: 'Caterpillar 320 Hydraulic Excavator',
    contractType: 'Equipment Finance Agreement (₹1 Buyout)',
    originalAmount: 220000,
    currentBalance: 142800,
    termMonths: 60,
    remainingMonths: 38,
    monthlyPayment: 4210,
    nextDueDate: 'Nov 01, 2026',
    autopay: true,
    lender: 'First Western Equipment Credit',
    equipmentSerial: 'CAT0320V-X89234'
  },
  {
    id: 'LN-4890',
    equipmentName: 'Doosan Puma 2600SY CNC Lathe',
    contractType: 'Fair Market Value Commercial Lease',
    originalAmount: 165000,
    currentBalance: 59400,
    termMonths: 48,
    remainingMonths: 16,
    monthlyPayment: 3620,
    nextDueDate: 'Nov 05, 2026',
    autopay: true,
    lender: 'KeyBank Commercial Credit',
    equipmentSerial: 'DN-PUMA-9812-US'
  }
];

const DEFAULT_MESSAGES = [
  {
    id: 1,
    sender: 'Marcus Reynolds',
    role: 'SVP Underwriting',
    time: 'Oct 15, 10:35 AM',
    avatar: 'MR',
    isStaff: true,
    text: 'Good morning John! I reviewed your 5-Axis CNC submission. First Western gave us a preliminary approval at 6.45% on 60 months with ₹0 down. Before final closing doc generation, please upload the Commercial Insurance COI naming them as loss payee.'
  },
  {
    id: 2,
    sender: 'John Sterling',
    role: 'Client',
    time: 'Oct 15, 11:15 AM',
    avatar: 'JS',
    isStaff: false,
    text: 'Thanks Marcus! I just uploaded the updated Certificate of Insurance through the document vault. Please let me know once Haas receives the funding confirmation so they can schedule technician delivery.'
  },
  {
    id: 3,
    sender: 'Marcus Reynolds',
    role: 'SVP Underwriting',
    time: 'Oct 15, 11:22 AM',
    avatar: 'MR',
    isStaff: true,
    text: 'Received! Underwriting is completing the final audit. We expect loan docs for electronic signature by tomorrow afternoon.'
  }
];

// Helper Storage Controller
const DataStore = {
  getUser() {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    try { return JSON.parse(raw); } catch(e) { return DEFAULT_USER; }
  },

  setUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getApplications() {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(DEFAULT_APPLICATIONS));
      return DEFAULT_APPLICATIONS;
    }
    try { return JSON.parse(raw); } catch(e) { return DEFAULT_APPLICATIONS; }
  },

  addApplication(app) {
    const apps = this.getApplications();
    apps.unshift(app);
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
    return apps;
  },

  getDocuments() {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(DEFAULT_DOCUMENTS));
      return DEFAULT_DOCUMENTS;
    }
    try { return JSON.parse(raw); } catch(e) { return DEFAULT_DOCUMENTS; }
  },

  addDocument(doc) {
    const docs = this.getDocuments();
    docs.unshift(doc);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    return docs;
  },

  getContracts() {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(DEFAULT_CONTRACTS));
      return DEFAULT_CONTRACTS;
    }
    try { return JSON.parse(raw); } catch(e) { return DEFAULT_CONTRACTS; }
  },

  getMessages() {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(DEFAULT_MESSAGES));
      return DEFAULT_MESSAGES;
    }
    try { return JSON.parse(raw); } catch(e) { return DEFAULT_MESSAGES; }
  },

  addMessage(msg) {
    const msgs = this.getMessages();
    msgs.push(msg);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(msgs));
    return msgs;
  },

  resetDefaults() {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(DEFAULT_APPLICATIONS));
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(DEFAULT_DOCUMENTS));
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(DEFAULT_CONTRACTS));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(DEFAULT_MESSAGES));
  }
};
