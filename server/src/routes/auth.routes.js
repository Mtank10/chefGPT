import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validateRequest } from '../middleware/validation.js';
import { authSchema } from '../schemas/auth.schemas.js';
import { Database } from '../config/database.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Register endpoint
router.post('/register', validateRequest(authSchema.register), async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await Database.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userData = {
      email,
      name,
      password_hash: hashedPassword
    };

    const user = await Database.createUser(userData);

    // Create default subscription
    const subscriptionData = {
      user_id: user.id,
      plan: 'free',
      status: 'active'
    };

    const subscription = await Database.createSubscription(subscriptionData);

    // Create initial usage tracking
    const currentMonth = Database.getCurrentMonth();
    await Database.getOrCreateUsageTracking(user.id, currentMonth);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        subscription: {
          plan: subscription.plan,
          status: subscription.status,
          requestsUsed: 0,
          requestLimit: Database.getRequestLimitForPlan(subscription.plan)
        }
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          subscription: {
            plan: subscription.plan,
            status: subscription.status,
            requestsUsed: 0,
            requestLimit: Database.getRequestLimitForPlan(subscription.plan)
          }
        }
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Login endpoint
router.post('/login', validateRequest(authSchema.login), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await Database.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Get subscription and usage data
    const subscription = await Database.getSubscriptionByUserId(user.id);
    const currentMonth = Database.getCurrentMonth();
    const usage = await Database.getOrCreateUsageTracking(user.id, currentMonth);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        stripeCustomerId: user.stripe_customer_id,
        subscription: {
          plan: subscription?.plan || 'free',
          status: subscription?.status || 'active',
          requestsUsed: usage.requests_used,
          requestLimit: usage.request_limit
        }
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          subscription: {
            plan: subscription?.plan || 'free',
            status: subscription?.status || 'active',
            requestsUsed: usage.requests_used,
            requestLimit: usage.request_limit
          }
        }
      },
      message: 'Login successful'
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as authRoutes };