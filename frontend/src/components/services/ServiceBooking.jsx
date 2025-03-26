import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Package, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useServices } from '../../hooks/useServices';
import { useBookings } from '../../hooks/useBookings';

const steps = [
  { id: 'service', name: 'Select Service' },
  { id: 'details', name: 'Service Details' },
  { id: 'date', name: 'Date & Time' },
  { id: 'review', name: 'Review & Pay' },
];

export default function ServiceBooking() {
  const navigate = useNavigate();
  const { services, loading: servicesLoading } = useServices();
  const { createBooking } = useBookings();
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    serviceId: '',
    serviceName: '',
    date: '',
    time: '',
    additionalServices: [],
    specialRequests: '',
    totalAmount: 0,
  });

  const handleServiceSelect = (service) => {
    setBookingData((prev) => ({
      ...prev,
      serviceId: service.id,
      serviceName: service.name,
      totalAmount: service.basePrice,
    }));
    setCurrentStep(1);
  };

  const handleAdditionalService = (service) => {
    setBookingData((prev) => {
      const exists = prev.additionalServices.find((s) => s.id === service.id);
      const updatedServices = exists
        ? prev.additionalServices.filter((s) => s.id !== service.id)
        : [...prev.additionalServices, service];
      
      return {
        ...prev,
        additionalServices: updatedServices,
        totalAmount:
          prev.totalAmount + (exists ? -service.price : service.price),
      };
    });
  };

  const handleSubmit = async () => {
    try {
      await createBooking(bookingData);
      toast.success('Service booked successfully');
      navigate('/dashboard/client/bookings');
    } catch (error) {
      toast.error('Failed to book service. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <nav aria-label="Progress">
        <ol className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className={`relative ${
                index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''
              }`}
            >
              <div className="flex items-center">
                <span
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    index <= currentStep
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1}
                </span>
                <span className="ml-4 text-sm font-medium text-gray-900">
                  {step.name}
                </span>
              </div>
              {index !== steps.length - 1 && (
                <div className="hidden sm:block absolute top-4 left-full w-16 h-0.5 bg-gray-200" />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {currentStep === 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Select a Service Package
            </h2>
            {servicesLoading ? (
              <div className="text-center py-8">Loading services...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services?.map((service) => (
                  <div
                    key={service.id}
                    className="border rounded-lg p-6 hover:border-primary-500 cursor-pointer transition-colors"
                    onClick={() => handleServiceSelect(service)}
                  >
                    <h3 className="text-lg font-medium text-gray-900">
                      {service.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {service.description}
                    </p>
                    <p className="mt-4 text-xl font-semibold text-primary-600">
                      ${service.basePrice}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Additional Services
            </h2>
            <div className="space-y-4">
              {services
                ?.find((s) => s.id === bookingData.serviceId)
                ?.additionalServices?.map((service) => (
                  <label
                    key={service.id}
                    className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={bookingData.additionalServices.some(
                        (s) => s.id === service.id
                      )}
                      onChange={() => handleAdditionalService(service)}
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{service.name}</p>
                      <p className="text-sm text-gray-500">
                        {service.description}
                      </p>
                    </div>
                    <p className="text-primary-600 font-medium">
                      ${service.price}
                    </p>
                  </label>
                ))}
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">
                Special Requests
              </label>
              <textarea
                value={bookingData.specialRequests}
                onChange={(e) =>
                  setBookingData((prev) => ({
                    ...prev,
                    specialRequests: e.target.value,
                  }))
                }
                rows={4}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Any special requirements or requests..."
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Select Date & Time
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={bookingData.date}
                  onChange={(e) =>
                    setBookingData((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Preferred Time
                </label>
                <input
                  type="time"
                  value={bookingData.time}
                  onChange={(e) =>
                    setBookingData((prev) => ({
                      ...prev,
                      time: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Review Booking Details
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <dl className="divide-y">
                <div className="py-4 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Service</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {bookingData.serviceName}
                  </dd>
                </div>
                <div className="py-4 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {new Date(bookingData.date).toLocaleDateString()}
                  </dd>
                </div>
                <div className="py-4 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Time</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {bookingData.time}
                  </dd>
                </div>
                <div className="py-4">
                  <dt className="text-sm font-medium text-gray-500 mb-2">
                    Additional Services
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {bookingData.additionalServices.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {bookingData.additionalServices.map((service) => (
                          <li key={service.id}>{service.name}</li>
                        ))}
                      </ul>
                    ) : (
                      'None selected'
                    )}
                  </dd>
                </div>
                <div className="py-4">
                  <dt className="text-sm font-medium text-gray-500">
                    Total Amount
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-primary-600">
                    ${bookingData.totalAmount}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            className="btn-secondary"
            disabled={currentStep === 0}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => {
              if (currentStep === steps.length - 1) {
                handleSubmit();
              } else {
                setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
              }
            }}
            className="btn-primary"
          >
            {currentStep === steps.length - 1 ? 'Confirm Booking' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}