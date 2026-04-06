/* =============================================
   js/render.js
   — All DOM rendering functions
   ============================================= */

/** Update the three stat cards and sidebar balance */
function renderStats(expenses) {
  const me      = getMonthExpenses(expenses);
  const income  = me.filter(e => e.type === 'income').reduce((a, b) => a + b.amount, 0);
  const spent   = me.filter(e => e.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const days    = new Date().getDate();

  document.getElementById('stat-income').textContent       = fmt(income);
  document.getElementById('stat-spent').textContent        = fmt(spent);
  document.getElementById('stat-avg').textContent          = fmt(spent / days);
  document.getElementById('stat-income-count').textContent = me.filter(e => e.type === 'income').length  + ' transactions';
  document.getElementById('stat-spent-count').textContent  = me.filter(e => e.type === 'expense').length + ' transactions';
  document.getElementById('sidebar-balance').textContent   = fmt(income - spent);
}

/** Render the scrollable transaction list, respecting the active filter */
function renderList(expenses, filter) {
  const list = document.getElementById('expense-list');
  let items = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filter !== 'all') items = items.filter(e => e.type === filter);

  if (!items.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div style="font-size:32px;margin-bottom:12px;opacity:.4">◈</div>
        No transactions yet. Add your first one!
      </div>`;
    return;
  }

  list.innerHTML = items.slice(0, 12).map(e => {
    const cat     = CATS[e.category] || CATS.Other;
    const icon    = CAT_ICONS[e.category] || '📦';
    const dateStr = new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const sign    = e.type === 'expense' ? '-' : '+';

    return `
      <div class="expense-item">
        <div class="cat-icon" style="background:${cat.color}22;">${icon}</div>
        <div class="expense-info">
          <div class="expense-name">${e.desc || e.category}</div>
          <div class="expense-meta">
            <span>${dateStr}</span>
            <span class="tag-pill">${e.category}</span>
          </div>
        </div>
        <div class="expense-amount ${e.type}">${sign}${fmt(e.amount)}</div>
      </div>`;
  }).join('');
}

/** Render the SVG donut chart and its legend */
function renderDonut(expenses) {
  const me     = getMonthExpenses(expenses).filter(e => e.type === 'expense');
  const totals = {};
  me.forEach(e => { totals[e.category] = (totals[e.category] || 0) + e.amount; });

  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const total  = sorted.reduce((a, b) => a + b[1], 0);

  if (!total) {
    document.getElementById('donut-svg').innerHTML =
      `<circle cx="60" cy="60" r="40" fill="none" stroke="#212128" stroke-width="18"/>`;
    document.getElementById('donut-legend').innerHTML =
      `<div style="color:var(--muted);font-size:12px;text-align:center">No data</div>`;
    return;
  }

  let angle = -90, paths = '', legend = '';

  sorted.forEach(([cat, val]) => {
    const pct  = val / total;
    const a1   = (angle * Math.PI) / 180;
    const a2   = ((angle + pct * 360) * Math.PI) / 180;
    const r = 40, cx = 60, cy = 60;
    const x1   = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2   = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const large = pct > 0.5 ? 1 : 0;
    const color = CATS[cat]?.color || '#888';

    paths  += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z" fill="${color}" opacity="0.85"/>`;
    legend += `
      <div class="legend-row">
        <div class="legend-left">
          <div class="legend-dot" style="background:${color}"></div>${cat}
        </div>
        <div style="font-family:var(--mono);font-size:11px;">${(pct * 100).toFixed(0)}%</div>
      </div>`;
    angle += pct * 360;
  });

  // Donut hole
  paths += `<circle cx="60" cy="60" r="24" fill="#18181d"/>`;

  document.getElementById('donut-svg').innerHTML    = paths;
  document.getElementById('donut-legend').innerHTML = legend;
}

/** Render the budget progress bars */
function renderBudgets(expenses) {
  const me     = getMonthExpenses(expenses).filter(e => e.type === 'expense');
  const totals = {};
  me.forEach(e => { totals[e.category] = (totals[e.category] || 0) + e.amount; });

  document.getElementById('budget-list').innerHTML = Object.keys(BUDGETS_DEF).map(cat => {
    const spent  = totals[cat] || 0;
    const budget = BUDGETS_DEF[cat];
    const pct    = Math.min((spent / budget) * 100, 100);
    const color  = pct > 90 ? 'var(--accent2)' : pct > 70 ? '#fbbf24' : 'var(--accent)';
    const icon   = CAT_ICONS[cat] || '•';

    return `
      <div class="budget-item">
        <div class="budget-header">
          <div class="budget-name"><span>${icon}</span>${cat}</div>
          <div class="budget-amounts">${fmt(spent)} / ${fmt(budget)}</div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct}%;background:${color}"></div>
        </div>
      </div>`;
  }).join('');
}

/** Master render — calls all four sub-renders */
function render(expenses, filter) {
  renderStats(expenses);
  renderList(expenses, filter);
  renderDonut(expenses);
  renderBudgets(expenses);
}
