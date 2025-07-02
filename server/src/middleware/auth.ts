import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    stripeCustomerId: any;
    id: string;
    email: string;
    subscription: {
      plan: string;
      status: string;
      requestsUsed: number;
      requestLimit: number;
    };
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const checkSubscriptionLimits = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

export const requirePlan = (requiredPlans: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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