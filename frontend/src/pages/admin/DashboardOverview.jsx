import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, DollarSign, Calendar, Settings,
  TrendingUp, BarChart2, FileText, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardHeader from '../../components/DashboardHeader';
import api from '../../api/config';

export default function DashboardOverview() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeBookings: 0,
    monthlyRevenue: 0,
    pendingApprovals: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/users/admin/statistics');
        const { stats: dashboardStats, recentActivities: activities } = response.data;
        setStats(dashboardStats);
        setRecentActivities(activities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Refresh dashboard data every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const quickStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      trend: 'up',
      change: '+5%',
      format: (value) => value
    },
    {
      title: 'Active Bookings',
      value: stats.activeBookings,
      icon: Calendar,
      color: 'bg-green-100 text-green-600',
      trend: stats.activeBookings > 0 ? 'up' : 'neutral',
      change: stats.activeBookings > 0 ? `+${stats.activeBookings}` : '0',
      format: (value) => value
    },
    {
      title: 'Monthly Revenue',
      value: stats.monthlyRevenue,
      icon: DollarSign,
      color: 'bg-purple-100 text-purple-600',
      trend: stats.monthlyRevenue > 0 ? 'up' : 'neutral',
      change: stats.monthlyRevenue > 0 ? '+KSH ' + (stats.monthlyRevenue / 100).toFixed(1) + 'K' : 'KSH 0',
      format: (value) => `KSH ${value.toLocaleString()}`
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: AlertCircle,
      color: 'bg-yellow-100 text-yellow-600',
      trend: stats.pendingApprovals > 0 ? 'down' : 'neutral',
      change: stats.pendingApprovals > 0 ? `${stats.pendingApprovals} items` : 'None',
      format: (value) => value
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'payment':
        return <DollarSign className="w-5 h-5 text-green-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="bg-white shadow-sm">
        <DashboardHeader 
          pageTitle="Admin Dashboard"
          actions={headerActions}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto px-6">
          <div className="max-w-7xl mx-auto space-y-6">
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
                        stat.trend === 'up' ? 'text-green-600' : 
                        stat.trend === 'down' ? 'text-red-600' : 
                        'text-gray-600'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <p className="mt-4 text-2xl font-semibold text-gray-900">
                    {stat.format(stat.value)}
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
                    to="/dashboard/admin/documents"
                    className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FileText className="w-6 h-6 text-purple-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Documents</p>
                      <p className="text-sm text-gray-500">Manage document approvals</p>
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
                  {recentActivities.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No recent activities
                    </div>
                  ) : (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="p-6">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-4">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.message}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}