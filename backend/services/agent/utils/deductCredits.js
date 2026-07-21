import axios from 'axios';

export const deductCredits = async (userId, agent) => {
  try {
    const { data } = await axios.post(
      `${process.env.GATEWAY_URL}/api/auth/deduct-credits`,
      { userId, agent }
    );
    return data;
  } catch (error) {
    const response = error.response?.data;
    const err = new Error(response?.message || 'Failed to deduct credits.');
    err.status = error.response?.status || 500;
    err.data = {
      success: false,
      title: response?.title || 'Insufficient Credits',
      message:
        response?.message ||
        "You don't have enough credits. Please upgrade your plan.",
    };
    throw err;
  }
};
