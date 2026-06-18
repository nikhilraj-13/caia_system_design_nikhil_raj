const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interaction.controller');
const asyncWrapper = require('../utils/asyncWrapper');
const { protect } = require('../middlewares/auth.middleware');

// We will mount this router differently based on base paths
// E.g., /api/v1/bookmarks, /api/v1/notes, /api/v1/votes

// Routes to be mounted at /api/v1/bookmarks
const bookmarkRouter = express.Router();
bookmarkRouter.use(protect);
bookmarkRouter.get('/', asyncWrapper(interactionController.getUserBookmarks));
bookmarkRouter.post('/:conceptId', asyncWrapper(interactionController.toggleBookmark));
bookmarkRouter.delete('/:conceptId', asyncWrapper(interactionController.removeBookmark));

// Routes to be mounted at /api/v1/notes
const noteRouter = express.Router();
noteRouter.use(protect);
noteRouter.get('/', asyncWrapper(interactionController.getUserNotes));
noteRouter.post('/:conceptId', asyncWrapper(interactionController.createNote));
noteRouter.get('/:conceptId', asyncWrapper(interactionController.getConceptNotes));
noteRouter.patch('/:noteId', asyncWrapper(interactionController.updateNote));
noteRouter.delete('/:noteId', asyncWrapper(interactionController.deleteNote));

// Routes to be mounted at /api/v1/votes
const voteRouter = express.Router();
voteRouter.get('/top', asyncWrapper(interactionController.getTopVoted)); // public or protected? The spec doesn't say protected. Let's make it public.
voteRouter.post('/:conceptId', protect, asyncWrapper(interactionController.toggleVote));

// Routes to be mounted at /api/v1/history
const historyRouter = express.Router();
historyRouter.use(protect);
historyRouter.get('/', asyncWrapper(interactionController.getUserHistory));
historyRouter.post('/:conceptId', asyncWrapper(interactionController.recordHistory));

module.exports = {
  bookmarkRouter,
  noteRouter,
  voteRouter,
  historyRouter
};
