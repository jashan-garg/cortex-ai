import { model, Schema } from 'mongoose';

const paymentSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    PaymentId: String,
    amount: Number,
    currency: {
      type: String,
      default: 'INR',
    },
    credits: {
      type: Number,
    },
    plan: String,
    status: {
      type: String,
      enum: ['created', 'paid', 'failed'],
      default: 'created',
    },
  },
  { timestamps: true }
);

const Payment = model('Payment', paymentSchema);
export default Payment;
