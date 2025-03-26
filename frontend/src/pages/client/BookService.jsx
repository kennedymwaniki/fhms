import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import servicesService from '../../api/services/services.service';
import bookingsService from '../../api/services/bookings.service';
import documentsService from '../../api/services/documents.service';
import DashboardHeader from '../../components/DashboardHeader';
import { Calendar, Clock, DollarSign, Upload } from 'lucide-react';

export default function BookService() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [deceasedInfo, setDeceasedInfo] = useState({
    first_name: '',
    last_name: '',
    date_of_death: '',
    place_of_death: ''
  });
  const [documents, setDocuments] = useState({
    death_certificate: null,
    burial_permit: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await servicesService.getAvailableServices();
      setServices(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading services:', error);
      setLoading(false);
    }
  };

  const handleFileChange = (type, e) => {
    const file = e.target.files[0];
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [type]: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedService || !bookingDate || !bookingTime) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      // First create deceased record
      const deceasedResponse = await bookingsService.createDeceased(deceasedInfo);
      const deceased_id = deceasedResponse.id;

      // Create booking
      const bookingData = {
        deceased_id,
        services: [{
          service_id: selectedService.id,
          quantity: 1,
          scheduled_date: `${bookingDate}T${bookingTime}`
        }]
      };
      
      const bookingResponse = await bookingsService.createBooking(bookingData);
      const booking_id = bookingResponse.booking.id;

      // Upload documents
      const uploadPromises = Object.entries(documents)
        .filter(([_, file]) => file !== null)
        .map(async ([type, file]) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('document_type', type);
          formData.append('deceased_id', deceased_id);
          formData.append('booking_id', booking_id);
          return documentsService.uploadDocument(formData);
        });

      await Promise.all(uploadPromises);
      
      navigate('/dashboard/client/bookings');
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
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
      <DashboardHeader pageTitle="Book a Service" />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {services.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl">😢</span>
            <p className="mt-4 text-lg text-gray-500">No services available</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Book a Service</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Please fill in all required information</p>
            </div>

            <form onSubmit={handleSubmit} className="border-t border-gray-200">
              <div className="px-4 py-5 sm:px-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Deceased Information */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name of Deceased</label>
                      <input
                        type="text"
                        required
                        value={deceasedInfo.first_name}
                        onChange={(e) => setDeceasedInfo(prev => ({ ...prev, first_name: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name of Deceased</label>
                      <input
                        type="text"
                        required
                        value={deceasedInfo.last_name}
                        onChange={(e) => setDeceasedInfo(prev => ({ ...prev, last_name: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date of Death</label>
                      <input
                        type="date"
                        required
                        value={deceasedInfo.date_of_death}
                        onChange={(e) => setDeceasedInfo(prev => ({ ...prev, date_of_death: e.target.value }))}
                        max={new Date().toISOString().split('T')[0]}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Place of Death</label>
                      <input
                        type="text"
                        required
                        value={deceasedInfo.place_of_death}
                        onChange={(e) => setDeceasedInfo(prev => ({ ...prev, place_of_death: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Service Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Select Service</label>
                    <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {services.map((service) => (
                        <div
                          key={service.id}
                          onClick={() => setSelectedService(service)}
                          className={`relative rounded-lg border p-4 cursor-pointer hover:border-primary-500 ${
                            selectedService?.id === service.id ? 'border-primary-500 ring-2 ring-primary-500' : 'border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">{service.name}</h3>
                              <p className="mt-1 text-sm text-gray-500">{service.description}</p>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-5 w-5 text-gray-400" />
                              <span className="ml-1 text-sm font-medium text-gray-900">
                                KES {service.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Date and Time Selection */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <Calendar className="h-5 w-5 text-gray-400 inline-block mr-2" />
                        Date
                      </label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <Clock className="h-5 w-5 text-gray-400 inline-block mr-2" />
                        Time
                      </label>
                      <input
                        type="time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Document Upload */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <Upload className="h-5 w-5 text-gray-400 inline-block mr-2" />
                        Death Certificate
                      </label>
                      <input
                        type="file"
                        required
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('death_certificate', e)}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <Upload className="h-5 w-5 text-gray-400 inline-block mr-2" />
                        Burial Permit
                      </label>
                      <input
                        type="file"
                        required
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('burial_permit', e)}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedService || !bookingDate || !bookingTime}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating Booking...' : 'Book Service'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}