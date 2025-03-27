import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import servicesService from '../api/services/services.service';
import {
  fetchServicesStart,
  fetchServicesSuccess,
  fetchServicesFailure,
  addService,
  updateService,
  deleteService,
  updatePricing,
  setSelectedService,
} from '../store/slices/serviceSlice';

export const useServices = () => {
  const dispatch = useDispatch();
  const { services, selectedService, pricing, loading, error } = useSelector(
    (state) => state.services
  );

  const fetchServices = async () => {
    try {
      dispatch(fetchServicesStart());
      const data = await servicesService.getAvailableServices();
      dispatch(fetchServicesSuccess(data));
    } catch (error) {
      dispatch(fetchServicesFailure(error.response?.data?.message));
      toast.error('Failed to fetch services');
    }
  };

  const getServiceById = async (id) => {
    try {
      const service = await servicesService.getServiceDetails(id);
      dispatch(setSelectedService(service));
      return service;
    } catch (error) {
      toast.error('Failed to fetch service details');
      throw error;
    }
  };

  const createService = async (serviceData) => {
    try {
      const response = await servicesService.createService(serviceData);
      dispatch(addService(response));
      toast.success('Service created successfully');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create service');
      throw error;
    }
  };

  const editService = async (id, serviceData) => {
    try {
      const response = await servicesService.updateService(id, serviceData);
      dispatch(updateService(response));
      toast.success('Service updated successfully');
      return response;
    } catch (error) {
      toast.error('Failed to update service');
      throw error;
    }
  };

  const removeService = async (id) => {
    try {
      await servicesService.deleteService(id);
      dispatch(deleteService(id));
      toast.success('Service deleted successfully');
    } catch (error) {
      toast.error('Failed to delete service');
      throw error;
    }
  };

  const updateServicePricing = async (prices) => {
    try {
      await servicesService.updatePricing(prices);
      dispatch(updatePricing(prices));
      toast.success('Service prices updated successfully');
    } catch (error) {
      toast.error('Failed to update service prices');
      throw error;
    }
  };

  return {
    services,
    selectedService,
    pricing,
    loading,
    error,
    fetchServices,
    getServiceById,
    createService,
    editService,
    removeService,
    updateServicePricing,
  };
};