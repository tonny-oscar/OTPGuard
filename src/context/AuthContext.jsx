import { createContext, useContext, useState, useEffect } from 'react'

export const AuthContext = createContext(null)
export const API = import.meta.env.VITE_API_URL || '/api'

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [token, setToken]   = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setUser(d.user))
      .catch(() => { localStorage.removeItem('token'); setToken(null) })
      .finally(() => setLoading(false))
  }, [])

  function saveSession(access, refresh, userData) {
    localStorage.setItem('token', access)
    localStorage.setItem('refresh_token', refresh)
    setToken(access)
    setUser(userData)
  }

  async function register(payload) {
    const r = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error || 'Registration failed')
    saveSession(d.access_token, d.refresh_token, d.user)
    return d
  }

  async function login(email, password) {
    const r = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error || 'Login failed')
    if (d.mfa_required) {
      localStorage.setItem('pre_auth_token', d.pre_auth_token)
      return d
    }
    saveSession(d.access_token, d.refresh_token, d.user)
    return d
  }

  async function sendOTP() {
    const pre = localStorage.getItem('pre_auth_token')
    const r = await fetch(`${API}/mfa/send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${pre}` }
    })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error || 'Failed to send OTP')
    return d
  }

  async function verifyOTP(code) {
    const pre = localStorage.getItem('pre_auth_token')
    const r = await fetch(`${API}/mfa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pre}` },
      body: JSON.stringify({ code })
    })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error || 'Invalid OTP')
    localStorage.removeItem('pre_auth_token')
    saveSession(d.access_token, d.refresh_token, d.user)
    return d
  }

  async function resendOTP() {
    const pre = localStorage.getItem('pre_auth_token')
    const r = await fetch(`${API}/mfa/resend`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${pre}` }
    })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error || 'Failed to resend OTP')
    return d
  }

  function logout() {
    ['token','refresh_token','pre_auth_token'].forEach(k => localStorage.removeItem(k))
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, sendOTP, verifyOTP, resendOTP, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
