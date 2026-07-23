import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import 'express-async-errors';

import { logger } from './config/logger';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth.routes';

const app = express();

// --- Middleware Chain ---

// CORS
app.use(cors());

// Body parsing
app.use(express.json());

// HTTP request/response logging
app.use(pinoHttp({ logger }));

// --- Routes ---

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// --- Error Handling ---

// Global error handler (must be last)
app.use(errorHandler);

export default app;
