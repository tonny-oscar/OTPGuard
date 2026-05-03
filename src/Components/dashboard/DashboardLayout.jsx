import { useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main style={{ flex: 1, padding: '32px 28px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
