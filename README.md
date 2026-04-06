# Xpnsr — Expense Tracker

A clean, dark-themed personal expense tracker that runs entirely in the browser.
No server, no build step, no npm install required.

## Features

- Add income & expense transactions with category, date, and description
- Live dashboard: income, total spent, daily average
- Donut chart breakdown by category
- Budget progress bars with colour-coded alerts
- Export to **Excel (.xlsx)** — two sheets: all transactions + monthly summary
- Export to **PDF** — dark-styled A4 report with budget table
- Data stored in browser `localStorage` (persists across sessions)

## Project Structure

```
xpnsr/
├── index.html          # Markup + script/link tags
├── css/
│   └── style.css       # All styles (CSS variables, layout, components)
├── js/
│   ├── data.js         # Constants, seed data, localStorage helpers, formatters
│   ├── render.js       # DOM rendering (stats, list, donut, budgets)
│   ├── export.js       # Excel + PDF export logic
│   └── app.js          # Bootstrap, state, event handlers (modal, filter, toast)
└── README.md
```

## Getting Started

### Run locally (no install)
Just open `index.html` in any modern browser:
```
# macOS
open index.html

# Windows
start index.html

# Linux
xdg-open index.html
```

> Requires an internet connection the first time to load Google Fonts and
> the three CDN libraries (SheetJS, jsPDF, jsPDF-AutoTable).

### Deploy for free
| Platform | Steps |
|---|---|
| **Netlify Drop** | Go to [app.netlify.com/drop](https://app.netlify.com/drop) → drag the whole `xpnsr/` folder |
| **GitHub Pages** | Push to a repo → Settings → Pages → Deploy from `main` branch |
| **Vercel** | `npx vercel` in the project folder, or drag-and-drop on vercel.com |

## Customising

### Change budget limits
Edit `BUDGETS_DEF` in `js/data.js`:
```js
const BUDGETS_DEF = {
  Food: 8000,        // ← change these values
  Transport: 3000,
  // ...
};
```

### Add a new category
1. Add an entry to `CATS` (colour) and `CAT_ICONS` (emoji) in `js/data.js`
2. Add an `<option>` in the `#f-cat` select inside `index.html`

### Change the currency symbol
Replace `₹` with your symbol in the `fmt()` function in `js/data.js`:
```js
function fmt(n) {
  return '$' + Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
}
```

## Libraries Used (CDN, no install needed)

| Library | Version | Purpose |
|---|---|---|
| [SheetJS (xlsx)](https://sheetjs.com) | 0.18.5 | Excel export |
| [jsPDF](https://github.com/parallax/jsPDF) | 2.5.1 | PDF generation |
| [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) | 3.8.2 | PDF tables |
| [Google Fonts](https://fonts.google.com) | — | Syne + DM Mono typefaces |

## License
MIT — do whatever you like with it.
