import api from '../config';

const bookingsService = {
  getAllBookings: async () => {
    const response = await api.get('/bookings');
    return response.data.bookings;
  },

  getMyBookings: async () => {
    const response = await api.get('/bookings/my');
    return response.data.bookings;
  },

  getMorgueAttendantBookings: async () => {
    const response = await api.get('/bookings/attendant');
    return response.data.bookings;
  },

  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data.booking;
  },

  getBookingDetails: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data.booking;
  },

  updateBookingStatus: async (id, status) => {
    const response = await api.patch(`/bookings/${id}/status`, { status });
    return response.data.booking;
  },

  cancelBooking: async (id, reason) => {
    const response = await api.patch(`/bookings/${id}/status`, {
      status: 'cancelled',
      notes: reason
    });
    return response.data.booking;
  },

  assignMorgueAttendant: async (bookingId, attendantId) => {
    const response = await api.post(`/bookings/${bookingId}/assign`, {
      attendant_id: attendantId
    });
    return response.data;
  },

  createDeceased: async (deceasedData) => {
    const response = await api.post('/deceased', deceasedData);
    return response.data;
  },

  getDeceasedDetails: async (id) => {
    const response = await api.get(`/deceased/${id}`);
    return response.data.deceased;
  }
};

export default bookingsService;