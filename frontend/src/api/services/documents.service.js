import api from '../config';

const documentsService = {
  getMyDocuments: async () => {
    try {
      const response = await api.get('/documents/my');
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error.response?.data || error.message);
      throw error;
    }
  },

  uploadDocument: async (formData) => {
    try {
      // Ensure all required fields are present
      if (!formData.get('file') || !formData.get('document_type')) {
        throw new Error('Missing required fields');
      }

      // Log the formData contents for debugging
      console.log('Uploading document with formData:', {
        type: formData.get('document_type'),
        fileName: formData.get('file').name,
        description: formData.get('description')
      });
      
      const response = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error.response?.data || error.message);
      throw error;
    }
  },

  downloadDocument: async (id) => {
    try {
      const response = await api.get(`/documents/${id}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading document:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteDocument: async (id) => {
    try {
      const response = await api.delete(`/documents/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting document:', error.response?.data || error.message);
      throw error;
    }
  },

  getDocumentDetails: async (id) => {
    try {
      const response = await api.get(`/documents/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching document details:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default documentsService;