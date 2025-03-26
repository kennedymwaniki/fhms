import api from '../config';

const documentsService = {
  getMyDocuments: async () => {
    const response = await api.get('/documents/my-documents');
    return response.data;
  },

  uploadDocument: async (formData) => {
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  downloadDocument: async (id) => {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default documentsService;