import express from 'express';
const router = express.Router();
import { getLeaderboard } from '../controllers/leaderboardController.js';

// @route   GET /api/leaderboard
router.get('/', getLeaderboard);

export default router;