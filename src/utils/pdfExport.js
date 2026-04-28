/**
 * generatePDF — opens a styled print window that saves as PDF.
 * @param {string} title   — document title shown in header
 * @param {string} html    — inner HTML content to print
 * @param {string} subtitle — optional subtitle / date range
 */
export function generatePDF(title, html, subtitle = '') {
  const now = new Date().toLocaleString()
  const win = window.open('', '_blank', 'width=900,height=700')
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 13px;
      color: #1a202c;
      background: #fff;
      padding: 32px 40px;
    }
    .pdf-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #00b860;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .pdf-logo { font-size: 1.3rem; font-weight: 800; color: #1a202c; }
    .pdf-logo span { color: #00b860; }
    .pdf-title { font-size: 1.4rem; font-weight: 700; color: #1a202c; margin-bottom: 4px; }
    .pdf-subtitle { font-size: .85rem; color: #4a5568; }
    .pdf-meta { text-align: right; font-size: .78rem; color: #718096; }
    .section { margin-bottom: 28px; }
    .section-title {
      font-size: 1rem; font-weight: 700; color: #1a202c;
      border-left: 3px solid #00b860; padding-left: 10px;
      margin-bottom: 14px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }
    .kpi-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 16px;
      background: #f7fafc;
    }
    .kpi-val  { font-size: 1.6rem; font-weight: 800; color: #1a202c; }
    .kpi-label{ font-size: .75rem; color: #718096; margin-top: 4px; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: .82rem;
      margin-bottom: 16px;
    }
    thead tr { background: #f0fdf4; }
    th {
      padding: 9px 12px;
      text-align: left;
      font-weight: 700;
      color: #2d3748;
      border-bottom: 2px solid #00b860;
      white-space: nowrap;
    }
    td {
      padding: 9px 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #4a5568;
      vertical-align: top;
    }
    tr:last-child td { border-bottom: none; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: .72rem;
      font-weight: 700;
    }
    .badge-green  { background: #d1fae5; color: #065f46; }
    .badge-red    { background: #fee2e2; color: #991b1b; }
    .badge-yellow { background: #fef3c7; color: #92400e; }
    .badge-blue   { background: #dbeafe; color: #1e40af; }
    .bar-wrap { background: #e2e8f0; border-radius: 4px; height: 8px; overflow: hidden; margin-top: 4px; }
    .bar-fill { height: 100%; background: #00b860; border-radius: 4px; }
    .pdf-footer {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: .72rem;
      color: #a0aec0;
      display: flex;
      justify-content: space-between;
    }
    .tip {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: .82rem;
      color: #065f46;
      margin-top: 16px;
    }
    @media print {
      body { padding: 16px 20px; }
      @page { margin: 12mm; size: A4; }
    }
  </style>
</head>
<body>
  <div class="pdf-header">
    <div>
      <div class="pdf-logo">🔐 OTP<span>Guard</span></div>
      <div class="pdf-title">${title}</div>
      ${subtitle ? `<div class="pdf-subtitle">${subtitle}</div>` : ''}
    </div>
    <div class="pdf-meta">
      Generated: ${now}<br/>
      OTPGuard Admin Portal
    </div>
  </div>

  ${html}

  <div class="pdf-footer">
    <span>OTPGuard — Confidential</span>
    <span>${title} · ${now}</span>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400)
    }
  </script>
</body>
</html>`)
  win.document.close()
}

/** Helper: build a KPI grid HTML string */
export function pdfKpiGrid(items) {
  return `<div class="kpi-grid">${items.map(k => `
    <div class="kpi-card">
      <div class="kpi-val">${k.val}</div>
      <div class="kpi-label">${k.label}</div>
    </div>`).join('')}</div>`
}

/** Helper: build a table HTML string */
export function pdfTable(headers, rows) {
  return `<table>
    <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c ?? '—'}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>`
}

/** Helper: section wrapper */
export function pdfSection(title, content) {
  return `<div class="section"><div class="section-title">${title}</div>${content}</div>`
}

/** Helper: bar row */
export function pdfBar(label, pct, color = '#00b860') {
  return `<div style="margin-bottom:10px">
    <div style="display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:3px">
      <span>${label}</span><span style="font-weight:700">${pct}%</span>
    </div>
    <div class="bar-wrap"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
  </div>`
}
