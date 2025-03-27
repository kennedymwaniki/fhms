import api from '../config';

const paymentsService = {
  getMyPayments: async () => {
    const response = await api.get('/payments/my');
    return response.data;
  },

  getPendingPayments: async () => {
    const response = await api.get('/payments/pending');
    return response.data;
  },

  initiatePayment: async (paymentData) => {
    const response = await api.post('/payments/initiate', paymentData);
    return response.data;
  },

  // Initiate M-Pesa STK Push
  initiateMpesa: async (data) => {
    const response = await api.post('/payments/mpesa/initiate', {
      phone: data.phone,
      amount: data.amount,
      booking_id: data.bookingId
    });
    return response.data;
  },

  // Verify M-Pesa transaction
  verifyMpesaPayment: async (transactionId) => {
    const response = await api.get(`/payments/mpesa/verify/${transactionId}`);
    return response.data;
  },

  getPaymentDetails: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  }
};

export default paymentsService;