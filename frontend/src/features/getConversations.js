import api from '../../utils/axios.js';

export const getConversations = async () => {
  let lastError;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const { data } = await api.get('/api/chat/get-conversations', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!Array.isArray(data)) throw new Error('Invalid conversations response');
      return data;
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 400 * 2 ** attempt));
      }
    }
  }

  throw lastError;
};
