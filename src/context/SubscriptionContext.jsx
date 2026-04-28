import { createContext, useState, useEffect, useContext } from 'react'
import { API } from './AuthContext'

export const SubscriptionContext = createContext(null)

export function SubscriptionProvider({ children }) {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }

    fetch(`${API}/subscription/current`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => setSubscription(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      currentPlan:  subscription?.plan?.name || 'starter',
      planDetails:  subscription?.plan,
      isTrial:      subscription?.is_trial || false,
      trialEnds:    subscription?.trial_ends,
      loading,
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => useContext(SubscriptionContext)
