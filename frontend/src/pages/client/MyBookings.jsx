import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useBookings } from '../../hooks/useBookings';
import DashboardHeader from '../../components/DashboardHeader';

export default function MyBookings() {
  const navigate = useNavigate();
  const { getClientBookings } = useBookings();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await getClientBookings();
      setBookings(data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-orange-100 text-orange-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader pageTitle="My Bookings" />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        pageTitle="My Bookings"
        actions={
          <button
            onClick={() => navigate('/dashboard/client/book-service')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            Book New Service
          </button>
        }
      />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl">😢</span>
            <p className="mt-4 text-lg text-gray-500">No bookings available</p>
            <button
              onClick={() => navigate('/dashboard/client/book-service')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Book a Service
            </button>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <li key={booking.id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-medium text-primary-600 truncate">
                            Booking #{booking.id}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                              {new Date(booking.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            Deceased: {booking.deceased_first_name} {booking.deceased_last_name}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(booking.payment_status)}`}>
                              {booking.payment_status}
                            </span>
                          </div>
                        </div>
                        {booking.services && booking.services.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-500">Services:</p>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {booking.services.map((service) => (
                                <span
                                  key={service.id}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {service.service_name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="mt-2 flex justify-between items-center">
                          <p className="text-sm font-medium text-gray-900">
                            Total Amount: KSH {booking.total_amount?.toLocaleString()}
                          </p>
                          <button
                            onClick={() => navigate(`/dashboard/client/bookings/${booking.id}`)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100"
                          >
                            View Details →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}