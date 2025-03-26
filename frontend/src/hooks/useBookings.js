import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { useCallback } from 'react';
import bookingsService from '../api/services/bookings.service';
import {
  fetchBookingsStart,
  fetchBookingsSuccess,
  fetchBookingsFailure,
  addBooking,
  updateBookingStatus,
  cancelBooking,
  assignAttendant,
} from '../store/slices/bookingSlice';

export const useBookings = () => {
  const dispatch = useDispatch();
  const { bookings, selectedBooking, loading, error } = useSelector(
    (state) => state.bookings
  );

  const fetchBookings = async () => {
    try {
      dispatch(fetchBookingsStart());
      const data = await bookingsService.getAllBookings();
      dispatch(fetchBookingsSuccess(data));
    } catch (error) {
      dispatch(fetchBookingsFailure(error.response?.data?.message));
      toast.error('Failed to fetch bookings');
    }
  };

  const createBooking = async (bookingData) => {
    try {
      const response = await bookingsService.createBooking(bookingData);
      dispatch(addBooking(response));
      toast.success('Booking created successfully');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
      throw error;
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await bookingsService.updateBookingStatus(id, status);
      dispatch(updateBookingStatus({ id, status }));
      toast.success('Booking status updated');
    } catch (error) {
      toast.error('Failed to update booking status');
      throw error;
    }
  };

  const handleCancelBooking = async (id, reason) => {
    try {
      await bookingsService.cancelBooking(id, reason);
      dispatch(cancelBooking(id));
      toast.success('Booking cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel booking');
      throw error;
    }
  };

  const handleAssignAttendant = async (bookingId, attendantId) => {
    try {
      const response = await bookingsService.assignMorgueAttendant(
        bookingId,
        attendantId
      );
      dispatch(assignAttendant({ bookingId, attendant: response.attendant }));
      toast.success('Attendant assigned successfully');
    } catch (error) {
      toast.error('Failed to assign attendant');
      throw error;
    }
  };

  const getUserBookings = async () => {
    try {
      dispatch(fetchBookingsStart());
      const data = await bookingsService.getUserBookings();
      dispatch(fetchBookingsSuccess(data));
    } catch (error) {
      dispatch(fetchBookingsFailure(error.response?.data?.message));
      toast.error('Failed to fetch user bookings');
    }
  };

  const getAttendantBookings = async () => {
    try {
      dispatch(fetchBookingsStart());
      const data = await bookingsService.getMorgueAttendantBookings();
      dispatch(fetchBookingsSuccess(data));
    } catch (error) {
      dispatch(fetchBookingsFailure(error.response?.data?.message));
      toast.error('Failed to fetch attendant bookings');
    }
  };

  const getClientBookings = useCallback(async () => {
    try {
      const data = await bookingsService.getMyBookings();
      return data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }, []);

  return {
    bookings,
    selectedBooking,
    loading,
    error,
    fetchBookings,
    createBooking,
    updateStatus,
    cancelBooking: handleCancelBooking,
    assignAttendant: handleAssignAttendant,
    getUserBookings,
    getAttendantBookings,
    getClientBookings,
  };
}