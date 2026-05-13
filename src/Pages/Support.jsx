import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth, API } from '../context/AuthContext'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'

// ── Design tokens ──────────────────────────────────────────────────────────
const STATUS = {
  open:        { bg: 'rgba(59,130,246,.15)',  color: '#3b82f6',  label: 'Open' },
  in_progress: { bg: 'rgba(250,204,21,.15)',  color: '#facc15',  label: 'In Progress' },
  waiting:     { bg: 'rgba(168,85,247,.15)',  color: '#a855f7',  label: 'Waiting' },
  resolved:    { bg: 'rgba(0,255,136,.15)',   color: '#00ff88',  label: 'Resolved' },
  closed:      { bg: 'rgba(100,116,139,.15)', color: '#64748b',  label: 'Closed' },
}
const PRIORITY = {
  low:    { color: '#64748b', bg: 'rgba(100,116,139,.12)' },
  medium: { color: '#3b82f6', bg: 'rgba(59,130,246,.12)' },
  high:   { color: '#fb923c', bg: 'rgba(251,146,60,.12)' },
  urgent: { color: '#f87171', bg: 'rgba(248,113,113,.12)' },
}

function StatusBadge({ s }) {
  const c = STATUS[s] || STATUS.open
  return <span style={{ background: c.bg, color: c.color, borderRadius: 20, padding: '2px 10px', fontSize: '.7rem', fontWeight: 700 }}>{c.label}</span>
}
function PriorityBadge({ p }) {
  const c = PRIORITY[p] || PRIORITY.medium
  return <span style={{ background: c.bg, color: c.color, borderRadius: 20, padding: '2px 9px', fontSize: '.7rem', fontWeight: 700, textTransform: 'capitalize' }}>{p}</span>
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: 'var(--bg)', border: '1px solid var(--border)',
  borderRadius: 10, padding: '10px 14px',
  color: 'var(--heading)', fontSize: '.9rem', outline: 'none',
  fontFamily: 'inherit', transition: 'border-color .2s',
}
const labelStyle = { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }
const labelText  = { fontSize: '.78rem', color: 'var(--text)', fontWeight: 600 }

function Field({ label, required, children }) {
  return (
    <label style={labelStyle}>
      <span style={labelText}>{label}{required && <span style={{ color: '#f87171' }}> *</span>}</span>
      {children}
    </label>
  )
}

// ── Spinner ────────────────────────────────────────────────────────────────
function Spin({ size = 24 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', border: '2px solid rgba(0,255,136,.15)', borderTopColor: 'var(--green)', animation: 'spin .7s linear infinite', flexShrink: 0 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  KNOWLEDGE BASE
// ─────────────────────────────────────────────────────────────────────────────
function ArticleModal({ article, onClose, onVote }) {
  const [voted, setVoted] = useState(null)
  if (!article) return null

  function renderMd(text) {
    return (text || '').split('\n').map((line, i) => {
      if (line.startsWith('# '))   return <h1 key={i} style={{ color: 'var(--heading)', fontSize: '1.4rem', fontWeight: 800, margin: '24px 0 10px' }}>{line.slice(2)}</h1>
      if (line.startsWith('## '))  return <h2 key={i} style={{ color: 'var(--heading)', fontSize: '1.1rem', fontWeight: 700, margin: '18px 0 8px' }}>{line.slice(3)}</h2>
      if (line.startsWith('### ')) return <h3 key={i} style={{ color: 'var(--heading)', fontSize: '.95rem', fontWeight: 700, margin: '14px 0 6px' }}>{line.slice(4)}</h3>
      if (line.startsWith('- '))   return <li key={i} style={{ color: 'var(--text)', fontSize: '.88rem', lineHeight: 1.7, marginLeft: 20 }}>{line.slice(2)}</li>
      if (line.startsWith('```'))  return null
      if (!line.trim())            return <br key={i} />
      return <p key={i} style={{ color: 'var(--text)', fontSize: '.88rem', lineHeight: 1.7, margin: '4px 0' }}>{line}</p>
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, width: '100%', maxWidth: 700, maxHeight: '88vh', overflow: 'auto', padding: '36px 36px 28px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <h2 style={{ color: 'var(--heading)', fontSize: '1.3rem', fontWeight: 800, margin: 0, flex: 1, paddingRight: 16, lineHeight: 1.3 }}>{article.title}</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.06)', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', color: 'var(--text)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
        </div>
        <div>{renderMd(article.content)}</div>
        <div style={{ marginTop: 32, padding: 20, background: 'rgba(0,255,136,.04)', border: '1px solid rgba(0,255,136,.1)', borderRadius: 12, textAlign: 'center' }}>
          <p style={{ fontSize: '.85rem', color: 'var(--text)', marginBottom: 12 }}>Was this article helpful?</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {[['👍', true, 'yes', article.helpful_count], ['👎', false, 'no', article.not_helpful_count]].map(([icon, helpful, key, count]) => (
              <button key={key} onClick={() => { if (!voted) { setVoted(key); onVote(article.id, helpful) } }}
                style={{ background: voted === key ? (helpful ? 'rgba(0,255,136,.2)' : 'rgba(248,113,113,.12)') : 'var(--border)', border: `1px solid ${voted === key ? (helpful ? 'rgba(0,255,136,.4)' : 'rgba(248,113,113,.3)') : 'transparent'}`, color: voted === key ? (helpful ? 'var(--green)' : '#f87171') : 'var(--text)', borderRadius: 8, padding: '8px 20px', cursor: voted ? 'default' : 'pointer', fontSize: '.85rem', transition: 'all .2s' }}>
                {icon} {count ?? 0}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function HelpCenterSection({ onSubmitTicket }) {
  const [categories, setCategories]     = useState([])
  const [articles, setArticles]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [search, setSearch]             = useState('')
  const [activeCategory, setActiveCat]  = useState(null)
  const [selectedArticle, setSelected]  = useState(null)
  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  const loadArticles = useCallback((q = '', catId = null) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q)     params.set('search', q)
    if (catId) params.set('category_id', catId)
    fetch(`${API}/support/kb/articles?${params}`)
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json() })
      .then(d => { setArticles(d.articles || []); setError(null) })
      .catch(() => setError('Could not load articles. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    Promise.all([
      fetch(`${API}/support/kb/categories`).then(r => r.json()),
    ]).then(([cats]) => {
      setCategories(cats.categories || [])
    }).catch(() => setError('Could not connect to support API'))
    loadArticles()
  }, [loadArticles])

  function handleSearch(val) {
    setSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => loadArticles(val, activeCategory?.id), 350)
  }

  function openArticle(a) {
    fetch(`${API}/support/kb/articles/${a.slug}`)
      .then(r => r.json()).then(d => setSelected(d.article)).catch(() => setSelected(a))
  }

  function handleVote(id, helpful) {
    fetch(`${API}/support/kb/articles/${id}/vote`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ helpful }),
    }).catch(() => {})
  }

  return (
    <div>
      {/* Search hero */}
      <div style={{ textAlign: 'center', padding: '40px 0 36px', borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
        <h1 style={{ color: 'var(--heading)', fontSize: '1.8rem', fontWeight: 900, marginBottom: 8, letterSpacing: '-.02em' }}>
          How can we <span style={{ color: 'var(--green)' }}>help?</span>
        </h1>
        <p style={{ color: 'var(--text)', fontSize: '.9rem', marginBottom: 24 }}>Search our knowledge base or browse by category below.</p>
        <div style={{ position: 'relative', maxWidth: 540, margin: '0 auto' }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', pointerEvents: 'none', color: 'var(--text)' }}>🔍</span>
          <input
            ref={searchRef} value={search} onChange={e => handleSearch(e.target.value)}
            placeholder="Search articles, guides, FAQs…"
            style={{ ...inputStyle, paddingLeft: 46, fontSize: '1rem', borderRadius: 14, padding: '13px 16px 13px 46px' }}
            onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,.5)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <div style={{ display: 'flex', gap: 28, justifyContent: 'center', marginTop: 20 }}>
          {[
            { v: `${categories.reduce((s, c) => s + (c.article_count || 0), 0)}`, l: 'Articles' },
            { v: '< 2hr', l: 'Avg Response' },
            { v: '98%', l: 'Satisfaction' },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--green)' }}>{s.v}</div>
              <div style={{ fontSize: '.68rem', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#f87171', fontSize: '.85rem' }}>
          ⚠ {error}
        </div>
      )}

      {/* Categories */}
      {!search && (
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ color: 'var(--heading)', fontWeight: 700, fontSize: '.95rem', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Browse by Category</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: 10 }}>
            {categories.map(cat => (
              <motion.button key={cat.id} whileHover={{ y: -2 }} whileTap={{ scale: .97 }}
                onClick={() => { setActiveCat(activeCategory?.id === cat.id ? null : cat); loadArticles(search, activeCategory?.id === cat.id ? null : cat.id) }}
                style={{ background: activeCategory?.id === cat.id ? 'linear-gradient(135deg,rgba(0,255,136,.15),rgba(0,255,136,.05))' : 'var(--surface)', border: `1px solid ${activeCategory?.id === cat.id ? 'rgba(0,255,136,.4)' : 'var(--border)'}`, borderRadius: 12, padding: '16px 14px', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{cat.icon}</div>
                <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--heading)', marginBottom: 3 }}>{cat.name}</div>
                <div style={{ fontSize: '.7rem', color: 'var(--green)' }}>{cat.article_count} article{cat.article_count !== 1 ? 's' : ''}</div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Articles */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ color: 'var(--heading)', fontWeight: 700, fontSize: '.95rem', textTransform: 'uppercase', letterSpacing: 1 }}>
            {search ? `Results for "${search}"` : activeCategory ? activeCategory.name : 'Featured Articles'}
          </h2>
          {activeCategory && (
            <button onClick={() => { setActiveCat(null); loadArticles(search, null) }} style={{ background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer', fontSize: '.8rem' }}>Clear ✕</button>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spin /></div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 0', color: 'var(--text)', opacity: .5 }}>
            <div style={{ fontSize: '2rem', marginBottom: 10 }}>🔍</div>
            <div>No articles found{search ? ` for "${search}"` : ''}.</div>
            <button onClick={onSubmitTicket} style={{ marginTop: 14, background: 'none', border: '1px solid rgba(0,255,136,.3)', color: 'var(--green)', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontSize: '.82rem' }}>Submit a ticket instead →</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
            {articles.map(a => (
              <motion.div key={a.id} whileHover={{ borderColor: 'rgba(0,255,136,.3)', y: -2 }}
                onClick={() => openArticle(a)}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, cursor: 'pointer', transition: 'all .2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <h3 style={{ color: 'var(--heading)', fontSize: '.88rem', fontWeight: 700, margin: 0, lineHeight: 1.3, flex: 1 }}>{a.title}</h3>
                  {a.is_featured && <span style={{ background: 'rgba(0,255,136,.1)', color: 'var(--green)', borderRadius: 20, padding: '2px 8px', fontSize: '.62rem', fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>Featured</span>}
                </div>
                <p style={{ color: 'var(--text)', fontSize: '.78rem', lineHeight: 1.5, margin: '0 0 10px' }}>{a.excerpt}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  {a.tags?.slice(0, 2).map(t => <span key={t} style={{ background: 'var(--border)', color: 'var(--text)', borderRadius: 20, padding: '2px 8px', fontSize: '.65rem' }}>{t}</span>)}
                  <span style={{ marginLeft: 'auto', fontSize: '.68rem', color: 'var(--text)', opacity: .5 }}>👁 {a.view_count}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedArticle && <ArticleModal article={selectedArticle} onClose={() => setSelected(null)} onVote={handleVote} />}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  SUBMIT TICKET
// ─────────────────────────────────────────────────────────────────────────────
function SubmitTicketSection({ user, token, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', category: 'general', priority: 'medium' })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult]         = useState(null)
  const [error, setError]           = useState(null)

  // Auto-fill when user loads
  useEffect(() => {
    if (user) setForm(f => ({ ...f, name: f.name || user.full_name || '', email: f.email || user.email || '' }))
  }, [user])

  const CATEGORIES = ['general', 'billing', 'technical', 'account', 'security', 'api']
  const PRIORITIES = [
    { v: 'low', l: 'Low', sub: 'Cosmetic / informational' },
    { v: 'medium', l: 'Medium', sub: 'Feature or usage question' },
    { v: 'high', l: 'High', sub: 'Service partially impaired' },
    { v: 'urgent', l: 'Urgent 🔴', sub: 'Total outage / security breach' },
  ]

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null); setSubmitting(true)
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const r = await fetch(`${API}/support/tickets`, { method: 'POST', headers, body: JSON.stringify(form) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed to submit')
      setResult(d)
      onSuccess?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (result) return (
    <motion.div initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }}
      style={{ maxWidth: 520, margin: '60px auto', textAlign: 'center', padding: 40, background: 'var(--surface)', border: '1px solid rgba(0,255,136,.2)', borderRadius: 20 }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,255,136,.12)', border: '2px solid rgba(0,255,136,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 20px' }}>✅</div>
      <h2 style={{ color: 'var(--heading)', fontWeight: 800, fontSize: '1.3rem', marginBottom: 8 }}>Ticket Created!</h2>
      <p style={{ color: 'var(--text)', fontSize: '.88rem', marginBottom: 20 }}>We've received your request and will respond within 24 hours.</p>
      <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '14px 20px', marginBottom: 24, display: 'inline-block' }}>
        <div style={{ fontSize: '.72rem', color: 'var(--text)', marginBottom: 4 }}>Your ticket number</div>
        <div style={{ fontFamily: 'monospace', fontWeight: 900, color: 'var(--green)', fontSize: '1.4rem', letterSpacing: 2 }}>{result.ticket_number}</div>
      </div>
      <p style={{ color: 'var(--text)', fontSize: '.8rem', marginBottom: 20 }}>A confirmation email has been sent to <strong style={{ color: 'var(--heading)' }}>{form.email}</strong>.</p>
      <button onClick={() => setResult(null)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 20px', color: 'var(--text)', cursor: 'pointer', fontSize: '.85rem' }}>Submit Another Ticket</button>
    </motion.div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)', gap: 28, alignItems: 'start' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 32 }}>
        <h2 style={{ color: 'var(--heading)', fontWeight: 800, fontSize: '1.15rem', marginBottom: 4 }}>Submit a Support Ticket</h2>
        <p style={{ color: 'var(--text)', fontSize: '.82rem', marginBottom: 28 }}>Typical response time: under 2 hours on business days.</p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 0 }}>
            <Field label="Full Name" required>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Jane Doe" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </Field>
            <Field label="Email Address" required>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required type="email" placeholder="you@company.com" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </Field>
          </div>

          <Field label="Category">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, category: c }))}
                  style={{ padding: '5px 12px', borderRadius: 20, border: `1px solid ${form.category === c ? 'rgba(0,255,136,.5)' : 'var(--border)'}`, background: form.category === c ? 'rgba(0,255,136,.1)' : 'transparent', color: form.category === c ? 'var(--green)' : 'var(--text)', cursor: 'pointer', fontSize: '.78rem', fontWeight: form.category === c ? 700 : 400, textTransform: 'capitalize' }}>
                  {c}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Priority">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {PRIORITIES.map(p => (
                <button key={p.v} type="button" onClick={() => setForm(f => ({ ...f, priority: p.v }))}
                  style={{ padding: '8px 12px', borderRadius: 10, border: `1px solid ${form.priority === p.v ? PRIORITY[p.v]?.color + '66' : 'var(--border)'}`, background: form.priority === p.v ? PRIORITY[p.v]?.bg : 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ fontSize: '.8rem', fontWeight: 700, color: form.priority === p.v ? PRIORITY[p.v]?.color : 'var(--heading)' }}>{p.l}</div>
                  <div style={{ fontSize: '.67rem', color: 'var(--text)', marginTop: 1 }}>{p.sub}</div>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Subject" required>
            <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required placeholder="Brief summary of your issue" style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </Field>

          <label style={labelStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={labelText}>Message <span style={{ color: '#f87171' }}>*</span></span>
              <span style={{ fontSize: '.7rem', color: form.message.length > 4500 ? '#f87171' : 'var(--text)' }}>{form.message.length}/5000</span>
            </div>
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required rows={6}
              maxLength={5000} placeholder="Describe your issue in detail. Include any error messages, steps to reproduce, and what you expected to happen."
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </label>

          {error && <div style={{ color: '#f87171', fontSize: '.82rem', marginBottom: 14, padding: '10px 14px', background: 'rgba(248,113,113,.08)', borderRadius: 8, border: '1px solid rgba(248,113,113,.2)' }}>⚠ {error}</div>}

          <button type="submit" disabled={submitting} style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', background: submitting ? 'var(--border)' : 'linear-gradient(135deg,var(--green),#00cc6a)', color: '#0a0e1a', fontWeight: 800, fontSize: '.9rem', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {submitting ? <><Spin size={18} /> Submitting…</> : '🚀 Submit Ticket'}
          </button>
        </form>
      </div>

      {/* Side info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { icon: '⚡', h: 'Urgent Issues', b: 'For security or account lockout issues, mark as Urgent. We aim to respond within 4 hours.' },
          { icon: '📧', h: 'Email Confirmation', b: "We'll email your ticket number and any relevant KB articles automatically." },
          { icon: '🔍', h: 'Track Anytime', b: 'Use the Track Ticket tab with your ticket number + email to check status without an account.' },
          { icon: '🤖', h: 'Smart Suggestions', b: 'When you submit, our system searches the KB and attaches relevant articles to your ticket.' },
        ].map(item => (
          <div key={item.h} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{item.icon}</span>
            <div>
              <div style={{ color: 'var(--heading)', fontWeight: 700, fontSize: '.85rem', marginBottom: 3 }}>{item.h}</div>
              <div style={{ color: 'var(--text)', fontSize: '.78rem', lineHeight: 1.5 }}>{item.b}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  MY TICKETS + CONVERSATION VIEW
// ─────────────────────────────────────────────────────────────────────────────
function MyTicketsSection({ user, token }) {
  const [tickets, setTickets]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [selected, setSelected]     = useState(null)
  const [detail, setDetail]         = useState(null)
  const [detailLoading, setDL]      = useState(false)
  const [replyText, setReplyText]   = useState('')
  const [sending, setSending]       = useState(false)
  const bottomRef = useRef(null)
  const pollRef   = useRef(null)

  const authH = { Authorization: `Bearer ${token}` }

  const loadTickets = useCallback(() => {
    fetch(`${API}/support/tickets`, { headers: authH })
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json() })
      .then(d => { setTickets(d.tickets || []); setError(null) })
      .catch(() => setError('Could not load tickets'))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => { loadTickets() }, [loadTickets])

  const loadDetail = useCallback((tid) => {
    setDL(true)
    fetch(`${API}/support/tickets/${tid}`, { headers: authH })
      .then(r => r.json())
      .then(d => { setDetail(d.ticket); setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100) })
      .catch(() => {})
      .finally(() => setDL(false))
  }, [token])

  useEffect(() => {
    if (!selected) { clearInterval(pollRef.current); return }
    loadDetail(selected)
    pollRef.current = setInterval(() => loadDetail(selected), 4000)
    return () => clearInterval(pollRef.current)
  }, [selected, loadDetail])

  async function sendReply(e) {
    e.preventDefault()
    if (!replyText.trim()) return
    setSending(true)
    try {
      await fetch(`${API}/support/tickets/${selected}/reply`, {
        method: 'POST', headers: { ...authH, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText }),
      })
      setReplyText('')
      loadDetail(selected)
      loadTickets()
    } finally { setSending(false) }
  }

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔐</div>
      <p style={{ color: 'var(--text)', marginBottom: 16 }}>Log in to view your tickets.</p>
      <Link to="/login" style={{ background: 'var(--green)', color: '#0a0e1a', padding: '10px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: '.88rem' }}>Log In</Link>
    </div>
  )

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spin /></div>
  if (error)   return <div style={{ color: '#f87171', padding: 24, background: 'rgba(248,113,113,.08)', borderRadius: 10, border: '1px solid rgba(248,113,113,.2)' }}>⚠ {error}</div>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.5fr' : '1fr', gap: 20, alignItems: 'start' }}>
      {/* Ticket list */}
      <div>
        <h2 style={{ color: 'var(--heading)', fontWeight: 800, fontSize: '1rem', marginBottom: 16 }}>Your Tickets ({tickets.length})</h2>
        {tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text)', opacity: .5 }}>
            <div style={{ fontSize: '2rem', marginBottom: 10 }}>🎫</div>
            <div>No tickets yet.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tickets.map(t => (
              <motion.div key={t.id} whileHover={{ borderColor: 'rgba(0,255,136,.25)' }}
                onClick={() => setSelected(selected === t.id ? null : t.id)}
                style={{ background: selected === t.id ? 'linear-gradient(135deg,rgba(0,255,136,.06),transparent)' : 'var(--surface)', border: `1px solid ${selected === t.id ? 'rgba(0,255,136,.3)' : 'var(--border)'}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', transition: 'all .2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '.72rem', color: 'var(--green)', fontWeight: 700 }}>{t.ticket_number}</span>
                  <StatusBadge s={t.status} />
                </div>
                <div style={{ color: 'var(--heading)', fontSize: '.88rem', fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>{t.subject}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <PriorityBadge p={t.priority} />
                  <span style={{ fontSize: '.7rem', color: 'var(--text)', marginLeft: 'auto' }}>{t.message_count} msg · {new Date(t.updated_at).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Conversation panel */}
      <AnimatePresence>
        {selected && (
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, display: 'flex', flexDirection: 'column', minHeight: 460, maxHeight: '70vh' }}>
            {detailLoading && !detail ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}><Spin /></div>
            ) : detail ? (
              <>
                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
                  <div>
                    <div style={{ color: 'var(--heading)', fontWeight: 700, fontSize: '.92rem', lineHeight: 1.3, marginBottom: 6 }}>{detail.subject}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <StatusBadge s={detail.status} />
                      <PriorityBadge p={detail.priority} />
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '1rem', padding: '2px 6px' }}>✕</button>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(detail.messages || []).map(msg => (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: msg.sender_type === 'user' ? 'row-reverse' : 'row', gap: 10, alignItems: 'flex-end' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: msg.sender_type === 'agent' ? 'rgba(0,255,136,.15)' : msg.sender_type === 'system' ? 'rgba(59,130,246,.15)' : 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', fontWeight: 800, color: msg.sender_type === 'agent' ? 'var(--green)' : msg.sender_type === 'system' ? '#3b82f6' : 'var(--text)' }}>
                        {msg.sender_type === 'agent' ? '👨‍💼' : msg.sender_type === 'system' ? '🤖' : '👤'}
                      </div>
                      <div style={{ maxWidth: '78%' }}>
                        <div style={{ fontSize: '.67rem', color: 'var(--text)', marginBottom: 3, textAlign: msg.sender_type === 'user' ? 'right' : 'left' }}>
                          <strong>{msg.sender_name}</strong> · {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ background: msg.sender_type === 'user' ? 'rgba(0,255,136,.12)' : msg.sender_type === 'agent' ? 'rgba(59,130,246,.1)' : 'rgba(255,255,255,.04)', border: `1px solid ${msg.sender_type === 'user' ? 'rgba(0,255,136,.2)' : msg.sender_type === 'agent' ? 'rgba(59,130,246,.2)' : 'rgba(255,255,255,.06)'}`, borderRadius: 10, padding: '9px 13px', fontSize: '.84rem', color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Reply box */}
                {detail.status !== 'closed' && (
                  <form onSubmit={sendReply} style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0 }}>
                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={2}
                      placeholder="Type your reply…"
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(e) } }}
                      style={{ ...inputStyle, resize: 'none', flex: 1, padding: '9px 12px', fontSize: '.85rem' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,.4)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    <button type="submit" disabled={sending || !replyText.trim()} style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: 'var(--green)', color: '#0a0e1a', fontWeight: 700, cursor: 'pointer', fontSize: '.82rem', flexShrink: 0, opacity: (!replyText.trim() || sending) ? .5 : 1 }}>
                      {sending ? <Spin size={16} /> : 'Send'}
                    </button>
                  </form>
                )}
              </>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  TRACK TICKET (guest + logged-in)
// ─────────────────────────────────────────────────────────────────────────────
function TrackTicketSection({ user, token }) {
  const [num, setNum]           = useState('')
  const [email, setEmail]       = useState(user?.email || '')
  const [ticket, setTicket]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  useEffect(() => { if (user) setEmail(user.email || '') }, [user])

  async function lookup(e) {
    e.preventDefault()
    setError(null); setLoading(true); setTicket(null)
    try {
      const r = await fetch(`${API}/support/tickets/lookup`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_number: num.trim().toUpperCase(), email: email.trim().toLowerCase() }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Ticket not found')
      setTicket(d.ticket)
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 32, marginBottom: 20 }}>
        <h2 style={{ color: 'var(--heading)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 6 }}>Track Your Ticket</h2>
        <p style={{ color: 'var(--text)', fontSize: '.82rem', marginBottom: 24 }}>Enter the ticket number from your confirmation email and the email address you used.</p>
        <form onSubmit={lookup}>
          <Field label="Ticket Number" required>
            <input value={num} onChange={e => setNum(e.target.value.toUpperCase())} required placeholder="TKT-XXXXXXXX"
              style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: 2 }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </Field>
          <Field label="Email Address" required>
            <input value={email} onChange={e => setEmail(e.target.value)} required type="email" placeholder="Email you submitted with"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </Field>
          {error && <div style={{ color: '#f87171', fontSize: '.82rem', marginBottom: 14, padding: '10px 14px', background: 'rgba(248,113,113,.08)', borderRadius: 8 }}>⚠ {error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: loading ? 'var(--border)' : 'linear-gradient(135deg,var(--green),#00cc6a)', color: '#0a0e1a', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <><Spin size={18} /> Looking up…</> : '🔍 Find My Ticket'}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {ticket && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: 'monospace', color: 'var(--green)', fontWeight: 800, fontSize: '1rem', marginBottom: 4 }}>#{ticket.ticket_number}</div>
                <div style={{ color: 'var(--heading)', fontWeight: 700, fontSize: '.95rem' }}>{ticket.subject}</div>
              </div>
              <StatusBadge s={ticket.status} />
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, fontSize: '.75rem', color: 'var(--text)' }}>
              <PriorityBadge p={ticket.priority} />
              <span>Category: {ticket.category}</span>
              <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
              <span>{ticket.message_count} message{ticket.message_count !== 1 ? 's' : ''}</span>
            </div>

            {(ticket.messages || []).length > 0 && (
              <div>
                <div style={{ fontSize: '.72rem', color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Conversation</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ticket.messages.map((msg, i) => (
                    <div key={i} style={{ padding: '11px 14px', borderRadius: 10, background: msg.sender_type === 'agent' ? 'rgba(0,255,136,.06)' : msg.sender_type === 'system' ? 'rgba(59,130,246,.06)' : 'var(--bg)', border: `1px solid ${msg.sender_type === 'agent' ? 'rgba(0,255,136,.15)' : msg.sender_type === 'system' ? 'rgba(59,130,246,.15)' : 'var(--border)'}` }}>
                      <div style={{ fontSize: '.7rem', color: 'var(--text)', marginBottom: 5 }}>
                        <strong style={{ color: msg.sender_type === 'agent' ? 'var(--green)' : msg.sender_type === 'system' ? '#3b82f6' : 'var(--heading)' }}>{msg.sender_name}</strong>
                        {' · '}{new Date(msg.created_at).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '.84rem', color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{msg.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  LIVE CHAT
// ─────────────────────────────────────────────────────────────────────────────
const CHAT_KEY = 'otpguard_chat_session'

function LiveChatSection({ user, token }) {
  const [session, setSession]     = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(CHAT_KEY) || 'null') } catch { return null }
  })
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [sending, setSending]     = useState(false)
  const [status, setStatus]       = useState('open')
  const [startForm, setStartForm] = useState({ name: '', email: '', message: '' })
  const [starting, setStarting]   = useState(false)
  const [startError, setStartErr] = useState(null)
  const bottomRef  = useRef(null)
  const pollRef    = useRef(null)

  useEffect(() => {
    if (user) setStartForm(f => ({ ...f, name: f.name || user.full_name || '', email: f.email || user.email || '' }))
  }, [user])

  const pollMessages = useCallback(() => {
    if (!session) return
    fetch(`${API}/support/tickets/chat/${session.ticketNumber}/messages?email=${encodeURIComponent(session.email)}`)
      .then(r => r.json())
      .then(d => {
        setMessages(d.messages || [])
        setStatus(d.status || 'open')
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      }).catch(() => {})
  }, [session])

  useEffect(() => {
    if (!session) return
    pollMessages()
    pollRef.current = setInterval(pollMessages, 3000)
    return () => clearInterval(pollRef.current)
  }, [session, pollMessages])

  async function startChat(e) {
    e.preventDefault()
    setStartErr(null); setStarting(true)
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const r = await fetch(`${API}/support/tickets`, {
        method: 'POST', headers,
        body: JSON.stringify({
          name: startForm.name, email: startForm.email,
          subject: startForm.message.slice(0, 80) || 'Live Chat',
          message: startForm.message,
          category: 'general', priority: 'medium',
        }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed to start chat')
      const sess = { ticketNumber: d.ticket_number, email: startForm.email }
      sessionStorage.setItem(CHAT_KEY, JSON.stringify(sess))
      setSession(sess)
    } catch (err) {
      setStartErr(err.message)
    } finally { setStarting(false) }
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)
    try {
      await fetch(`${API}/support/tickets/chat/${session.ticketNumber}/reply`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.email, message: input.trim() }),
      })
      setInput('')
      pollMessages()
    } finally { setSending(false) }
  }

  function endChat() {
    sessionStorage.removeItem(CHAT_KEY)
    setSession(null); setMessages([])
  }

  // No active session — show start form
  if (!session) return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid rgba(0,255,136,.2)', borderRadius: 20, padding: 32 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,255,136,.12)', border: '2px solid rgba(0,255,136,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>💬</div>
          <div>
            <div style={{ color: 'var(--heading)', fontWeight: 700, fontSize: '1rem' }}>Chat with Support</div>
            <div style={{ color: 'var(--green)', fontSize: '.75rem', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', boxShadow: '0 0 6px var(--green)' }} />
              Online · Typically replies in minutes
            </div>
          </div>
        </div>

        <form onSubmit={startChat}>
          {!user && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Your Name" required>
                <input value={startForm.name} onChange={e => setStartForm(f => ({ ...f, name: e.target.value }))} required placeholder="Jane Doe" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </Field>
              <Field label="Email Address" required>
                <input value={startForm.email} onChange={e => setStartForm(f => ({ ...f, email: e.target.value }))} required type="email" placeholder="you@example.com" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </Field>
            </div>
          )}
          <Field label="How can we help you?" required>
            <textarea value={startForm.message} onChange={e => setStartForm(f => ({ ...f, message: e.target.value }))} required rows={4}
              placeholder="Describe your question or issue…"
              style={{ ...inputStyle, resize: 'none' }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </Field>
          {startError && <div style={{ color: '#f87171', fontSize: '.82rem', marginBottom: 14, padding: '10px 14px', background: 'rgba(248,113,113,.08)', borderRadius: 8 }}>⚠ {startError}</div>}
          <button type="submit" disabled={starting} style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: starting ? 'var(--border)' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)', color: '#fff', fontWeight: 800, fontSize: '.9rem', cursor: starting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {starting ? <><Spin size={18} /> Starting chat…</> : '💬 Start Chat'}
          </button>
        </form>
      </div>
    </div>
  )

  // Active chat session
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', height: '65vh', minHeight: 440 }}>
      {/* Chat header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px 16px 0 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,255,136,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🛡️</div>
          <div>
            <div style={{ color: 'var(--heading)', fontWeight: 700, fontSize: '.88rem' }}>OTPGuard Support</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '.7rem', color: status === 'closed' ? '#f87171' : 'var(--green)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
              {status === 'closed' ? 'Chat closed' : 'Active'}
              <span style={{ color: 'var(--text)', marginLeft: 6 }}>#{session.ticketNumber}</span>
            </div>
          </div>
        </div>
        <button onClick={endChat} title="End chat" style={{ background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.2)', borderRadius: 8, padding: '5px 12px', color: '#f87171', cursor: 'pointer', fontSize: '.75rem', fontWeight: 600 }}>End Chat</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: 'rgba(0,0,0,.2)', border: '1px solid var(--border)', borderTop: 'none', borderBottom: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Spin />
          </div>
        )}
        {messages.map((msg) => {
          const isUser = msg.sender_type === 'user'
          const isSystem = msg.sender_type === 'system'
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: isUser ? 'rgba(0,255,136,.15)' : isSystem ? 'rgba(59,130,246,.15)' : 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', flexShrink: 0 }}>
                {isUser ? '👤' : isSystem ? '🤖' : '👨‍💼'}
              </div>
              <div style={{ maxWidth: '76%' }}>
                <div style={{ fontSize: '.65rem', color: 'var(--text)', marginBottom: 3, textAlign: isUser ? 'right' : 'left' }}>
                  <strong style={{ color: isUser ? 'var(--green)' : isSystem ? '#3b82f6' : 'var(--heading)' }}>{msg.sender_name}</strong>
                  {' · '}{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ background: isUser ? 'rgba(0,255,136,.15)' : isSystem ? 'rgba(59,130,246,.1)' : 'rgba(255,255,255,.06)', border: `1px solid ${isUser ? 'rgba(0,255,136,.25)' : isSystem ? 'rgba(59,130,246,.2)' : 'rgba(255,255,255,.08)'}`, borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '9px 14px', fontSize: '.84rem', color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {msg.message}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {status !== 'closed' ? (
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: 10, padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 16px 16px', flexShrink: 0 }}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message… (Enter to send)"
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e) } }}
            style={{ ...inputStyle, flex: 1, padding: '9px 14px', fontSize: '.88rem' }}
            onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,.4)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          <button type="submit" disabled={sending || !input.trim()} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '.82rem', opacity: (!input.trim() || sending) ? .5 : 1, flexShrink: 0 }}>
            {sending ? '…' : '→'}
          </button>
        </form>
      ) : (
        <div style={{ padding: '14px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 16px 16px', textAlign: 'center', color: 'var(--text)', fontSize: '.82rem' }}>
          This chat has been resolved. <button onClick={endChat} style={{ background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer', fontWeight: 600 }}>Start a new one →</button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  COMMUNITY FORUM
// ─────────────────────────────────────────────────────────────────────────────
function ForumSection({ user, token }) {
  const [posts, setPosts]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [detail, setDetail]       = useState(null)
  const [dlLoading, setDlLoad]    = useState(false)
  const [search, setSearch]       = useState('')
  const [sort, setSort]           = useState('newest')
  const [showNew, setShowNew]     = useState(false)
  const [newPost, setNewPost]     = useState({ title: '', body: '', category: 'general', author_name: '', author_email: '' })
  const [newReply, setNewReply]   = useState('')
  const [submitting, setSubmit]   = useState(false)
  const [error, setError]         = useState(null)
  const debounceRef = useRef(null)

  const loadPosts = useCallback((q = '', s = 'newest') => {
    setLoading(true)
    const params = new URLSearchParams({ sort: s })
    if (q) params.set('search', q)
    fetch(`${API}/support/forum/posts?${params}`)
      .then(r => r.json())
      .then(d => { setPosts(d.posts || []); setError(null) })
      .catch(() => setError('Could not load forum posts'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadPosts() }, [loadPosts])

  useEffect(() => {
    if (user) setNewPost(f => ({ ...f, author_name: f.author_name || user.full_name || '', author_email: f.author_email || user.email || '' }))
  }, [user])

  function handleSearch(val) {
    setSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => loadPosts(val, sort), 350)
  }

  function openPost(id) {
    setSelected(id); setDlLoad(true)
    fetch(`${API}/support/forum/posts/${id}`)
      .then(r => r.json()).then(d => setDetail(d.post)).catch(() => {})
      .finally(() => setDlLoad(false))
  }

  async function createPost(e) {
    e.preventDefault(); setSubmit(true); setError(null)
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const r = await fetch(`${API}/support/forum/posts`, { method: 'POST', headers, body: JSON.stringify(newPost) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed')
      setPosts(p => [d.post, ...p])
      setShowNew(false)
      setNewPost(f => ({ ...f, title: '', body: '' }))
    } catch (err) { setError(err.message) }
    finally { setSubmit(false) }
  }

  async function addReply(e) {
    e.preventDefault(); setSubmit(true)
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const body = { body: newReply, author_name: user?.full_name || 'Anonymous' }
      const r = await fetch(`${API}/support/forum/posts/${selected}/replies`, { method: 'POST', headers, body: JSON.stringify(body) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed')
      setDetail(prev => ({ ...prev, replies: [...(prev.replies || []), d.reply], reply_count: (prev.reply_count || 0) + 1 }))
      setNewReply('')
    } catch (err) { setError(err.message) }
    finally { setSubmit(false) }
  }

  async function upvotePost(id) {
    await fetch(`${API}/support/forum/posts/${id}/vote`, { method: 'POST' })
    loadPosts(search, sort)
  }

  const CATEGORIES = ['general', 'technical', 'api', 'billing', 'security', 'feature-request']

  if (selected && detail) return (
    <div>
      <button onClick={() => { setSelected(null); setDetail(null) }} style={{ background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer', fontSize: '.85rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
        ← Back to forum
      </button>

      {/* Post detail */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <button onClick={() => upvotePost(detail.id)} style={{ background: 'var(--border)', border: 'none', borderRadius: 8, width: 36, height: 36, cursor: 'pointer', color: 'var(--green)', fontSize: '1rem' }}>▲</button>
            <span style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--heading)' }}>{detail.upvotes}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              {detail.is_answered && <span style={{ background: 'rgba(0,255,136,.12)', color: 'var(--green)', borderRadius: 20, padding: '2px 10px', fontSize: '.7rem', fontWeight: 700 }}>✓ Answered</span>}
              {detail.is_pinned && <span style={{ background: 'rgba(250,204,21,.12)', color: '#facc15', borderRadius: 20, padding: '2px 10px', fontSize: '.7rem', fontWeight: 700 }}>📌 Pinned</span>}
              <span style={{ background: 'var(--border)', color: 'var(--text)', borderRadius: 20, padding: '2px 8px', fontSize: '.7rem', textTransform: 'capitalize' }}>{detail.category}</span>
            </div>
            <h2 style={{ color: 'var(--heading)', fontWeight: 800, fontSize: '1.2rem', marginBottom: 12, lineHeight: 1.3 }}>{detail.title}</h2>
            <div style={{ color: 'var(--text)', fontSize: '.88rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 14 }}>{detail.body}</div>
            <div style={{ fontSize: '.72rem', color: 'var(--text)', display: 'flex', gap: 12 }}>
              <span>By <strong style={{ color: 'var(--heading)' }}>{detail.author_name}</strong></span>
              <span>{new Date(detail.created_at).toLocaleDateString()}</span>
              <span>👁 {detail.views} views</span>
            </div>
            {detail.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                {detail.tags.map(t => <span key={t} style={{ background: 'var(--border)', color: 'var(--text)', borderRadius: 20, padding: '2px 8px', fontSize: '.68rem' }}>{t}</span>)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      <h3 style={{ color: 'var(--heading)', fontWeight: 700, fontSize: '.92rem', marginBottom: 14 }}>{(detail.replies || []).length} Answer{(detail.replies || []).length !== 1 ? 's' : ''}</h3>

      {(detail.replies || []).map(reply => (
        <div key={reply.id} style={{ background: reply.is_accepted ? 'rgba(0,255,136,.04)' : 'var(--surface)', border: `1px solid ${reply.is_accepted ? 'rgba(0,255,136,.25)' : 'var(--border)'}`, borderRadius: 14, padding: 20, marginBottom: 12, display: 'flex', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <button onClick={() => fetch(`${API}/support/forum/posts/${selected}/replies/${reply.id}/vote`, { method: 'POST' }).then(() => openPost(selected))}
              style={{ background: 'var(--border)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: 'var(--green)', fontSize: '.9rem' }}>▲</button>
            <span style={{ fontSize: '.82rem', fontWeight: 700 }}>{reply.upvotes}</span>
            {reply.is_accepted && <span title="Accepted answer" style={{ fontSize: '1.1rem', color: 'var(--green)' }}>✓</span>}
          </div>
          <div style={{ flex: 1 }}>
            {reply.is_accepted && <div style={{ fontSize: '.7rem', color: 'var(--green)', fontWeight: 700, marginBottom: 6 }}>✓ Accepted Answer</div>}
            <div style={{ color: 'var(--text)', fontSize: '.88rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 8 }}>{reply.body}</div>
            <div style={{ fontSize: '.7rem', color: 'var(--text)' }}>
              <strong style={{ color: 'var(--heading)' }}>{reply.author_name}</strong> · {new Date(reply.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}

      {/* Add reply */}
      {error && <div style={{ color: '#f87171', fontSize: '.82rem', marginBottom: 12, padding: '10px 14px', background: 'rgba(248,113,113,.08)', borderRadius: 8 }}>⚠ {error}</div>}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
        <h4 style={{ color: 'var(--heading)', fontWeight: 700, marginBottom: 12, fontSize: '.9rem' }}>Your Answer</h4>
        <form onSubmit={addReply}>
          {!user && (
            <Field label="Your Name" required>
              <input value={newPost.author_name} onChange={e => setNewPost(f => ({ ...f, author_name: e.target.value }))} required placeholder="Your name" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </Field>
          )}
          <textarea value={newReply} onChange={e => setNewReply(e.target.value)} required rows={4}
            placeholder="Share your knowledge or experience…"
            style={{ ...inputStyle, resize: 'vertical', marginBottom: 12 }}
            onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          <button type="submit" disabled={submitting || !newReply.trim()} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--green)', color: '#0a0e1a', fontWeight: 700, cursor: 'pointer', fontSize: '.85rem', opacity: (!newReply.trim() || submitting) ? .5 : 1 }}>
            {submitting ? 'Posting…' : 'Post Answer'}
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <div>
      {/* Forum toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text)', pointerEvents: 'none' }}>🔍</span>
          <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search discussions…"
            style={{ ...inputStyle, paddingLeft: 36 }}
            onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,.4)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['newest', 'votes', 'unanswered'].map(s => (
            <button key={s} onClick={() => { setSort(s); loadPosts(search, s) }}
              style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${sort === s ? 'rgba(0,255,136,.4)' : 'var(--border)'}`, background: sort === s ? 'rgba(0,255,136,.1)' : 'var(--surface)', color: sort === s ? 'var(--green)' : 'var(--text)', cursor: 'pointer', fontSize: '.8rem', fontWeight: sort === s ? 700 : 400, textTransform: 'capitalize' }}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={() => setShowNew(!showNew)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,var(--green),#00cc6a)', color: '#0a0e1a', fontWeight: 700, cursor: 'pointer', fontSize: '.82rem', flexShrink: 0 }}>
          + Ask Question
        </button>
      </div>

      {/* New post form */}
      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid rgba(0,255,136,.2)', borderRadius: 14, padding: 24 }}>
              <h3 style={{ color: 'var(--heading)', fontWeight: 700, marginBottom: 16, fontSize: '.95rem' }}>Ask a Question</h3>
              {error && <div style={{ color: '#f87171', fontSize: '.82rem', marginBottom: 12, padding: '10px 14px', background: 'rgba(248,113,113,.08)', borderRadius: 8 }}>⚠ {error}</div>}
              <form onSubmit={createPost}>
                {!user && (
                  <Field label="Your Name" required>
                    <input value={newPost.author_name} onChange={e => setNewPost(f => ({ ...f, author_name: e.target.value }))} required placeholder="Your name" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </Field>
                )}
                <Field label="Question Title" required>
                  <input value={newPost.title} onChange={e => setNewPost(f => ({ ...f, title: e.target.value }))} required placeholder="What's your question? Be specific." style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </Field>
                <Field label="Category">
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {CATEGORIES.map(c => (
                      <button key={c} type="button" onClick={() => setNewPost(f => ({ ...f, category: c }))}
                        style={{ padding: '4px 12px', borderRadius: 20, border: `1px solid ${newPost.category === c ? 'rgba(0,255,136,.5)' : 'var(--border)'}`, background: newPost.category === c ? 'rgba(0,255,136,.1)' : 'transparent', color: newPost.category === c ? 'var(--green)' : 'var(--text)', cursor: 'pointer', fontSize: '.75rem', fontWeight: newPost.category === c ? 700 : 400, textTransform: 'capitalize' }}>
                        {c.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Details" required>
                  <textarea value={newPost.body} onChange={e => setNewPost(f => ({ ...f, body: e.target.value }))} required rows={5}
                    placeholder="Provide as much context as possible. Include error messages, what you tried, and what you expected."
                    style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,.5)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </Field>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" disabled={submitting} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--green)', color: '#0a0e1a', fontWeight: 700, cursor: 'pointer', fontSize: '.85rem' }}>
                    {submitting ? 'Posting…' : 'Post Question'}
                  </button>
                  <button type="button" onClick={() => setShowNew(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border)', background: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '.85rem' }}>Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && !showNew && <div style={{ color: '#f87171', fontSize: '.82rem', marginBottom: 14, padding: '10px 14px', background: 'rgba(248,113,113,.08)', borderRadius: 8 }}>⚠ {error}</div>}

      {/* Post list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spin /></div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 0', color: 'var(--text)', opacity: .5 }}>
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>💬</div>
          <div>No discussions yet. Be the first to ask!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {posts.map(post => (
            <motion.div key={post.id} whileHover={{ borderColor: 'rgba(0,255,136,.25)' }}
              onClick={() => openPost(post.id)}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', cursor: 'pointer', transition: 'all .2s', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              {/* Votes */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0, minWidth: 40 }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: post.upvotes > 0 ? 'var(--green)' : 'var(--text)' }}>{post.upvotes}</span>
                <span style={{ fontSize: '.6rem', color: 'var(--text)' }}>votes</span>
              </div>
              {/* Answers */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0, minWidth: 40, padding: '4px 8px', borderRadius: 8, background: post.is_answered ? 'rgba(0,255,136,.1)' : 'var(--border)', border: `1px solid ${post.is_answered ? 'rgba(0,255,136,.3)' : 'transparent'}` }}>
                <span style={{ fontSize: '.9rem', fontWeight: 800, color: post.is_answered ? 'var(--green)' : 'var(--text)' }}>{post.reply_count}</span>
                <span style={{ fontSize: '.6rem', color: post.is_answered ? 'var(--green)' : 'var(--text)' }}>ans.</span>
              </div>
              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                  {post.is_pinned && <span style={{ background: 'rgba(250,204,21,.1)', color: '#facc15', borderRadius: 20, padding: '1px 8px', fontSize: '.65rem', fontWeight: 700 }}>📌 Pinned</span>}
                  <span style={{ background: 'var(--border)', color: 'var(--text)', borderRadius: 20, padding: '1px 8px', fontSize: '.65rem', textTransform: 'capitalize' }}>{post.category}</span>
                  {post.tags?.slice(0, 2).map(t => <span key={t} style={{ background: 'rgba(59,130,246,.1)', color: '#3b82f6', borderRadius: 20, padding: '1px 8px', fontSize: '.65rem' }}>{t}</span>)}
                </div>
                <div style={{ color: 'var(--heading)', fontWeight: 600, fontSize: '.9rem', lineHeight: 1.3, marginBottom: 5 }}>{post.title}</div>
                <div style={{ color: 'var(--text)', fontSize: '.78rem', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: 8 }}>{post.body}</div>
                <div style={{ fontSize: '.7rem', color: 'var(--text)', display: 'flex', gap: 10 }}>
                  <span><strong style={{ color: 'var(--heading)' }}>{post.author_name}</strong></span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  <span>👁 {post.views}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN SUPPORT PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function Support() {
  const { user, token } = useAuth()
  const [active, setActive] = useState('kb')
  const [ticketSuccess, setTicketSuccess] = useState(false)

  const TABS = [
    { id: 'kb',     icon: '📚', label: 'Help Center' },
    { id: 'ticket', icon: '🎫', label: 'Submit Ticket' },
    { id: 'track',  icon: '🔍', label: 'Track Ticket' },
    { id: 'chat',   icon: '💬', label: 'Live Chat' },
    { id: 'forum',  icon: '🌐', label: 'Community' },
    ...(user ? [{ id: 'mine', icon: '📋', label: 'My Tickets' }] : []),
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 60px' }}>
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: '.72rem', letterSpacing: 3, color: 'var(--green)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Support Center</div>
          <h1 style={{ color: 'var(--heading)', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-.02em', marginBottom: 4 }}>OTPGuard Help & Support</h1>
          <p style={{ color: 'var(--text)', fontSize: '.88rem' }}>Knowledge base · Ticketing · Live chat · Community forum</p>
        </div>

        {/* Tab navigation */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, borderBottom: '1px solid var(--border)', paddingBottom: 0, overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setActive(t.id); setTicketSuccess(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 18px', border: 'none', background: 'none', cursor: 'pointer', color: active === t.id ? 'var(--green)' : 'var(--text)', fontWeight: active === t.id ? 700 : 400, fontSize: '.88rem', borderBottom: `2px solid ${active === t.id ? 'var(--green)' : 'transparent'}', marginBottom: -1, whiteSpace: 'nowrap`, transition: 'all .18s', borderRadius: '8px 8px 0 0' }}
              onMouseEnter={e => { if (active !== t.id) e.currentTarget.style.color = 'var(--heading)' }}
              onMouseLeave={e => { if (active !== t.id) e.currentTarget.style.color = 'var(--text)' }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .18 }}>
            {active === 'kb'     && <HelpCenterSection onSubmitTicket={() => setActive('ticket')} />}
            {active === 'ticket' && <SubmitTicketSection user={user} token={token} onSuccess={() => setTicketSuccess(true)} />}
            {active === 'track'  && <TrackTicketSection user={user} token={token} />}
            {active === 'chat'   && <LiveChatSection user={user} token={token} />}
            {active === 'forum'  && <ForumSection user={user} token={token} />}
            {active === 'mine'   && <MyTicketsSection user={user} token={token} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  )
}
