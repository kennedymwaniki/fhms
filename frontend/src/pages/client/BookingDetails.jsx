import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import bookingsService from '../../api/services/bookings.service';
import DashboardHeader from '../../components/DashboardHeader';

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookingDetails();
  }, [id]);

  const loadBookingDetails = async () => {
    try {
      const data = await bookingsService.getBookingDetails(id);
      setBooking(data);
    } catch (error) {
      toast.error('Failed to load booking details');
      navigate('/dashboard/client/bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
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
    switch (status?.toLowerCase()) {
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
        <DashboardHeader pageTitle="Booking Details" />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader pageTitle="Booking Details" />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">Booking not found</p>
            <button
              onClick={() => navigate('/dashboard/client/bookings')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Back to Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader pageTitle="Booking Details" />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Booking #{booking.id}
              </h3>
              <button
                onClick={() => navigate('/dashboard/client/bookings')}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Bookings
              </button>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Created on {new Date(booking.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`px-2 py-1 text-sm rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                <dd className="mt-1">
                  <span className={`px-2 py-1 text-sm rounded-full ${getPaymentStatusColor(booking.payment_status)}`}>
                    {booking.payment_status}
                  </span>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Deceased Information</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {booking.deceased_first_name} {booking.deceased_last_name}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Services</dt>
                <dd className="mt-2">
                  <div className="space-y-4">
                    {booking.services?.map((service) => (
                      <div key={service.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{service.service_name}</p>
                          <p className="text-sm text-gray-500">Quantity: {service.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          KSH {service.price_at_booking?.toLocaleString()}
                        </p>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 font-medium">
                      <p className="text-gray-900">Total Amount</p>
                      <p className="text-primary-600 text-lg">
                        KSH {booking.total_amount?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </dd>
              </div>
              {booking.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900">{booking.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}