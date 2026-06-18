const Bookmark = require('../models/bookmark.model');
const Note = require('../models/note.model');
const Vote = require('../models/vote.model');
const Concept = require('../models/concept.model');
const paginate = require('../utils/paginate');

// BOOKMARKS
const toggleBookmark = async (userId, conceptId) => {
  // Check if concept exists
  const concept = await Concept.findOne({ _id: conceptId, isDeleted: false });
  if (!concept) throw new Error('Concept not found');

  const existing = await Bookmark.findOne({ userId, conceptId });
  
  if (existing) {
    await Bookmark.findByIdAndDelete(existing._id);
    await Concept.findByIdAndUpdate(conceptId, { $inc: { bookmarks: -1 } });
    return { bookmarked: false };
  } else {
    await Bookmark.create({ userId, conceptId });
    await Concept.findByIdAndUpdate(conceptId, { $inc: { bookmarks: 1 } });
    return { bookmarked: true };
  }
};

const removeBookmark = async (userId, conceptId) => {
  const existing = await Bookmark.findOneAndDelete({ userId, conceptId });
  if (existing) {
    await Concept.findByIdAndUpdate(conceptId, { $inc: { bookmarks: -1 } });
  }
  return { bookmarked: false };
};

const getUserBookmarks = async (userId, reqQuery) => {
  // We paginate over bookmarks and populate concepts
  return await paginate(Bookmark, { userId }, reqQuery, { path: 'conceptId', match: { isDeleted: false } });
};

// NOTES
const getUserNotes = async (userId, reqQuery) => {
  return await paginate(Note, { userId }, reqQuery, { path: 'conceptId', match: { isDeleted: false } });
};
const createNote = async (userId, conceptId, content) => {
  const concept = await Concept.findOne({ _id: conceptId, isDeleted: false });
  if (!concept) throw new Error('Concept not found');

  return await Note.create({ userId, conceptId, content });
};

const getConceptNotes = async (userId, conceptId) => {
  return await Note.find({ userId, conceptId }).sort('-createdAt');
};

const updateNote = async (userId, noteId, content) => {
  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId },
    { content },
    { new: true, runValidators: true }
  );
  if (!note) throw new Error('Note not found or unauthorized');
  return note;
};

const deleteNote = async (userId, noteId) => {
  const note = await Note.findOneAndDelete({ _id: noteId, userId });
  if (!note) throw new Error('Note not found or unauthorized');
  return note;
};

// VOTES
const toggleVote = async (userId, conceptId, voteType) => {
  const concept = await Concept.findOne({ _id: conceptId, isDeleted: false });
  if (!concept) throw new Error('Concept not found');

  const existing = await Vote.findOne({ userId, conceptId });

  if (existing) {
    if (existing.voteType === voteType) {
      // Remove vote
      await Vote.findByIdAndDelete(existing._id);
      return { vote: null };
    } else {
      // Change vote
      existing.voteType = voteType;
      await existing.save();
      return { vote: voteType };
    }
  } else {
    // New vote
    await Vote.create({ userId, conceptId, voteType });
    return { vote: voteType };
  }
};

const getTopVoted = async () => {
  // Aggregate upvotes
  return await Vote.aggregate([
    { $match: { voteType: 'up' } },
    { $group: { _id: '$conceptId', upvotes: { $sum: 1 } } },
    { $sort: { upvotes: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'concepts',
        localField: '_id',
        foreignField: '_id',
        as: 'concept'
      }
    },
    { $unwind: '$concept' },
    { $match: { 'concept.isDeleted': false } },
    { $project: { _id: 1, upvotes: 1, 'concept.title': 1, 'concept.category': 1 } }
  ]);
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
