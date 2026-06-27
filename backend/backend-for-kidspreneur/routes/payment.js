import express from 'express';
const router = express.Router();
import { protect } from '../middleware/auth.js';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';

// @route   POST /api/payments/create-order
router.post('/create-order', protect, createOrder);

// @route   POST /api/payments/verify-payment
router.post('/verify-payment', protect, verifyPayment);

export default router;