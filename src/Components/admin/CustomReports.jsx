import { useState, useEffect } from 'react'
import { useAuth, API } from '../../context/AuthContext'

const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 24,
}

function CustomReports() {
  const { token } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [generatedReport, setGeneratedReport] = useState(null)
  const [filters, setFilters] = useState({})

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API}/admin/reports/list`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const json = await res.json()
        setReports(json.reports)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [token])

  const generateReport = async () => {
    if (!selectedReport) return

    try {
      const res = await fetch(`${API}/admin/reports/custom`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedReport.id.split('-')[0],
          filters,
        }),
      })
      const json = await res.json()
      setGeneratedReport(json)
    } catch (e) {
      console.error(e)
    }
  }

  const exportReport = () => {
    if (!generatedReport) return
    const csv = JSON.stringify(generatedReport, null, 2)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: 'var(--heading)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>
          📋 Custom Report Builder
        </h1>
        <p style={{ fontSize: '.85rem' }}>Generate custom reports based on your specific needs</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
          {/* Report Templates */}
          <div>
            <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}>Report Templates</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => {
                    setSelectedReport(report)
                    setGeneratedReport(null)
                    setFilters({})
                  }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: selectedReport?.id === report.id ? '2px solid var(--green)' : '1px solid var(--border)',
                    background: selectedReport?.id === report.id ? 'var(--green-dim)' : 'var(--surface)',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all .2s',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{report.name}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text)', opacity: 0.7 }}>
                    {report.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Report Configuration & Results */}
          <div>
            {selectedReport ? (
              <div>
                {/* Configuration */}
                <div style={card}>
                  <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}>
                    Configure Report: {selectedReport.name}
                  </h3>

                  <div style={{ marginBottom: 20 }}>
                    {selectedReport.id.includes('usage') && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Time Period</label>
                          <select
                            value={filters.days || 30}
                            onChange={(e) => setFilters({ ...filters, days: parseInt(e.target.value) })}
                            style={{
                              width: '100%',
                              background: 'var(--border)',
                              border: '1px solid var(--border)',
                              borderRadius: 6,
                              padding: '8px 12px',
                              color: 'var(--text)',
                            }}
                          >
                            <option value={7}>Last 7 days</option>
                            <option value={30}>Last 30 days</option>
                            <option value={90}>Last 90 days</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Filter by Status</label>
                          <select
                            value={filters.status || ''}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                            style={{
                              width: '100%',
                              background: 'var(--border)',
                              border: '1px solid var(--border)',
                              borderRadius: 6,
                              padding: '8px 12px',
                              color: 'var(--text)',
                            }}
                          >
                            <option value="">All</option>
                            <option value="verified">Verified</option>
                            <option value="failed">Failed</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {selectedReport.id.includes('security') && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Time Period</label>
                          <select
                            value={filters.days || 7}
                            onChange={(e) => setFilters({ ...filters, days: parseInt(e.target.value) })}
                            style={{
                              width: '100%',
                              background: 'var(--border)',
                              border: '1px solid var(--border)',
                              borderRadius: 6,
                              padding: '8px 12px',
                              color: 'var(--text)',
                            }}
                          >
                            <option value={1}>Last 24 hours</option>
                            <option value={7}>Last 7 days</option>
                            <option value={30}>Last 30 days</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {selectedReport.id.includes('revenue') && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Plan Filter</label>
                          <select
                            value={filters.plan || ''}
                            onChange={(e) => setFilters({ ...filters, plan: e.target.value || undefined })}
                            style={{
                              width: '100%',
                              background: 'var(--border)',
                              border: '1px solid var(--border)',
                              borderRadius: 6,
                              padding: '8px 12px',
                              color: 'var(--text)',
                            }}
                          >
                            <option value="">All Plans</option>
                            <option value="starter">Starter</option>
                            <option value="growth">Growth</option>
                            <option value="business">Business</option>
                            <option value="enterprise">Enterprise</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      onClick={generateReport}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: 'none',
                        background: 'var(--green)',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '.9rem',
                      }}
                    >
                      Generate Report
                    </button>
                    {generatedReport && (
                      <button
                        onClick={exportReport}
                        style={{
                          padding: '10px 16px',
                          borderRadius: 8,
                          border: '1px solid var(--border)',
                          background: 'var(--surface)',
                          color: 'var(--text)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '.9rem',
                        }}
                      >
                        📥 Export
                      </button>
                    )}
                  </div>
                </div>

                {/* Report Results */}
                {generatedReport && (
                  <div style={{ ...card, marginTop: 20 }}>
                    <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}>Report Results</h3>

                    <div style={{ marginBottom: 20 }}>
                      {generatedReport.type === 'usage' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
                          <div>
                            <div style={{ fontSize: '.85rem', marginBottom: 4, color: 'var(--text)' }}>
                              Total Operations
                            </div>
                            <div
                              style={{
                                fontSize: '1.5rem',
                                fontWeight: 800,
                                color: 'var(--heading)',
                              }}
                            >
                              {generatedReport.total_operations}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '.85rem', marginBottom: 4, color: 'var(--text)' }}>
                              By Method
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {Object.entries(generatedReport.by_method || {}).map(([method, count]) => (
                                <div key={method} style={{ fontSize: '.85rem' }}>
                                  {method}: <span style={{ fontWeight: 600 }}>{count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {generatedReport.type === 'security' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
                          <div>
                            <div style={{ fontSize: '.85rem', marginBottom: 4, color: 'var(--text)' }}>
                              Failed Attempts
                            </div>
                            <div
                              style={{
                                fontSize: '1.8rem',
                                fontWeight: 800,
                                color: '#f87171',
                              }}
                            >
                              {generatedReport.failed_attempts}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '.85rem', marginBottom: 4, color: 'var(--text)' }}>
                              Suspicious IPs
                            </div>
                            <div
                              style={{
                                fontSize: '1.8rem',
                                fontWeight: 800,
                                color: '#facc15',
                              }}
                            >
                              {generatedReport.suspicious_ips}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {generatedReport.top_ips && (
                      <div>
                        <h4 style={{ fontWeight: 600, marginBottom: 8 }}>Top Suspicious IPs</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {generatedReport.top_ips.map((ip, i) => (
                            <div
                              key={i}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '8px',
                                background: 'rgba(248,113,113,.05)',
                                borderRadius: 6,
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>{ip.ip}</span>
                              <span style={{ color: '#f87171' }}>{ip.attempts} attempts</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: 12, fontSize: '.75rem', color: 'var(--text)' }}>
                      Generated: {new Date(generatedReport.generated).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ ...card, textAlign: 'center', color: 'var(--text)', padding: 48 }}>
                Select a report template to get started
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomReports
