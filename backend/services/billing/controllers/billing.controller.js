import { PLANS } from '../config/Plans.js';

export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.headers['x-user-id'];
    const selectedPlan = PLANS[plan];

    if (!selectedPlan)
      return res.status(404).json({ message: 'Plan not found.' });
  } catch (error) {}
};
