import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import User from '../models/User.js';

// Initialize Razorpay only if keys are present
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET are not defined in .env. Payment routes will not work.');
}

// @desc    Create a Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = async (req, res) => {
  if (!razorpay) {
    return res.status(500).json({ message: 'Payment system is not configured on the server.' });
  }

  const { amount, currency = 'INR', ideaId, ideaCreatorId } = req.body;

  if (!amount) {
    return res.status(400).json({ message: 'Amount is required' });
  }

  const options = {
    amount: amount * 100, // Razorpay expects amount in the smallest currency unit (e.g., paise)
    currency,
    receipt: `receipt_order_${new Date().getTime()}`,
  };

  try {
    // Always fetch latest bank details of receiver before creating order
    if (ideaCreatorId) {
      const receiver = await User.findById(ideaCreatorId).select('bankName accountNumber ifscCode');
      if (!receiver || !receiver.bankName || !receiver.accountNumber || !receiver.ifscCode) {
        return res.status(400).json({ message: 'Receiver has incomplete bank details. Please try again later.' });
      }
    }
    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ message: 'Failed to create Razorpay order' });
    }

    const payment = new Payment({
      razorpay_order_id: order.id,
      user: req.user._id,
      amount: amount,
      status: 'created',
      razorpay_payment_id: 'pending',
      razorpay_signature: 'pending',
      idea: ideaId, // Save idea ID
      ideaCreator: ideaCreatorId, // Save idea creator ID
    });

    await payment.save();

    res.json(order);
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify a payment and update records
// @route   POST /api/payments/verify-payment
// @access  Private
const verifyPayment = async (req, res) => {
  if (!razorpay) {
    return res.status(500).json({ message: 'Payment system is not configured on the server.' });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: 'Missing payment details for verification' });
  }

  const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = shasum.digest('hex');

  if (digest === razorpay_signature) {
    try {
      const payment = await Payment.findOne({ razorpay_order_id });
      if (!payment) {
        return res.status(404).json({ message: 'Payment record not found' });
      }

      payment.razorpay_payment_id = razorpay_payment_id;
      payment.razorpay_signature = razorpay_signature;
      payment.status = 'captured';
      await payment.save();

      const user = await User.findById(payment.user);
      if (user) {
        user.funding = (user.funding || 0) + payment.amount;
        await user.save();
      }

      res.json({ message: 'Payment verified successfully', status: 'success' });
    } catch (error) {
      res.status(500).json({ message: 'Server error while updating records', error: error.message });
    }
  } else {
    res.status(400).json({ message: 'Invalid signature', status: 'failure' });
  }
};

export { createOrder, verifyPayment };