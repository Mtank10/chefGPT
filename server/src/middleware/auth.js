import jwt from 'jsonwebtoken';
import { Database } from '../config/database.js';
import { logger } from '../utils/logger.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get fresh user data from database
    const user = await Database.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get current subscription and usage
    const subscription = await Database.getSubscriptionByUserId(user.id);
    const currentMonth = Database.getCurrentMonth();
    const usage = await Database.getOrCreateUsageTracking(user.id, currentMonth);

    req.user = {
      id: user.id,
      email: user.email,
      stripeCustomerId: user.stripe_customer_id,
      subscription: {
        plan: subscription?.plan || 'free',
        status: subscription?.status || 'active',
        requestsUsed: usage.requests_used,
        requestLimit: usage.request_limit
      }
    };

    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const checkSubscriptionLimits = async (req, res, next) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const { subscription } = user;
  
  // Check if subscription is active
  if (subscription.status !== 'active' && subscription.plan !== 'free') {
    return res.status(403).json({
      success: false,
      message: 'Active subscription required',
      code: 'SUBSCRIPTION_REQUIRED'
    });
  }

  // Check request limits (unlimited = -1)
  if (subscription.requestLimit !== -1 && subscription.requestsUsed >= subscription.requestLimit) {
    return res.status(429).json({
      success: false,
      message: 'Monthly request limit exceeded. Please upgrade your plan.',
      code: 'LIMIT_EXCEEDED',
      requestsUsed: subscription.requestsUsed,
      requestLimit: subscription.requestLimit
    });
  }

  next();
};

export const requirePlan = (requiredPlans) => {
  return (req, res, next) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!requiredPlans.includes(user.subscription.plan)) {
      return res.status(403).json({
        success: false,
        message: `This feature requires ${requiredPlans.join(' or ')} plan`,
        code: 'PLAN_UPGRADE_REQUIRED',
        currentPlan: user.subscription.plan,
        requiredPlans
      });
    }

    next();
  };
};

export const incrementUsage = async (req, res, next) => {
  try {
    const user = req.user;
    if (user && user.subscription.requestLimit !== -1) {
      const currentMonth = Database.getCurrentMonth();
      await Database.incrementUsage(user.id, currentMonth);
    }
    next();
  } catch (error) {
    logger.error('Error incrementing usage:', error);
    next(); // Continue even if usage tracking fails
  }
};