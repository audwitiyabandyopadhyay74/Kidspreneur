const express = require('express');
const router = express.Router();
const passport = require('passport');
const { body } = require('express-validator');
const { validate } = require('../../middleware/validation');
const { validationRules } = require('../../middleware/validation');
const ideaController = require('../../controllers/ideaController');
const { csrfProtection } = require('../../middleware/security');

// Protect all routes with JWT authentication
const requireAuth = passport.authenticate('jwt', { session: false });

// Get all ideas
router.get('/', ideaController.getAllIdeas);

// Get a single idea
router.get('/:id', ideaController.getIdea);

// Create a new idea (protected)
router.post(
  '/',
  requireAuth,
  csrfProtection,
  validate(validationRules.idea.create),
  ideaController.createIdea
);

// Update an idea (protected, owner only)
router.put(
  '/:id',
  requireAuth,
  csrfProtection,
  validate(validationRules.idea.update),
  ideaController.updateIdea
);

// Delete an idea (protected, owner or admin only)
router.delete('/:id', requireAuth, ideaController.deleteIdea);

// Like/Unlike an idea
router.post('/:id/like', requireAuth, ideaController.toggleLike);

// Add a comment to an idea
router.post(
  '/:id/comments',
  requireAuth,
  csrfProtection,
  validate(validationRules.comment.create),
  ideaController.addComment
);

// Get comments for an idea
router.get('/:id/comments', ideaController.getComments);

// Fund an idea
router.post('/:id/fund', requireAuth, csrfProtection, ideaController.fundIdea);

module.exports = router;
