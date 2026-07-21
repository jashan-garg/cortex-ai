import api from '../../utils/axios.js';

export const verifyPayment = async (payload) => {
  try {
    const { data } = await api.post('/api/billing/verify', payload);
    return data;
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};
