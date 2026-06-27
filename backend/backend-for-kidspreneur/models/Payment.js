import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  razorpay_order_id: {
    type: String,
    required: true,
  },
  razorpay_payment_id: {
    type: String,
    default: 'pending',
  },
  razorpay_signature: {
    type: String,
    default: 'pending',
  },
  user: { // The user who made the payment (funder)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['created', 'captured', 'failed'],
    default: 'created',
  },
  idea: { // The idea being funded
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea',
    required: false, // Not all payments might be for ideas
  },
  ideaCreator: { // The creator of the idea (receiver of funds)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
}, {
  timestamps: true,
});

const Payment = mongoose.model('Payment', PaymentSchema);

export default Payment;