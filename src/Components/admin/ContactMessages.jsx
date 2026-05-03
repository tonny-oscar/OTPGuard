import { useState, useEffect, useCallback } from 'react'
import { useAuth, API } from '../../context/AuthContext'

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }

export default function ContactMessages({ onUnreadChange }) {
  const { token } = useAuth()
  const [messages, setMessages] = useState([])
  const [total, setTotal] = useState(0)
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  const headers = { Authorization: `Bearer ${token}` }

  const load = useCallback(() => {
    setLoading(true)
    const params = filter === 'unread' ? '?unread=true' : ''
    fetch(`${API}/admin/contact/messages${params}`, { headers })
      .then(r => r.json())
      .then(d => {
        setMessages(d.messages || [])
        setTotal(d.total || 0)
        const u = d.unread || 0
        setUnread(u)
        onUnreadChange?.(u)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token, filter])

  useEffect(() => { load() }, [load])

  async function markRead(msg) {
    if (msg.is_read) return
    await fetch(`${API}/admin/contact/messages/${msg.id}/read`, { method: 'PATCH', headers })
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m))
    setUnread(u => {
      const next = Math.max(0, u - 1)
      onUnreadChange?.(next)
      return next
    })
    setSelected(prev => prev?.id === msg.id ? { ...prev, is_read: true } : prev)
  }

  async function deleteMsg(id) {
    if (!confirm('Delete this message?')) return
    const wasUnread = messages.find(m => m.id === id)?.is_read === false
    await fetch(`${API}/admin/contact/messages/${id}`, { method: 'DELETE', headers })
    setMessages(prev => prev.filter(m => m.id !== id))
    if (wasUnread) setUnread(u => Math.max(0, u - 1))
    if (selected?.id === id) setSelected(null)
  }

  function openMsg(msg) {
    setSelected(msg)
    markRead(msg)
  }

  function replyEmail(msg) {
    const subject = encodeURIComponent(`Re: ${msg.subject}`)
    const body = encodeURIComponent(`\n\n---\nOriginal message from ${msg.name}:\n${msg.message}`)
    window.location.href = `mailto:${msg.email}?subject=${subject}&body=${body}`
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ color: 'var(--heading)', fontSize: '1.6rem', fontWeight: 800, marginBottom: 4 }}>Contact Messages</h1>
          <p style={{ color: 'var(--text)', fontSize: '.85rem' }}>
            {total} total &nbsp;&middot;&nbsp;
            <span style={{ color: unread > 0 ? '#facc15' : 'var(--green)', fontWeight: 600 }}>{unread} unread</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'unread'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 18px', borderRadius: 8,
              border: `1px solid ${filter === f ? 'var(--green)' : 'var(--border)'}`,
              background: filter === f ? 'var(--green-dim)' : 'transparent',
              color: filter === f ? 'var(--green)' : 'var(--text)',
              cursor: 'pointer', fontSize: '.85rem', fontWeight: filter === f ? 700 : 400, textTransform: 'capitalize',
            }}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text)' }}>Loading...</div>
      ) : messages.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: 56, color: 'var(--text)', opacity: .5 }}>No messages yet</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 20, alignItems: 'flex-start' }}>

          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map(msg => (
              <div key={msg.id} onClick={() => openMsg(msg)} style={{
                ...card, padding: '14px 18px', cursor: 'pointer',
                borderColor: selected?.id === msg.id
                  ? 'var(--green)'
                  : !msg.is_read ? 'rgba(250,204,21,.4)' : 'var(--border)',
                background: selected?.id === msg.id ? 'var(--green-dim)' : 'var(--surface)',
                transition: 'all .15s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      {!msg.is_read && (
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#facc15', flexShrink: 0, display: 'inline-block' }} />
                      )}
                      <span style={{ fontWeight: 700, color: 'var(--heading)', fontSize: '.9rem' }}>{msg.name}</span>
                      <span style={{ fontSize: '.75rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.email}</span>
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--heading)', fontSize: '.85rem', marginBottom: 4 }}>{msg.subject}</div>
                    <div style={{ fontSize: '.8rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.message}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: '.72rem', color: 'var(--text)' }}>{new Date(msg.created_at).toLocaleDateString()}</span>
                    <button onClick={e => { e.stopPropagation(); deleteMsg(msg.id) }} style={{
                      background: 'none', border: '1px solid rgba(248,113,113,.3)', color: '#f87171',
                      borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: '.72rem',
                    }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={{ ...card, position: 'sticky', top: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, color: 'var(--heading)', fontSize: '1rem', marginBottom: 6 }}>{selected.subject}</div>
                  <div style={{ fontSize: '.82rem', color: 'var(--text)', marginBottom: 4 }}>
                    From <span style={{ color: 'var(--heading)', fontWeight: 600 }}>{selected.name}</span>
                  </div>
                  <a href={`mailto:${selected.email}`} style={{ fontSize: '.82rem', color: 'var(--green)', textDecoration: 'none' }}>
                    {selected.email}
                  </a>
                  <div style={{ fontSize: '.75rem', color: 'var(--text)', marginTop: 6 }}>
                    {new Date(selected.created_at).toLocaleString()}
                    {selected.is_read && (
                      <span style={{ marginLeft: 10, color: 'var(--green)', fontWeight: 600 }}>Read</span>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{
                  background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer',
                  fontSize: '1rem', padding: '4px 8px', borderRadius: 6, flexShrink: 0,
                }}>x</button>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 20 }}>
                <p style={{ color: 'var(--text)', lineHeight: 1.85, fontSize: '.92rem', whiteSpace: 'pre-wrap' }}>
                  {selected.message}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => replyEmail(selected)}
                  className="btn-primary"
                  style={{ padding: '9px 20px', fontSize: '.85rem', border: 'none', cursor: 'pointer' }}
                >
                  Reply via Email
                </button>
                <button onClick={() => deleteMsg(selected.id)} style={{
                  padding: '9px 20px', borderRadius: 8,
                  border: '1px solid rgba(248,113,113,.3)',
                  background: 'rgba(248,113,113,.08)', color: '#f87171',
                  cursor: 'pointer', fontSize: '.85rem',
                }}>Delete</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
