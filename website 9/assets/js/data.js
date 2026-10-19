// Hisaab shared data: demo client, monthly numbers, statements, messages and pricing.

const CLIENT = {
  name: 'Kavya Rao',
  company: 'Brew Theory Cafés',
  email: 'kavya@brewtheory.in',
  team: [
    { name: 'Rohan Das', role: 'Your Bookkeeper' },
    { name: 'Anita Menon', role: 'Your Fractional CFO' }
  ]
};

// Last 12 months, amounts in ₹
const MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
const REVENUE = [1820000, 2140000, 1960000, 1880000, 2210000, 2290000, 2410000, 2180000, 2350000, 2520000, 2470000, 2690000];
const EXPENSES = [1610000, 1790000, 1720000, 1690000, 1840000, 1900000, 1960000, 1880000, 1930000, 2010000, 2050000, 2120000];
const CASH_BALANCE = [940000, 1010000, 980000, 960000, 1070000, 1160000, 1290000, 1250000, 1340000, 1480000, 1530000, 1690000];

// Where October's money went
const EXPENSE_SPLIT = [
  { label: 'Staff salaries', amount: 820000 },
  { label: 'Raw materials', amount: 610000 },
  { label: 'Rent', amount: 360000 },
  { label: 'Marketing', amount: 140000 },
  { label: 'Utilities', amount: 110000 },
  { label: 'Other', amount: 80000 }
];

const STATEMENTS = [
  { month: 'October 2026', status: 'In progress', ready: '7 Nov 2026', files: [] },
  { month: 'September 2026', status: 'Ready', ready: '6 Oct 2026', files: ['Profit & Loss', 'Balance Sheet', 'Cash Flow', 'GST Summary'] },
  { month: 'August 2026', status: 'Ready', ready: '5 Sep 2026', files: ['Profit & Loss', 'Balance Sheet', 'Cash Flow', 'GST Summary'] },
  { month: 'July 2026', status: 'Ready', ready: '6 Aug 2026', files: ['Profit & Loss', 'Balance Sheet', 'Cash Flow', 'GST Summary'] },
  { month: 'June 2026', status: 'Ready', ready: '7 Jul 2026', files: ['Profit & Loss', 'Balance Sheet', 'Cash Flow'] }
];

const MESSAGES = [
  { from: 'Rohan Das', mine: false, time: 'Mon, 10:12 AM', text: 'Hi Kavya! Could you upload the Swiggy payout report for October? Then I can close the month.' },
  { from: 'Kavya Rao', mine: true, time: 'Mon, 11:40 AM', text: 'Done, uploaded just now. Also, can we talk about opening the 4th outlet?' },
  { from: 'Anita Menon', mine: false, time: 'Mon, 2:05 PM', text: 'Great timing. You have been profitable every month this year and cash is up to ₹16.9 L. I will share a break-even model for the new outlet before our Thursday call.' }
];

const PLANS = [
  { name: 'Starter', price: 6999, for: 'Freelancers & new businesses', features: ['Monthly bookkeeping', 'Up to 150 transactions', 'Monthly P&L + Balance Sheet', 'GST filing support', 'Email support'] },
  { name: 'Growth', price: 14999, for: 'Growing small businesses', popular: true, features: ['Everything in Starter', 'Up to 600 transactions', 'Cash flow dashboard', 'Dedicated bookkeeper', 'Quarterly review call'] },
  { name: 'CFO Plus', price: 39999, for: 'Businesses raising or scaling', features: ['Everything in Growth', 'Fractional CFO (8 hrs/month)', 'Budgets & forecasts', 'Investor & bank reports', 'Monthly strategy meeting'] }
];

function formatINR(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}
function formatShort(n) {
  if (Math.abs(n) >= 1e7) return `₹${+(n / 1e7).toFixed(2)} Cr`;
  if (Math.abs(n) >= 1e5) return `₹${+(n / 1e5).toFixed(1)} L`;
  return formatINR(n);
}
function initials(name) {
  return name.split(' ').map(p => p[0]).join('');
}
function escapeHTML(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}
