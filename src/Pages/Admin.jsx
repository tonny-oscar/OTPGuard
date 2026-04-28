import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, API } from '../context/AuthContext'
import ThemeToggle from '../Components/shared/ThemeToggle'
import { sound } from '../utils/sound'
import BillingReport from '../Components/admin/BillingReport'
import RevenueAnalytics from '../Components/admin/RevenueAnalytics'
import ChurnAnalysis from '../Components/admin/ChurnAnalysis'
import LifecycleAnalytics from '../Components/admin/LifecycleAnalytics'
import CustomReports from '../Components/admin/CustomReports'
import ComplianceAudit from '../Components/admin/ComplianceAudit'
import FeatureUsage from '../Components/admin/FeatureUsage'
import LocationMap from '../Components/admin/LocationMap'

const card = {
  background: 'var(--surface)', border: '1px solid rgba(255,255,255,.06)',
  borderRadius: 16, padding: 24,
}

const alertColors = {
  danger:  { bg: 'rgba(248,113,113,.08)', border: 'rgba(248,113,113,.3)', color: '#f87171' },
  warning: { bg: 'rgba(250,204,21,.08)',  border: 'rgba(250,204,21,.3)',  color: '#facc15' },
  info:    { bg: 'rgba(59,130,246,.08)',  border: 'rgba(59,130,246,.3)',  color: 'var(--blue)' },
  success: { bg: 'rgba(0,255,136,.08)',   border: 'rgba(0,255,136,.3)',   color: 'var(--green)' },
}

function Spinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(0,255,136,.15)', borderTopColor: 'var(--green)', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ color: 'var(--text)', fontSize: '.85rem' }}>Loading…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
    { id: 'overview',      icon: '📊', label: 'Overview' },
    { id: 'users',         icon: '👥', label: 'Users' },
    { id: 'analytics',     icon: '📈', label: 'Analytics' },
    { id: 'billing',       icon: '💳', label: 'Billing' },
    { id: 'revenue',       icon: '💰', label: 'Revenue' },
    { id: 'churn',         icon: '📉', label: 'Churn' },
    { id: 'lifecycle',     icon: '🔄', label: 'Lifecycle' },
    { id: 'reports',       icon: '📋', label: 'Reports' },
    { id: 'compliance',    icon: '🔐', label: 'Compliance' },
    { id: 'feature-usage', icon: '🎮', label: 'Features' },
    { id: 'alerts',        icon: '🚨', label: 'Alerts', badge: dangerCount || null },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }} className="admin-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 99,
        }} />
      )}

      {/* Sidebar */}
      <aside className="admin-sidebar" style={{
        width: 240, background: 'linear-gradient(180deg,#0d1117 0%,#0f1629 100%)',
        borderRight: '1px solid rgba(0,255,136,.08)',
        padding: '0', display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh',
        boxShadow: '4px 0 24px rgba(0,0,0,.3)',
      }}>
        <div className="sidebar-logo" style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(0,255,136,.03)' }}>
          <Link to="/" style={{ textDecoration: 'none', fontWeight: 800, fontSize: '1.15rem', color: 'var(--heading)', letterSpacing: '-.01em' }}>
            🔐 OTP<span style={{ color: 'var(--green)' }}>Guard</span>
          </Link>
          <div style={{ fontSize: '.68rem', color: 'var(--green)', marginTop: 6, fontWeight: 700, letterSpacing: 2, opacity: .8 }}>ADMIN PANEL</div>
        </div>
        <nav style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); sound.tab() }} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: activeTab === item.id
                ? 'linear-gradient(135deg,rgba(0,255,136,.15),rgba(0,255,136,.05))'
                : 'transparent',
              color: activeTab === item.id ? 'var(--green)' : 'var(--text)',
              fontSize: '.875rem', fontWeight: activeTab === item.id ? 700 : 400,
              marginBottom: 2, transition: 'all .18s', textAlign: 'left',
              borderLeft: activeTab === item.id ? '3px solid var(--green)' : '3px solid transparent',
            }}
              onMouseEnter={e => { if (activeTab !== item.id) { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = 'var(--heading)' } }}
              onMouseLeave={e => { if (activeTab !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text)' } }}
            >
              <span style={{ fontSize: '1rem', width: 20, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{ background: '#ef4444', color: '#fff', borderRadius: 20, fontSize: '.65rem', padding: '2px 7px', fontWeight: 800, letterSpacing: .3 }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer" style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,.06)', background: 'rgba(0,0,0,.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,var(--green),#00cc6a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0e1a', fontWeight: 800, fontSize: '.9rem', flexShrink: 0 }}>
              {(user?.full_name || user?.email || 'A').charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name || 'Admin'}</div>
              <div style={{ fontSize: '.72rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
            <Link to="/" style={{ fontSize: '.75rem', color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>← Site</Link>
            <button onClick={logout} style={{ fontSize: '.75rem', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}>Logout</button>
          </div>
          <ThemeToggle />
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', minWidth: 0, background: 'var(--bg)' }}>
        {/* Mobile topbar */}
        <div className="admin-mobile-bar" style={{
          display: 'none', alignItems: 'center', gap: 12,
          marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,.06)',
        }}>
          <button onClick={() => setSidebarOpen(true)} style={{
            background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10,
            color: 'var(--heading)', fontSize: '1.1rem', cursor: 'pointer', padding: '8px 12px',
          }}>☰</button>
          <span style={{ fontWeight: 800, color: 'var(--heading)', fontSize: '1rem', letterSpacing: '-.01em' }}>
            🔐 OTP<span style={{ color: 'var(--green)' }}>Guard</span>
          </span>
        </div>
        {error && (
          <div style={{ ...alertColors.danger, background: alertColors.danger.bg, border: `1px solid ${alertColors.danger.border}`, borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: alertColors.danger.color }}>
            {error} — <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}>dismiss</button>
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          loading ? <Spinner /> : (
            <div>
              <h1 style={{ color: 'var(--heading)', fontSize: '1.6rem', fontWeight: 800, marginBottom: 4, letterSpacing: '-.02em' }}>Dashboard Overview</h1>
              <p style={{ fontSize: '.85rem', marginBottom: 28, color: 'var(--text)' }}>Welcome back. Here’s what’s happening today.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
                {statsData?.map((s, i) => (
                  <div key={s.label} className="admin-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,255,136,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                        {s.icon}
                      </div>
                      {s.change && (
                        <span style={{
                          fontSize: '.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                          background: s.up ? 'rgba(0,255,136,.12)' : 'rgba(248,113,113,.12)',
                          color: s.up ? 'var(--green)' : '#f87171',
                          border: `1px solid ${s.up ? 'rgba(0,255,136,.2)' : 'rgba(248,113,113,.2)'}`,
                        }}>{s.change}</span>
                      )}
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--heading)', marginBottom: 4, letterSpacing: '-.02em' }}>{s.val}</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--text)', fontWeight: 500 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {mfaAdoption && (
                <div style={{ ...card, background: 'linear-gradient(135deg,rgba(0,255,136,.05),rgba(0,255,136,.02))', border: '1px solid rgba(0,255,136,.12)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ color: 'var(--heading)', fontWeight: 700, marginBottom: 2 }}>MFA Adoption Rate</h3>
                      <p style={{ fontSize: '.78rem', color: 'var(--text)' }}>Users with multi-factor authentication enabled</p>
                    </div>
                    <span style={{ color: 'var(--green)', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-.02em' }}>{mfaAdoption.pct}%</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 8, height: 12, overflow: 'hidden', marginBottom: 10 }}>
                    <div style={{ width: `${mfaAdoption.pct}%`, height: '100%', background: 'linear-gradient(90deg,var(--green),#00cc6a)', borderRadius: 8, transition: 'width .8s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem' }}>
                    <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ {mfaAdoption.enabled} secured</span>
                    <span style={{ color: '#f87171', fontWeight: 600 }}>⚠ {mfaAdoption.disabled} at risk</span>
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
                <h1 style={{ color: 'var(--heading)', fontSize: '1.6rem', fontWeight: 800, marginBottom: 4, letterSpacing: '-.02em' }}>User Management</h1>
                <p style={{ fontSize: '.85rem', color: 'var(--text)' }}>{userTotal} total users</p>
              </div>
              <input
                placeholder="🔍 Search users..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="admin-search"
              />
            </div>

            {loading ? <Spinner /> : (
              <div className="table-wrap" style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.2)' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      {['User', 'Plan', 'MFA', 'Logins', 'Status', 'Risk', 'Actions'].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => {
                      const risk = !u.mfa_enabled ? 'high' : u.failed_count > 5 ? 'medium' : 'low'
                      const riskColor = { high: '#f87171', medium: '#facc15', low: 'var(--green)' }[risk]
                      const riskBg    = { high: 'rgba(248,113,113,.12)', medium: 'rgba(250,204,21,.12)', low: 'rgba(0,255,136,.12)' }[risk]
                      return (
                        <tr key={u.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--heading)', fontSize: '.88rem' }}>{u.full_name || '—'}</div>
                            <div style={{ fontSize: '.72rem', marginTop: 2, color: 'var(--text)' }}>{u.email}</div>
                          </td>
                          <td>
                            <span style={{ background: 'rgba(0,255,136,.1)', color: 'var(--green)', borderRadius: 20, padding: '3px 10px', fontSize: '.72rem', fontWeight: 700, textTransform: 'capitalize', border: '1px solid rgba(0,255,136,.2)' }}>
                              {u.plan}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '1rem' }}>{u.mfa_enabled ? '✅' : '❌'}</span>
                          </td>
                          <td style={{ fontWeight: 600, color: 'var(--heading)' }}>{u.login_count ?? 0}</td>
                          <td>
                            <span style={{
                              borderRadius: 20, padding: '3px 10px', fontSize: '.72rem', fontWeight: 700,
                              background: u.is_active ? 'rgba(0,255,136,.1)' : 'rgba(248,113,113,.1)',
                              color: u.is_active ? 'var(--green)' : '#f87171',
                              border: `1px solid ${u.is_active ? 'rgba(0,255,136,.2)' : 'rgba(248,113,113,.2)'}`,
                            }}>
                              {u.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <span style={{ background: riskBg, color: riskColor, borderRadius: 20, padding: '3px 10px', fontSize: '.72rem', fontWeight: 700, textTransform: 'capitalize' }}>{risk}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => toggleUserStatus(u)} style={{
                                fontSize: '.72rem', padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
                                border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.05)', color: 'var(--text)',
                                transition: 'all .15s',
                              }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.3)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'}
                              >
                                {u.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                              {u.mfa_enabled && (
                                <button onClick={() => resetMFA(u)} style={{
                                  fontSize: '.72rem', padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
                                  border: '1px solid rgba(250,204,21,.3)', background: 'rgba(250,204,21,.08)', color: '#facc15',
                                  transition: 'all .15s',
                                }}>Reset MFA</button>
                              )}
                              <button onClick={() => deleteUser(u)} style={{
                                fontSize: '.72rem', padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
                                border: '1px solid rgba(248,113,113,.3)', background: 'rgba(248,113,113,.08)', color: '#f87171',
                                transition: 'all .15s',
                              }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {!users.length && (
                      <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: 'var(--text)', opacity: .5 }}>No users found.</td></tr>
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
              <h1 style={{ color: 'var(--heading)', fontSize: '1.6rem', fontWeight: 800, marginBottom: 4, letterSpacing: '-.02em' }}>Analytics</h1>
              <p style={{ fontSize: '.85rem', marginBottom: 28, color: 'var(--text)' }}>{analytics.chart_period}</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
                {analytics.summary?.map(s => (
                  <div key={s.label} style={card}>
                    <div style={{ fontSize: '1.4rem', marginBottom: 8 }}>{s.icon}</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--heading)' }}>{s.val}</div>
                    <div style={{ fontSize: '.8rem', marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, marginBottom: 28 }}>
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
              {/* Map */}
              <LocationMap locations={analytics.locations || []} />
            </div>
          )
        )}

        {/* ── ALERTS ── */}
        {activeTab === 'alerts' && (
          <div>
            <h1 style={{ color: 'var(--heading)', fontSize: '1.6rem', fontWeight: 800, marginBottom: 4, letterSpacing: '-.02em' }}>Security Alerts</h1>
            <p style={{ fontSize: '.85rem', marginBottom: 24, color: 'var(--text)' }}>{alerts.length} active alert{alerts.length !== 1 ? 's' : ''}</p>

            {loading ? <Spinner /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {alerts.map(a => {
                  const c = alertColors[a.type] || alertColors.info
                  return (
                    <div key={a.id} className="admin-alert" style={{
                      background: c.bg, border: `1px solid ${c.border}`,
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
                  <div style={{ ...card, textAlign: 'center', color: 'var(--text)', padding: 56, opacity: .5 }}>
                    ✅ No active alerts
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── BILLING REPORTS ── */}
        {activeTab === 'billing' && <BillingReport />}

        {/* ── REVENUE ANALYTICS ── */}
        {activeTab === 'revenue' && <RevenueAnalytics />}

        {/* ── CHURN ANALYSIS ── */}
        {activeTab === 'churn' && <ChurnAnalysis />}

        {/* ── LIFECYCLE ANALYTICS ── */}
        {activeTab === 'lifecycle' && <LifecycleAnalytics />}

        {/* ── CUSTOM REPORTS ── */}
        {activeTab === 'reports' && <CustomReports />}

        {/* ── COMPLIANCE & AUDIT ── */}
        {activeTab === 'compliance' && <ComplianceAudit />}

        {/* ── FEATURE USAGE ANALYTICS ── */}
        {activeTab === 'feature-usage' && <FeatureUsage />}
      </div>

      {/* Mobile sidebar slide-in */}
      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { left: ${sidebarOpen ? '0' : '-260px'} !important; }
          .admin-mobile-bar { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
