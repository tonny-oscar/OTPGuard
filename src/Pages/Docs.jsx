import { useState } from 'react'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'

const sections = [
  { id: 'overview', label: '📖 Overview' },
  { id: 'auth', label: '🔑 Authentication' },
  { id: 'send-otp', label: '📤 Send OTP' },
  { id: 'verify-otp', label: '✅ Verify OTP' },
  { id: 'resend-otp', label: '🔄 Resend OTP' },
  { id: 'errors', label: '⚠️ Error Codes' },
  { id: 'sdks', label: '📦 SDKs' },
]

const s = {
  page: { background: 'var(--bg)', minHeight: '100vh' },
  wrap: { display: 'flex', maxWidth: 1100, margin: '0 auto', padding: '60px 20px', gap: 40 },
  sidebar: {
    width: 220, flexShrink: 0, position: 'sticky', top: 80,
    alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: 4,
  },
  navItem: (active) => ({
    padding: '8px 14px', borderRadius: 8, fontSize: '.88rem', cursor: 'pointer',
    background: active ? 'var(--green-dim)' : 'transparent',
    color: active ? 'var(--green)' : 'var(--text)',
    border: active ? '1px solid rgba(0,255,136,.25)' : '1px solid transparent',
    textAlign: 'left', transition: 'all .15s',
  }),
  content: { flex: 1, minWidth: 0 },
  h1: { color: 'var(--heading)', fontWeight: 800, fontSize: '2rem', marginBottom: 8 },
  h2: { color: 'var(--heading)', fontWeight: 700, fontSize: '1.3rem', marginBottom: 16, marginTop: 40 },
  p: { color: 'var(--text)', lineHeight: 1.8, marginBottom: 16 },
  pre: {
    background: '#0a0e1a', border: '1px solid var(--border)', borderRadius: 10,
    padding: '20px 24px', overflowX: 'auto', marginBottom: 24,
    fontSize: '.85rem', lineHeight: 1.7,
  },
  code: { color: '#00ff88', fontFamily: 'monospace' },
  badge: (color) => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: 20,
    fontSize: '.75rem', fontWeight: 700, marginRight: 8,
    background: color === 'green' ? 'var(--green-dim)' : color === 'blue' ? 'var(--blue-dim)' : 'rgba(239,68,68,.15)',
    color: color === 'green' ? 'var(--green)' : color === 'blue' ? 'var(--blue)' : '#f87171',
    border: `1px solid ${color === 'green' ? 'rgba(0,255,136,.3)' : color === 'blue' ? 'rgba(59,130,246,.3)' : 'rgba(239,68,68,.3)'}`,
  }),
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: 24, fontSize: '.88rem' },
  th: { textAlign: 'left', padding: '10px 14px', borderBottom: '1px solid var(--border)', color: 'var(--heading)', fontWeight: 600 },
  td: { padding: '10px 14px', borderBottom: '1px solid var(--border)', color: 'var(--text)', verticalAlign: 'top' },
  divider: { border: 'none', borderTop: '1px solid var(--border)', margin: '40px 0' },
}

function Code({ children }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(children.trim())
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div style={{ position: 'relative' }}>
      <pre style={s.pre}>
        <code style={s.code}>{children.trim()}</code>
      </pre>
      <button onClick={copy} style={{
        position: 'absolute', top: 10, right: 12, background: 'var(--border)',
        border: 'none', color: copied ? 'var(--green)' : 'var(--text)',
        borderRadius: 6, padding: '3px 10px', fontSize: '.75rem', cursor: 'pointer',
      }}>{copied ? 'Copied!' : 'Copy'}</button>
    </div>
  )
}

function Overview() {
  return (
    <>
      <h1 style={s.h1}>OTPGuard API Docs</h1>
      <p style={s.p}>
        The OTPGuard REST API lets you send, verify, and manage one-time passwords via SMS and Email.
        All requests are made over HTTPS to the base URL:
      </p>
      <Code>{`https://api.otpguard.co.ke/v1`}</Code>
      <p style={s.p}>Responses are JSON. All timestamps are ISO 8601 UTC.</p>
      <hr style={s.divider} />
      <h2 style={{ ...s.h2, marginTop: 0 }}>Quick Start</h2>
      <p style={s.p}>1. Grab your API key from the <strong style={{ color: 'var(--heading)' }}>Dashboard → Settings → API Keys</strong>.</p>
      <p style={s.p}>2. Send your first OTP:</p>
      <Code>{`curl -X POST https://api.otpguard.co.ke/v1/otp/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"channel":"sms","recipient":"+254700000000"}'`}</Code>
      <p style={s.p}>3. Verify the code your user enters:</p>
      <Code>{`curl -X POST https://api.otpguard.co.ke/v1/otp/verify \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"otp_id":"otp_abc123","code":"847291"}'`}</Code>
    </>
  )
}

function Auth() {
  return (
    <>
      <h1 style={s.h1}>Authentication</h1>
      <p style={s.p}>
        OTPGuard uses Bearer token authentication. Include your API key in every request header:
      </p>
      <Code>{`Authorization: Bearer YOUR_API_KEY`}</Code>
      <p style={s.p}>
        API keys are scoped per project. You can create multiple keys with different permission levels
        from your dashboard. Never expose your API key in client-side code.
      </p>
      <h2 style={s.h2}>Key Permissions</h2>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Scope</th>
            <th style={s.th}>Description</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['otp:send', 'Send OTP to a recipient'],
            ['otp:verify', 'Verify a submitted OTP code'],
            ['otp:read', 'Read OTP logs and analytics'],
            ['admin', 'Full access including key management'],
          ].map(([scope, desc]) => (
            <tr key={scope}>
              <td style={s.td}><code style={{ ...s.code, fontSize: '.82rem' }}>{scope}</code></td>
              <td style={s.td}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

function SendOTP() {
  return (
    <>
      <h1 style={s.h1}>Send OTP</h1>
      <div style={{ marginBottom: 20 }}>
        <span style={s.badge('green')}>POST</span>
        <code style={{ ...s.code, fontSize: '.9rem' }}>/v1/otp/send</code>
      </div>
      <p style={s.p}>Generates and delivers a one-time password to the specified recipient.</p>
      <h2 style={s.h2}>Request Body</h2>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Field</th>
            <th style={s.th}>Type</th>
            <th style={s.th}>Required</th>
            <th style={s.th}>Description</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['channel', 'string', 'Yes', '"sms" or "email"'],
            ['recipient', 'string', 'Yes', 'Phone (+254...) or email address'],
            ['expires_in', 'integer', 'No', 'TTL in seconds. Default: 300'],
            ['length', 'integer', 'No', 'OTP digit length (4–8). Default: 6'],
            ['template', 'string', 'No', 'Custom message template. Use {{code}} placeholder'],
          ].map(([f, t, r, d]) => (
            <tr key={f}>
              <td style={s.td}><code style={{ ...s.code, fontSize: '.82rem' }}>{f}</code></td>
              <td style={s.td}>{t}</td>
              <td style={s.td}><span style={s.badge(r === 'Yes' ? 'red' : 'blue')}>{r}</span></td>
              <td style={s.td}>{d}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 style={s.h2}>Example Request</h2>
      <Code>{`curl -X POST https://api.otpguard.co.ke/v1/otp/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "channel": "sms",
    "recipient": "+254700000000",
    "expires_in": 120,
    "length": 6
  }'`}</Code>
      <h2 style={s.h2}>Response</h2>
      <Code>{`{
  "success": true,
  "otp_id": "otp_abc123xyz",
  "channel": "sms",
  "expires_at": "2025-01-01T12:02:00Z"
}`}</Code>
    </>
  )
}

function VerifyOTP() {
  return (
    <>
      <h1 style={s.h1}>Verify OTP</h1>
      <div style={{ marginBottom: 20 }}>
        <span style={s.badge('green')}>POST</span>
        <code style={{ ...s.code, fontSize: '.9rem' }}>/v1/otp/verify</code>
      </div>
      <p style={s.p}>Validates the code entered by the user against the issued OTP.</p>
      <h2 style={s.h2}>Request Body</h2>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Field</th>
            <th style={s.th}>Type</th>
            <th style={s.th}>Required</th>
            <th style={s.th}>Description</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['otp_id', 'string', 'Yes', 'ID returned from /otp/send'],
            ['code', 'string', 'Yes', 'The code entered by the user'],
          ].map(([f, t, r, d]) => (
            <tr key={f}>
              <td style={s.td}><code style={{ ...s.code, fontSize: '.82rem' }}>{f}</code></td>
              <td style={s.td}>{t}</td>
              <td style={s.td}><span style={s.badge('red')}>{r}</span></td>
              <td style={s.td}>{d}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 style={s.h2}>Example Request</h2>
      <Code>{`curl -X POST https://api.otpguard.co.ke/v1/otp/verify \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "otp_id": "otp_abc123xyz",
    "code": "847291"
  }'`}</Code>
      <h2 style={s.h2}>Response</h2>
      <Code>{`{
  "success": true,
  "verified": true,
  "otp_id": "otp_abc123xyz"
}`}</Code>
      <p style={s.p}>If the code is wrong or expired, <code style={s.code}>verified</code> will be <code style={s.code}>false</code> and an error code is returned.</p>
    </>
  )
}

function ResendOTP() {
  return (
    <>
      <h1 style={s.h1}>Resend OTP</h1>
      <div style={{ marginBottom: 20 }}>
        <span style={s.badge('green')}>POST</span>
        <code style={{ ...s.code, fontSize: '.9rem' }}>/v1/otp/resend</code>
      </div>
      <p style={s.p}>Issues a new OTP to the same recipient, invalidating the previous one. Rate-limited to 3 resends per 10 minutes.</p>
      <h2 style={s.h2}>Request Body</h2>
      <Code>{`{
  "otp_id": "otp_abc123xyz"
}`}</Code>
      <h2 style={s.h2}>Response</h2>
      <Code>{`{
  "success": true,
  "otp_id": "otp_new456abc",
  "expires_at": "2025-01-01T12:07:00Z"
}`}</Code>
    </>
  )
}

function Errors() {
  const codes = [
    ['400', 'bad_request', 'Missing or invalid request fields'],
    ['401', 'unauthorized', 'Invalid or missing API key'],
    ['403', 'forbidden', 'API key lacks required scope'],
    ['404', 'not_found', 'OTP ID does not exist'],
    ['410', 'otp_expired', 'OTP has expired'],
    ['422', 'otp_invalid', 'Code does not match'],
    ['429', 'rate_limited', 'Too many requests'],
    ['500', 'server_error', 'Internal server error'],
  ]
  return (
    <>
      <h1 style={s.h1}>Error Codes</h1>
      <p style={s.p}>All errors follow this shape:</p>
      <Code>{`{
  "success": false,
  "error": {
    "code": "otp_expired",
    "message": "The OTP has expired. Please request a new one."
  }
}`}</Code>
      <h2 style={s.h2}>Reference</h2>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>HTTP</th>
            <th style={s.th}>Code</th>
            <th style={s.th}>Meaning</th>
          </tr>
        </thead>
        <tbody>
          {codes.map(([http, code, meaning]) => (
            <tr key={code}>
              <td style={s.td}><span style={s.badge(http.startsWith('2') ? 'green' : http.startsWith('4') ? 'red' : 'blue')}>{http}</span></td>
              <td style={s.td}><code style={{ ...s.code, fontSize: '.82rem' }}>{code}</code></td>
              <td style={s.td}>{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

function SDKs() {
  return (
    <>
      <h1 style={s.h1}>SDKs & Libraries</h1>
      <p style={s.p}>Official SDKs are coming soon. In the meantime, use the REST API directly or one of these community wrappers.</p>
      <h2 style={s.h2}>Node.js</h2>
      <Code>{`npm install otpguard`}</Code>
      <Code>{`import OTPGuard from 'otpguard'

const client = new OTPGuard('YOUR_API_KEY')

const { otp_id } = await client.send({
  channel: 'sms',
  recipient: '+254700000000',
})

const { verified } = await client.verify({ otp_id, code: '847291' })`}</Code>
      <h2 style={s.h2}>Python</h2>
      <Code>{`pip install otpguard`}</Code>
      <Code>{`from otpguard import OTPGuard

client = OTPGuard("YOUR_API_KEY")

result = client.send(channel="email", recipient="user@example.com")
verify = client.verify(otp_id=result["otp_id"], code="847291")`}</Code>
      <h2 style={s.h2}>PHP</h2>
      <Code>{`composer require otpguard/php-sdk`}</Code>
      <Code>{`$client = new OTPGuard\\Client('YOUR_API_KEY');
$result = $client->send(['channel' => 'sms', 'recipient' => '+254700000000']);
$verify = $client->verify(['otp_id' => $result['otp_id'], 'code' => '847291']);`}</Code>
    </>
  )
}

const views = { overview: Overview, auth: Auth, 'send-otp': SendOTP, 'verify-otp': VerifyOTP, 'resend-otp': ResendOTP, errors: Errors, sdks: SDKs }

export default function Docs() {
  const [active, setActive] = useState('overview')
  const View = views[active]

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.wrap}>
        <nav style={s.sidebar}>
          <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text)', letterSpacing: 1, marginBottom: 8, paddingLeft: 14 }}>DOCUMENTATION</div>
          {sections.map(sec => (
            <button key={sec.id} style={s.navItem(active === sec.id)} onClick={() => setActive(sec.id)}>
              {sec.label}
            </button>
          ))}
          <hr style={{ ...s.divider, margin: '16px 0' }} />
          <a href="mailto:hello@otpguard.co.ke" style={{ ...s.navItem(false), textDecoration: 'none', display: 'block' }}>
            💬 Get Support
          </a>
        </nav>
        <main style={s.content}>
          <View />
        </main>
      </div>
      <Footer />
    </div>
  )
}
