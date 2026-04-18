import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchSubscription();
  }, []);
  
  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      const response = await axios.get('http://localhost:5000/api/subscription/current', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSubscription(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      setError(err.message);
      // Default to starter if no subscription
      setSubscription({
        plan: { name: 'starter' },
        status: 'active'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    subscription,
    currentPlan: subscription?.plan?.name || 'starter',
    planDetails: subscription?.plan,
    isActive: subscription?.is_active || false,
    isTrial: subscription?.is_trial || false,
    trialEnds: subscription?.trial_ends,
    loading,
    error,
    refetch: fetchSubscription
  };
  
  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
