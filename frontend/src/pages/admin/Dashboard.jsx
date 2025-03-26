import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, DollarSign, Calendar, Settings,
  TrendingUp, BarChart2, FileText, AlertCircle
} from 'lucide-react';
import DashboardHeader from '../../components/DashboardHeader';

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeBookings: 0,
    monthlyRevenue: 0,
    pendingApprovals: 0
  });

  // Simulated data - replace with actual API calls
  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalUsers: 156,
        activeBookings: 24,
        monthlyRevenue: 45600,
        pendingApprovals: 8
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const quickStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Active Bookings',
      value: stats.activeBookings,
      change: '+5%',
      trend: 'up',
      icon: Calendar,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      change: '+8%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      change: '-2',
      trend: 'down',
      icon: AlertCircle,
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'user_registration',
      message: 'New user registration: John Smith',
      time: '10 minutes ago',
    },
    {
      id: 2,
      type: 'booking_confirmed',
      message: 'Booking #1234 confirmed and payment received',
      time: '1 hour ago',
    },
    {
      id: 3,
      type: 'service_completed',
      message: 'Funeral service completed for booking #1230',
      time: '2 hours ago',
    },
    {
      id: 4,
      type: 'document_uploaded',
      message: 'Death certificate uploaded for booking #1228',
      time: '3 hours ago',
    },
  ];

  const headerActions = (
    <>
      <Link
        to="/dashboard/admin/reports"
        className="btn-primary"
      >
        <BarChart2 className="w-4 h-4 mr-2" />
        View Reports
      </Link>
      <Link
        to="/dashboard/admin/settings"
        className="btn-secondary"
      >
        <Settings className="w-4 h-4 mr-2" />
        Settings
      </Link>
    </>
  );

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="bg-white shadow-sm">
        <DashboardHeader 
          pageTitle="Admin Dashboard"
          actions={headerActions}
        />
      </div>
      
      <div className="flex-1 overflow-auto px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {quickStats.map((stat) => (
              <div
                key={stat.title}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <p className="mt-4 text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-gray-500">{stat.title}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6 h-full">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/dashboard/admin/users"
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Users className="w-6 h-6 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Manage Users</p>
                    <p className="text-sm text-gray-500">View and manage user accounts</p>
                  </div>
                </Link>
                <Link
                  to="/dashboard/admin/services"
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FileText className="w-6 h-6 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Services</p>
                    <p className="text-sm text-gray-500">Manage service offerings</p>
                  </div>
                </Link>
                <Link
                  to="/dashboard/admin/reports"
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Analytics</p>
                    <p className="text-sm text-gray-500">View business metrics</p>
                  </div>
                </Link>
                <Link
                  to="/dashboard/admin/settings"
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Settings className="w-6 h-6 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Settings</p>
                    <p className="text-sm text-gray-500">Configure system settings</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm h-full">
              <div className="p-6 border-b">
                <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
              </div>
              <div className="divide-y">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="p-6">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}