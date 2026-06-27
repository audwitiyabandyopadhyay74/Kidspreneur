import express from 'express';
const router = express.Router();
import { submitContactForm } from '../controllers/contactController.js';

// @route POST /api/contact
router.post('/', submitContactForm);

export default router;
