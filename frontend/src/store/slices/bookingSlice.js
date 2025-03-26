import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bookings: [],
  selectedBooking: null,
  loading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    fetchBookingsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBookingsSuccess: (state, action) => {
      state.loading = false;
      state.bookings = action.payload;
    },
    fetchBookingsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addBooking: (state, action) => {
      state.bookings.push(action.payload);
    },
    updateBookingStatus: (state, action) => {
      const { id, status } = action.payload;
      const booking = state.bookings.find(b => b.id === id);
      if (booking) {
        booking.status = status;
      }
    },
    setSelectedBooking: (state, action) => {
      state.selectedBooking = action.payload;
    },
    cancelBooking: (state, action) => {
      const index = state.bookings.findIndex(b => b.id === action.payload);
      if (index !== -1) {
        state.bookings[index].status = 'cancelled';
      }
    },
    assignAttendant: (state, action) => {
      const { bookingId, attendant } = action.payload;
      const booking = state.bookings.find(b => b.id === bookingId);
      if (booking) {
        booking.assignedAttendant = attendant;
      }
    }
  },
});

export const {
  fetchBookingsStart,
  fetchBookingsSuccess,
  fetchBookingsFailure,
  addBooking,
  updateBookingStatus,
  setSelectedBooking,
  cancelBooking,
  assignAttendant,
} = bookingSlice.actions;

export default bookingSlice.reducer;