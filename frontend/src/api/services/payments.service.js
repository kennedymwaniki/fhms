import api from '../config';

const paymentsService = {
  getMyPayments: async () => {
    const response = await api.get('/payments/my-payments');
    return response.data;
  },

  makePayment: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  getPaymentDetails: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  }
};

export default paymentsService;