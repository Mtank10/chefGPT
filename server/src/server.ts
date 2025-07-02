import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { recipeRoutes } from './routes/recipe.routes.js';
import { nutritionRoutes } from './routes/nutrition.routes.js';
import { mealPlanRoutes } from './routes/mealplan.routes.js';
import { chatRoutes } from './routes/chat.routes.js';
import { imageRoutes } from './routes/image.routes.js';
import { subscriptionRoutes } from './routes/subscription.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parsing middleware
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/images', imageRoutes);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`🚀 AI Recipe Microservice running on port ${PORT}`);
});

export default app;