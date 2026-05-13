import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth, API } from '../../context/AuthContext'

const CHAT_KEY  = 'otpguard_chat_session'
const POLL_MS   = 3500

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
  borderRadius: 10, padding: '8px 12px', color: '#f1f5f9',
  fontSize: '.82rem', outline: 'none', fontFamily: 'inherit',
  transition: 'border-color .2s',
}

export default function ChatWidget() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen]       = useState(false)
  const [view, setView]       = useState('home') // home | chat | kb
  const [session, setSession] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(CHAT_KEY) || 'null') } catch { return null }
  })
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [sending, setSending]   = useState(false)
  const [startForm, setStartForm] = useState({ name: '', email: '', message: '' })
  const [starting, setStarting]   = useState(false)
  const [startError, setStartErr] = useState(null)
  const [kbResults, setKbResults] = useState([])
  const [kbQuery, setKbQuery]     = useState('')
  const [kbLoading, setKbLoad]    = useState(false)
  const [unread, setUnread]       = useState(0)
  const bottomRef  = useRef(null)
  const pollRef    = useRef(null)
  const debounceRef = useRef(null)
  const prevMsgLen  = useRef(messages.length)

  useEffect(() => {
    if (user) setStartForm(f => ({ ...f, name: f.name || user.full_name || '', email: f.email || user.email || '' }))
  }, [user])

  // Auto-switch to chat view if session exists and widget opens
  useEffect(() => {
    if (open && session) setView('chat')
    else if (open && !session) setView('home')
  }, [open, session])

  const pollMessages = useCallback(() => {
    if (!session) return
    fetch(`${API}/support/tickets/chat/${session.ticketNumber}/messages?email=${encodeURIComponent(session.email)}`)
      .then(r => r.json())
      .then(d => {
        const msgs = d.messages || []
        setMessages(msgs)
        if (!open && msgs.length > prevMsgLen.current) {
          setUnread(u => u + msgs.length - prevMsgLen.current)
        }
        prevMsgLen.current = msgs.length
        if (open) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
      }).catch(() => {})
  }, [session, open])

  useEffect(() => {
    if (!session) return
    pollMessages()
    pollRef.current = setInterval(pollMessages, POLL_MS)
    return () => clearInterval(pollRef.current)
  }, [session, pollMessages])

  // KB search debounce
  function handleKbSearch(val) {
    setKbQuery(val)
    clearTimeout(debounceRef.current)
    if (!val.trim()) { setKbResults([]); return }
    setKbLoad(true)
    debounceRef.current = setTimeout(() => {
      fetch(`${API}/support/kb/search?q=${encodeURIComponent(val)}&limit=5`)
        .then(r => r.json()).then(d => setKbResults(d.results || [])).catch(() => setKbResults([]))
        .finally(() => setKbLoad(false))
    }, 350)
  }

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
      setView('chat')
      setUnread(0)
    } catch (err) {
      setStartErr(err.message)
    } finally { setStarting(false) }
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!input.trim() || sending || !session) return
    const text = input.trim()
    setSending(true); setInput('')
    // Optimistic update
    setMessages(m => [...m, { id: Date.now(), sender_type: 'user', sender_name: 'You', message: text, created_at: new Date().toISOString() }])
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
    try {
      await fetch(`${API}/support/tickets/chat/${session.ticketNumber}/reply`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.email, message: text }),
      })
      pollMessages()
    } finally { setSending(false) }
  }

  function closeWidget() { setOpen(false); setUnread(0) }

  function endChat() {
    sessionStorage.removeItem(CHAT_KEY)
    setSession(null); setMessages([]); setView('home')
    prevMsgLen.current = 0
  }

  // ── Trigger button ────────────────────────────────────────────────────────
  const TriggerBtn = (
    <AnimatePresence>
      {!open && (
        <motion.button key="trigger"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: .93 }}
          onClick={() => { setOpen(true); setUnread(0) }}
          title="Support Chat"
          style={{ position: 'fixed', bottom: 28, left: 28, zIndex: 9000, width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg,#1e3a5f,#0f2240)', border: '2px solid rgba(59,130,246,.55)', boxShadow: '0 4px 24px rgba(59,130,246,.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}
        >
          💬
          {unread > 0 && (
            <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: '.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  )

  // ── Close button ──────────────────────────────────────────────────────────
  const CloseBtn = open && (
    <button onClick={closeWidget}
      style={{ position: 'fixed', bottom: 28, left: 28, zIndex: 9001, width: 54, height: 54, borderRadius: '50%', background: 'rgba(248,113,113,.15)', border: '2px solid rgba(248,113,113,.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: '#f87171', fontWeight: 800, transition: 'all .2s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,.28)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,.15)'}
    >✕</button>
  )

  // ── Panel ─────────────────────────────────────────────────────────────────
  const Panel = (
    <AnimatePresence>
      {open && (
        <motion.div key="panel"
          initial={{ opacity: 0, y: 40, scale: .95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: .95 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          style={{ position: 'fixed', bottom: 94, left: 28, zIndex: 9001, width: 340, maxHeight: 520, background: 'rgba(10,14,26,.97)', border: '1px solid rgba(59,130,246,.3)', borderRadius: 20, boxShadow: '0 24px 64px rgba(0,0,0,.7)', display: 'flex', flexDirection: 'column', overflow: 'hidden', backdropFilter: 'blur(20px)' }}
        >
          {/* Header */}
          <div style={{ padding: '14px 16px 12px', background: 'linear-gradient(135deg,rgba(59,130,246,.15),rgba(59,130,246,.05))', borderBottom: '1px solid rgba(59,130,246,.2)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem', flexShrink: 0 }}>🛡️</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '.85rem', fontWeight: 700, color: '#f1f5f9' }}>OTPGuard Support</div>
              <div style={{ fontSize: '.68rem', color: '#00ff88', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00ff88', display: 'inline-block' }} />
                Online · Usually replies in minutes
              </div>
            </div>
            {/* View switcher */}
            <div style={{ display: 'flex', gap: 3 }}>
              {[['home', '⊞'], ['chat', '💬'], ['kb', '📚']].map(([v, icon]) => (
                <button key={v} onClick={() => setView(v)}
                  style={{ background: view === v ? 'rgba(59,130,246,.25)' : 'none', border: `1px solid ${view === v ? 'rgba(59,130,246,.4)' : 'transparent'}`, borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: view === v ? '#3b82f6' : '#94a3b8', fontSize: '.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

            {/* ── HOME VIEW ── */}
            {view === 'home' && (
              <div style={{ padding: '12px 14px' }}>
                {session ? (
                  <div>
                    <div style={{ fontSize: '.72rem', color: '#94a3b8', fontWeight: 600, letterSpacing: .5, textTransform: 'uppercase', marginBottom: 8 }}>Active Chat</div>
                    <button onClick={() => setView('chat')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.2)', cursor: 'pointer', textAlign: 'left' }}>
                      <span style={{ fontSize: '1.1rem' }}>💬</span>
                      <div>
                        <div style={{ fontSize: '.82rem', fontWeight: 600, color: '#f1f5f9' }}>Continue conversation</div>
                        <div style={{ fontSize: '.7rem', color: '#94a3b8' }}>#{session.ticketNumber}</div>
                      </div>
                      <span style={{ marginLeft: 'auto', color: '#94a3b8' }}>›</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '.72rem', color: '#94a3b8', fontWeight: 600, letterSpacing: .5, textTransform: 'uppercase', marginBottom: 8 }}>Quick Actions</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                      {[
                        { icon: '💬', label: 'Start Live Chat', sub: 'Chat with our team now', action: () => setView('chat') },
                        { icon: '📚', label: 'Knowledge Base', sub: 'Browse help articles', action: () => setView('kb') },
                        { icon: '🎫', label: 'Submit a Ticket', sub: 'For detailed issues', action: () => { navigate('/support'); closeWidget() } },
                        { icon: '🔍', label: 'Track a Ticket', sub: 'Check ticket status', action: () => { navigate('/support'); closeWidget() } },
                      ].map(a => (
                        <button key={a.label} onClick={a.action}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,.08)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,.25)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)' }}
                        >
                          <span style={{ fontSize: '1.05rem', flexShrink: 0 }}>{a.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '.8rem', fontWeight: 600, color: '#f1f5f9' }}>{a.label}</div>
                            <div style={{ fontSize: '.68rem', color: '#94a3b8' }}>{a.sub}</div>
                          </div>
                          <span style={{ color: '#94a3b8', fontSize: '.8rem' }}>›</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(0,255,136,.05)', border: '1px solid rgba(0,255,136,.1)', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span>⚡</span>
                  <div style={{ fontSize: '.72rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    Avg response: <span style={{ color: '#00ff88', fontWeight: 700 }}>under 2 hours</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── CHAT VIEW ── */}
            {view === 'chat' && (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                {!session ? (
                  /* Start form */
                  <div style={{ padding: '14px' }}>
                    <div style={{ fontSize: '.78rem', color: '#94a3b8', marginBottom: 12 }}>Start a conversation with our support team.</div>
                    {startError && <div style={{ color: '#f87171', fontSize: '.75rem', marginBottom: 10, padding: '8px 10px', background: 'rgba(248,113,113,.08)', borderRadius: 8 }}>⚠ {startError}</div>}
                    <form onSubmit={startChat} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {!user && (
                        <>
                          <input value={startForm.name} onChange={e => setStartForm(f => ({ ...f, name: e.target.value }))} required placeholder="Your name" style={inputStyle}
                            onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.1)'} />
                          <input value={startForm.email} onChange={e => setStartForm(f => ({ ...f, email: e.target.value }))} required type="email" placeholder="Email address" style={inputStyle}
                            onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.1)'} />
                        </>
                      )}
                      <textarea value={startForm.message} onChange={e => setStartForm(f => ({ ...f, message: e.target.value }))} required rows={3}
                        placeholder="How can we help you?"
                        style={{ ...inputStyle, resize: 'none' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.1)'} />
                      <button type="submit" disabled={starting}
                        style={{ padding: '10px', borderRadius: 10, border: 'none', background: starting ? 'rgba(255,255,255,.08)' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)', color: '#fff', fontWeight: 700, cursor: starting ? 'not-allowed' : 'pointer', fontSize: '.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        {starting ? '…' : '💬 Start Chat'}
                      </button>
                    </form>
                  </div>
                ) : (
                  /* Active chat */
                  <>
                    {/* Session info bar */}
                    <div style={{ padding: '7px 14px', background: 'rgba(0,0,0,.2)', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '.68rem', color: '#94a3b8' }}>#{session.ticketNumber}</span>
                      <button onClick={endChat} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '.68rem', fontWeight: 600 }}>End chat</button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 200 }}>
                      {messages.map((msg) => {
                        const isUser = msg.sender_type === 'user'
                        return (
                          <div key={msg.id} style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', gap: 7, alignItems: 'flex-end' }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: isUser ? 'rgba(0,255,136,.15)' : msg.sender_type === 'system' ? 'rgba(59,130,246,.15)' : 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', flexShrink: 0 }}>
                              {isUser ? '👤' : msg.sender_type === 'system' ? '🤖' : '👨‍💼'}
                            </div>
                            <div style={{ maxWidth: '80%' }}>
                              <div style={{ background: isUser ? 'rgba(0,255,136,.15)' : msg.sender_type === 'system' ? 'rgba(59,130,246,.1)' : 'rgba(255,255,255,.08)', border: `1px solid ${isUser ? 'rgba(0,255,136,.25)' : msg.sender_type === 'system' ? 'rgba(59,130,246,.2)' : 'rgba(255,255,255,.08)'}`, borderRadius: isUser ? '12px 12px 3px 12px' : '12px 12px 12px 3px', padding: '7px 11px', fontSize: '.8rem', color: '#e2e8f0', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                                {msg.message}
                              </div>
                              <div style={{ fontSize: '.6rem', color: '#64748b', marginTop: 3, textAlign: isUser ? 'right' : 'left' }}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={sendMessage} style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', gap: 8, flexShrink: 0 }}>
                      <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message…"
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e) } }}
                        style={{ ...inputStyle, flex: 1, padding: '7px 11px' }}
                        onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.1)'} />
                      <button type="submit" disabled={!input.trim() || sending}
                        style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '.8rem', opacity: (!input.trim() || sending) ? .5 : 1, flexShrink: 0 }}>
                        {sending ? '…' : '→'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}

            {/* ── KB SEARCH VIEW ── */}
            {view === 'kb' && (
              <div style={{ padding: '12px 14px' }}>
                <div style={{ position: 'relative', marginBottom: 12 }}>
                  <input value={kbQuery} onChange={e => handleKbSearch(e.target.value)} placeholder="Search help articles…"
                    style={{ ...inputStyle, paddingLeft: 34 }}
                    onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.1)'} />
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: '.8rem', color: '#94a3b8', pointerEvents: 'none' }}>{kbLoading ? '⟳' : '⌕'}</span>
                </div>
                {kbResults.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {kbResults.map(a => (
                      <button key={a.id} onClick={() => { navigate('/support'); closeWidget() }}
                        style={{ textAlign: 'left', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '9px 11px', cursor: 'pointer', transition: 'all .15s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,255,136,.3)'; e.currentTarget.style.background = 'rgba(0,255,136,.05)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; e.currentTarget.style.background = 'rgba(255,255,255,.04)' }}
                      >
                        <div style={{ fontSize: '.8rem', fontWeight: 600, color: '#f1f5f9', marginBottom: 2, lineHeight: 1.3 }}>{a.title}</div>
                        <div style={{ fontSize: '.7rem', color: '#94a3b8', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{a.excerpt}</div>
                      </button>
                    ))}
                  </div>
                ) : kbQuery && !kbLoading ? (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>🔍</div>
                    <div style={{ fontSize: '.78rem', color: '#94a3b8', marginBottom: 12 }}>No articles found.</div>
                    <button onClick={() => { navigate('/support'); closeWidget() }}
                      style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(59,130,246,.15)', border: '1px solid rgba(59,130,246,.3)', color: '#3b82f6', cursor: 'pointer', fontSize: '.75rem', fontWeight: 600 }}>
                      Submit a ticket →
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: '.68rem', color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .5, fontWeight: 600 }}>Popular Topics</div>
                    {['Quick Start Guide', 'Setting Up Email OTP', 'Not Receiving OTP Codes', 'API Authentication'].map(t => (
                      <button key={t} onClick={() => { navigate('/support'); closeWidget() }}
                        style={{ textAlign: 'left', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', fontSize: '.78rem', color: '#e2e8f0', transition: 'all .15s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,255,136,.25)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'}
                      >📄 {t}</button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,.06)', textAlign: 'center', flexShrink: 0 }}>
            <button onClick={() => { navigate('/support'); closeWidget() }}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '.72rem' }}>
              Open full support center →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      {TriggerBtn}
      {CloseBtn}
      {Panel}
    </>
  )
}
