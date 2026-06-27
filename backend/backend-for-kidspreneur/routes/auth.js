// Third-party dependencies
import express from 'express';
import passport from 'passport';

// Local dependencies
import { protect } from '../middleware/auth.js';
import {
  signup,
  login,
  socialLoginCallback,
  getProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout
} from '../controllers/authController.js';

// Initialize router
const router = express.Router();

/**
 * @route   POST /api/v1/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', signup);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/profile', protect, getProfile);

/**
 * @route   GET /api/v1/auth/logout
 * @desc    Logout user / clear cookie
 * @access  Private
 */
router.get('/logout', protect, logout);

/**
 * @route   PUT /api/v1/auth/change-password
 * @desc    Change user's password
 * @access  Private
 */
router.put('/change-password', protect, changePassword);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password/:token
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password/:token', resetPassword);

/**
 * @route   GET /api/v1/auth/google
 * @desc    Authenticate with Google
 * @access  Public
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Google auth callback
 * @access  Public
 */
router.get('/google/callback', 
  passport.authenticate('google', { session: false }), 
  socialLoginCallback
);

/**
 * @route   GET /api/v1/auth/facebook
 * @desc    Authenticate with Facebook
 * @access  Public
 */
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

/**
 * @route   GET /api/v1/auth/facebook/callback
 * @desc    Facebook auth callback
 * @access  Public
 */
router.get('/facebook/callback', 
  passport.authenticate('facebook', { session: false }), 
  socialLoginCallback
);

export default router;