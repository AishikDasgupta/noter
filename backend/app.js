import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js'; 
import notesRoutes from './routes/notes.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// TODO: Import routes here
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/admin/analytics', analyticsRoutes);

export default app;
