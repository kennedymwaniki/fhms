import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Users, Calendar, FileText, Settings, Mail, 
  CreditCard, Truck, ClipboardList, BarChart2, Database
} from 'lucide-react';

const navigationConfig = {
  client: [
    { name: 'Dashboard', href: '/dashboard/client', icon: Home },
    { name: 'Book Service', href: '/dashboard/client/book-service', icon: Calendar },
    { name: 'My Bookings', href: '/dashboard/client/bookings', icon: ClipboardList },
    { name: 'Documents', href: '/dashboard/client/documents', icon: FileText },
    { name: 'Payments', href: '/dashboard/client/payments', icon: CreditCard },
    { name: 'Messages', href: '/dashboard/client/messages', icon: Mail },
  ],
  morgueAttendant: [
    { name: 'Dashboard', href: '/dashboard/morgue', icon: Home },
    { name: 'Body Management', href: '/dashboard/morgue/body-management', icon: Database },
    { name: 'Preparation Tasks', href: '/dashboard/morgue/tasks', icon: ClipboardList },
    { name: 'Transport', href: '/dashboard/morgue/transport', icon: Truck },
    { name: 'Documents', href: '/dashboard/morgue/documents', icon: FileText },
    { name: 'Messages', href: '/dashboard/morgue/messages', icon: Mail },
  ],
  admin: [
    { name: 'Dashboard', href: '/dashboard/admin', icon: Home },
    { name: 'Users', href: '/dashboard/admin/users', icon: Users },
    { name: 'Services', href: '/dashboard/admin/services', icon: ClipboardList },
    { name: 'Reports', href: '/dashboard/admin/reports', icon: BarChart2 },
    { name: 'Documents', href: '/dashboard/admin/documents', icon: FileText },
    { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
  ],
};

export default function Sidebar({ isOpen, onClose, userRole }) {
  const location = useLocation();
  const navigation = navigationConfig[userRole] || [];

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-16 left-0 z-40 w-64 bg-white shadow-lg h-[calc(100vh-4rem)] transform transition-transform duration-300 ease-in-out lg:sticky lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium">
                  {userRole?.[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {userRole?.[0]?.toUpperCase() + userRole?.slice(1)}
                </p>
                <p className="text-xs text-gray-500">Portal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}