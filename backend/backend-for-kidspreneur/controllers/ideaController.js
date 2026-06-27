import Idea from '../models/Idea.js';
import User from '../models/User.js';
import AppError from '../utils/appError.js';
import { logger } from '../utils/logger.js';
import { validationResult } from 'express-validator';

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

// @desc    Create a new idea
// @route   POST /api/v1/ideas
// @access  Private
const createIdea = async (req, res, next) => {
  try {
    const { title, description, category = '' } = req.body;
    const userId = req.user._id;

    // Create new idea
    const idea = new Idea({
      title,
      description,
      category,
      createdBy: userId,
    });

    await idea.save();

    // Populate creator details
    await idea.populate('createdBy', 'name username profileImage');

    // Log the creation
    logger.info(`New idea created: ${idea._id} by user ${userId}`);

    res.status(201).json({
      status: 'success',
      data: {
        idea
      }
    });
  } catch (error) {
    logger.error(`Error creating idea: ${error.message}`, { error });
    next(error);
  }
};

// @desc    Get all ideas with filtering, sorting, and pagination
// @route   GET /api/v1/ideas
// @access  Public
const getAllIdeas = async (req, res, next) => {
  try {
    // 1) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 2) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    let query = Idea.find(JSON.parse(queryStr));

    // 3) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 4) Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // 5) Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;
    
    if (req.query.page) {
      const numIdeas = await Idea.countDocuments();
      if (skip >= numIdeas) throw new Error('This page does not exist');
    }
    
    query = query.skip(skip).limit(limit);

    // Execute query
    const ideas = await query.populate('createdBy', 'name username profileImage');

    res.status(200).json({
      status: 'success',
      results: ideas.length,
      data: {
        ideas
      }
    });
  } catch (error) {
    logger.error(`Error fetching ideas: ${error.message}`, { error });
    next(error);
  }
};

// @desc    Get ideas for the logged in user
// @route   GET /api/v1/ideas/me
// @access  Private
const getMyIdeas = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const ideas = await Idea.find({ createdBy: userId })
      .populate('createdBy', 'name username profileImage')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: ideas.length,
      data: {
        ideas
      }
    });
  } catch (error) {
    logger.error(`Error fetching user ideas: ${error.message}`, { userId: req.user?._id, error });
    next(error);
  }
};

// @desc    Get a single idea by ID
// @route   GET /api/v1/ideas/:id
// @access  Public
const getIdeaById = async (req, res, next) => {
  try {
    const idea = await Idea.findById(req.params.id)
      .populate('createdBy', 'name username profileImage')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'name username profileImage'
        },
        options: { sort: { createdAt: -1 } }
      });

    if (!idea) {
      return next(new AppError('No idea found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        idea
      }
    });
  } catch (error) {
    logger.error(`Error fetching idea ${req.params.id}: ${error.message}`, { error });
    next(error);
  }
};

// @desc    Update an idea
// @route   PUT /api/v1/ideas/:id
// @access  Private
const updateIdea = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return next(new AppError('No idea found with that ID', 404));
    }

    // Check if the user is the owner of the idea
    if (idea.createdBy.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to update this idea', 403));
    }

    // Update only the fields that are passed in the request
    if (title) idea.title = title;
    if (description) idea.description = description;
    if (category) idea.category = category;

    const updatedIdea = await idea.save();
    
    // Populate the updated idea with creator details
    await updatedIdea.populate('createdBy', 'name username profileImage');

    logger.info(`Idea updated: ${updatedIdea._id} by user ${req.user._id}`);

    res.status(200).json({
      status: 'success',
      data: {
        idea: updatedIdea
      }
    });
  } catch (error) {
    logger.error(`Error updating idea ${req.params.id}: ${error.message}`, { 
      userId: req.user?._id, 
      error 
    });
    next(error);
  }
};

// @desc    Delete an idea
// @route   DELETE /api/v1/ideas/:id
// @access  Private
const deleteIdea = async (req, res, next) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return next(new AppError('No idea found with that ID', 404));
    }

    // Check if the user is the owner of the idea or an admin
    if (idea.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to delete this idea', 403));
    }

    await idea.deleteOne();
    
    logger.info(`Idea deleted: ${req.params.id} by user ${req.user._id}`);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error(`Error deleting idea ${req.params.id}: ${error.message}`, { 
      userId: req.user?._id, 
      error 
    });
    next(error);
  }
};

// @desc    Toggle like on an idea
// @route   POST /api/v1/ideas/:id/like
// @access  Private
const toggleLike = async (req, res, next) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return next(new AppError('No idea found with that ID', 404));
    }

    const userId = req.user._id;
    const hasLiked = idea.likes.some(like => like.user.toString() === userId.toString());
    let message;

    if (hasLiked) {
      // Remove like
      idea.likes = idea.likes.filter(like => like.user.toString() !== userId.toString());
      message = 'Idea unliked successfully';
    } else {
      // Add like
      idea.likes.push({ user: userId });
      message = 'Idea liked successfully';
    }

    await idea.save();
    
    // Populate the user details in the likes array
    await idea.populate('likes.user', 'name username profileImage');

    logger.info(`Idea ${hasLiked ? 'unliked' : 'liked'}: ${idea._id} by user ${userId}`);

    res.status(200).json({
      status: 'success',
      message,
      data: {
        likes: idea.likes,
        likesCount: idea.likes.length
      }
    });
  } catch (error) {
    logger.error(`Error toggling like on idea ${req.params.id}: ${error.message}`, { 
      userId: req.user?._id, 
      error 
    });
    next(error);
  }
};

// @desc    Add a comment to an idea
// @route   POST /api/v1/ideas/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return next(new AppError('No idea found with that ID', 404));
    }

    const newComment = {
      text,
      user: req.user._id,
    };

    idea.comments.unshift(newComment);
    await idea.save();
    
    // Populate the user details in the new comment
    await idea.populate('comments.user', 'name username profileImage');
    
    const addedComment = idea.comments[0]; // The newly added comment is at index 0

    logger.info(`Comment added to idea ${idea._id} by user ${req.user._id}`);

    res.status(201).json({
      status: 'success',
      data: {
        comment: addedComment
      }
    });
  } catch (error) {
    logger.error(`Error adding comment to idea ${req.params.id}: ${error.message}`, { 
      userId: req.user?._id, 
      error 
    });
    next(error);
  }
};

// @desc    Get comments for an idea
// @route   GET /api/v1/ideas/:id/comments
// @access  Public
const getComments = async (req, res, next) => {
  try {
    const idea = await Idea.findById(req.params.id)
      .select('comments')
      .populate({
        path: 'comments.user',
        select: 'name username profileImage'
      });

    if (!idea) {
      return next(new AppError('No idea found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      results: idea.comments.length,
      data: {
        comments: idea.comments
      }
    });
  } catch (error) {
    logger.error(`Error fetching comments for idea ${req.params.id}: ${error.message}`, { error });
    next(error);
  }
};

// @desc    Fund an idea
// @route   POST /api/v1/ideas/:id/fund
// @access  Private
// @desc    Search ideas by title, description, or category
// @route   GET /api/ideas/search
// @access  Public
const searchIdeas = async (req, res, next) => {
  try {
    const { q: searchQuery } = req.query;

    if (!searchQuery || searchQuery.trim() === '') {
      return res.status(200).json({
        status: 'success',
        results: 0,
        data: []
      });
    }

    // Case-insensitive search for title, description, or category
    const searchRegex = new RegExp(searchQuery, 'i');
    
    const ideas = await Idea.find({
      $or: [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { category: { $regex: searchRegex } }
      ]
    })
    .sort({ createdAt: -1 }) // Sort by newest first
    .populate('createdBy', 'name username profileImage')
    .lean();

    res.status(200).json({
      status: 'success',
      results: ideas.length,
      data: ideas
    });
  } catch (error) {
    logger.error(`Error searching ideas: ${error.message}`, { error });
    next(error);
  }
};

// @desc    Fund an idea
// @route   POST /api/ideas/:id/fund
// @access  Private
const fundIdea = async (req, res, next) => {
  const Notification = require('../models/Notification');
  const Razorpay = require('razorpay');
  const mongoose = require('mongoose');
  const Payment = require('../models/Payment');
  
  const session = await mongoose.startSession();
  session.startTransaction();
  const { amount } = req.body;
  const ideaId = req.params.id;

  // Validate funding amount
  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ 
      success: false,
      code: 'INVALID_AMOUNT',
      message: 'Please provide a valid funding amount greater than zero.'
    });
  }

  try {
    const idea = await Idea.findById(ideaId).populate('createdBy', 'name email bankName accountNumber ifscCode');

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found.' });
    }

    const ideaCreator = await User.findById(idea.createdBy._id);

    if (!ideaCreator) {
      return res.status(404).json({ message: 'Idea creator not found.' });
    }

    // Check if the user trying to fund has complete bank details
    const funder = await User.findById(req.user._id).select('+bankName +accountNumber +ifscCode');
    const missingFunderDetails = [];
    
    if (!funder.bankName) missingFunderDetails.push('bank name');
    if (!funder.accountNumber) missingFunderDetails.push('account number');
    if (!funder.ifscCode) missingFunderDetails.push('IFSC code');
    
    if (missingFunderDetails.length > 0) {
      const notification = await Notification.create({
        user: req.user._id,
        type: 'BANK_DETAILS_INCOMPLETE',
        title: 'Bank Details Required',
        message: `Please complete your bank details (${missingFunderDetails.join(', ')}) to fund ideas.`,
        metadata: {
          action: 'update_bank_details',
          redirectTo: '/profile/bank-details',
          ideaId: idea._id,
          ideaTitle: idea.title,
          missingFields: missingFunderDetails
        },
        priority: 'high'
      });

      return res.status(400).json({ 
        success: false,
        code: 'BANK_DETAILS_INCOMPLETE',
        message: `Please complete your bank details to proceed with funding.`,
        error: {
          type: 'BANK_DETAILS_INCOMPLETE',
          description: 'Your bank details are incomplete',
          missingFields: missingFunderDetails,
          resolution: 'Please update your bank details in your profile settings.'
        },
        notification: {
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          action: notification.metadata.action,
          redirectTo: notification.metadata.redirectTo
        }
      });
    }

    // Check if the idea creator has complete bank details
    const missingCreatorDetails = [];
    if (!ideaCreator.bankName) missingCreatorDetails.push('bank name');
    if (!ideaCreator.accountNumber) missingCreatorDetails.push('account number');
    if (!ideaCreator.ifscCode) missingCreatorDetails.push('IFSC code');
    
    if (missingCreatorDetails.length > 0) {
      // Notify the idea creator
      await Notification.create({
        user: idea.createdBy._id,
        type: 'CREATOR_BANK_DETAILS_INCOMPLETE',
        title: 'Bank Details Required for Funding',
        message: `A user attempted to fund your idea "${idea.title}" but your bank details (${missingCreatorDetails.join(', ')}) are incomplete.`,
        metadata: {
          action: 'update_bank_details',
          redirectTo: '/profile/bank-details',
          ideaId: idea._id,
          ideaTitle: idea.title,
          funderId: req.user._id,
          funderName: req.user.name,
          missingFields: missingCreatorDetails
        },
        priority: 'high'
      });

      // Notify the funder
      const funderNotification = await Notification.create({
        user: req.user._id,
        type: 'CREATOR_DETAILS_NEEDED',
        title: 'Creator Bank Details Required',
        message: `The creator of "${idea.title}" needs to complete their bank details before you can fund this idea.`,
        metadata: {
          ideaId: idea._id,
          ideaTitle: idea.title,
          creatorId: idea.createdBy._id,
          action: 'notify_creator',
          canNotify: true,
          missingFields: missingCreatorDetails
        },
        priority: 'medium'
      });

      return res.status(400).json({ 
        success: false,
        code: 'CREATOR_BANK_DETAILS_INCOMPLETE',
        message: 'The idea creator needs to complete their bank details before you can fund this idea.',
        error: {
          type: 'CREATOR_BANK_DETAILS_INCOMPLETE',
          description: 'Creator bank details are incomplete',
          missingFields: missingCreatorDetails,
          resolution: 'The creator has been notified to update their bank details.'
        },
        notification: {
          id: funderNotification._id,
          type: funderNotification.type,
          title: funderNotification.title,
          message: funderNotification.message,
          action: funderNotification.metadata.action,
          canNotify: funderNotification.metadata.canNotify
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Idea creator has bank details. Proceed with payment.',
      data: {
        ideaCreatorId: ideaCreator._id,
        ideaCreatorName: ideaCreator.name,
        ideaId: idea._id,
        ideaTitle: idea.title,
        amount: amount,
        currency: 'INR' // Default currency
      },
      nextSteps: [
        'Proceed to payment gateway',
        'Complete the payment',
        'Get payment confirmation'
      ]
    });

  } catch (error) {
    console.error('Error funding idea:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  createIdea,
  getAllIdeas,
  getMyIdeas,
  getIdeaById,
  updateIdea,
  deleteIdea,
  toggleLike,
  addComment,
  getComments,
  searchIdeas,
  fundIdea
};