/* =============================================
   js/data.js
   — Constants, seed data, localStorage helpers
   ============================================= */

/** Category metadata: color for donut/icons */
const CATS = {
  Food:          { color: '#ff6b6b' },
  Transport:     { color: '#57c8ff' },
  Shopping:      { color: '#c084fc' },
  Health:        { color: '#34d399' },
  Utilities:     { color: '#fbbf24' },
  Entertainment: { color: '#f472b6' },
  Salary:        { color: '#c8ff57' },
  Other:         { color: '#94a3b8' },
};

/** Emoji icons per category */
const CAT_ICONS = {
  Food: '🍜', Transport: '🚌', Shopping: '🛍️',
  Health: '💊', Utilities: '⚡', Entertainment: '🎮',
  Salary: '💼', Other: '📦',
};

/** Monthly budget limits (₹) per category */
const BUDGETS_DEF = {
  Food: 8000, Transport: 3000, Shopping: 5000,
  Health: 2000, Utilities: 2500, Entertainment: 3000,
};

/** Seed transactions used on first load */
function getSeedData() {
  const now = new Date();
  const m = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  return [
    { id: 1,  amount: 45000, desc: 'Monthly Salary',    category: 'Salary',        date: m+'-01', type: 'income'  },
    { id: 2,  amount: 2400,  desc: 'Grocery Run',       category: 'Food',          date: m+'-03', type: 'expense' },
    { id: 3,  amount: 850,   desc: 'Metro Card',        category: 'Transport',     date: m+'-04', type: 'expense' },
    { id: 4,  amount: 3200,  desc: 'New Shoes',         category: 'Shopping',      date: m+'-06', type: 'expense' },
    { id: 5,  amount: 1800,  desc: 'Electricity Bill',  category: 'Utilities',     date: m+'-08', type: 'expense' },
    { id: 6,  amount: 600,   desc: 'Lunch with team',   category: 'Food',          date: m+'-10', type: 'expense' },
    { id: 7,  amount: 999,   desc: 'Netflix + Prime',   category: 'Entertainment', date: m+'-11', type: 'expense' },
    { id: 8,  amount: 2100,  desc: 'Doctor Visit',      category: 'Health',        date: m+'-13', type: 'expense' },
    { id: 9,  amount: 1200,  desc: 'Auto & Uber',       category: 'Transport',     date: m+'-15', type: 'expense' },
    { id: 10, amount: 5000,  desc: 'Freelance Project', category: 'Salary',        date: m+'-16', type: 'income'  },
    { id: 11, amount: 3400,  desc: 'Zara Kurti',        category: 'Shopping',      date: m+'-18', type: 'expense' },
    { id: 12, amount: 450,   desc: 'Dinner Out',        category: 'Food',          date: m+'-20', type: 'expense' },
  ];
}

// ── Storage helpers ─────────────────────────

/** Load expenses from localStorage (seeds on first run) */
function loadExpenses() {
  const raw = localStorage.getItem('xpnsr_expenses');
  if (raw) return JSON.parse(raw);
  const seed = getSeedData();
  saveExpenses(seed);
  return seed;
}

/** Persist expenses array to localStorage */
function saveExpenses(arr) {
  localStorage.setItem('xpnsr_expenses', JSON.stringify(arr));
}

// ── Formatting helpers ──────────────────────

/** Format a number as Indian currency string e.g. ₹1,23,456 */
function fmt(n) {
  return '₹' + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

/** Same as fmt() but without the ₹ symbol — used in PDF/Excel */
function fmtNum(n) {
  return Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

/** Return only the transactions from the current calendar month */
function getMonthExpenses(expenses) {
  const now = new Date();
  return expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
}
