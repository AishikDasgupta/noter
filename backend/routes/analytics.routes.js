import express from 'express';
import Note from '../models/notes.model.js';
import User from '../models/User.js';
import auth from '../middlewares/auth.middleware.js';
import adminOnly from '../middlewares/admin.middleware.js';

const router = express.Router();

// Renamed endpoints to match frontend service calls

// 1. Most active users (top 5 by note count)
router.get('/most-active-users', auth, adminOnly, async (req, res) => {
  try {
    const users = await Note.aggregate([
      { $group: { _id: '$owner', noteCount: { $sum: 1 } } },
      { $sort: { noteCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $project: { _id: 0, username: '$user.email', noteCount: 1 } }
    ]);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 2. Most used tags (top 10)
router.get('/most-used-tags', auth, adminOnly, async (req, res) => {
  try {
    const tags = await Note.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, tag: '$_id', count: 1 } }
    ]);
    res.json(tags);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 3. Notes created per day (last 7 days)
router.get('/notes-created-daily', auth, adminOnly, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const notesPerDay = await Note.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', count: 1 } }
    ]);
    res.json(notesPerDay);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;