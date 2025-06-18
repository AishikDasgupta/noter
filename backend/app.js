// app.js - Main Express application setup
// This file initializes the Express app, configures middleware, and registers API routes.
// It is imported by server.js, which starts the server.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js'; 
import notesRoutes from './routes/notes.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

dotenv.config(); // Load environment variables from .env file

const app = express();

// Enable CORS for specified origins (replace with your actual frontend URLs)
app.use(cors({
  origin: [
    'https://noter-itsdg19-gmailcoms-projects.vercel.app/', // <-- Replace with your actual Vercel frontend URL
    'http://localhost:3000' // (optional) for local dev
  ],
  credentials: true
}));
// Parse incoming JSON requests
app.use(express.json());

// Register authentication routes (login, register, etc.)
app.use('/api/auth', authRoutes);
// Register notes CRUD and sharing routes
app.use('/api/notes', notesRoutes);
// Register admin analytics routes (protected, admin-only)
app.use('/api/admin/analytics', analyticsRoutes);

export default app;
