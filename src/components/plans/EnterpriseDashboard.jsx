import MetricCard from '../dashboard/widgets/MetricCard'
import ActivityTable from '../dashboard/widgets/ActivityTable'

export default function EnterpriseDashboard() {
  const metrics = { totalUsers: 125456, uptime: 99.99, avgResponseTime: 45, totalOTPs: 1200000, smsCost: 234567, successRate: 98.2 }

  const systemHealth = [
    { name: 'API Gateway',   uptime: '99.99%', responseTime: '42ms' },
    { name: 'Database',      uptime: '100%',   connections: 234 },
    { name: 'SMS Provider',  uptime: '99.95%', queue: 12 },
    { name: 'Email Service', uptime: '99.98%', queue: 45 },
  ]

  const slaMetrics = [
    { metric: 'Uptime',          target: '99.9%',  actual: '99.99%', exceeding: true },
    { metric: 'Response Time',   target: '<100ms', actual: '45ms',   exceeding: true },
    { metric: 'Error Rate',      target: '<0.1%',  actual: '0.03%',  exceeding: false },
    { metric: 'Support Response',target: '<1hr',   actual: '23min',  exceeding: true },
  ]

  const teamMembers = [
    { name: 'John Doe',    role: 'Admin',     email: 'john@acme.com', lastActive: '5 min ago' },
    { name: 'Jane Smith',  role: 'Developer', email: 'jane@acme.com', lastActive: '2 hrs ago' },
    { name: 'Bob Johnson', role: 'Viewer',    email: 'bob@acme.com',  lastActive: '1 day ago' },
  ]

  const auditLogs = [
    { time: '2 min ago',   user: 'admin@acme.com', action: 'API Key Created',   ip: '197.232.xxx.xxx' },
    { time: '15 min ago',  user: 'dev@acme.com',   action: 'Settings Updated',  ip: '197.232.xxx.xxx' },
    { time: '1 hour ago',  user: 'admin@acme.com', action: 'User Role Changed', ip: '197.232.xxx.xxx' },
    { time: '3 hours ago', user: 'dev@acme.com',   action: 'Integration Added', ip: '197.232.xxx.xxx' },
  ]

  const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ color: 'var(--heading)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Enterprise Dashboard</h1>
        <p style={{ fontSize: '.88rem' }}>Mission-critical MFA infrastructure monitoring and management</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
        <MetricCard title="Total Users"       value={metrics.totalUsers.toLocaleString()} icon="" trend="+2,345 this month" trendUp color="blue" />
        <MetricCard title="Uptime"            value={`${metrics.uptime}%`} icon="️" subtitle="SLA: 99.9%" badge="✓ On Track" color="green" />
        <MetricCard title="Avg Response"      value={`${metrics.avgResponseTime}ms`} icon="⚡" trend="-5ms" trendUp color="purple" />
        <MetricCard title="Total OTPs"        value={`${(metrics.totalOTPs / 1000000).toFixed(1)}M`} icon="" subtitle="This month" color="indigo" />
        <MetricCard title="SMS Cost"          value={`${metrics.smsCost.toLocaleString()} KES`} icon="" trend="+12%" trendUp={false} color="amber" />
        <MetricCard title="Success Rate"      value={`${metrics.successRate}%`} icon="✅" trend="+0.5%" trendUp color="emerald" />
      </div>

      {/* System Health */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ color: 'var(--heading)', fontWeight: 600 }}>Infrastructure Status</h3>
          <span style={{ background: 'rgba(0,255,136,.12)', color: 'var(--green)', padding: '4px 12px', borderRadius: 10, fontSize: '.75rem', fontWeight: 700 }}>
            ● All Systems Operational
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
          {systemHealth.map(s => (
            <div key={s.name} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '.88rem', color: 'var(--heading)', fontWeight: 600 }}>{s.name}</span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', marginTop: 4 }} />
              </div>
              <div style={{ fontSize: '.75rem', color: 'var(--text)' }}>Uptime: <strong style={{ color: 'var(--heading)' }}>{s.uptime}</strong></div>
              {s.responseTime && <div style={{ fontSize: '.75rem', color: 'var(--text)' }}>Response: <strong style={{ color: 'var(--heading)' }}>{s.responseTime}</strong></div>}
              {s.connections  && <div style={{ fontSize: '.75rem', color: 'var(--text)' }}>Connections: <strong style={{ color: 'var(--heading)' }}>{s.connections}</strong></div>}
              {s.queue !== undefined && <div style={{ fontSize: '.75rem', color: 'var(--text)' }}>Queue: <strong style={{ color: 'var(--heading)' }}>{s.queue}</strong></div>}
            </div>
          ))}
        </div>
      </div>

      {/* SLA */}
      <div style={card}>
        <h3 style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16 }}>SLA Performance (Last 30 Days)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
          {slaMetrics.map(m => (
            <div key={m.metric} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: '.82rem', color: 'var(--text)', marginBottom: 6 }}>{m.metric}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--heading)' }}>{m.actual}</div>
              <div style={{ fontSize: '.72rem', color: 'var(--text)', marginBottom: 6 }}>target: {m.target}</div>
              <span style={{ fontSize: '.72rem', fontWeight: 700, color: m.exceeding ? 'var(--green)' : 'var(--blue)' }}>
                {m.exceeding ? '↗ Exceeding' : '✓ Meeting'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ color: 'var(--heading)', fontWeight: 600 }}>Team & Roles</h3>
          <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '.82rem' }}>+ Add Member</button>
        </div>
        {teamMembers.map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg)', borderRadius: 8, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(99,102,241,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontWeight: 700, fontSize: '.85rem' }}>
                {m.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div style={{ fontSize: '.88rem', color: 'var(--heading)', fontWeight: 500 }}>{m.name}</div>
                <div style={{ fontSize: '.75rem' }}>{m.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ background: 'rgba(139,92,246,.15)', color: '#a78bfa', padding: '3px 10px', borderRadius: 10, fontSize: '.75rem', fontWeight: 600 }}>{m.role}</span>
              <span style={{ fontSize: '.75rem', opacity: .6 }}>{m.lastActive}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Audit Log */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ color: 'var(--heading)', fontWeight: 600 }}>Security Audit Log</h3>
          <button style={{ background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer', fontSize: '.85rem', fontWeight: 600 }}>Export All →</button>
        </div>
        <ActivityTable title="" columns={['Time','User','Action','IP Address']} data={auditLogs} searchable exportable pagination />
      </div>

      {/* White-Label */}
      <div style={{ background: 'rgba(250,204,21,.07)', border: '1px solid rgba(250,204,21,.25)', borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: '1.3rem' }}>️</span>
          <h3 style={{ color: 'var(--heading)', fontWeight: 600 }}>White-Label Active</h3>
        </div>
        <p style={{ fontSize: '.85rem', marginBottom: 12 }}>Your custom domain: <code style={{ color: 'var(--heading)', fontWeight: 700 }}>auth.acme.com</code></p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {['Custom Domain','No OTPGuard Branding','Custom Email Templates','Custom SMS Sender ID'].map(f => (
            <span key={f} style={{ background: 'rgba(255,255,255,.06)', color: 'var(--heading)', padding: '3px 12px', borderRadius: 20, fontSize: '.75rem', fontWeight: 600 }}>✓ {f}</span>
          ))}
        </div>
        <a href="/white-label" style={{ color: '#facc15', fontSize: '.85rem', textDecoration: 'none', fontWeight: 600 }}>Manage White-Label Settings →</a>
      </div>
    </div>
  )
}

