import { useState, useEffect } from 'react';
import { Link, Routes, Route, Navigate } from 'react-router-dom';
import { Calendar, Package, FileText, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBookings } from '../../hooks/useBookings';
import DashboardHeader from '../../components/DashboardHeader';
import DashboardOverview from './DashboardOverview';
import MyBookings from './MyBookings';
import Documents from './Documents';
import Payments from './Payments';
import BookService from './BookService';
import Messages from './Messages';

export default function ClientDashboard() {
  const { user } = useAuth();
  const { getClientBookings } = useBookings();
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookings = await getClientBookings();
        setRecentBookings(bookings.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [getClientBookings]);

  const stats = [
    {
      title: 'Active Bookings',
      value: recentBookings.filter(b => b.status === 'active').length,
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Completed Services',
      value: recentBookings.filter(b => b.status === 'completed').length,
      icon: Package,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Pending Documents',
      value: 2,
      icon: FileText,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'Notifications',
      value: 3,
      icon: AlertCircle,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const headerActions = (
    <Link
      to="/dashboard/client/book-service"
      className="btn-primary"
    >
      Book New Service
    </Link>
  );

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader 
        pageTitle={`Welcome back, ${user?.name}`}
        actions={headerActions}
      />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-lg font-medium text-gray-900">Recent Bookings</h2>
            </div>
            <div className="divide-y">
              {isLoading ? (
                <div className="p-6 text-center text-gray-500">Loading...</div>
              ) : recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{booking.serviceName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          booking.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                      <Link
                        to={`/dashboard/client/bookings/${booking.id}`}
                        className="ml-4 text-sm font-medium text-primary-600 hover:text-primary-700"
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No recent bookings found.{' '}
                  <Link
                    to="/dashboard/client/book-service"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Book your first service
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Routes>
        <Route index element={<DashboardOverview />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="book-service" element={<BookService />} />
        <Route path="documents" element={<Documents />} />
        <Route path="payments" element={<Payments />} />
        <Route path="messages" element={<Messages />} />
        <Route path="*" element={<Navigate to="/dashboard/client" replace />} />
      </Routes>
    </div>
  );
}