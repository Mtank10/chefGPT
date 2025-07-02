import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validateRequest } from '../middleware/validation.js';
import { authSchema } from '../schemas/auth.schemas.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Mock user database (replace with your actual database)
const users = [];

// Register endpoint
router.post('/register', validateRequest(authSchema.register), async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: Date.now().toString(),
      email,
      name,
      password: hashedPassword,
      subscription: {
        plan: 'free',
        status: 'active',
        requestsUsed: 0,
        requestLimit: 5
      },
      stripeCustomerId: null,
      createdAt: new Date()
    };

    users.push(user);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        subscription: user.subscription
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info(`User registered: ${email}`);
    console.log(user);
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          subscription: user.subscription
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
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        subscription: user.subscription,
        stripeCustomerId: user.stripeCustomerId
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
          subscription: user.subscription
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