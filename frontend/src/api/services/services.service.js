import api from '../config';

const servicesService = {
  getAvailableServices: async () => {
    const response = await api.get('/services/available');
    return response.data;
  },

  getServiceDetails: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  }
};

export default servicesService;