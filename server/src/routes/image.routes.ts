import { Router } from 'express';
import multer from 'multer';
import { authenticateToken, requirePlan, checkSubscriptionLimits, AuthenticatedRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Analyze recipe from image - Pro feature only
router.post('/analyze', 
  authenticateToken,
  requirePlan(['pro', 'pro_yearly']),
  checkSubscriptionLimits,
  upload.single('image'), 
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      // This would integrate with OpenAI Vision API or similar
      // For now, returning a mock response
      const mockAnalysis = {
        recognizedDish: "Chicken Stir Fry",
        confidence: 0.87,
        ingredients: ["chicken breast", "bell peppers", "onions", "soy sauce"],
        estimatedCalories: 350,
        suggestions: "This looks like a healthy stir fry! Consider adding more vegetables for extra nutrients."
      };

      logger.info(`Image analysis completed for user: ${req.user?.email}`);
      res.json({
        success: true,
        data: mockAnalysis,
        message: 'Image analyzed successfully'
      });
    } catch (error) {
      logger.error('Image analysis failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze image',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export { router as imageRoutes };