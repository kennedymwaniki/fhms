import React, { useState, useEffect } from 'react';
import { CreditCard, Phone, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import paymentsService from '../../api/services/payments.service';
import DashboardHeader from '../../components/DashboardHeader';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showMpesaDialog, setShowMpesaDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [mpesaPhone, setMpesaPhone] = useState('');

  useEffect(() => {
    loadPayments();
    loadPendingPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const data = await paymentsService.getMyPayments();
      setPayments(data.payments || []); // Ensure we always have an array
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payment history');
      setPayments([]); // Set empty array on error
    }
  };

  const loadPendingPayments = async () => {
    try {
      const data = await paymentsService.getPendingPayments();
      setPendingPayments(data.bookings || []); // Ensure we always have an array
    } catch (error) {
      console.error('Error loading pending payments:', error);
      toast.error('Failed to load pending payments');
      setPendingPayments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleMpesaPayment = async () => {
    if (!mpesaPhone.match(/^(?:254|\+254|0)?(7\d{8})$/)) {
      toast.error('Please enter a valid Safaricom phone number');
      return;
    }

    setProcessingPayment(true);
    try {
      const response = await paymentsService.initiateMpesa({
        phone: mpesaPhone.replace(/^(?:254|\+254|0)?(\d{9})$/, '254$1'),
        amount: selectedBooking.total_amount,
        bookingId: selectedBooking.id
      });

      toast.success('Please check your phone for the M-Pesa prompt');
      
      // Start polling for payment status
      let attempts = 0;
      const maxAttempts = 10;
      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const result = await paymentsService.verifyMpesaPayment(response.transactionId);
          if (result.status === 'completed') {
            clearInterval(pollInterval);
            toast.success('Payment completed successfully');
            setShowMpesaDialog(false);
            loadPayments();
            loadPendingPayments();
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            toast.error('Payment verification timeout. Please check your payment status later');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            toast.error('Failed to verify payment. Please contact support if payment was deducted');
          }
        }
      }, 5000);
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      toast.error('Failed to initiate M-Pesa payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader pageTitle="Payments" />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader pageTitle="Payments" />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-8">
        {/* Pending Payments Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Pending Payments</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Outstanding payments for your bookings</p>
          </div>
          
          {pendingPayments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No pending payments
            </div>
          ) : (
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {pendingPayments.map((booking) => (
                  <li key={booking.id} className="px-4 py-4 sm:px-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Booking #{booking.id} - {booking.deceased_first_name} {booking.deceased_last_name}
                        </p>
                        <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending Payment
                          </span>
                          <span className="text-sm text-gray-500">
                            Due Amount: KSH {booking.total_amount?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowMpesaDialog(true);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Pay with M-Pesa
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Payment History Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Payment History</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Record of your previous payments</p>
          </div>
          
          {payments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No payment records available
            </div>
          ) : (
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <li key={payment.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {payment.payment_method === 'mpesa' ? (
                            <Phone className="h-5 w-5 text-green-500 mr-3" />
                          ) : (
                            <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-primary-600">
                              Payment for Booking #{payment.booking_id}
                            </p>
                            <p className="text-sm text-gray-500">
                              Transaction ID: {payment.transaction_id}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 inline-flex text-sm leading-5 font-semibold rounded-full 
                            ${payment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              payment.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'}`}>
                            {payment.status}
                          </span>
                          <p className="ml-4 text-sm font-medium text-gray-900">
                            KSH {payment.amount?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {new Date(payment.payment_date).toLocaleDateString()} at {new Date(payment.payment_date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* M-Pesa Payment Dialog */}
      {showMpesaDialog && selectedBooking && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pay with M-Pesa</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Enter M-Pesa Phone Number</label>
                <div className="mt-1">
                  <input
                    type="tel"
                    placeholder="e.g., 0712345678"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">You will receive a prompt to pay KSH {selectedBooking.total_amount?.toLocaleString()}</p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowMpesaDialog(false);
                    setMpesaPhone('');
                    setSelectedBooking(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleMpesaPayment}
                  disabled={processingPayment}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4 mr-2" />
                      Pay Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}