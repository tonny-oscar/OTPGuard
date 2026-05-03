import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { SubscriptionProvider } from './context/SubscriptionContext'
import { useEffect, useState } from 'react'
import Navbar from './Components/Navbar'
import Footer from './Components/Footer'
import Landing from './Pages/Landing'
import Login from './Pages/Login'
import Register from './Pages/Register'
import Dashboard from './Pages/Dashboard'
import PlanBasedDashboard from './Pages/PlanBasedDashboard'
import Admin from './Pages/Admin'
import Docs from './Pages/Docs'
import ApiDocs from './Pages/ApiDocs'
import FeaturesPage from './Pages/FeaturesPage'
import PricingPage from './Pages/PricingPage'
import HowItWorksPage from './Pages/HowItWorksPage'
import PrivacyPolicy from './Pages/PrivacyPolicy'
import TermsOfService from './Pages/TermsOfService'
import FAQ from './Pages/FAQ'
import AboutUs from './Pages/AboutUs'
import ContactUs from './Pages/ContactUs'

// Scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])
  return null
}

// Floating scroll-to-top button
function ScrollTopButton() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  if (!visible) return null
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      title="Back to top"
      style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 200,
        width: 44, height: 44, borderRadius: '50%',
        background: 'var(--green)', border: 'none',
        color: '#0a0e1a', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(0,255,136,.35)',
        transition: 'transform .2s, box-shadow .2s',
        fontSize: '1.1rem', fontWeight: 800, lineHeight: 1,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,255,136,.5)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,255,136,.35)' }}
    >
      &#8679;
    </button>
  )
}
function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'var(--green)', fontSize:'1.2rem' }}>Loading...</div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <SubscriptionProvider>
        <ScrollToTop />
        <ScrollTopButton />
        <Routes>
          <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
          <Route path="/features"     element={<FeaturesPage />} />
          <Route path="/pricing"      element={<PricingPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/privacy"      element={<PrivacyPolicy />} />
          <Route path="/terms"        element={<TermsOfService />} />
          <Route path="/faq"          element={<FAQ />} />
          <Route path="/about"        element={<AboutUs />} />
          <Route path="/contact"      element={<ContactUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><PlanBasedDashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/legacy" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly><Admin /></ProtectedRoute>
          } />
          <Route path="/docs" element={<Docs />} />
          <Route path="/api-docs" element={<ApiDocs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SubscriptionProvider>
    </BrowserRouter>
  )
}
