import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingsService from '../../api/services/bookings.service';
import DashboardHeader from '../../components/DashboardHeader';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await bookingsService.getMyBookings();
      setBookings(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading bookings:', error);
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
      <DashboardHeader pageTitle="My Bookings" />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl">😢</span>
            <p className="mt-4 text-lg text-gray-500">No bookings available</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <li key={booking.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                       onClick={() => navigate(`/dashboard/client/bookings/${booking.id}`)}>
                    <div className="flex items-center justify-between">
                      <div className="sm:flex">
                        <p className="text-sm font-medium text-primary-600 truncate">
                          {booking.serviceName}
                        </p>
                        <p className="mt-1 sm:mt-0 sm:ml-6 text-sm text-gray-500">
                          Status: <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                              booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {booking.status}
                          </span>
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="text-sm text-gray-500">
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Time: {booking.bookingTime}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}