/* =============================================
   js/app.js
   — App bootstrap, state, UI event handlers
   ============================================= */

// ── App State ────────────────────────────────
window._expenses = loadExpenses();   // shared across all modules via window
let _filter      = 'all';            // 'all' | 'expense' | 'income'

// ── Initialise ───────────────────────────────
document.getElementById('date-label').textContent =
  new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

render(window._expenses, _filter);   // initial paint

// ── Filter tabs ──────────────────────────────

/**
 * Called by the three filter buttons (All / Expense / Income).
 * @param {string} f - new filter value
 * @param {HTMLElement} el - the clicked button element
 */
function setFilter(f, el) {
  _filter = f;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderList(window._expenses, _filter);
}

// ── Add transaction modal ────────────────────

/** Open the "New Transaction" modal and reset its fields */
function openModal() {
  document.getElementById('f-date').value   = new Date().toISOString().split('T')[0];
  document.getElementById('f-amount').value = '';
  document.getElementById('f-desc').value   = '';
  document.getElementById('modal').classList.add('open');
}

/** Close the modal */
function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

/** Close modal when clicking the dark overlay (but not the card itself) */
function closeModalOutside(e) {
  if (e.target.id === 'modal') closeModal();
}

/** Read the form, validate, persist, and re-render */
function saveExpense() {
  const amount = parseFloat(document.getElementById('f-amount').value);
  const desc   = document.getElementById('f-desc').value.trim();
  const cat    = document.getElementById('f-cat').value;
  const date   = document.getElementById('f-date').value;
  const type   = document.getElementById('f-type').value;

  if (!amount || !date) {
    showToast('Please fill in amount & date');
    return;
  }

  window._expenses.unshift({
    id:       Date.now(),
    amount,
    desc:     desc || cat,
    category: cat,
    date,
    type,
  });

  saveExpenses(window._expenses);
  closeModal();
  render(window._expenses, _filter);
  showToast(type === 'expense' ? '💸 Expense added!' : '💰 Income added!');
}

// ── Toast helper ─────────────────────────────

/**
 * Show a brief notification at the bottom-right of the screen.
 * @param {string} msg - message to display
 */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}
