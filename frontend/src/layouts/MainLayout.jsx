import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="flex pt-16"> {/* Add pt-16 to account for fixed navbar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userRole={user?.role}
        />
        
        <main className="flex-1 min-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="h-full p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}