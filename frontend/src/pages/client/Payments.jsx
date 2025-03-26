import React, { useState, useEffect } from 'react';
import paymentsService from '../../api/services/payments.service';
import DashboardHeader from '../../components/DashboardHeader';
import { CreditCard } from 'lucide-react';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const data = await paymentsService.getMyPayments();
      setPayments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading payments:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader pageTitle="Payments" />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl">😢</span>
            <p className="mt-4 text-lg text-gray-500">No payment records available</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Payment History</h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <li key={payment.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-primary-600">
                              {payment.description || 'Payment'}
                            </p>
                            <p className="text-sm text-gray-500">
                              Transaction ID: {payment.transactionId}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 inline-flex text-sm leading-5 font-semibold rounded-full 
                            ${payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                              payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {payment.status}
                          </span>
                          <p className="ml-4 text-sm font-medium text-gray-900">
                            KES {payment.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {new Date(payment.date).toLocaleDateString()} at {new Date(payment.date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}