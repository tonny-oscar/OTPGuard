import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, API } from '../context/AuthContext'

const card = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 12, padding: 24,
}

const alertColors = {
  danger:  { bg: 'rgba(248,113,113,.08)', border: 'rgba(248,113,113,.3)', color: '#f87171' },
  warning: { bg: 'rgba(250,204,21,.08)',  border: 'rgba(250,204,21,.3)',  color: '#facc15' },
  info:    { bg: 'rgba(59,130,246,.08)',  border: 'rgba(59,130,246,.3)',  color: 'var(--blue)' },
  success: { bg: 'rgba(0,255,136,.08)',   border: 'rgba(0,255,136,.3)',   color: 'var(--green)' },
}

function Spinner() {
  return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading…</div>
}

function BarChart({ data }) {
  if (!data?.length) return null
  const max = Math.max(...data.map(d => d.logins), 1)
  return (
    <div style={{ ...card }}>
      <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 20 }}>Login Activity (Last 7 Days)</h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
        {data.map(d => (
          <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, height: 120, justifyContent: 'flex-end' }}>
              <div style={{ width: '60%', height: `${(d.failed / max) * 100}%`, background: '#f87171', borderRadius: '3px 3px 0 0', minHeight: d.failed ? 3 : 0 }} />
              <div style={{ width: '100%', height: `${(d.logins / max) * 100}%`, background: 'var(--green)', borderRadius: '3px 3px 0 0', minHeight: d.logins ? 3 : 0 }} />
            </div>
            <span style={{ fontSize: '.7rem', color: 'var(--text)' }}>{d.day}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: '.75rem' }}>
        <span><span style={{ color: 'var(--green)' }}>■</span> Logins</span>
        <span><span style={{ color: '#f87171' }}>■</span> Failed</span>
      </div>
    </div>
  )
}

function OTPBreakdown({ data }) {
  if (!data?.length) return null
  return (
    <div style={{ ...card }}>
      <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 20 }}>OTP Methods</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {data.map(m => (
          <div key={m.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', marginBottom: 4 }}>
              <span>{m.label}</span><span style={{ color: m.color, fontWeight: 600 }}>{m.pct}%</span>
            </div>
            <div style={{ background: 'var(--border)', borderRadius: 4, height: 6 }}>
              <div style={{ width: `${m.pct}%`, height: '100%', background: m.color, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Admin() {
  const { token, user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [search, setSearch] = useState('')

  // Data state
  const [statsData, setStatsData]     = useState(null)
  const [mfaAdoption, setMfaAdoption] = useState(null)
  const [analytics, setAnalytics]     = useState(null)
  const [users, setUsers]             = useState([])
  const [userTotal, setUserTotal]     = useState(0)
  const [alerts, setAlerts]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)


  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])

  const apiFetch = useCallback(async (path) => {
    const r = await fetch(`${API}/admin${path}`, { headers: authHeaders })
    if (r.status === 403) { navigate('/login'); return null }
    if (!r.ok) throw new Error(`API error ${r.status}`)
    return r.json()

  }, [authHeaders, navigate])

  const loadOverview = useCallback(async () => {
    setLoading(true)
    try {
      const d = await apiFetch('/stats')
      if (d) { setStatsData(d.stats); setMfaAdoption(d.mfa_adoption) }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [apiFetch])

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const d = await apiFetch('/analytics')
      if (d) setAnalytics(d)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [apiFetch])

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const d = await apiFetch(`/users?search=${encodeURIComponent(search)}&per_page=50`)
      if (d) { setUsers(d.users); setUserTotal(d.total) }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [apiFetch, search])

  const loadAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const d = await apiFetch('/alerts')
      if (d) setAlerts(d.alerts)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [apiFetch])

  // Load overview data
  useEffect(() => {
    if (activeTab !== 'overview') return

    loadOverview()
  }, [activeTab, loadOverview])

  // Load analytics data
  useEffect(() => {
    if (activeTab !== 'analytics') return

    loadAnalytics()
  }, [activeTab, loadAnalytics])

  // Load users
  useEffect(() => {
    if (activeTab !== 'users') return

    loadUsers()
  }, [activeTab, loadUsers])

  // Load alerts
  useEffect(() => {
    if (activeTab !== 'alerts') return

    loadAlerts()
  }, [activeTab, loadAlerts])


  async function toggleUserStatus(u) {
    const newStatus = u.is_active ? 'inactive' : 'active'
    await fetch(`${API}/admin/users/${u.id}/status`, {
      method: 'PUT', headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: !x.is_active } : x))
  }

  async function resetMFA(u) {
    if (!confirm(`Reset MFA for ${u.email}?`)) return
    await fetch(`${API}/admin/users/${u.id}/reset-mfa`, { method: 'POST', headers: authHeaders })
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, mfa_enabled: false } : x))
  }

  async function deleteUser(u) {
    if (!confirm(`Delete ${u.email}? This cannot be undone.`)) return
    const r = await fetch(`${API}/admin/users/${u.id}`, { method: 'DELETE', headers: authHeaders })
    if (r.ok) setUsers(prev => prev.filter(x => x.id !== u.id))
  }

  async function dismissAlert(id) {
    await fetch(`${API}/admin/alerts/${id}/dismiss`, { method: 'PUT', headers: authHeaders })
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const dangerCount = alerts.filter(a => a.type === 'danger').length

  const navItems = [
    { id: 'overview',  icon: '📊', label: 'Overview' },
    { id: 'users',     icon: '👥', label: 'Users' },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
    { id: 'alerts',    icon: '🚨', label: 'Alerts', badge: dangerCount || null },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)',
        padding: '24px 0', display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)' }}>
          <Link to="/" style={{ textDecoration: 'none', fontWeight: 700, fontSize: '1.1rem', color: 'var(--heading)' }}>
            🔐 OTP<span style={{ color: 'var(--green)' }}>Guard</span>
          </Link>
          <div style={{ fontSize: '.7rem', color: 'var(--green)', marginTop: 4, fontWeight: 600, letterSpacing: 1 }}>ADMIN PANEL</div>
        </div>
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: activeTab === item.id ? 'var(--green-dim)' : 'transparent',
              color: activeTab === item.id ? 'var(--green)' : 'var(--text)',
              fontSize: '.9rem', fontWeight: activeTab === item.id ? 600 : 400,
              marginBottom: 4, transition: 'all .2s', textAlign: 'left',
            }}>
              <span>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{ background: '#f87171', color: '#fff', borderRadius: 10, fontSize: '.7rem', padding: '1px 7px', fontWeight: 700 }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '.8rem', marginBottom: 4, color: 'var(--heading)' }}>{user?.full_name || 'Admin'}</div>
          <div style={{ fontSize: '.75rem' }}>{user?.email}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Link to="/" style={{ fontSize: '.75rem', color: 'var(--green)', textDecoration: 'none' }}>← Back to site</Link>
            <button onClick={logout} style={{ fontSize: '.75rem', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Logout</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, padding: '32px 28px', overflowY: 'auto' }}>
        {error && (
          <div style={{ ...alertColors.danger, background: alertColors.danger.bg, border: `1px solid ${alertColors.danger.border}`, borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: alertColors.danger.color }}>
            {error} — <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}>dismiss</button>
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          loading ? <Spinner /> : (
            <div>
              <h1 style={{ color: 'var(--heading)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Dashboard Overview</h1>
              <p style={{ fontSize: '.85rem', marginBottom: 28 }}>Welcome back. Here's what's happening today.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20, marginBottom: 28 }}>
                {statsData?.map(s => (
                  <div key={s.label} style={card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
                      {s.change && (
                        <span style={{
                          fontSize: '.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                          background: s.up ? 'rgba(0,255,136,.1)' : 'rgba(248,113,113,.1)',
                          color: s.up ? 'var(--green)' : '#f87171',
                        }}>{s.change}</span>
                      )}
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--heading)', margin: '12px 0 4px' }}>{s.val}</div>
                    <div style={{ fontSize: '.8rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {mfaAdoption && (
                <div style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ color: 'var(--heading)', fontWeight: 600 }}>MFA Adoption Rate</h3>
                    <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: '1.1rem' }}>{mfaAdoption.pct}%</span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: 4, height: 10, overflow: 'hidden' }}>
                    <div style={{ width: `${mfaAdoption.pct}%`, height: '100%', background: 'linear-gradient(90deg,var(--green),#00cc6a)', borderRadius: 4 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '.8rem' }}>
                    <span>{mfaAdoption.enabled} users with MFA</span>
                    <span>{mfaAdoption.disabled} users without MFA</span>
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {/* ── USERS ── */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h1 style={{ color: 'var(--heading)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>User Management</h1>
                <p style={{ fontSize: '.85rem' }}>{userTotal} total users</p>
              </div>
              <input
                placeholder="🔍 Search users..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '10px 16px', color: 'var(--text)', fontSize: '.9rem', width: 260,
                }}
              />
            </div>

            {loading ? <Spinner /> : (
              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,.02)' }}>
                      {['User', 'Plan', 'MFA', 'Logins', 'Status', 'Risk', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--heading)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => {
                      const risk = !u.mfa_enabled ? 'high' : u.failed_count > 5 ? 'medium' : 'low'
                      const riskColor = { high: '#f87171', medium: '#facc15', low: 'var(--green)' }[risk]
                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--heading)' }}>{u.full_name || '—'}</div>
                            <div style={{ fontSize: '.75rem', marginTop: 2 }}>{u.email}</div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ background: 'var(--green-dim)', color: 'var(--green)', borderRadius: 6, padding: '2px 8px', fontSize: '.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
                              {u.plan}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ color: u.mfa_enabled ? 'var(--green)' : '#f87171', fontWeight: 600 }}>
                              {u.mfa_enabled ? '✅' : '❌'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>{u.login_count ?? 0}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              borderRadius: 6, padding: '2px 8px', fontSize: '.75rem', fontWeight: 600,
                              background: u.is_active ? 'rgba(0,255,136,.1)' : 'rgba(248,113,113,.1)',
                              color: u.is_active ? 'var(--green)' : '#f87171',
                            }}>
                              {u.is_active ? 'active' : 'inactive'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ color: riskColor, fontWeight: 600, fontSize: '.8rem' }}>{risk}</span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => toggleUserStatus(u)} style={{
                                fontSize: '.72rem', padding: '3px 8px', borderRadius: 5, cursor: 'pointer',
                                border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)',
                              }}>
                                {u.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                              {u.mfa_enabled && (
                                <button onClick={() => resetMFA(u)} style={{
                                  fontSize: '.72rem', padding: '3px 8px', borderRadius: 5, cursor: 'pointer',
                                  border: '1px solid rgba(250,204,21,.4)', background: 'transparent', color: '#facc15',
                                }}>
                                  Reset MFA
                                </button>
                              )}
                              <button onClick={() => deleteUser(u)} style={{
                                fontSize: '.72rem', padding: '3px 8px', borderRadius: 5, cursor: 'pointer',
                                border: '1px solid rgba(248,113,113,.4)', background: 'transparent', color: '#f87171',
                              }}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {!users.length && (
                      <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--text)' }}>No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {activeTab === 'analytics' && (
          loading ? <Spinner /> : analytics && (
            <div>
              <h1 style={{ color: 'var(--heading)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Analytics</h1>
              <p style={{ fontSize: '.85rem', marginBottom: 28 }}>{analytics.chart_period}</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
                {analytics.summary?.map(s => (
                  <div key={s.label} style={card}>
                    <div style={{ fontSize: '1.4rem', marginBottom: 8 }}>{s.icon}</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--heading)' }}>{s.val}</div>
                    <div style={{ fontSize: '.8rem', marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 28 }}>
                <BarChart data={analytics.login_chart} />
                <OTPBreakdown data={analytics.otp_methods} />
              </div>

              {analytics.locations?.length > 0 && (
                <div style={card}>
                  <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}>Top Locations</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {analytics.locations.map(l => (
                      <div key={l.country} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ width: 140, fontSize: '.85rem' }}>{l.country}</span>
                        <div style={{ flex: 1, background: 'var(--border)', borderRadius: 4, height: 8 }}>
                          <div style={{ width: `${l.pct}%`, height: '100%', background: 'var(--blue)', borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: '.8rem', width: 40, textAlign: 'right' }}>{l.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {/* ── ALERTS ── */}
        {activeTab === 'alerts' && (
          <div>
            <h1 style={{ color: 'var(--heading)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Security Alerts</h1>
            <p style={{ fontSize: '.85rem', marginBottom: 28 }}>{alerts.length} active alert{alerts.length !== 1 ? 's' : ''}</p>

            {loading ? <Spinner /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {alerts.map(a => {
                  const c = alertColors[a.type] || alertColors.info
                  return (
                    <div key={a.id} style={{
                      background: c.bg, border: `1px solid ${c.border}`,
                      borderRadius: 10, padding: '16px 20px',
                      display: 'flex', alignItems: 'flex-start', gap: 14,
                    }}>
                      <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{a.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: 'var(--heading)', fontSize: '.9rem', fontWeight: 500 }}>{a.msg}</div>
                        <div style={{ fontSize: '.75rem', marginTop: 4, color: c.color }}>{a.time}</div>
                      </div>
                      <button onClick={() => dismissAlert(a.id)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text)', fontSize: '1rem', flexShrink: 0,
                      }}>✕</button>
                    </div>
                  )
                })}
                {!alerts.length && (
                  <div style={{ ...card, textAlign: 'center', color: 'var(--text)', padding: 48 }}>
                    ✅ No active alerts
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
