import express from 'express';
const router = express.Router();
import { protect } from '../middleware/auth.js';
import { getBankDetails, updateBankDetails } from '../controllers/userController.js';

// @route   GET /api/settings/bank-details
router.get('/bank-details', protect, getBankDetails);

// @route   PUT /api/settings/bank-details
router.put('/bank-details', protect, updateBankDetails);

export default router;