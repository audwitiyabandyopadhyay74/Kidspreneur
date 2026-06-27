import express from 'express';
const router = express.Router();
import { protect } from '../middleware/auth.js';
import {
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
} from '../controllers/ideaController.js';

// Routes
router.route('/')
  .post(protect, createIdea) // Create a new idea
  .get(getAllIdeas);         // Get all ideas

// Search ideas
router.get('/search', searchIdeas);

router.get('/my-ideas', protect, getMyIdeas); // Get ideas for logged in user

router.route('/:id')
  .get(getIdeaById)           // Get a single idea
  .put(protect, updateIdea)     // Update an idea
  .delete(protect, deleteIdea); // Delete an idea

// Likes and comments
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', getComments);

// Fund an idea
router.post('/:id/fund', protect, fundIdea); // New route

export default router;