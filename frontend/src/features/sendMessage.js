import api from '../../utils/axios.js';

const sendMessage = async (payload) => {
  try {
    const { data } = await api.post('/api/agent/chat', payload);
    return data;
  } catch (error) {
    console.log(error);
    return {
      answer: 'Something went wrong, please try again.',
      images: [],
    };
  }
};

export default sendMessage;
