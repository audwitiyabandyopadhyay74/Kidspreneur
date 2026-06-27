// Built-in Node.js modules
import crypto from 'crypto';
import { promisify } from 'util';

// Third-party dependencies
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Local imports
import User from '../models/User.js';
import { sendMail } from '../config/mailer.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { logger } from '../utils/logger.js';

// In-memory storage for rate limiting
const forgotPasswordAttempts = {};

// Ensure logger has all required methods
const log = new Proxy(logger, {
  get(target, level) {
    return (message, ...args) => {
      if (typeof target[level] === 'function') {
        return target[level](message, ...args);
      }
      return target.info(message, ...args);
    };
  }
});

// Promisify JWT methods
const signToken = promisify(jwt.sign);
const verifyToken = promisify(jwt.verify);

// Helper function to create and sign JWT token
const createSendToken = (user, statusCode, req, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

  // Remove sensitive data from output
  user.password = undefined;
  user.passwordChangedAt = undefined;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.active = undefined;

  // Set cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000 // 7 days
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'lax'
  };

  // Set cookie
  res.cookie('jwt', token, cookieOptions);

  // Send response
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(user.username && { username: user.username }),
        ...(user.avatar && { avatar: user.avatar })
      }
    }
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/signup
 * @access  Public
 */
const signup = catchAsync(async (req, res, next) => {
  const { name, username, email, password, passwordConfirm, role, ...otherFields } = req.body;
  
  // 1) Check if required fields are provided
  if (!name || !email || !password || !passwordConfirm) {
    return next(new AppError('Please provide all required fields', 400, {
      fields: {
        name: !name ? 'Name is required' : undefined,
        email: !email ? 'Email is required' : undefined,
        password: !password ? 'Password is required' : undefined,
        passwordConfirm: !passwordConfirm ? 'Please confirm your password' : undefined
      }
    }));
  }

  // 2) Check if passwords match
  if (password !== passwordConfirm) {
    return next(new AppError('Passwords do not match', 400, {
      fields: { password: 'Passwords do not match', passwordConfirm: 'Passwords do not match' }
    }));
  }

  // 3) Check if user already exists (case-insensitive email check)
  const existingUser = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
  if (existingUser) {
    return next(new AppError('User already exists with this email', 400, {
      fields: { email: 'Email is already in use' }
    }));
  }

  // 4) Check if username is taken (if provided)
  if (username) {
    const existingUsername = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (existingUsername) {
      return next(new AppError('Username is already taken', 400, {
        fields: { username: 'Username is already taken' }
      }));
    }
  }

  // 5) Create new user with additional fields
  const newUser = await User.create({
    name,
    username: username || undefined, // Only set if provided
    email: email.toLowerCase(),
    password,
    passwordConfirm,
    ...(role && { role }), // Only set role if provided (admin creating users)
    ...otherFields // Include any additional fields from the request
  });

  // 6) Generate JWT token and send response
  createSendToken(newUser, 201, req, res);

  // 7) Log the successful registration
  logger.info('New user registered', {
    userId: newUser._id,
    email: newUser.email,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  // 8) Send welcome email (in background, don't await)
  try {
    await sendMail({
      to: newUser.email,
      subject: 'Welcome to Kidpreneur!',
      template: 'welcome',
      context: {
        name: newUser.name,
        loginUrl: `${process.env.FRONTEND_URL}/login`
      }
    });
  } catch (error) {
    logger.error('Failed to send welcome email', {
      userId: newUser._id,
      error: error.message
    });
  }
});

/**
 * @desc    Login user and get JWT token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400, {
      fields: {
        email: !email ? 'Email is required' : undefined,
        password: !password ? 'Password is required' : undefined
      }
    }));
  }

  // 2) Check if user exists and is active
  const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
    .select('+password +active');

  // 3) Check if user exists and password is correct
  const isPasswordCorrect = user && await user.matchPassword(password, user.password);
  
  if (!user || !isPasswordCorrect) {
    // Log failed login attempt
    logger.warn('Failed login attempt', {
      email,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      reason: !user ? 'User not found' : 'Incorrect password'
    });
    
    return next(new AppError('Incorrect email or password', 401, {
      fields: {
        email: 'Incorrect email or password',
        password: 'Incorrect email or password'
      }
    }));
  }

  // 4) Check if user is active
  if (!user.active) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 401));
  }

  // 5) Update last login timestamp
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  // 6) Generate JWT token and send response
  createSendToken(user, 200, req, res);

  // 7) Log successful login
  logger.info('User logged in', {
    userId: user._id,
    email: user.email,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
});

/**
 * @desc    Handle successful social login
 * @route   GET /api/v1/auth/{provider}/callback
 * @access  Public
 */
const socialLoginCallback = catchAsync(async (req, res, next) => {
  try {
    if (!req.user) {
      logger.warn('Social login failed - No user data', {
        provider: req.params.provider,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      throw new AppError('Authentication failed - No user data received', 401);
    }

    // 1) Find or create user based on provider profile
    const { provider, profile } = req.user;
    let user = await User.findOne({ [`${provider}Id`]: profile.id });

    // 2) If user doesn't exist, create a new one
    if (!user) {
      // Check if email already exists
      if (profile.email) {
        user = await User.findOne({ email: profile.email.toLowerCase() });
        
        if (user) {
          // Link social account to existing user
          user[`${provider}Id`] = profile.id;
          await user.save({ validateBeforeSave: false });
        }
      }

      // If still no user, create a new one
      if (!user) {
        const userData = {
          name: profile.displayName || `${profile.name?.givenName} ${profile.name?.familyName}`.trim(),
          email: profile.email?.toLowerCase(),
          [`${provider}Id`]: profile.id,
          isEmailVerified: true,
          // Generate a random password that won't be used but is required by the model
          password: crypto.randomBytes(16).toString('hex'),
          passwordConfirm: undefined
        };

        user = await User.create(userData);
        
        // Log new user registration via social login
        logger.info('New user registered via social login', {
          userId: user._id,
          provider,
          email: user.email,
          ip: req.ip
        });
      }
    }

    // 3) Update last login timestamp
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // 4) Generate JWT token and redirect
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    // 5) Log successful social login
    logger.info('User logged in via social provider', {
      userId: user._id,
      provider,
      email: user.email,
      ip: req.ip
    });

    // 6) Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = new URL(`${frontendUrl}/auth/callback`);
    redirectUrl.searchParams.set('token', token);
    
    // Add user data to the URL for the frontend
    if (user.name) redirectUrl.searchParams.set('name', encodeURIComponent(user.name));
    if (user.email) redirectUrl.searchParams.set('email', user.email);
    if (user.avatar) redirectUrl.searchParams.set('avatar', user.avatar);
    
    return res.redirect(redirectUrl.toString());
    
  } catch (error) {
    logger.error('Social login error', {
      error: error.message,
      stack: error.stack,
      provider: req.params.provider,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const errorMessage = encodeURIComponent(
      error.isOperational ? error.message : 'Authentication failed. Please try again.'
    );
    
    return res.redirect(`${frontendUrl}/auth/error?message=${errorMessage}`);
  }
});

/**
 * @desc    Get current user's profile
 * @route   GET /api/v1/auth/profile
 * @access  Private
 * 
 * Returns the authenticated user's profile information.
 * Sensitive data like password hashes and tokens are excluded.
 */
const getProfile = catchAsync(async (req, res, next) => {
  // 1) Get user data with selected fields
  const user = await User.findById(req.user.id).select(
    'name email username role avatar isEmailVerified lastLogin createdAt updatedAt'
  );
  
  // 2) Check if user exists
  if (!user) {
    logger.warn('User profile not found', { userId: req.user.id });
    return next(new AppError('Your account could not be found. Please contact support.', 404));
  }

  // 3) Check if user account is active
  if (!user.active) {
    logger.warn('Attempt to access deactivated account', { userId: user._id });
    return next(new AppError('Your account has been deactivated. Please contact support.', 403));
  }

  // 4) Log profile access
  logger.info('User profile accessed', {
    userId: user._id,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  // 5) Send response
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  });
});

/**
 * @desc    Update user profile
 * @route   PATCH /api/v1/auth/update-profile
 * @access  Private
 * 
 * Allows authenticated users to update their profile information.
 * Excludes password updates (handled by separate endpoint).
 */
const updateProfile = catchAsync(async (req, res, next) => {
  // 1) Create error if user tries to update password with this endpoint
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /update-password.',
        400
      )
    );
  }

  // 2) Filter out unwanted fields that are not allowed to be updated
  const filteredBody = {};
  const allowedFields = ['name', 'email', 'username', 'avatar', 'bio', 'phone', 'location'];
  
  Object.keys(req.body).forEach(el => {
    if (allowedFields.includes(el)) {
      filteredBody[el] = req.body[el];
    }
  });

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
      select: 'name email username role avatar isEmailVerified lastLogin createdAt updatedAt'
    }
  );

  // 4) Log the profile update
  logger.info('User profile updated', {
    userId: req.user.id,
    updatedFields: Object.keys(filteredBody),
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  // 5) Send response with updated user data
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

/**
 * @desc    Change user password
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 * 
 * Allows authenticated users to change their password.
 * Requires current password for verification.
 * Invalidates all active sessions after password change.
 */
const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  
  // 1) Validate input
  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    return next(new AppError('Please provide all required fields', 400, {
      fields: {
        currentPassword: !currentPassword ? 'Current password is required' : undefined,
        newPassword: !newPassword ? 'New password is required' : undefined,
        newPasswordConfirm: !newPasswordConfirm ? 'Please confirm your new password' : undefined
      }
    }));
  }

  // 2) Check if new passwords match
  if (newPassword !== newPasswordConfirm) {
    return next(new AppError('New passwords do not match', 400, {
      fields: {
        newPassword: 'Passwords do not match',
        newPasswordConfirm: 'Passwords do not match'
      }
    }));
  }

  // 3) Get user with password
  const user = await User.findById(req.user.id).select('+password +active');
  
  // 4) Check if user exists and is active
  if (!user) {
    logger.warn('User not found during password change', { userId: req.user.id });
    return next(new AppError('User not found', 404));
  }
  
  if (!user.active) {
    logger.warn('Attempt to change password on deactivated account', { userId: user._id });
    return next(new AppError('This account has been deactivated', 403));
  }

  // 5) Verify current password
  if (!(await user.matchPassword(currentPassword, user.password))) {
    logger.warn('Incorrect current password provided', { userId: user._id });
    return next(new AppError('Your current password is incorrect', 401, {
      fields: { currentPassword: 'Incorrect password' }
    }));
  }

  // 6) Check if new password is different from current
  if (await user.matchPassword(newPassword, user.password)) {
    return next(new AppError('New password must be different from current password', 400, {
      fields: { newPassword: 'Must be different from current password' }
    }));
  }

  // 7) Update password and invalidate all sessions
  user.password = newPassword;
  user.passwordChangedAt = Date.now() - 1000; // Ensure token is invalidated
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 8) Log password change
  logger.info('Password changed successfully', { 
    userId: user._id,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  // 9) Send password reset notification email (in background)
  try {
    await sendMail({
      to: user.email,
      subject: 'Password Changed',
      template: 'password-changed',
      context: {
        name: user.name,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    });
  } catch (error) {
    logger.error('Failed to send password change notification', {
      userId: user._id,
      error: error.message
    });
  }

  // 10) Generate new JWT token and send response
  createSendToken(user, 200, req, res, 'Password changed successfully');
});

/**
 * @desc    Request password reset
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 * 
 * Initiates the password reset process by sending a reset token to the user's email.
 * Implements rate limiting and security best practices.
 */
const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get email from request body
  const { email } = req.body;
  
  // 2) Validate email
  if (!email) {
    return next(new AppError('Please provide your email address', 400, {
      field: 'email',
      message: 'Email is required'
    }));
  }

  // 3) In-memory rate limiting (5 attempts per hour per IP)
  const rateLimitKey = `forgot-password:${req.ip}`;
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  
  // Initialize or get existing attempts
  if (!forgotPasswordAttempts[rateLimitKey]) {
    forgotPasswordAttempts[rateLimitKey] = [];
  }
  
  // Filter out old attempts
  forgotPasswordAttempts[rateLimitKey] = forgotPasswordAttempts[rateLimitKey].filter(
    timestamp => timestamp > oneHourAgo
  );
  
  // Add current attempt
  forgotPasswordAttempts[rateLimitKey].push(now);
  
  // Check if rate limit exceeded
  if (forgotPasswordAttempts[rateLimitKey].length > 5) {
    logger.warn('Rate limit exceeded for forgot password', {
      ip: req.ip,
      email,
      attempts: forgotPasswordAttempts[rateLimitKey].length - 1
    });
    
    return next(
      new AppError('Too many password reset attempts. Please try again later.', 429, {
        ip: req.ip,
        email,
        attempts: forgotPasswordAttempts[rateLimitKey].length - 1
      })
    );
  }

  // 4) Find user by email (case insensitive)
  const user = await User.findOne({ 
    email: { $regex: new RegExp(`^${email}$`, 'i') } 
  });
  
  // 5) If user exists, proceed with token generation
  if (user) {
    // Check if there's a recent reset token that's still valid
    if (user.passwordResetExpires && user.passwordResetExpires > Date.now()) {
      const minutesLeft = Math.ceil((user.passwordResetExpires - Date.now()) / (1000 * 60));
      return next(new AppError(
        `A password reset link has already been sent to your email. Please check your inbox or wait ${minutesLeft} minutes to request a new one.`,
        429
      ));
    }

    // 6) Generate reset token and save to database
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 7) Create reset URL with token
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
      // 8) Send password reset email
    try {
      await sendMail({
        to: user.email,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Click the link to reset your password: ${resetUrl}\n\nIf you did not request this, please ignore this email. This link expires in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>You requested a password reset for your Kidpreneur account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="margin: 25px 0;">
              <a href="${resetUrl}" 
                style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${resetUrl}</p>
            <p><strong>This link will expire in 10 minutes.</strong></p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have any concerns.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #777;">
              This is an automated message, please do not reply directly to this email.
            </p>
          </div>
        `
      });

      logger.info('Password reset email sent', {
        userId: user._id,
        email: user.email,
        ip: req.ip
      });

      // 9) Send success response
      return res.status(200).json({
        status: 'success',
        message: 'If that email address exists in our system, a reset link has been sent.'
      });
    } catch (error) {
      // If email sending fails, clean up the reset token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      logger.error('Error sending password reset email:', {
        error: error.message,
        stack: error.stack,
        userId: user._id,
        email: user.email,
        ip: req.ip
      });

      return next(
        new AppError('There was an error sending the email. Please try again later!', 500)
      );
    }
  }

  // If we get here, the email doesn't exist in our system
  // But we still return success to prevent email enumeration
  return res.status(200).json({
    status: 'success',
    message: 'If that email address exists in our system, a reset link has been sent.'
  });
});

/**
 * @desc    Reset user password
 * @route   PATCH /api/v1/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token and check if token has not expired
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // 3) Update password and clear reset token
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  
  // This will run the validators and the pre-save middleware
  await user.save();

  // 4) Log the user in, send JWT
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

  // 5) Send response with user data and token
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    }
  });
});

/**
 * @desc    Logout user / clear cookie
 * @route   GET /api/v1/auth/logout
 * @access  Private
 */
const logout = (req, res) => {
  // Clear the JWT cookie
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
    httpOnly: true
  });
  
  res.status(200).json({ status: 'success' });
};

export {
  signup,
  login,
  socialLoginCallback,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout
};