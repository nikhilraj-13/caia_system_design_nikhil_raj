const interactionService = require('../services/interaction.service');
const { sendResponse } = require('../utils/apiResponse');

// BOOKMARKS
const toggleBookmark = async (req, res) => {
  const data = await interactionService.toggleBookmark(req.user._id, req.params.conceptId);
  return sendResponse(res, 200, true, data.bookmarked ? 'Bookmark added' : 'Bookmark removed', data);
};

const removeBookmark = async (req, res) => {
  const data = await interactionService.removeBookmark(req.user._id, req.params.conceptId);
  return sendResponse(res, 200, true, 'Bookmark removed', data);
};

const getUserBookmarks = async (req, res) => {
  const result = await interactionService.getUserBookmarks(req.user._id, req.query);
  return sendResponse(res, 200, true, 'Bookmarks fetched successfully', result.data, result.pagination);
};

const getUserNotes = async (req, res) => {
  const result = await interactionService.getUserNotes(req.user._id, req.query);
  return sendResponse(res, 200, true, 'User notes fetched successfully', result.data, result.pagination);
};

// NOTES
const createNote = async (req, res) => {
  const data = await interactionService.createNote(req.user._id, req.params.conceptId, req.body.content);
  return sendResponse(res, 201, true, 'Note created successfully', data);
};

const getConceptNotes = async (req, res) => {
  const data = await interactionService.getConceptNotes(req.user._id, req.params.conceptId);
  return sendResponse(res, 200, true, 'Notes fetched successfully', data);
};

const updateNote = async (req, res) => {
  const data = await interactionService.updateNote(req.user._id, req.params.noteId, req.body.content);
  return sendResponse(res, 200, true, 'Note updated successfully', data);
};

const deleteNote = async (req, res) => {
  const data = await interactionService.deleteNote(req.user._id, req.params.noteId);
  return sendResponse(res, 200, true, 'Note deleted successfully', data);
};

// VOTES
const toggleVote = async (req, res) => {
  const data = await interactionService.toggleVote(req.user._id, req.params.conceptId, req.body.voteType);
  return sendResponse(res, 200, true, 'Vote recorded successfully', data);
};

const getTopVoted = async (req, res) => {
  const data = await interactionService.getTopVoted();
  return sendResponse(res, 200, true, 'Top voted concepts fetched', data);
};

module.exports = {
  toggleBookmark,
  removeBookmark,
  getUserBookmarks,
  getUserNotes,
  createNote,
  getConceptNotes,
  updateNote,
  deleteNote,
  toggleVote,
  getTopVoted
};
