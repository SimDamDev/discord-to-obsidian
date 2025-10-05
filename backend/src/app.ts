import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true,
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Import routes
import authRoutes from './routes/auth';
import discordRoutes from './routes/discord';
import connectionRoutes from './routes/connections';
import cacheRoutes from './routes/cache';
import userBotRoutes from './routes/user-bot';

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/discord', discordRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/cache', cacheRoutes);
app.use('/api/user-bot', userBotRoutes);

app.get('/api', (req, res) => {
  res.json({ 
    message: 'Discord to Obsidian API',
    version: '1.0.0',
    status: 'running'
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

export default app;
