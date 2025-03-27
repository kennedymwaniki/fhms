import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { useServices } from '../../hooks/useServices';
import bookingsService from '../../api/services/bookings.service';

const steps = [
  { id: 'service', name: 'Select Services' },
  { id: 'deceased', name: 'Deceased Details' },
  { id: 'scheduling', name: 'Schedule Service' },
  { id: 'review', name: 'Review & Confirm' }
];

export default function ServiceBooking() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { services, loading: servicesLoading, fetchServices } = useServices();
  const [currentStep, setCurrentStep] = useState(0);
  
  const [formData, setFormData] = useState({
    selectedServices: [], // Array of selected services
    deceased: {
      firstName: '',
      lastName: '',
      dateOfDeath: '',
      placeOfDeath: '',
      gender: '',
      religion: ''
    },
    scheduling: {
      date: '',
      time: '',
      specialRequests: ''
    }
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchServices();
  }, []);

  const validateCurrentStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 0:
        if (formData.selectedServices.length === 0) {
          newErrors.service = 'Please select at least one service';
        }
        break;
      case 1:
        if (!formData.deceased.firstName) newErrors.firstName = 'First name is required';
        if (!formData.deceased.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.deceased.dateOfDeath) newErrors.dateOfDeath = 'Date of death is required';
        if (!formData.deceased.placeOfDeath) newErrors.placeOfDeath = 'Place of death is required';
        break;
      case 2:
        if (!formData.scheduling.date) newErrors.date = 'Service date is required';
        if (!formData.scheduling.time) newErrors.time = 'Service time is required';
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleServiceSelect = (service) => {
    setFormData(prev => {
      const isSelected = prev.selectedServices.some(s => s.id === service.id);
      let updatedServices;
      
      if (isSelected) {
        // Remove service if already selected
        updatedServices = prev.selectedServices.filter(s => s.id !== service.id);
      } else {
        // Add service if not selected
        updatedServices = [...prev.selectedServices, {
          id: service.id,
          name: service.name,
          price: service.price
        }];
      }

      return {
        ...prev,
        selectedServices: updatedServices
      };
    });
  };

  const getTotalPrice = () => {
    return formData.selectedServices.reduce((total, service) => total + service.price, 0);
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Create deceased record first
      const deceasedResponse = await bookingsService.createDeceased({
        first_name: formData.deceased.firstName,
        last_name: formData.deceased.lastName,
        date_of_death: formData.deceased.dateOfDeath,
        place_of_death: formData.deceased.placeOfDeath,
        gender: formData.deceased.gender || null,
        religion: formData.deceased.religion || null
      });

      // Create booking with deceased ID and service details
      const bookingPayload = {
        deceased_id: deceasedResponse.deceased.id,
        services: formData.selectedServices.map(service => ({
          service_id: service.id,
          quantity: 1,
          scheduled_date: `${formData.scheduling.date}T${formData.scheduling.time}:00`
        })),
        notes: formData.scheduling.specialRequests || undefined
      };

      await bookingsService.createBooking(bookingPayload);
      toast.success('Service booked successfully');
      navigate('/dashboard/client/bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <p className="text-sm text-gray-500 mb-4">Select one or more services that you need</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`bg-white p-6 rounded-lg border-2 cursor-pointer transition-all
                    ${formData.selectedServices.some(s => s.id === service.id)
                      ? 'border-primary-500 ring-2 ring-primary-200' 
                      : 'border-gray-200 hover:border-primary-200'}`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                  <p className="mt-2 text-sm text-gray-500">{service.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary-600">
                      KSH {service.price.toLocaleString()}
                    </span>
                    <div className={`w-4 h-4 rounded-full border-2 
                      ${formData.selectedServices.some(s => s.id === service.id)
                        ? 'bg-primary-500 border-primary-500' 
                        : 'border-gray-300'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            {errors.service && (
              <p className="text-sm text-red-600">{errors.service}</p>
            )}
            {formData.selectedServices.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900">Selected Services:</h4>
                <ul className="mt-2 space-y-2">
                  {formData.selectedServices.map(service => (
                    <li key={service.id} className="flex justify-between text-sm">
                      <span>{service.name}</span>
                      <span className="font-medium">KSH {service.price.toLocaleString()}</span>
                    </li>
                  ))}
                  <li className="flex justify-between text-base font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>KSH {getTotalPrice().toLocaleString()}</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-lg space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name*
                  </label>
                  <input
                    type="text"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500
                      ${errors.firstName ? 'border-red-300' : ''}`}
                    value={formData.deceased.firstName}
                    onChange={(e) => handleInputChange('deceased', 'firstName', e.target.value)}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name*
                  </label>
                  <input
                    type="text"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500
                      ${errors.lastName ? 'border-red-300' : ''}`}
                    value={formData.deceased.lastName}
                    onChange={(e) => handleInputChange('deceased', 'lastName', e.target.value)}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Death*
                  </label>
                  <input
                    type="date"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500
                      ${errors.dateOfDeath ? 'border-red-300' : ''}`}
                    value={formData.deceased.dateOfDeath}
                    onChange={(e) => handleInputChange('deceased', 'dateOfDeath', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.dateOfDeath && (
                    <p className="mt-1 text-sm text-red-600">{errors.dateOfDeath}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Place of Death*
                  </label>
                  <input
                    type="text"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500
                      ${errors.placeOfDeath ? 'border-red-300' : ''}`}
                    value={formData.deceased.placeOfDeath}
                    onChange={(e) => handleInputChange('deceased', 'placeOfDeath', e.target.value)}
                  />
                  {errors.placeOfDeath && (
                    <p className="mt-1 text-sm text-red-600">{errors.placeOfDeath}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={formData.deceased.gender}
                    onChange={(e) => handleInputChange('deceased', 'gender', e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Religion
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={formData.deceased.religion}
                    onChange={(e) => handleInputChange('deceased', 'religion', e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-lg space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Service Date*
                  </label>
                  <input
                    type="date"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500
                      ${errors.date ? 'border-red-300' : ''}`}
                    value={formData.scheduling.date}
                    onChange={(e) => handleInputChange('scheduling', 'date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Service Time*
                  </label>
                  <input
                    type="time"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500
                      ${errors.time ? 'border-red-300' : ''}`}
                    value={formData.scheduling.time}
                    onChange={(e) => handleInputChange('scheduling', 'time', e.target.value)}
                  />
                  {errors.time && (
                    <p className="mt-1 text-sm text-red-600">{errors.time}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Special Requests or Additional Notes
                </label>
                <textarea
                  rows="4"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={formData.scheduling.specialRequests}
                  onChange={(e) => handleInputChange('scheduling', 'specialRequests', e.target.value)}
                  placeholder="Any special requirements or additional information..."
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-lg space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900">Selected Services</h3>
                <div className="mt-2 space-y-2">
                  {formData.selectedServices.map(service => (
                    <div key={service.id} className="flex justify-between items-center">
                      <span className="text-gray-600">{service.name}</span>
                      <span className="text-lg font-semibold text-primary-600">
                        KSH {service.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="text-xl font-bold text-primary-600">
                      KSH {getTotalPrice().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900">Deceased Information</h3>
                <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formData.deceased.firstName} {formData.deceased.lastName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date of Death</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(formData.deceased.dateOfDeath).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Place of Death</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formData.deceased.placeOfDeath}
                    </dd>
                  </div>
                  {formData.deceased.gender && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Gender</dt>
                      <dd className="mt-1 text-sm text-gray-900 capitalize">
                        {formData.deceased.gender}
                      </dd>
                    </div>
                  )}
                  {formData.deceased.religion && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Religion</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formData.deceased.religion}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900">Service Schedule</h3>
                <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(formData.scheduling.date).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Time</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formData.scheduling.time}
                    </dd>
                  </div>
                </dl>
                {formData.scheduling.specialRequests && (
                  <div className="mt-4">
                    <dt className="text-sm font-medium text-gray-500">Special Requests</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formData.scheduling.specialRequests}
                    </dd>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (servicesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <nav aria-label="Progress">
        <ol className="flex items-center justify-center">
          {steps.map((step, index) => (
            <li key={step.id} className="relative flex items-center">
              <div className={`flex items-center ${index !== 0 ? 'ml-8' : ''}`}>
                <span
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium
                    ${index <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}
                >
                  {index + 1}
                </span>
                <span className="ml-3 text-sm font-medium text-gray-900">{step.name}</span>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden sm:block w-12 ml-4">
                  <div className="h-0.5 bg-gray-200"></div>
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="mt-8">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        {currentStep > 0 && (
          <button
            type="button"
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
        )}
        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="ml-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="ml-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Confirm Booking
          </button>
        )}
      </div>
    </div>
  );
}