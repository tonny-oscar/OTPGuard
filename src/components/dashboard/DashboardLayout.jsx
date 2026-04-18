import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        mobile={true}
      />
      
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <Sidebar mobile={false} />
      </div>
      
      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
