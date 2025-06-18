// notes.model.js - Mongoose schema for notes
// This schema defines the structure of note documents, including sharing, tags, and ownership.

import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  // Note title (required)
  title: {
    type: String,
    required: true,
    trim: true
  },
  // Note content (required)
  content: {
    type: String,
    required: true
  },
  // Array of tags (for filtering/search)
  tags: {
    type: [String],
    default: []
  },
  // Archive flag (not used in UI, but available for future use)
  isArchived: {
    type: Boolean,
    default: false
  },
  // Reference to the user who owns the note
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Array of sharing objects (users with whom the note is shared)
  sharedWith: [
    {
      // User the note is shared with
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      // Permission: 'read' or 'write'
      permission: { type: String, enum: ['read', 'write'], default: 'read' },
      // User who shared the note (for audit)
      sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      // Timestamp of when shared
      sharedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true }); // Adds createdAt and updatedAt fields

const Note = mongoose.model('Note', noteSchema);
export default Note;
