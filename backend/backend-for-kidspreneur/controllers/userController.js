import User from '../models/User.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  // req.user is populated by the 'protect' middleware
  res.json(req.user);
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.country = req.body.country || user.country;
    user.profileImage = typeof req.body.profileImage !== 'undefined' ? req.body.profileImage : user.profileImage;
    user.category = typeof req.body.category !== 'undefined' ? req.body.category : user.category;
    // Add other fields if they are part of the User model and need to be updatable
    // e.g., user.age = req.body.age || user.age;

    // Update bank details if provided
    user.bankName = req.body.bankName || user.bankName;
    user.accountNumber = req.body.accountNumber || user.accountNumber;
    user.ifscCode = req.body.ifscCode || user.ifscCode;

    const updatedUser = await user.save();

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      country: updatedUser.country,
      funding: updatedUser.funding,
      bankName: updatedUser.bankName,
      accountNumber: updatedUser.accountNumber,
      ifscCode: updatedUser.ifscCode,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Get user bank details
// @route   GET /api/settings/bank-details
// @access  Private
const getBankDetails = async (req, res) => {
  const user = await User.findById(req.user._id).select('bankName accountNumber ifscCode');

  if (user) {
    res.json({
      bankDetails: {
        bankName: user.bankName,
        accountNumber: user.accountNumber,
        ifscCode: user.ifscCode,
      },
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user bank details
// @route   PUT /api/settings/bank-details
// @access  Private
const updateBankDetails = async (req, res) => {
  const { bankName, accountNumber, ifscCode } = req.body;

  const user = await User.findById(req.user._id);

  if (user) {
    user.bankName = bankName || user.bankName;
    user.accountNumber = accountNumber || user.accountNumber;
    user.ifscCode = ifscCode || user.ifscCode;

    const updatedUser = await user.save();

    res.json({
      message: 'Bank details updated successfully',
      bankDetails: {
        bankName: updatedUser.bankName,
        accountNumber: updatedUser.accountNumber,
        ifscCode: updatedUser.ifscCode,
      },
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
const followUser = async (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user._id.toString();

  if (targetUserId === currentUserId) {
    return res.status(400).json({ message: 'You cannot follow yourself' });
  }

  const targetUser = await User.findById(targetUserId);
  const currentUser = await User.findById(currentUserId);

  if (!targetUser || !currentUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isAlreadyFollowing = currentUser.following?.some(id => id.toString() === targetUserId);
  if (isAlreadyFollowing) {
    return res.status(400).json({ message: 'Already following this user' });
  }

  currentUser.following = [...(currentUser.following || []), targetUser._id];
  targetUser.followers = [...(targetUser.followers || []), currentUser._id];

  await currentUser.save();
  await targetUser.save();

  return res.json({ message: 'Followed successfully' });
};

// @desc    Unfollow a user
// @route   POST /api/users/:id/unfollow
// @access  Private
const unfollowUser = async (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user._id.toString();

  if (targetUserId === currentUserId) {
    return res.status(400).json({ message: 'You cannot unfollow yourself' });
  }

  const targetUser = await User.findById(targetUserId);
  const currentUser = await User.findById(currentUserId);

  if (!targetUser || !currentUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  currentUser.following = (currentUser.following || []).filter(id => id.toString() !== targetUserId);
  targetUser.followers = (targetUser.followers || []).filter(id => id.toString() !== currentUserId);

  await currentUser.save();
  await targetUser.save();

  return res.json({ message: 'Unfollowed successfully' });
};

export {
  getUserProfile,
  updateUserProfile,
  getBankDetails,
  updateBankDetails,
  followUser,
  unfollowUser
};
