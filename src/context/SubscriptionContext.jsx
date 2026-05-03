import { createContext, useState, useEffect, useContext, useCallback } from 'react'
import { API } from './AuthContext'

export const SubscriptionContext = createContext(null)

export function SubscriptionProvider({ children }) {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading]           = useState(true)

  // Fetch subscription — called on mount and after login/plan change
  const refresh = useCallback(() => {
    const token = localStorage.getItem('token')
    if (!token) { setSubscription(null); setLoading(false); return }

    setLoading(true)
    fetch(`${API}/subscription/current`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setSubscription(d); else setSubscription(null) })
      .catch(() => setSubscription(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { refresh() }, [refresh])

  // Derive plan name: from subscription → fallback to user.plan in localStorage
  const currentPlan = subscription?.plan?.name ||
    (() => { try { return JSON.parse(atob((localStorage.getItem('token')||'').split('.')[1]||'e30='))?.plan } catch { return null } })() ||
    'starter'

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      currentPlan,
      planDetails:  subscription?.plan,
      isTrial:      subscription?.is_trial || false,
      trialEnds:    subscription?.trial_ends,
      loading,
      refresh,
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => useContext(SubscriptionContext)
