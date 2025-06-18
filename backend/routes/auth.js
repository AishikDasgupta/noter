import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'This email already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({ 
      email, 
      password: hashedPassword,
      role: role || 'user' // Default to 'user' if no role provided
    });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DEVELOPMENT ONLY: Register admin user
// WARNING: Remove or secure this endpoint before production!
router.post('/register-admin', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'This email already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const user = new User({ 
      email, 
      password: hashedPassword,
      role: 'admin'
    });
    await user.save();

    res.status(201).json({ message: 'Admin user registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email' });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    // Create JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ 
      token, 
      user: { 
        _id: user._id,
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;