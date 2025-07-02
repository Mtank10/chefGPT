import { Router } from 'express';
import { AIService } from '../services/aiService.js';
import { validateRequest } from '../middleware/validation.js';
import { nutritionAnalysisSchema } from '../schemas/nutrition.schemas.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Analyze recipe nutrition
router.post('/analyze', validateRequest(nutritionAnalysisSchema), async (req, res) => {
  try {
    const { recipe } = req.body;
    
    const analysis = await AIService.analyzeNutrition(recipe);
    
    logger.info(`Nutrition analysis completed for: ${recipe.title || 'Unknown recipe'}`);
    res.json({
      success: true,
      data: analysis,
      message: 'Nutrition analysis completed successfully'
    });
  } catch (error) {
    logger.error('Nutrition analysis failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze nutrition',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as nutritionRoutes };