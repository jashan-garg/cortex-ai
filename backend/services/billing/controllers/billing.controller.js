import { PLANS } from '../config/Plans.js';
import razorpay from '../config/razorpay.js';
import Payment from '../models/payment.model.js';
import crypto from 'crypto';
import axios from 'axios';

export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.headers['x-user-id'];
    const selectedPlan = PLANS[plan];

    if (!selectedPlan)
      return res.status(404).json({ message: 'Plan not found.' });
    const order = await razorpay.orders.create({
      amount: selectedPlan.amount * 100,
      currency: 'INR',
      receipt: `receipt-${Date.now()}`,
    });
    await Payment.create({
      userId,
      orderId: order.id,
      amount: selectedPlan.amount,
      credits: selectedPlan.credits,
      plan: selectedPlan.id,
      currency: order.currency,
      status: 'created',
    });
    return res.status(200).json({ order, plan: selectedPlan });
  } catch (error) {
    console.error('Create order error:', error);
    return res
      .status(500)
      .json({ message: error.message || 'Create order error' });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const payment = await Payment.findOne({ orderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status === 'paid') {
      return res.json({ message: 'Payment already verified' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      payment.status = 'failed';
      await payment.save();
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    payment.status = 'paid';
    payment.paymentId = razorpay_payment_id;
    await payment.save();

    await axios.post(`${process.env.SERVER_URL}/api/auth/update-plan`, {
      userId: payment.userId,
      plan: payment.plan,
      credits: payment.credits,
    });

    return res.json({
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({
      message: `Payment verification error: ${error.message}`,
    });
  }
};
