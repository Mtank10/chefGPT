import { logger } from '../utils/logger.js';

export const errorHandler = (error, req, res, next) => {
  logger.error('Unhandled error:', error);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
};