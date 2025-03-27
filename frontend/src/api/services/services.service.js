import api from '../config';

const servicesService = {
  getAvailableServices: async () => {
    const response = await api.get('/services');
    return response.data.services;
  },

  getServiceDetails: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data.service;
  },

  createService: async (serviceData) => {
    const response = await api.post('/services', serviceData);
    return response.data.service;
  },

  updateService: async (id, serviceData) => {
    const response = await api.put(`/services/${id}`, serviceData);
    return response.data.service;
  },

  deleteService: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },

  updatePricing: async (prices) => {
    const response = await api.put('/services/pricing', prices);
    return response.data;
  }
};

export default servicesService;