// Kavach shared data: photos, insurers, client policies, quotes, claims and documents.

const photo = (id, w = 1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

// Only these photo IDs are used across the site
const PHOTOS = {
  offices: 'photo-1486406146926-c627a92ad1ab',
  officeInterior: 'photo-1497366216548-37526070297c',
  warehouse: 'photo-1553413077-190dd305871c',
  construction: 'photo-1504307651254-35680f356dfd',
  city: 'photo-1449157291145-7efd050a4d0e'
};

// Fictional insurer partners
const INSURERS = ['Suraksha General', 'Bharat Shield Insurance', 'Sahyadri Assurance', 'Tricolor General', 'Ganga Mutual'];

// Demo client
const CLIENT = {
  name: 'Ravi Shankar',
  company: 'Shankar Textiles Pvt. Ltd.',
  email: 'ravi@shankartextiles.in',
  advisor: { name: 'Neha Joshi', phone: '+91 98200 45678', email: 'neha@kavach.in' }
};

const POLICIES = [
  { id: 'POL-24018', type: 'Fire & Property', insurer: 'Suraksha General', asset: 'Factory, Bhiwandi', sumInsured: 85000000, premium: 142000, start: '2026-04-01', end: '2027-03-31', status: 'Active' },
  { id: 'POL-24019', type: 'Public Liability', insurer: 'Bharat Shield Insurance', asset: 'All premises', sumInsured: 20000000, premium: 38500, start: '2026-04-01', end: '2027-03-31', status: 'Active' },
  { id: 'POL-23077', type: 'Burglary & Theft', insurer: 'Sahyadri Assurance', asset: 'Warehouse, Thane', sumInsured: 15000000, premium: 21000, start: '2025-11-15', end: '2026-11-14', status: 'Renewal due' }
];

// Quotes for a new Business Interruption cover, to compare side by side
const QUOTES = [
  { insurer: 'Suraksha General', premium: 64000, sumInsured: 30000000, deductible: 100000, claimRatio: 94, extras: ['Loss of rent', '6-month indemnity'] },
  { insurer: 'Tricolor General', premium: 58500, sumInsured: 30000000, deductible: 150000, claimRatio: 91, extras: ['3-month indemnity'] },
  { insurer: 'Ganga Mutual', premium: 71200, sumInsured: 30000000, deductible: 75000, claimRatio: 96, extras: ['Loss of rent', '12-month indemnity', 'Supplier cover'] }
];

const CLAIMS = [
  { id: 'CLM-1102', policyId: 'POL-24018', title: 'Water damage to finished stock', filed: '2026-09-12', amount: 1250000, status: 'Under survey', step: 2 },
  { id: 'CLM-0987', policyId: 'POL-23077', title: 'Stolen copper wiring', filed: '2026-05-03', amount: 340000, status: 'Settled', step: 4, settled: 310000 }
];
// Claim steps, in order. `step` above is the index of the current one.
const CLAIM_STEPS = ['Reported', 'Documents received', 'Under survey', 'Approved', 'Settled'];

const DOCUMENTS = [
  { name: 'Fire & Property Policy Schedule 2026-27.pdf', policyId: 'POL-24018', size: '1.2 MB', date: '2026-04-01' },
  { name: 'Public Liability Certificate.pdf', policyId: 'POL-24019', size: '640 KB', date: '2026-04-01' },
  { name: 'Burglary Policy Wording.pdf', policyId: 'POL-23077', size: '980 KB', date: '2025-11-15' },
  { name: 'Claim CLM-0987 Settlement Letter.pdf', policyId: 'POL-23077', size: '210 KB', date: '2026-06-20' }
];

// ₹ formatting: full Indian grouping, or short lakh/crore
function formatINR(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}
function formatShort(n) {
  if (n >= 1e7) return `₹${+(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${+(n / 1e5).toFixed(2)} L`;
  return formatINR(n);
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function initials(name) {
  return name.split(' ').map(p => p[0]).join('');
}

// Mobile menu toggle shared by every page
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (btn && menu) btn.addEventListener('click', () => menu.classList.toggle('hidden'));
});
