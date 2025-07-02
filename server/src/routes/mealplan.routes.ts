import { Router } from 'express';
import { AIService } from '../services/aiService.js';
import { validateRequest } from '../middleware/validation.js';
import { mealPlanSchema } from '../schemas/mealplan.schemas.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Generate meal plan
router.post('/generate', validateRequest(mealPlanSchema), async (req, res) => {
  try {
    const preferences = req.body;
    
    const mealPlan = await AIService.createMealPlan(preferences);
    
    logger.info(`Meal plan generated for ${preferences.days || 7} days`);
    res.json({
      success: true,
      data: mealPlan,
      message: 'Meal plan generated successfully'
    });
  } catch (error) {
    logger.error('Meal plan generation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate meal plan',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as mealPlanRoutes };