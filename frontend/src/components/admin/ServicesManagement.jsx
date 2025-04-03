import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Tag, CheckCircle, Clock, DollarSign, XCircle, RefreshCw } from 'lucide-react';
import api from '../../api/config';
import { useBookings } from '../../hooks/useBookings';
import bookingsService from '../../api/services/bookings.service';

export default function ServicesManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalBookings: 0,
    pendingPayments: 0,
    paidBookings: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings');
      setBookings(response.data.bookings);
      calculateSummary(response.data.bookings);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (bookingsData) => {
    const summary = {
      totalBookings: bookingsData.length,
      pendingPayments: bookingsData.filter(b => b.payment_status === 'pending').length,
      paidBookings: bookingsData.filter(b => b.payment_status === 'paid').length,
      monthlyRevenue: bookingsData
        .filter(b => b.payment_status === 'paid')
        .reduce((sum, b) => sum + b.total_amount, 0)
    };
    setSummary(summary);
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/status`, { 
        status: newStatus 
      });

      if (response.data.booking) {
        // Update the specific booking in state with the complete updated booking
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId ? response.data.booking : booking
          )
        );
        // Recalculate summary with updated data
        calculateSummary(bookings.map(booking => 
          booking.id === bookingId ? response.data.booking : booking
        ));
        toast.success(response.data.message || 'Booking status updated successfully');
      }
    } catch (error) {
      console.error('Update status error:', error);
      toast.error(error.response?.data?.message || 'Failed to update booking status');
      // Refresh bookings to ensure consistency
      fetchBookings();
    }
  };

  const updatePaymentStatus = async (bookingId, newPaymentStatus) => {
    try {
      setLoading(true);
      const response = await api.patch(`/bookings/${bookingId}/payment`, {
        payment_status: newPaymentStatus
      });

      if (response.data.booking) {
        // Update the specific booking in state with the complete updated booking
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId ? response.data.booking : booking
          )
        );

        // Recalculate summary with the latest data
        const updatedBookings = bookings.map(booking => 
          booking.id === bookingId ? response.data.booking : booking
        );
        calculateSummary(updatedBookings);
        
        toast.success('Payment status updated successfully');
      }
    } catch (error) {
      console.error('Update payment status error:', error);
      toast.error(error.response?.data?.message || 'Failed to update payment status');
      // Refresh the bookings to ensure consistency
      fetchBookings();
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Tag className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-semibold text-gray-900">
            {summary.totalBookings}
          </p>
          <p className="mt-1 text-sm text-gray-500">Total Bookings</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-semibold text-gray-900">
            {summary.pendingPayments}
          </p>
          <p className="mt-1 text-sm text-gray-500">Pending Payments</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-semibold text-gray-900">
            {summary.paidBookings}
          </p>
          <p className="mt-1 text-sm text-gray-500">Paid Bookings</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-semibold text-gray-900">
            KSH {summary.monthlyRevenue.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-gray-500">Monthly Revenue</p>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">All Bookings</h2>
            <button
              onClick={fetchBookings}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deceased
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Services
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{booking.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.client_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.deceased_first_name} {booking.deceased_last_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {booking.services?.map((service) => (
                        <span
                          key={service.id}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {service.service_name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    KSH {booking.total_amount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={booking.status}
                      onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                      disabled={loading}
                      className={`text-sm rounded-full px-2 py-1 font-medium w-full cursor-pointer ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={booking.payment_status}
                      onChange={(e) => updatePaymentStatus(booking.id, e.target.value)}
                      disabled={loading}
                      className={`text-sm rounded-full px-2 py-1 font-medium w-full cursor-pointer ${getPaymentStatusColor(
                        booking.payment_status
                      )}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="partial">Partial</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      disabled={loading}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}