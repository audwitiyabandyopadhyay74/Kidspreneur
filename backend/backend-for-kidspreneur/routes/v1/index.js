const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const ideaRoutes = require('./idea');
const leaderboardRoutes = require('./leaderboard');
const paymentRoutes = require('./payment');
const userRoutes = require('./user');
const settingsRoutes = require('./settings');
const contactRoutes = require('./contact');

// Mount routes
router.use('/auth', authRoutes);
router.use('/ideas', ideaRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/payments', paymentRoutes);
router.use('/users', userRoutes);
router.use('/settings', settingsRoutes);
router.use('/contact', contactRoutes);

module.exports = router;
