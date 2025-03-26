import api from '../config';

const messagesService = {
  getMyMessages: async () => {
    const response = await api.get('/messages/my-messages');
    return response.data;
  },

  sendMessage: async (message) => {
    const response = await api.post('/messages', message);
    return response.data;
  },

  markAsRead: async (messageId) => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  }
};

export default messagesService;