import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      permission: { type: String, enum: ['read', 'write'], default: 'read' },
      sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      sharedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

const Note = mongoose.model('Note', noteSchema);
export default Note;
