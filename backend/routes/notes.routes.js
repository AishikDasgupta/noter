// notes.routes.js - Routes for notes CRUD, sharing, search, and filtering
// This file defines all endpoints related to notes, including creation, reading (with pagination/search/tags), updating, deleting, and sharing/unsharing notes.
// All routes are protected by the auth middleware.

import express from 'express';
import Note from '../models/notes.model.js';
import User from '../models/User.js';
import auth from '../middlewares/auth.middleware.js';

const router = express.Router();

// ---------------------- CREATE a note ----------------------
// POST /api/notes
// Requires: title, content, tags (optional)
// Owner is set to the authenticated user
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const note = new Note({
      title,
      content,
      tags,
      owner: req.user.userId,
    });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------- READ all notes for the user (owned or shared) ----------------------
// GET /api/notes
// Supports pagination (page, limit), search (search), and tag filtering (tags)
// Returns notes where user is owner or sharedWith
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Search (case-insensitive on title, content, tags)
    const search = req.query.search || '';
    const searchRegex = new RegExp(search, 'i');

    // Tags filter (comma-separated, matches any)
    let tagsFilter = {};
    if (req.query.tags) {
      const tagsArray = req.query.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      if (tagsArray.length > 0) {
        tagsFilter = { tags: { $in: tagsArray } };
      }
    }

    // Build query: user is owner or sharedWith, plus search/tags
    const baseQuery = {
      $and: [
        {
          $or: [
            { owner: user._id },
            { 'sharedWith.user': user._id }
          ]
        },
        search
          ? {
              $or: [
                { title: searchRegex },
                { content: searchRegex },
                { tags: searchRegex }
              ]
            }
          : {},
        tagsFilter
      ]
    };

    const notes = await Note.find(baseQuery)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('owner', 'username email') // Populate owner info
      .populate('sharedWith.user', 'username email') // Populate sharedWith user info
      .populate('sharedWith.sharedBy', 'username email'); // Populate who shared

    const total = await Note.countDocuments(baseQuery);

    res.json({
      notes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------- READ a single note ----------------------
// GET /api/notes/:id
// Returns the note with the given ID if the user is owner or has access
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const userId = req.user.userId;
    const isOwner = note.owner.equals(userId);
    const isShared = note.sharedWith.some((sw) => sw.user.equals(userId));
    if (!isOwner && !isShared) return res.status(403).json({ message: 'Forbidden' });

    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------- UPDATE a note ----------------------
// PUT /api/notes/:id
// Requires: title, content, tags, isArchived (optional)
// Only owner or users with write permission can update
router.put('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const userId = req.user.userId;
    const isOwner = note.owner.equals(userId);
    const hasWrite = note.sharedWith.some(
      (sw) => sw.user.equals(userId) && sw.permission === 'write'
    );
    if (!isOwner && !hasWrite) return res.status(403).json({ message: 'Forbidden' });

    const { title, content, tags, isArchived } = req.body;
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (isArchived !== undefined) note.isArchived = isArchived;

    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------- DELETE a note ----------------------
// DELETE /api/notes/:id
// Only the owner can delete a note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const userId = req.user.userId;
    if (!note.owner.equals(userId)) return res.status(403).json({ message: 'Forbidden' });

    await note.deleteOne();
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------- SHARE a note using username ----------------------
// POST /api/notes/:id/share
// Requires: username, permission (read-only or read-write)
// Only the owner can share a note
router.post('/:id/share', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (!note.owner.equals(req.user.userId))
      return res.status(403).json({ message: 'Only the owner can share this note.' });

    const { username, permission } = req.body;

    // Normalize permission
    const normalizePermission = (perm) => {
      if (perm === 'read-only') return 'read';
      if (perm === 'read-write') return 'write';
      return perm;
    };
    const normalizedPermission = normalizePermission(permission);

    if (!['read', 'write'].includes(normalizedPermission)) {
      return res.status(400).json({ message: 'Permission must be "read" or "write"' });
    }

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user._id.equals(req.user.userId)) {
      return res.status(400).json({ message: 'Cannot share with yourself' });
    }

    const existing = note.sharedWith.find((sw) => sw.user.equals(user._id));
    if (existing) {
      existing.permission = normalizedPermission;
    } else {
      note.sharedWith.push({ user: user._id, permission: normalizedPermission });
    }

    await note.save();
    res.json({ message: 'Note shared successfully', sharedWith: note.sharedWith });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------- REMOVE shared user using username ----------------------
// POST /api/notes/:id/unshare
// Requires: username
// Only the owner can unshare a note
router.post('/:id/unshare', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (!note.owner.equals(req.user.userId)) {
      return res.status(403).json({ message: 'Only the owner can unshare this note.' });
    }

    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    note.sharedWith = note.sharedWith.filter((sw) => !sw.user.equals(user._id));
    await note.save();

    res.json({ message: 'User unshared successfully', sharedWith: note.sharedWith });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------- GET shared users list ----------------------
// GET /api/notes/:id/shared
// Returns the list of users with whom the note is shared
router.get('/:id/shared', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('sharedWith.user', 'email');
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (!note.owner.equals(req.user.userId)) return res.status(403).json({ message: 'Forbidden' });

    res.json(note.sharedWith);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
