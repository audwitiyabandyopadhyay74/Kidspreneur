import express from 'express';
const router = express.Router();
import { protect } from '../middleware/auth.js';
import { 
  getUserProfile, 
  updateUserProfile, 
  getBankDetails, 
  updateBankDetails,
  followUser,
  unfollowUser
} from '../controllers/userController.js';

// @route   GET & PUT /api/users/profile
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Follow / Unfollow
router.post('/:id/follow', protect, followUser);
router.post('/:id/unfollow', protect, unfollowUser);

export default router;
