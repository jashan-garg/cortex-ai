import api from '../../utils/axios.js';

const getMessages = async (id) => {
  let lastError;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const { data } = await api.get(`/api/chat/get-messages/${id}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!Array.isArray(data)) throw new Error('Invalid messages response');
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

export default getMessages;
