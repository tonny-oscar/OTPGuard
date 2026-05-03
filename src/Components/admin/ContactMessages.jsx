import { useState, useEffect, useCallback } from 'react'
import { useAuth, API } from '../../context/AuthContext'

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }

export default function ContactMessages({ onUnreadChange }) {
  const { token } = useAuth()
  const [messages, setMessages]   = useState([])
  const [total, setTotal]         = useState(0)
  const [unread, setUnread]       = useState(0)
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [filter, setFilter]       = useState('all')
  const [reply, setReply]         = useState('')
  const [sending, setSending]     = useState(false)
  const [replyStatus, setReplyStatus] = useState(null) // 'ok' | 'err:<msg>'

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
    if (wasUnread) setUnread(u => { const n = Math.max(0, u - 1); onUnreadChange?.(n); return n })
    if (selected?.id === id) { setSelected(null); setReply(''); setReplyStatus(null) }
  }

  function openMsg(msg) {
    setSelected(msg)
    setReply('')
    setReplyStatus(null)
    markRead(msg)
  }

  async function sendReply(e) {
    e.preventDefault()
    if (!reply.trim()) return
    setSending(true)
    setReplyStatus(null)
    try {
      const r = await fetch(`${API}/admin/contact/messages/${selected.id}/reply`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: reply.trim() }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Failed to send')
      setReplyStatus('ok')
      setReply('')
      // Mark as read in list
      setMessages(prev => prev.map(m => m.id === selected.id ? { ...m, is_read: true } : m))
      setSelected(prev => ({ ...prev, is_read: true }))
    } catch (err) {
      setReplyStatus(`err:${err.message}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      {/* Header */}
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
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '380px 1fr' : '1fr', gap: 20, alignItems: 'flex-start' }}>

          {/* ── Message list ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map(msg => (
              <div key={msg.id} onClick={() => openMsg(msg)} style={{
                ...card, padding: '14px 18px', cursor: 'pointer',
                borderColor: selected?.id === msg.id ? 'var(--green)' : !msg.is_read ? 'rgba(250,204,21,.4)' : 'var(--border)',
                background: selected?.id === msg.id ? 'var(--green-dim)' : 'var(--surface)',
                transition: 'all .15s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                      {!msg.is_read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#facc15', flexShrink: 0 }} />}
                      <span style={{ fontWeight: 700, color: 'var(--heading)', fontSize: '.88rem' }}>{msg.name}</span>
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--heading)', fontSize: '.82rem', marginBottom: 3 }}>{msg.subject}</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.message}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: '.7rem', color: 'var(--text)' }}>{new Date(msg.created_at).toLocaleDateString()}</span>
                    <button onClick={e => { e.stopPropagation(); deleteMsg(msg.id) }} style={{
                      background: 'none', border: '1px solid rgba(248,113,113,.3)', color: '#f87171',
                      borderRadius: 6, padding: '2px 7px', cursor: 'pointer', fontSize: '.7rem',
                    }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Detail + Reply ── */}
          {selected && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Message detail */}
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--heading)', fontSize: '1rem', marginBottom: 6 }}>{selected.subject}</div>
                    <div style={{ fontSize: '.82rem', color: 'var(--text)', marginBottom: 2 }}>
                      From <span style={{ color: 'var(--heading)', fontWeight: 600 }}>{selected.name}</span>
                      {' '}&lt;<span style={{ color: 'var(--green)' }}>{selected.email}</span>&gt;
                    </div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text)', marginTop: 4 }}>
                      {new Date(selected.created_at).toLocaleString()}
                      {selected.is_read && <span style={{ marginLeft: 10, color: 'var(--green)', fontWeight: 600 }}>Read</span>}
                    </div>
                  </div>
                  <button onClick={() => { setSelected(null); setReply(''); setReplyStatus(null) }} style={{
                    background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '1rem', padding: '4px 8px',
                  }}>x</button>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <p style={{ color: 'var(--text)', lineHeight: 1.85, fontSize: '.92rem', whiteSpace: 'pre-wrap' }}>{selected.message}</p>
                </div>
              </div>

              {/* Reply form */}
              <div style={card}>
                <h3 style={{ color: 'var(--heading)', fontWeight: 700, fontSize: '.95rem', marginBottom: 14 }}>
                  Reply to {selected.name}
                  <span style={{ fontWeight: 400, color: 'var(--text)', fontSize: '.82rem', marginLeft: 8 }}>({selected.email})</span>
                </h3>

                {replyStatus === 'ok' ? (
                  <div style={{ padding: '14px 16px', background: 'var(--green-dim)', border: '1px solid rgba(0,255,136,.3)', borderRadius: 8, color: 'var(--green)', fontWeight: 600, fontSize: '.9rem', marginBottom: 12 }}>
                    Reply sent successfully.
                    <button onClick={() => setReplyStatus(null)} style={{ marginLeft: 12, background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer', textDecoration: 'underline', fontSize: '.85rem' }}>
                      Send another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={sendReply} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <textarea
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      placeholder={`Write your reply to ${selected.name}...`}
                      required
                      style={{
                        width: '100%', minHeight: 140, padding: '12px 14px',
                        background: 'var(--bg)', border: '1px solid var(--border)',
                        borderRadius: 8, color: 'var(--heading)', fontSize: '.9rem',
                        outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.7,
                        transition: 'border-color .2s',
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--green)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />

                    {replyStatus?.startsWith('err:') && (
                      <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 8, color: '#f87171', fontSize: '.85rem' }}>
                        {replyStatus.replace('err:', '')}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '.75rem', color: 'var(--text)' }}>
                        Will be sent from <span style={{ color: 'var(--heading)' }}>otpguard26@gmail.com</span>
                      </span>
                      <button type="submit" disabled={sending || !reply.trim()} style={{
                        padding: '9px 24px', borderRadius: 8, border: 'none',
                        background: sending || !reply.trim() ? 'var(--border)' : 'var(--green)',
                        color: sending || !reply.trim() ? 'var(--text)' : '#0a0e1a',
                        fontWeight: 700, cursor: sending || !reply.trim() ? 'not-allowed' : 'pointer',
                        fontSize: '.88rem', transition: 'all .2s',
                      }}>
                        {sending ? 'Sending...' : 'Send Reply'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
