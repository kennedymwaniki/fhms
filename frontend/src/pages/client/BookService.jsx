import React from 'react';
import { Link } from 'react-router-dom';
import ServiceBooking from '../../components/services/ServiceBooking';

export default function BookService() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Book a Service</h1>
            <p className="mt-2 text-sm text-gray-600">
              Choose a service and provide the necessary details to make a booking
            </p>
          </div>
          <Link
            to="/dashboard/client/bookings"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View My Bookings →
          </Link>
        </div>
        <ServiceBooking />
      </div>
    </div>
  );
}