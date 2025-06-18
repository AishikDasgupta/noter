// User.js - Mongoose schema for user accounts
// This schema defines the structure of user documents in MongoDB, including authentication and role-based access.

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Unique username for display and sharing
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  // Unique email address (used for login)
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  // Hashed password (never store plain text)
  password: {
    type: String,
    required: true
  },
  // User role: 'user' (default) or 'admin' (for analytics/dashboard access)
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, { timestamps: true }); // Adds createdAt and updatedAt fields

const User = mongoose.model('User', userSchema);

export default User;