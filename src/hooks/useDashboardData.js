import { useState, useEffect, useCallback } from 'react'
import { useAuth, API } from '../context/AuthContext'

/**
 * Fetches real dashboard data from the API.
 * Returns stats, activity, devices, apiKeys, usage, profile.
 */
export function useDashboardData() {
  const { token } = useAuth()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const [profile, activity, devices, keys, stats, usage] = await Promise.all([
        fetch(`${API}/users/profile`,     { headers }).then(r => r.json()),
        fetch(`${API}/users/activity`,    { headers }).then(r => r.json()),
        fetch(`${API}/users/devices`,     { headers }).then(r => r.json()),
        fetch(`${API}/users/api-keys`,    { headers }).then(r => r.json()),
        fetch(`${API}/users/stats`,       { headers }).then(r => r.json()),
        fetch(`${API}/subscription/usage`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
      ])
      setData({ profile, activity, devices, keys, stats, usage })
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  return {
    profile:   data?.profile?.user || null,
    activity:  data?.activity?.activity || [],
    devices:   data?.devices?.devices || [],
    apiKeys:   data?.keys?.api_keys || [],
    statCards: data?.stats?.stats || [],
    usage:     data?.usage || null,
    loading,
    error,
    reload: load,
  }
}
