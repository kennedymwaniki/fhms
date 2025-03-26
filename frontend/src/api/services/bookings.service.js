import api from '../config';

const bookingsService = {
  getMyBookings: async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },

  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  getBookingDetails: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  createDeceased: async (deceasedData) => {
    const response = await api.post('/deceased', deceasedData);
    return response.data;
  }
};

export default bookingsService;