import { useState } from 'react'

export default function ActivityTable({ title, columns, data, maxRows = 10, filters = [], searchable = false, exportable = false, pagination = false, noAnalytics = false }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [page, setPage] = useState(1)

  const filtered = data.filter(item => {
    const matchSearch = searchable ? Object.values(item).some(v => String(v).toLowerCase().includes(search.toLowerCase())) : true
    const matchFilter = filter === 'All' || Object.values(item).includes(filter)
    return matchSearch && matchFilter
  })

  const totalPages = Math.ceil(filtered.length / maxRows)
  const rows = pagination ? filtered.slice((page - 1) * maxRows, page * maxRows) : filtered.slice(0, maxRows)

  function handleExport() {
    const csv = [columns.join(','), ...filtered.map(r => Object.values(r).join(','))].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `${(title || 'export').replace(/\s+/g, '_')}.csv`
    a.click()
  }

  const th = { padding: '10px 16px', textAlign: 'left', fontSize: '.75rem', fontWeight: 600, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: .5, borderBottom: '1px solid var(--border)' }
  const td = { padding: '12px 16px', fontSize: '.85rem', color: 'var(--heading)', borderBottom: '1px solid var(--border)' }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        {title && <h3 style={{ color: 'var(--heading)', fontWeight: 600, fontSize: '1rem' }}>{title}</h3>}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '.78rem', fontWeight: 600,
              background: filter === f ? 'var(--green)' : 'var(--border)',
              color: filter === f ? '#0a0e1a' : 'var(--text)',
            }}>{f}</button>
          ))}
          {searchable && (
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              style={{ padding: '5px 12px', borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '.82rem', outline: 'none', width: 160 }} />
          )}
          {exportable && (
            <button onClick={handleExport} style={{ padding: '5px 12px', borderRadius: 6, background: 'none', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontSize: '.78rem' }}>
              ↓ Export
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(255,255,255,.02)' }}>
            <tr>{columns.map(c => <th key={c} style={th}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length > 0 ? rows.map((row, i) => (
              <tr key={i} style={{ transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {Object.values(row).map((cell, ci) => <td key={ci} style={td}>{cell}</td>)}
              </tr>
            )) : (
              <tr><td colSpan={columns.length} style={{ ...td, textAlign: 'center', padding: 32, opacity: .5 }}>No data available</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {pagination && totalPages > 1 && (
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.82rem' }}>
          <span style={{ color: 'var(--text)' }}>Page {page} of {totalPages}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '4px 12px', borderRadius: 6, background: 'none', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', opacity: page === 1 ? .4 : 1 }}>← Prev</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ padding: '4px 12px', borderRadius: 6, background: 'none', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', opacity: page === totalPages ? .4 : 1 }}>Next →</button>
          </div>
        </div>
      )}
      {noAnalytics && (
        <div style={{ padding: '8px 20px', background: 'rgba(255,255,255,.02)', borderTop: '1px solid var(--border)', fontSize: '.75rem', color: 'var(--text)', opacity: .6 }}>
          Limited to last {maxRows} entries. Upgrade for full analytics.
        </div>
      )}
    </div>
  )
}
