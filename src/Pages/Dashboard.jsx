import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, API } from '../context/AuthContext'
import { useSubscription } from '../context/SubscriptionContext'

const card = { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:24 }

function useApi(endpoint) {
  const { token } = useAuth()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  const load = useCallback(() => {
    if (!token) return
    setLoading(true)
    fetch(`${API}${endpoint}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setData(d); setError(null) })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }, [token, endpoint])

  useEffect(() => { load() }, [load])
  return { data, loading, error, reload: load }
}

export default function Dashboard() {
  const { user, token, logout } = useAuth()
  const { currentPlan, planDetails, isTrial, trialEnds, refresh: refreshSub } = useSubscription()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [codesVisible, setCodesVisible] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [newKeyName, setNewKeyName] = useState('')
  const [createdKey, setCreatedKey] = useState(null)

  const { data: profileData, reload: reloadProfile } = useApi('/users/profile')
  const { data: devicesData, reload: reloadDevices }  = useApi('/users/devices')
  const { data: activityData }                        = useApi('/users/activity')
  const { data: codesData, reload: reloadCodes }      = useApi('/users/backup-codes')
  const { data: keysData, reload: reloadKeys }        = useApi('/users/api-keys')
  const { data: statsData }                           = useApi('/users/stats')

  const profile   = profileData?.user || user
  const devices   = devicesData?.devices || []
  const activity  = activityData?.activity || []
  const codes     = codesData?.backup_codes || []
  const apiKeys   = keysData?.api_keys || []
  const statCards = statsData?.stats || []

  async function saveMFA(field, value) {
    setSaving(true); setMsg('')
    try {
      const r = await fetch(`${API}/users/settings/mfa`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [field]: value })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setMsg('Saved ✓')
      reloadProfile()
    } catch (e) { setMsg(e.message) }
    finally { setSaving(false) }
  }

  async function removeDevice(id) {
    await fetch(`${API}/users/devices/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    })
    reloadDevices()
  }

  async function trustDevice(id, trusted) {
    await fetch(`${API}/users/devices/${id}/trust`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ trusted })
    })
    reloadDevices()
  }

  async function createApiKey() {
    if (!newKeyName.trim()) return
    const r = await fetch(`${API}/users/api-keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: newKeyName })
    })
    const d = await r.json()
    if (r.ok) { setCreatedKey(d.api_key); setNewKeyName(''); reloadKeys() }
    else setMsg(d.error)
  }

  async function revokeKey(id) {
    await fetch(`${API}/users/api-keys/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    })
    reloadKeys()
  }

  function handleLogout() { logout(); navigate('/') }

  const tabs = ['overview', 'devices', 'activity', 'api-keys', 'subscription', 'settings']

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      {/* Topbar */}
      <div style={{ background:'var(--surface)', borderBottom:'1px solid var(--border)', padding:'0 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:64 }}>
          <Link to="/" style={{ textDecoration:'none', fontWeight:700, fontSize:'1.1rem', color:'var(--heading)' }}>
              OTP<span style={{ color:'var(--green)' }}>Guard</span>
          </Link>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <span style={{ fontSize:'.85rem', color:'var(--text)' }}>{profile?.email}</span>
            <span style={{ fontSize:'.75rem', background:'var(--green-dim)', color:'var(--green)', padding:'2px 10px', borderRadius:10, border:'1px solid rgba(0,255,136,.3)' }}>
              {profile?.plan?.toUpperCase()}
            </span>
            <button onClick={handleLogout} style={{ background:'none', border:'none', color:'#f87171', cursor:'pointer', fontSize:'.85rem' }}>Logout</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 24px' }}>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ color:'var(--heading)', fontSize:'1.6rem', fontWeight:700, marginBottom:4 }}>
            My Security Dashboard
          </h1>
          <p style={{ fontSize:'.9rem' }}>Welcome back, {profile?.full_name || profile?.email}</p>
        </div>

        {/* MFA Status Banner */}
        <div style={{
          ...card, marginBottom:28,
          background: profile?.mfa_enabled ? 'rgba(0,255,136,.07)' : 'rgba(248,113,113,.07)',
          border: `1px solid ${profile?.mfa_enabled ? 'rgba(0,255,136,.3)' : 'rgba(248,113,113,.3)'}`,
          display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:8, background: profile?.mfa_enabled ? 'rgba(0,255,136,.15)' : 'rgba(248,113,113,.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:'.7rem', fontWeight:800, color: profile?.mfa_enabled ? 'var(--green)' : '#f87171' }}>{profile?.mfa_enabled ? 'ON' : 'OFF'}</span>
            </div>
            <div>
              <div style={{ color:'var(--heading)', fontWeight:600 }}>MFA is {profile?.mfa_enabled ? 'Active' : 'Disabled'}</div>
              <div style={{ fontSize:'.85rem' }}>
                {profile?.mfa_enabled ? `Protected via ${profile?.mfa_method?.toUpperCase()}` : 'Your account is at risk — enable MFA in Settings'}
              </div>
            </div>
          </div>
          <Toggle value={!!profile?.mfa_enabled} onChange={v => saveMFA('mfa_enabled', v)} />
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:28, borderBottom:'1px solid var(--border)' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              background:'none', border:'none', cursor:'pointer', padding:'10px 18px',
              fontSize:'.88rem', fontWeight:500, textTransform:'capitalize',
              color: activeTab===t ? 'var(--green)' : 'var(--text)',
              borderBottom: activeTab===t ? '2px solid var(--green)' : '2px solid transparent',
              transition:'color .2s', whiteSpace:'nowrap'
            }}>{t.replace('-',' ')}</button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:20, marginBottom:28 }}>
              {(statCards.length > 0 ? statCards : [
                { label:'MFA Status',      val: profile?.mfa_enabled ? 'Active' : 'Disabled', color: profile?.mfa_enabled ? 'var(--green)' : '#f87171' },
                { label:'MFA Method',      val: (profile?.mfa_method || '—').toUpperCase(),    color: 'var(--blue)' },
                { label:'Trusted Devices', val: devices.filter(d=>d.trusted).length,           color: 'var(--green)' },
                { label:'API Keys',        val: apiKeys.length,                                color: '#facc15' },
              ]).map(s => (
                <div key={s.label} style={card}>
                  <div style={{ fontSize:'.75rem', color:'var(--text)', textTransform:'uppercase', letterSpacing:.5, fontWeight:600, marginBottom:8 }}>{s.label}</div>
                  <div style={{ color:s.color, fontWeight:800, fontSize:'1.4rem' }}>{s.val}</div>
                </div>
              ))}
            </div>
            <div style={card}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                <h3 style={{ color:'var(--heading)', fontWeight:600 }}>Recent Activity</h3>
                <button onClick={() => setActiveTab('activity')} style={{ background:'none', border:'none', color:'var(--green)', cursor:'pointer', fontSize:'.85rem' }}>View all →</button>
              </div>
              {activity.length === 0
                ? <Empty text="No activity yet" />
                : activity.slice(0, activityData?.preview_limit ?? 5).map((a,i) => <ActivityRow key={i} item={a} border={i < (activityData?.preview_limit ?? 5) - 1} />)
              }
            </div>
          </div>
        )}

        {/* ── DEVICES ── */}
        {activeTab === 'devices' && (
          <div style={card}>
            <h3 style={{ color:'var(--heading)', fontWeight:600, marginBottom:20 }}>Trusted Devices</h3>
            {devices.length === 0 ? <Empty text="No devices recorded yet" /> : devices.map((d,i) => (
              <div key={d.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 0', borderBottom: i<devices.length-1 ? '1px solid var(--border)' : 'none', flexWrap:'wrap', gap:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:32, height:32, borderRadius:6, background:'rgba(255,255,255,.06)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:'.65rem', fontWeight:700, color:'var(--text)' }}>DEV</span>
                  </div>
                  <div>
                    <div style={{ color:'var(--heading)', fontWeight:500, fontSize:'.9rem' }}>{d.user_agent || 'Unknown browser'}</div>
                    <div style={{ fontSize:'.78rem', marginTop:2 }}>{d.location || 'Unknown'} · {d.ip} · {timeAgo(d.last_seen)}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => trustDevice(d.id, !d.trusted)} style={{
                    padding:'4px 12px', borderRadius:6, cursor:'pointer', fontSize:'.78rem', border:'none',
                    background: d.trusted ? 'rgba(0,255,136,.15)' : 'rgba(250,204,21,.15)',
                    color: d.trusted ? 'var(--green)' : '#facc15'
                  }}>{d.trusted ? '✓ Trusted' : 'Trust'}</button>
                  <button onClick={() => removeDevice(d.id)} style={{ padding:'4px 12px', borderRadius:6, cursor:'pointer', fontSize:'.78rem', background:'rgba(248,113,113,.1)', color:'#f87171', border:'1px solid rgba(248,113,113,.3)' }}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ACTIVITY ── */}
        {activeTab === 'activity' && (
          <div style={card}>
            <h3 style={{ color:'var(--heading)', fontWeight:600, marginBottom:20 }}>Login Activity</h3>
            {activity.length === 0 ? <Empty text="No activity yet" /> : activity.map((a,i) => <ActivityRow key={i} item={a} border={i<activity.length-1} />)}
          </div>
        )}

        {/* ── API KEYS ── */}
        {activeTab === 'api-keys' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={card}>
              <h3 style={{ color:'var(--heading)', fontWeight:600, marginBottom:8 }}>Your API Keys</h3>
              <p style={{ fontSize:'.85rem', marginBottom:20 }}>Use these keys to call the OTPGuard API from your own apps. <Link to="/docs" style={{ color:'var(--green)' }}>View API Docs →</Link></p>

              {/* Create new key */}
              <div style={{ display:'flex', gap:10, marginBottom:24 }}>
                <input value={newKeyName} onChange={e => setNewKeyName(e.target.value)}
                  placeholder="Key name e.g. Production"
                  style={{ flex:1, padding:'10px 14px', borderRadius:8, background:'var(--bg)', border:'1px solid var(--border)', color:'var(--heading)', outline:'none', fontSize:'.9rem' }}
                  onKeyDown={e => e.key==='Enter' && createApiKey()}
                />
                <button onClick={createApiKey} className="btn-primary" style={{ padding:'10px 20px', fontSize:'.9rem' }}>+ Create Key</button>
              </div>

              {/* Show newly created key once */}
              {createdKey && (
                <div style={{ background:'rgba(0,255,136,.07)', border:'1px solid rgba(0,255,136,.3)', borderRadius:8, padding:16, marginBottom:20 }}>
                  <div style={{ color:'var(--green)', fontWeight:600, marginBottom:8 }}>✓ Key created — copy it now, it won't be shown again</div>
                  <div style={{ fontFamily:'monospace', fontSize:'.9rem', color:'var(--heading)', background:'var(--bg)', padding:'10px 14px', borderRadius:6, wordBreak:'break-all' }}>{createdKey.key}</div>
                  <button onClick={() => { navigator.clipboard.writeText(createdKey.key); setMsg('Copied!') }}
                    style={{ marginTop:10, background:'none', border:'1px solid var(--green)', color:'var(--green)', padding:'6px 16px', borderRadius:6, cursor:'pointer', fontSize:'.82rem' }}>
                    Copy to clipboard
                  </button>
                </div>
              )}

              {apiKeys.length === 0 ? <Empty text="No API keys yet — create one above" /> : (
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid var(--border)' }}>
                      {['Name','Key','Last Used','Created','Action'].map(h => (
                        <th key={h} style={{ padding:'8px 12px', textAlign:'left', color:'var(--text)', fontWeight:600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map(k => (
                      <tr key={k.id} style={{ borderBottom:'1px solid var(--border)' }}>
                        <td style={{ padding:'12px', color:'var(--heading)', fontWeight:500 }}>{k.name}</td>
                        <td style={{ padding:'12px', fontFamily:'monospace', fontSize:'.82rem', color:'var(--text)' }}>{k.key_preview}</td>
                        <td style={{ padding:'12px', fontSize:'.82rem' }}>{k.last_used ? timeAgo(k.last_used) : 'Never'}</td>
                        <td style={{ padding:'12px', fontSize:'.82rem' }}>{new Date(k.created_at).toLocaleDateString()}</td>
                        <td style={{ padding:'12px' }}>
                          <button onClick={() => revokeKey(k.id)} style={{ background:'rgba(248,113,113,.1)', border:'1px solid rgba(248,113,113,.3)', color:'#f87171', padding:'4px 12px', borderRadius:6, cursor:'pointer', fontSize:'.78rem' }}>Revoke</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {msg && <p style={{ marginTop:12, fontSize:'.85rem', color:'var(--green)' }}>{msg}</p>}
            </div>
          </div>
        )}

        {/* ── SUBSCRIPTION ── */}
        {activeTab === 'subscription' && (
          <SubscriptionTab
            currentPlan={currentPlan}
            planDetails={planDetails}
            isTrial={isTrial}
            trialEnds={trialEnds}
            token={token}
            onUpgrade={refreshSub}
          />
        )}

        {/* ── SETTINGS ── */}
        {activeTab === 'settings' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={card}>
              <h3 style={{ color:'var(--heading)', fontWeight:600, marginBottom:20 }}>MFA Method</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {(profile?.available_mfa_methods || [
                  { val:'email', label:'Email OTP',        desc:'Receive codes via email' },
                  { val:'sms',   label:'SMS OTP',           desc:'Receive codes via SMS (requires phone number)' },
                  { val:'totp',  label:'Authenticator App', desc:'Google Authenticator / Authy' },
                ]).map(m => (
                  <label key={m.val} style={{
                    display:'flex', alignItems:'center', gap:14, padding:16, borderRadius:8, cursor:'pointer',
                    border:`1px solid ${profile?.mfa_method===m.val ? 'var(--green)' : 'var(--border)'}`,
                    background: profile?.mfa_method===m.val ? 'var(--green-dim)' : 'transparent', transition:'all .2s'
                  }}>
                    <input type="radio" name="method" value={m.val}
                      checked={profile?.mfa_method===m.val}
                      onChange={() => saveMFA('mfa_method', m.val)}
                      style={{ accentColor:'var(--green)' }} />
                    <div>
                      <div style={{ color:'var(--heading)', fontWeight:500 }}>{m.label}</div>
                      <div style={{ fontSize:'.8rem', marginTop:2 }}>{m.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              {msg && <p style={{ marginTop:12, fontSize:'.85rem', color:'var(--green)' }}>{msg}</p>}
            </div>

            <div style={card}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <div>
                  <h3 style={{ color:'var(--heading)', fontWeight:600 }}>Backup Codes</h3>
                  <p style={{ fontSize:'.85rem', marginTop:4 }}>Use these if you lose access to your MFA device</p>
                </div>
                <button className="btn-outline" style={{ padding:'8px 16px', fontSize:'.85rem' }}
                  onClick={() => { setCodesVisible(!codesVisible); if (!codesVisible) reloadCodes() }}>
                  {codesVisible ? 'Hide' : 'Show Codes'}
                </button>
              </div>
              {codesVisible && (
                codes.length === 0 ? <Empty text="No backup codes — they will be generated on first view" /> : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:10, marginTop:16 }}>
                    {codes.map(c => (
                      <div key={c} style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:6, padding:'8px 12px', fontFamily:'monospace', fontSize:'.9rem', color:'var(--green)', textAlign:'center' }}>{c}</div>
                    ))}
                  </div>
                )
              )}
              <p style={{ fontSize:'.8rem', marginTop:16, color:'#facc15' }}>Store these somewhere safe. Each code can only be used once.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SubscriptionTab({ currentPlan, planDetails, isTrial, trialEnds, token, onUpgrade }) {
  const [upgrading, setUpgrading] = useState(false)
  const [msg, setMsg] = useState('')

  const PLANS = [
    { id: 'starter',    name: 'Starter',    price: 'Free',          users: '50',       channels: ['Email'],              color: '#60a5fa' },
    { id: 'growth',     name: 'Growth',     price: 'KES 1,500/mo',  users: '1,000',    channels: ['Email', 'SMS'],        color: 'var(--green)' },
    { id: 'business',   name: 'Business',   price: 'KES 5,000/mo',  users: 'Unlimited', channels: ['Email', 'SMS', 'TOTP'], color: '#a78bfa' },
    { id: 'enterprise', name: 'Enterprise', price: 'Custom',        users: 'Unlimited', channels: ['All + SLA'],           color: '#facc15' },
  ]

  async function handleUpgrade(planId) {
    if (planId === 'enterprise') {
      window.location.href = 'mailto:hello@otpguard.co.ke?subject=Enterprise Plan Inquiry'
      return
    }
    if (planId === currentPlan) return
    setUpgrading(true); setMsg('')
    try {
      const r = await fetch(`${API}/subscription/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan_name: planId })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setMsg(`Switched to ${planId} plan successfully.`)
      if (onUpgrade) onUpgrade()
    } catch (e) { setMsg(e.message) }
    finally { setUpgrading(false) }
  }

  const daysLeft = trialEnds ? Math.max(0, Math.ceil((new Date(trialEnds) - new Date()) / 86400000)) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Current plan card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
        <h3 style={{ color: 'var(--heading)', fontWeight: 700, marginBottom: 16 }}>Current Plan</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--heading)', textTransform: 'capitalize', marginBottom: 4 }}>
              {currentPlan}
              {isTrial && daysLeft !== null && (
                <span style={{ marginLeft: 10, fontSize: '.75rem', color: '#fb923c', fontWeight: 600 }}>
                  Trial — {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                </span>
              )}
            </div>
            {planDetails && (
              <div style={{ fontSize: '.85rem', color: 'var(--text)' }}>
                {planDetails.max_users === -1 ? 'Unlimited users' : `Up to ${planDetails.max_users} users`}
                {' · '}
                {(planDetails.otp_channels || ['email']).join(', ').toUpperCase()} OTP
              </div>
            )}
          </div>
          <Link to="/#pricing" style={{ fontSize: '.85rem', color: 'var(--green)', textDecoration: 'none', fontWeight: 600, padding: '8px 16px', border: '1px solid rgba(0,255,136,.3)', borderRadius: 8 }}>
            View All Plans
          </Link>
        </div>
      </div>

      {/* Plan comparison */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
        <h3 style={{ color: 'var(--heading)', fontWeight: 700, marginBottom: 16 }}>Available Plans</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
          {PLANS.map(p => {
            const isCurrent = p.id === currentPlan
            return (
              <div key={p.id} style={{
                border: `1px solid ${isCurrent ? p.color : 'var(--border)'}`,
                borderRadius: 10, padding: 18,
                background: isCurrent ? `${p.color}10` : 'var(--bg)',
                position: 'relative',
              }}>
                {isCurrent && (
                  <div style={{ position: 'absolute', top: -10, left: 16, background: p.color, color: '#0a0e1a', fontSize: '.65rem', fontWeight: 800, padding: '2px 10px', borderRadius: 20 }}>CURRENT</div>
                )}
                <div style={{ fontWeight: 800, color: 'var(--heading)', marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: '.85rem', color: p.color, fontWeight: 700, marginBottom: 10 }}>{p.price}</div>
                <div style={{ fontSize: '.78rem', color: 'var(--text)', marginBottom: 4 }}>{p.users} users</div>
                <div style={{ fontSize: '.78rem', color: 'var(--text)', marginBottom: 14 }}>{p.channels.join(' + ')}</div>
                <button
                  onClick={() => handleUpgrade(p.id)}
                  disabled={isCurrent || upgrading}
                  style={{
                    width: '100%', padding: '8px', borderRadius: 8, border: 'none', cursor: isCurrent ? 'default' : 'pointer',
                    background: isCurrent ? 'rgba(255,255,255,.06)' : p.color,
                    color: isCurrent ? 'var(--text)' : '#0a0e1a',
                    fontWeight: 700, fontSize: '.8rem', opacity: upgrading ? .6 : 1,
                  }}
                >
                  {isCurrent ? 'Active' : p.id === 'enterprise' ? 'Contact Us' : 'Switch'}
                </button>
              </div>
            )
          })}
        </div>
        {msg && <p style={{ marginTop: 14, fontSize: '.85rem', color: msg.includes('success') ? 'var(--green)' : '#f87171' }}>{msg}</p>}
      </div>
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width:52, height:28, borderRadius:14, border:'none', cursor:'pointer',
      background: value ? 'var(--green)' : 'var(--border)',
      position:'relative', transition:'background .2s', flexShrink:0
    }}>
      <span style={{ position:'absolute', top:3, left: value ? 26 : 3, width:22, height:22, borderRadius:'50%', background: value ? '#0a0e1a' : 'var(--text)', transition:'left .2s' }}/>
    </button>
  )
}

function ActivityRow({ item, border }) {
  const statusColor = { verified:'var(--green)', failed:'#f87171', expired:'#facc15', pending:'var(--blue)' }
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom: border ? '1px solid var(--border)' : 'none', flexWrap:'wrap', gap:8 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:8, height:8, borderRadius:'50%', background: statusColor[item.status] || 'var(--text)', flexShrink:0 }} />
        <div>
          <div style={{ color:'var(--heading)', fontSize:'.88rem', fontWeight:500 }}>
            OTP {item.status} via {item.method?.toUpperCase()}
          </div>
          <div style={{ fontSize:'.78rem', marginTop:2 }}>{item.ip_address || 'Unknown IP'}</div>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:'.75rem', padding:'2px 8px', borderRadius:10, background:`${statusColor[item.status]}20`, color:statusColor[item.status] }}>{item.status}</span>
        <span style={{ fontSize:'.78rem', opacity:.6 }}>{timeAgo(item.timestamp)}</span>
      </div>
    </div>
  )
}

function Empty({ text }) {
  return <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text)', fontSize:'.9rem', opacity:.6 }}>{text}</div>
}

function timeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff/60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m/60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h/24)}d ago`
}

