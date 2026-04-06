/* =============================================
   js/export.js
   — Excel (.xlsx) and PDF export functions
   ============================================= */

/** Toggle the export dropdown menu open/closed */
function toggleExportMenu() {
  document.getElementById('export-menu').classList.toggle('open');
}

/** Close the export dropdown */
function closeExportMenu() {
  document.getElementById('export-menu').classList.remove('open');
}

// Close dropdown when clicking anywhere outside it
document.addEventListener('click', e => {
  const btn  = document.getElementById('export-btn');
  const menu = document.getElementById('export-menu');
  if (!btn.contains(e.target) && !menu.contains(e.target)) closeExportMenu();
});

/* ── Excel export ──────────────────────────── */

/**
 * Exports all transactions + a monthly summary to an .xlsx file.
 * Uses the SheetJS (xlsx) library loaded via CDN.
 */
function exportExcel() {
  closeExportMenu();

  const wb = XLSX.utils.book_new();

  // --- Sheet 1: All Transactions ---
  const txRows = [['Date', 'Description', 'Category', 'Type', 'Amount (Rs)']];
  [...window._expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(e => {
      txRows.push([
        e.date,
        e.desc || e.category,
        e.category,
        e.type,
        e.type === 'expense' ? -e.amount : e.amount,
      ]);
    });

  const ws1 = XLSX.utils.aoa_to_sheet(txRows);
  ws1['!cols'] = [{ wch: 12 }, { wch: 28 }, { wch: 16 }, { wch: 10 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Transactions');

  // --- Sheet 2: Monthly Summary ---
  const me     = getMonthExpenses(window._expenses);
  const income = me.filter(e => e.type === 'income').reduce((a, b) => a + b.amount, 0);
  const spent  = me.filter(e => e.type === 'expense').reduce((a, b) => a + b.amount, 0);

  const sumRows = [
    ['Summary', new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })],
    [],
    ['Total Income',   income],
    ['Total Expenses', spent],
    ['Net Balance',    income - spent],
    [],
    ['Category', 'Spent (Rs)', 'Budget (Rs)', 'Status'],
  ];

  Object.entries(BUDGETS_DEF).forEach(([cat, budget]) => {
    const s = me.filter(e => e.type === 'expense' && e.category === cat)
                .reduce((a, b) => a + b.amount, 0);
    sumRows.push([cat, s, budget, s > budget ? 'Over Budget' : 'Within Budget']);
  });

  const ws2 = XLSX.utils.aoa_to_sheet(sumRows);
  ws2['!cols'] = [{ wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Monthly Summary');

  XLSX.writeFile(wb, `Xpnsr_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  showToast('📊 Excel downloaded!');
}

/* ── PDF export ────────────────────────────── */

/**
 * Generates a dark-styled A4 PDF report with:
 *  - Header bar with title + month
 *  - Summary stat boxes (income / spent / net)
 *  - Full transactions table (colour-coded amounts)
 *  - Budget summary table
 * Uses jsPDF + jsPDF-AutoTable loaded via CDN.
 */
function exportPDF() {
  closeExportMenu();

  const { jsPDF } = window.jspdf;
  const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W      = 210;
  const margin = 18;
  const now    = new Date();
  const monthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const me     = getMonthExpenses(window._expenses);
  const income = me.filter(e => e.type === 'income').reduce((a, b) => a + b.amount, 0);
  const spent  = me.filter(e => e.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const net    = income - spent;

  // --- Header bar ---
  doc.setFillColor(14, 14, 17);
  doc.rect(0, 0, W, 28, 'F');
  doc.setFontSize(18); doc.setFont('helvetica', 'bold'); doc.setTextColor(200, 255, 87);
  doc.text('Xpnsr', margin, 17);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(180, 180, 180);
  doc.text('Expense Report — ' + monthLabel, margin + 24, 17);
  doc.setTextColor(150, 150, 150); doc.setFontSize(8);
  doc.text('Generated ' + now.toLocaleDateString('en-IN'), W - margin, 17, { align: 'right' });

  let y = 38;

  // --- Stat boxes ---
  const boxes = [
    { label: 'Total Income', value: 'Rs ' + fmtNum(income), color: [200,255,87],  bg: [30,40,20]  },
    { label: 'Total Spent',  value: 'Rs ' + fmtNum(spent),  color: [255,107,107], bg: [40,20,20]  },
    { label: 'Net Balance',  value: 'Rs ' + fmtNum(net),    color: [87,200,255],  bg: [20,30,40]  },
  ];
  const bw = (W - margin * 2 - 8) / 3;
  boxes.forEach((b, i) => {
    const bx = margin + i * (bw + 4);
    doc.setFillColor(...b.bg); doc.roundedRect(bx, y, bw, 22, 3, 3, 'F');
    doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(150, 150, 150);
    doc.text(b.label.toUpperCase(), bx + 8, y + 8);
    doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(...b.color);
    doc.text(b.value, bx + 8, y + 17);
  });
  y += 30;

  // --- Transactions table ---
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(240, 240, 240);
  doc.text('Transactions', margin, y);
  y += 6;

  const txData = [...window._expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(e => [
      e.date,
      (e.desc || e.category).substring(0, 32),
      e.category,
      e.type.charAt(0).toUpperCase() + e.type.slice(1),
      (e.type === 'expense' ? '- ' : '+ ') + 'Rs ' + fmtNum(e.amount),
    ]);

  doc.autoTable({
    startY: y,
    head:   [['Date', 'Description', 'Category', 'Type', 'Amount']],
    body:   txData,
    theme:  'grid',
    styles: { fontSize: 8, font: 'helvetica', textColor: [220,220,220], fillColor: [24,24,29], lineColor: [50,50,60], lineWidth: 0.2, cellPadding: 3 },
    headStyles:           { fillColor: [30,30,40], textColor: [200,255,87], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles:   { fillColor: [28,28,35] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 58 },
      2: { cellWidth: 28 },
      3: { cellWidth: 20 },
      4: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
    didParseCell(data) {
      if (data.column.index === 4 && data.section === 'body') {
        const val = data.cell.raw || '';
        data.cell.styles.textColor = val.startsWith('-') ? [255,107,107] : [200,255,87];
      }
    },
  });

  let finalY = doc.lastAutoTable.finalY + 10;

  // --- Budget summary table ---
  if (finalY < 240) {
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(240, 240, 240);
    doc.text('Budget Summary', margin, finalY);
    finalY += 6;

    const budgetData = Object.entries(BUDGETS_DEF).map(([cat, budget]) => {
      const s   = me.filter(e => e.type === 'expense' && e.category === cat)
                    .reduce((a, b) => a + b.amount, 0);
      const pct = ((s / budget) * 100).toFixed(0) + '%';
      return [cat, 'Rs ' + fmtNum(s), 'Rs ' + fmtNum(budget), pct, s > budget ? 'Over' : 'OK'];
    });

    doc.autoTable({
      startY: finalY,
      head:   [['Category', 'Spent', 'Budget', 'Used', 'Status']],
      body:   budgetData,
      theme:  'grid',
      styles: { fontSize: 8, textColor: [220,220,220], fillColor: [24,24,29], lineColor: [50,50,60], lineWidth: 0.2, cellPadding: 3 },
      headStyles:          { fillColor: [30,30,40], textColor: [87,200,255], fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles:  { fillColor: [28,28,35] },
      columnStyles:        { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'center' }, 4: { halign: 'center', fontStyle: 'bold' } },
      margin: { left: margin, right: margin },
      didParseCell(data) {
        if (data.column.index === 4 && data.section === 'body') {
          data.cell.styles.textColor = data.cell.raw === 'Over' ? [255,107,107] : [200,255,87];
        }
      },
    });
  }

  // --- Footer ---
  const pages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFillColor(14, 14, 17); doc.rect(0, 285, W, 12, 'F');
    doc.setFontSize(7); doc.setTextColor(100, 100, 100); doc.setFont('helvetica', 'normal');
    doc.text('Xpnsr — Personal Finance Tracker', margin, 291);
    doc.text('Page ' + p + ' of ' + pages, W - margin, 291, { align: 'right' });
  }

  doc.save(`Xpnsr_Report_${now.toISOString().slice(0, 10)}.pdf`);
  showToast('📄 PDF downloaded!');
}
