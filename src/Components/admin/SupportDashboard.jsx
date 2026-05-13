import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth, API } from '../../context/AuthContext'

// ── Colour maps ───────────────────────────────────────────────────────────
const STATUS = {
  open:        { bg: 'rgba(59,130,246,.12)',  border: 'rgba(59,130,246,.3)',  text: '#3b82f6',    label: 'Open'        },
  in_progress: { bg: 'rgba(250,204,21,.12)',  border: 'rgba(250,204,21,.3)',  text: '#facc15',    label: 'In Progress' },
  waiting:     { bg: 'rgba(168,85,247,.12)',  border: 'rgba(168,85,247,.3)',  text: '#a855f7',    label: 'Waiting'     },
  resolved:    { bg: 'rgba(0,255,136,.12)',   border: 'rgba(0,255,136,.3)',   text: 'var(--green)', label: 'Resolved'  },
  closed:      { bg: 'rgba(100,116,139,.12)', border: 'rgba(100,116,139,.3)', text: '#64748b',    label: 'Closed'     },
}
const PRIORITY = {
  low:    { bg: 'rgba(100,116,139,.12)', text: '#64748b' },
  medium: { bg: 'rgba(59,130,246,.12)',  text: '#3b82f6' },
  high:   { bg: 'rgba(251,146,60,.12)',  text: '#fb923c' },
  urgent: { bg: 'rgba(248,113,113,.12)', text: '#f87171' },
}

function StatusBadge({ status }) {
  const c = STATUS[status] || STATUS.open
  return (
    <span style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text, borderRadius: 20, padding: '2px 10px', fontSize: '.7rem', fontWeight: 700 }}>
      {c.label}
    </span>
  )
}
function PriorityBadge({ priority }) {
  const c = PRIORITY[priority] || PRIORITY.medium
  return (
    <span style={{ background: c.bg, color: c.text, borderRadius: 20, padding: '2px 10px', fontSize: '.7rem', fontWeight: 700, textTransform: 'capitalize' }}>
      {priority}
    </span>
  )
}

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }
const inputStyle = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--heading)', fontSize: '.85rem', outline: 'none', width: '100%' }
const btnPrimary = { padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,var(--green),#00cc6a)', color: '#0a0e1a', fontWeight: 700, cursor: 'pointer', fontSize: '.85rem' }
const btnGhost  = { padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '.82rem' }

function Spinner() {
  return <div style={{ textAlign: 'center', padding: 48, color: 'var(--text)' }}>Loading…</div>
}

// ══════════════════════════════════════════════════════════════════════════
//  Ticket Detail Panel
// ══════════════════════════════════════════════════════════════════════════
function TicketPanel({ ticketId, token, onClose, onUpdated }) {
  const [ticket, setTicket]       = useState(null)
  const [loading, setLoading]     = useState(true)
  const [reply, setReply]         = useState('')
  const [note, setNote]           = useState('')
  const [noteMode, setNoteMode]   = useState(false)
  const [sending, setSending]     = useState(false)
  const [newStatus, setNewStatus] = useState('')

  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const load = useCallback(() => {
    setLoading(true)
    fetch(`${API}/support/admin/tickets/${ticketId}`, { headers: h })
      .then(r => r.json())
      .then(d => { setTicket(d.ticket); setNewStatus(d.ticket?.status || 'open') })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [ticketId, token])

  useEffect(() => { load() }, [load])

  async function sendReply() {
    if (!reply.trim()) return
    setSending(true)
    try {
      await fetch(`${API}/support/admin/tickets/${ticketId}/reply`, {
        method: 'POST', headers: h, body: JSON.stringify({ message: reply }),
      })
      setReply('')
      load()
      onUpdated?.()
    } finally { setSending(false) }
  }

  async function addNote() {
    if (!note.trim()) return
    setSending(true)
    try {
      await fetch(`${API}/support/admin/tickets/${ticketId}/note`, {
        method: 'POST', headers: h, body: JSON.stringify({ note }),
      })
      setNote('')
      setNoteMode(false)
      load()
    } finally { setSending(false) }
  }

  async function updateStatus(status) {
    await fetch(`${API}/support/admin/tickets/${ticketId}`, {
      method: 'PATCH', headers: h, body: JSON.stringify({ status }),
    })
    setNewStatus(status)
    load()
    onUpdated?.()
  }

  async function updatePriority(priority) {
    await fetch(`${API}/support/admin/tickets/${ticketId}`, {
      method: 'PATCH', headers: h, body: JSON.stringify({ priority }),
    })
    load()
    onUpdated?.()
  }

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }}
      style={{ ...card, height: '100%', display: 'flex', flexDirection: 'column', minWidth: 0 }}
    >
      {loading ? <Spinner /> : !ticket ? <div style={{ padding: 40, color: 'var(--text)' }}>Not found</div> : (
        <>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'monospace', color: 'var(--green)', fontSize: '.85rem', fontWeight: 700, marginBottom: 4 }}>
                #{ticket.ticket_number}
              </div>
              <h3 style={{ color: 'var(--heading)', fontSize: '1rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>{ticket.subject}</h3>
              <div style={{ fontSize: '.75rem', color: 'var(--text)', marginTop: 4 }}>
                From: <strong style={{ color: 'var(--heading)' }}>{ticket.requester_name}</strong> · {ticket.requester_email}
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '1.1rem', flexShrink: 0 }}>✕</button>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: '.68rem', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: 1 }}>Status</span>
              <select value={newStatus} onChange={e => updateStatus(e.target.value)}
                style={{ ...inputStyle, width: 'auto', padding: '5px 10px', fontSize: '.8rem' }}>
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: '.68rem', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: 1 }}>Priority</span>
              <select value={ticket.priority} onChange={e => updatePriority(e.target.value)}
                style={{ ...inputStyle, width: 'auto', padding: '5px 10px', fontSize: '.8rem' }}>
                {['low','medium','high','urgent'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', marginLeft: 'auto' }}>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {(ticket.messages || []).map((msg, i) => {
              const isAgent  = msg.sender_type === 'agent'
              const isSystem = msg.sender_type === 'system'
              const isNote   = msg.is_internal
              return (
                <div key={i} style={{
                  padding: '12px 14px', borderRadius: 10,
                  background: isNote ? 'rgba(250,204,21,.06)' : isAgent ? 'rgba(0,255,136,.06)' : isSystem ? 'rgba(59,130,246,.05)' : 'var(--bg)',
                  border: `1px solid ${isNote ? 'rgba(250,204,21,.2)' : isAgent ? 'rgba(0,255,136,.15)' : isSystem ? 'rgba(59,130,246,.12)' : 'var(--border)'}`,
                }}>
                  <div style={{ fontSize: '.7rem', color: 'var(--text)', marginBottom: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <strong style={{ color: isNote ? '#facc15' : isAgent ? 'var(--green)' : isSystem ? 'var(--blue)' : 'var(--heading)' }}>
                      {msg.sender_name}
                    </strong>
                    {isNote && <span style={{ background: 'rgba(250,204,21,.15)', color: '#facc15', borderRadius: 4, padding: '1px 6px', fontSize: '.65rem' }}>Internal Note</span>}
                    <span style={{ marginLeft: 'auto' }}>{new Date(msg.created_at).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: '.85rem', color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{msg.message}</div>
                </div>
              )
            })}
          </div>

          {/* Reply / Note toggle */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <button onClick={() => setNoteMode(false)} style={{ ...btnGhost, background: !noteMode ? 'rgba(0,255,136,.08)' : 'none', borderColor: !noteMode ? 'rgba(0,255,136,.3)' : 'var(--border)', color: !noteMode ? 'var(--green)' : 'var(--text)', fontSize: '.78rem' }}>
                Reply to User
              </button>
              <button onClick={() => setNoteMode(true)} style={{ ...btnGhost, background: noteMode ? 'rgba(250,204,21,.08)' : 'none', borderColor: noteMode ? 'rgba(250,204,21,.3)' : 'var(--border)', color: noteMode ? '#facc15' : 'var(--text)', fontSize: '.78rem' }}>
                Internal Note
              </button>
            </div>
            {noteMode ? (
              <>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                  placeholder="Private note — only visible to agents…"
                  style={{ ...inputStyle, resize: 'vertical', marginBottom: 8, fontFamily: 'inherit', borderColor: 'rgba(250,204,21,.25)' }} />
                <button onClick={addNote} disabled={sending || !note.trim()} style={{ ...btnPrimary, background: 'linear-gradient(135deg,#facc15,#f59e0b)', width: '100%' }}>
                  {sending ? 'Saving…' : 'Save Note'}
                </button>
              </>
            ) : (
              <>
                <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3}
                  placeholder="Write a reply to the user…"
                  style={{ ...inputStyle, resize: 'vertical', marginBottom: 8, fontFamily: 'inherit' }} />
                <button onClick={sendReply} disabled={sending || !reply.trim()} style={{ ...btnPrimary, width: '100%' }}>
                  {sending ? 'Sending…' : '✉ Send Reply'}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
//  KB Management
// ══════════════════════════════════════════════════════════════════════════
function KBManagement({ token }) {
  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const [articles, setArticles]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [editingArticle, setEditingArticle] = useState(null)  // null | 'new' | article obj
  const [form, setForm] = useState({ title: '', content: '', excerpt: '', category_id: '', tags: '', is_published: true, is_featured: false })
  const [saving, setSaving] = useState(false)

  function loadData() {
    setLoading(true)
    Promise.all([
      fetch(`${API}/support/admin/kb/articles`, { headers: h }).then(r => r.json()),
      fetch(`${API}/support/admin/kb/categories`, { headers: h }).then(r => r.json()),
    ]).then(([a, c]) => {
      setArticles(a.articles || [])
      setCategories(c.categories || [])
    }).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [token])

  function startNew() {
    setForm({ title: '', content: '', excerpt: '', category_id: '', tags: '', is_published: true, is_featured: false })
    setEditingArticle('new')
  }

  function startEdit(a) {
    setForm({ title: a.title, content: a.content || '', excerpt: a.excerpt || '', category_id: a.category_id || '', tags: (a.tags || []).join(', '), is_published: a.is_published, is_featured: a.is_featured })
    setEditingArticle(a)
  }

  async function save() {
    setSaving(true)
    try {
      const body = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), category_id: form.category_id || null }
      if (editingArticle === 'new') {
        await fetch(`${API}/support/admin/kb/articles`, { method: 'POST', headers: h, body: JSON.stringify(body) })
      } else {
        await fetch(`${API}/support/admin/kb/articles/${editingArticle.id}`, { method: 'PUT', headers: h, body: JSON.stringify(body) })
      }
      setEditingArticle(null)
      loadData()
    } finally { setSaving(false) }
  }

  async function deleteArticle(id) {
    if (!confirm('Delete this article?')) return
    await fetch(`${API}/support/admin/kb/articles/${id}`, { method: 'DELETE', headers: h })
    loadData()
  }

  if (loading) return <Spinner />

  return (
    <div style={{ display: 'grid', gridTemplateColumns: editingArticle ? '1fr 1fr' : '1fr', gap: 20 }}>
      {/* Article list */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: 'var(--heading)', fontWeight: 700, fontSize: '.95rem', margin: 0 }}>Knowledge Base Articles ({articles.length})</h3>
          <button onClick={startNew} style={btnPrimary}>+ New Article</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {articles.map(a => (
            <div key={a.id} style={{ ...card, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                  <span style={{ color: 'var(--heading)', fontSize: '.88rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</span>
                  {a.is_featured && <span style={{ background: 'rgba(0,255,136,.1)', color: 'var(--green)', borderRadius: 20, padding: '1px 7px', fontSize: '.65rem', fontWeight: 700, flexShrink: 0 }}>Featured</span>}
                  {!a.is_published && <span style={{ background: 'rgba(100,116,139,.12)', color: '#64748b', borderRadius: 20, padding: '1px 7px', fontSize: '.65rem', fontWeight: 700, flexShrink: 0 }}>Draft</span>}
                </div>
                <div style={{ fontSize: '.72rem', color: 'var(--text)' }}>
                  {categories.find(c => c.id === a.category_id)?.name || 'Uncategorised'} · {a.view_count ?? 0} views · 👍 {a.helpful_count ?? 0}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => startEdit(a)} style={{ ...btnGhost, padding: '5px 10px', fontSize: '.75rem' }}>Edit</button>
                <button onClick={() => deleteArticle(a.id)} style={{ ...btnGhost, padding: '5px 10px', fontSize: '.75rem', borderColor: 'rgba(248,113,113,.3)', color: '#f87171' }}>Delete</button>
              </div>
            </div>
          ))}
          {articles.length === 0 && <div style={{ textAlign: 'center', padding: 48, color: 'var(--text)', opacity: .5 }}>No articles yet.</div>}
        </div>
      </div>

      {/* Editor */}
      <AnimatePresence>
        {editingArticle && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            style={{ ...card, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'var(--heading)', fontWeight: 700, fontSize: '.95rem', margin: 0 }}>
                {editingArticle === 'new' ? 'New Article' : `Edit: ${editingArticle.title}`}
              </h3>
              <button onClick={() => setEditingArticle(null)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}>✕</button>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: '.75rem', color: 'var(--text)', fontWeight: 600 }}>Title *</span>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} placeholder="Article title" />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: '.75rem', color: 'var(--text)', fontWeight: 600 }}>Category</span>
              <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} style={inputStyle}>
                <option value="">— None —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: '.75rem', color: 'var(--text)', fontWeight: 600 }}>Tags (comma-separated)</span>
              <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} style={inputStyle} placeholder="e.g. otp, authentication, setup" />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <span style={{ fontSize: '.75rem', color: 'var(--text)', fontWeight: 600 }}>Content (Markdown) *</span>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={12}
                placeholder="Write article content in Markdown…"
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '.82rem' }} />
            </label>

            <div style={{ display: 'flex', gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '.82rem', color: 'var(--text)' }}>
                <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
                Published
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '.82rem', color: 'var(--text)' }}>
                <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} />
                Featured
              </label>
            </div>

            <button onClick={save} disabled={saving || !form.title || !form.content} style={{ ...btnPrimary, width: '100%', padding: 11 }}>
              {saving ? 'Saving…' : editingArticle === 'new' ? 'Create Article' : 'Save Changes'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
//  Analytics
// ══════════════════════════════════════════════════════════════════════════
function SupportAnalytics({ token }) {
  const h = { Authorization: `Bearer ${token}` }
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/support/admin/analytics`, { headers: h })
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <Spinner />
  if (!data)   return null

  const maxVol = Math.max(...(data.daily_volume || []).map(d => Math.max(d.created, d.resolved)), 1)

  return (
    <div>
      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Tickets',   val: data.total_tickets,                           color: 'var(--blue)'  },
          { label: 'Open',            val: data.open_tickets,                            color: '#f87171'      },
          { label: 'Resolved (30d)',  val: data.resolved_30d,                            color: 'var(--green)' },
          { label: 'Avg Response',    val: data.avg_response_hrs != null ? `${data.avg_response_hrs}h` : 'N/A', color: '#facc15' },
          { label: 'CSAT',            val: data.avg_satisfaction != null ? `${data.avg_satisfaction}/5` : 'N/A', color: 'var(--green)' },
          { label: 'KB Articles',     val: data.kb_articles,                             color: '#a855f7'      },
        ].map(m => (
          <div key={m.label} style={card}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: m.color, marginBottom: 4 }}>{m.val}</div>
            <div style={{ fontSize: '.75rem', color: 'var(--text)' }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
        {/* Daily volume chart */}
        <div style={card}>
          <h3 style={{ color: 'var(--heading)', fontWeight: 700, fontSize: '.9rem', marginBottom: 16 }}>Ticket Volume (7 Days)</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
            {(data.daily_volume || []).map(d => (
              <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', height: 80, justifyContent: 'flex-end', gap: 2 }}>
                  <div style={{ width: '70%', height: `${(d.resolved / maxVol) * 100}%`, background: 'var(--green)', borderRadius: '3px 3px 0 0', minHeight: d.resolved ? 3 : 0 }} />
                  <div style={{ width: '100%', height: `${(d.created / maxVol) * 100}%`, background: 'var(--blue)', borderRadius: '3px 3px 0 0', minHeight: d.created ? 3 : 0 }} />
                </div>
                <span style={{ fontSize: '.65rem', color: 'var(--text)' }}>{d.day}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: '.72rem' }}>
            <span><span style={{ color: 'var(--blue)' }}>■</span> Created</span>
            <span><span style={{ color: 'var(--green)' }}>■</span> Resolved</span>
          </div>
        </div>

        {/* By category */}
        <div style={card}>
          <h3 style={{ color: 'var(--heading)', fontWeight: 700, fontSize: '.9rem', marginBottom: 16 }}>By Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(data.by_category || []).sort((a, b) => b.count - a.count).map(item => {
              const max = Math.max(...(data.by_category || []).map(x => x.count), 1)
              return (
                <div key={item.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', marginBottom: 3 }}>
                    <span style={{ textTransform: 'capitalize' }}>{item.category}</span>
                    <span style={{ color: 'var(--green)', fontWeight: 600 }}>{item.count}</span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: 4, height: 6 }}>
                    <div style={{ width: `${(item.count / max) * 100}%`, height: '100%', background: 'var(--blue)', borderRadius: 4 }} />
                  </div>
                </div>
              )
            })}
            {(!data.by_category?.length) && <div style={{ color: 'var(--text)', opacity: .5, fontSize: '.82rem' }}>No data yet.</div>}
          </div>
        </div>

        {/* By priority */}
        <div style={card}>
          <h3 style={{ color: 'var(--heading)', fontWeight: 700, fontSize: '.9rem', marginBottom: 16 }}>By Priority</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(['urgent','high','medium','low']).map(p => {
              const item = (data.by_priority || []).find(x => x.priority === p) || { count: 0 }
              const max  = Math.max(...(data.by_priority || []).map(x => x.count), 1)
              const c    = PRIORITY[p]
              return (
                <div key={p}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', marginBottom: 3 }}>
                    <span style={{ textTransform: 'capitalize', color: c.text }}>{p}</span>
                    <span style={{ fontWeight: 600 }}>{item.count}</span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: 4, height: 6 }}>
                    <div style={{ width: `${(item.count / max) * 100}%`, height: '100%', background: c.text, borderRadius: 4, opacity: .7 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
//  Main SupportDashboard
// ══════════════════════════════════════════════════════════════════════════
export default function SupportDashboard() {
  const { token } = useAuth()
  const h = { Authorization: `Bearer ${token}` }

  const [subTab, setSubTab]     = useState('tickets')
  const [tickets, setTickets]   = useState([])
  const [stats, setStats]       = useState({})
  const [loading, setLoading]   = useState(true)
  const [selectedId, setSelectedId] = useState(null)

  // Filters
  const [filterStatus,   setFilterStatus]   = useState('all')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [search, setSearch]                 = useState('')

  const loadTickets = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterStatus !== 'all') params.set('status', filterStatus)
    if (filterPriority) params.set('priority', filterPriority)
    if (filterCategory) params.set('category', filterCategory)
    if (search) params.set('search', search)
    params.set('per_page', '50')

    fetch(`${API}/support/admin/tickets?${params}`, { headers: h })
      .then(r => r.json())
      .then(d => { setTickets(d.tickets || []); setStats(d.stats || {}) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token, filterStatus, filterPriority, filterCategory, search])

  useEffect(() => { loadTickets() }, [loadTickets])

  const subTabs = [
    { id: 'tickets',  label: `🎫 Tickets${stats.open ? ` (${stats.open} open)` : ''}` },
    { id: 'kb',       label: '📚 Knowledge Base' },
    { id: 'analytics', label: '📊 Analytics' },
  ]

  return (
    <div>
      <h1 style={{ color: 'var(--heading)', fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Support Center</h1>
      <p style={{ fontSize: '.85rem', marginBottom: 24, color: 'var(--text)' }}>Manage tickets, knowledge base, and support analytics.</p>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {subTabs.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{
            padding: '9px 16px', border: 'none', background: 'none', cursor: 'pointer',
            color: subTab === t.id ? 'var(--green)' : 'var(--text)',
            fontWeight: subTab === t.id ? 700 : 400,
            fontSize: '.85rem', borderBottom: `2px solid ${subTab === t.id ? 'var(--green)' : 'transparent'}`,
            marginBottom: -1, transition: 'all .15s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TICKETS ── */}
      {subTab === 'tickets' && (
        <div>
          {/* Status filter tabs */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {[['all','All',stats.total],['open','Open',stats.open],['in_progress','In Progress',stats.in_progress],['waiting','Waiting',stats.waiting],['resolved','Resolved',stats.resolved],['closed','Closed',stats.closed]].map(([val, label, count]) => (
              <button key={val} onClick={() => setFilterStatus(val)} style={{
                padding: '6px 14px', borderRadius: 20, border: `1px solid ${filterStatus === val ? 'rgba(0,255,136,.4)' : 'var(--border)'}`,
                background: filterStatus === val ? 'rgba(0,255,136,.1)' : 'none',
                color: filterStatus === val ? 'var(--green)' : 'var(--text)',
                fontSize: '.78rem', fontWeight: filterStatus === val ? 700 : 400, cursor: 'pointer', transition: 'all .15s',
              }}>
                {label}{count != null ? ` (${count})` : ''}
              </button>
            ))}
          </div>

          {/* Filter row */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets…"
              style={{ ...inputStyle, width: 200, flex: '1 1 160px' }} />
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
              <option value="">All Priorities</option>
              {['low','medium','high','urgent'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
            </select>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
              <option value="">All Categories</option>
              {['general','billing','technical','account','security','api'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
          </div>

          {/* Ticket list + detail panel */}
          <div style={{ display: 'grid', gridTemplateColumns: selectedId ? '1fr 1fr' : '1fr', gap: 16, alignItems: 'start' }}>
            {/* Table */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              {loading ? <Spinner /> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['#', 'Subject', 'From', 'Status', 'Priority', 'Category', 'Updated'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '.72rem', color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map(t => (
                      <tr key={t.id}
                        onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}
                        style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .12s', background: selectedId === t.id ? 'rgba(0,255,136,.04)' : 'none' }}
                        onMouseEnter={e => { if (selectedId !== t.id) e.currentTarget.style.background = 'rgba(255,255,255,.03)' }}
                        onMouseLeave={e => { if (selectedId !== t.id) e.currentTarget.style.background = 'none' }}>
                        <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: 'var(--green)', fontSize: '.75rem', whiteSpace: 'nowrap' }}>#{t.ticket_number}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--heading)', maxWidth: 200 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</div>
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--text)', whiteSpace: 'nowrap', fontSize: '.78rem' }}>{t.requester_name}</td>
                        <td style={{ padding: '10px 14px' }}><StatusBadge status={t.status} /></td>
                        <td style={{ padding: '10px 14px' }}><PriorityBadge priority={t.priority} /></td>
                        <td style={{ padding: '10px 14px', color: 'var(--text)', textTransform: 'capitalize', fontSize: '.78rem' }}>{t.category}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text)', whiteSpace: 'nowrap', fontSize: '.75rem' }}>{new Date(t.updated_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {tickets.length === 0 && (
                      <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: 'var(--text)', opacity: .5 }}>No tickets found.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Detail panel */}
            <AnimatePresence>
              {selectedId && (
                <TicketPanel
                  key={selectedId}
                  ticketId={selectedId}
                  token={token}
                  onClose={() => setSelectedId(null)}
                  onUpdated={loadTickets}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {subTab === 'kb'        && <KBManagement token={token} />}
      {subTab === 'analytics' && <SupportAnalytics token={token} />}
    </div>
  )
}
