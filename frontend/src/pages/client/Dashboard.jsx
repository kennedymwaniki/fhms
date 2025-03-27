import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardOverview from './DashboardOverview';
import MyBookings from './MyBookings';
import BookingDetails from './BookingDetails';
import Documents from './Documents';
import Payments from './Payments';
import BookService from './BookService';
import Messages from './Messages';

export default function ClientDashboard() {
  return (
    <Routes>
      <Route index element={<DashboardOverview />} />
      <Route path="bookings" element={<MyBookings />} />
      <Route path="bookings/:id" element={<BookingDetails />} />
      <Route path="book-service" element={<BookService />} />
      <Route path="documents" element={<Documents />} />
      <Route path="payments" element={<Payments />} />
      <Route path="messages" element={<Messages />} />
      <Route path="*" element={<Navigate to="/dashboard/client" replace />} />
    </Routes>
  );
}