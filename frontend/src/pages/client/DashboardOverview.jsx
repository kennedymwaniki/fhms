import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Package, FileText, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBookings } from '../../hooks/useBookings';
import DashboardHeader from '../../components/DashboardHeader';

export default function DashboardOverview() {
  const { user } = useAuth();
  const { getClientBookings } = useBookings();
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([
    {
      title: 'Active Bookings',
      value: 0,
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Completed Services',
      value: 0,
      icon: Package,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Pending Documents',
      value: 0,
      icon: FileText,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'Notifications',
      value: 0,
      icon: AlertCircle,
      color: 'bg-purple-100 text-purple-600',
    }
  ]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookings = await getClientBookings();
        setRecentBookings(bookings);
        
        // Update stats with actual data
        setStats(prevStats => [
          {
            ...prevStats[0],
            value: bookings.filter(b => b.status === 'active' || b.status === 'pending').length
          },
          {
            ...prevStats[1],
            value: bookings.filter(b => b.status === 'completed').length
          },
          {
            ...prevStats[2],
            value: bookings.filter(b => b.required_documents && b.required_documents.length > 0).length
          },
          {
            ...prevStats[3],
            value: bookings.filter(b => b.has_notifications).length
          }
        ]);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [getClientBookings]);

  const headerActions = (
    <Link
      to="/dashboard/client/book-service"
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
    >
      Book New Service
    </Link>
  );

  return (
    <div className="flex-1 overflow-auto">
      <DashboardHeader 
        pageTitle={`Welcome back, ${user?.name}`}
        actions={headerActions}
      />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
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
              recentBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Booking #{booking.id} - {booking.deceased_first_name} {booking.deceased_last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.services?.map(service => service.service_name).join(', ')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/dashboard/client/documents"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-lg font-medium text-gray-900">Manage Documents</p>
                <p className="text-sm text-gray-500">View and upload documents</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/dashboard/client/payments"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <Package className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-lg font-medium text-gray-900">Payment History</p>
                <p className="text-sm text-gray-500">View your payments</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/dashboard/client/messages"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-lg font-medium text-gray-900">Messages</p>
                <p className="text-sm text-gray-500">Contact support</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}