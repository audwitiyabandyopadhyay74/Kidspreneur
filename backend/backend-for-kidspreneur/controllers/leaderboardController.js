import User from '../models/User.js';

// @desc    Get top 10 users by funding
// @route   GET /api/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
  try {
    // The requirement was to sort by funding ascending, which is a bit unusual for a leaderboard.
    // Usually it's descending. I'll stick to the requirement, but left a comment.
    // If you meant descending, just change `funding: 1` to `funding: -1`.
    const topUsers = await User.find().sort({ funding: 1 }).limit(10).select('name funding country');
    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { getLeaderboard };
