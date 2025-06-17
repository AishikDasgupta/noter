import express from 'express';
import Note from '../models/notes.model.js';
import User from '../models/User.js';
import auth from '../middlewares/auth.middleware.js';

const router = express.Router();

// CREATE a note
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

// READ all notes for the user (owned or shared)
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Search
    const search = req.query.search || '';
    const searchRegex = new RegExp(search, 'i');

    // Build query
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
          : {}
      ]
    };

    const notes = await Note.find(baseQuery)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('owner', 'email')
      .populate('sharedWith.user', 'email')
      .populate('sharedWith.sharedBy', 'email');

    const total = await Note.countDocuments(baseQuery);

    res.json({
      notes,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// READ a single note
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

// UPDATE a note
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

// DELETE a note
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

// SHARE a note using email
router.post('/:id/share', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (!note.owner.equals(req.user.userId))
      return res.status(403).json({ message: 'Only the owner can share this note.' });

    const { email, permission } = req.body;

    if (!['read', 'write'].includes(permission)) {
      return res.status(400).json({ message: 'Permission must be "read" or "write"' });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user._id.equals(req.user.userId)) {
      return res.status(400).json({ message: 'Cannot share with yourself' });
    }

    const existing = note.sharedWith.find((sw) => sw.user.equals(user._id));
    if (existing) {
      existing.permission = permission;
    } else {
      note.sharedWith.push({ user: user._id, permission });
    }

    await note.save();
    res.json({ message: 'Note shared successfully', sharedWith: note.sharedWith });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// REMOVE shared user using email
router.post('/:id/unshare', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (!note.owner.equals(req.user.userId)) {
      return res.status(403).json({ message: 'Only the owner can unshare this note.' });
    }

    const { email } = req.body;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    note.sharedWith = note.sharedWith.filter((sw) => !sw.user.equals(user._id));
    await note.save();

    res.json({ message: 'User unshared successfully', sharedWith: note.sharedWith });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET shared users list
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
