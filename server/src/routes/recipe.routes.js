import { Router } from 'express';
import { AIService } from '../services/aiService.js';
import { validateRequest } from '../middleware/validation.js';
import { recipeGenerationSchema, substitutionSchema } from '../schemas/recipe.schemas.js';
import { authenticateToken, checkSubscriptionLimits, requirePlan } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Generate recipe from ingredients
router.post('/generate', 
  authenticateToken,
  checkSubscriptionLimits,
  validateRequest(recipeGenerationSchema), 
  async (req, res) => {
    try {
      const { ingredients, dietaryRestrictions, cuisine } = req.body;
      
      const recipe = await AIService.generateRecipe(ingredients, dietaryRestrictions, cuisine);
      
      // Here you would increment the user's request count in your database
      logger.info(`Recipe generated: ${recipe.title} for user: ${req.user?.email}`);
      
      res.json({
        success: true,
        data: recipe,
        message: 'Recipe generated successfully'
      });
    } catch (error) {
      logger.error('Recipe generation failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate recipe',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get ingredient substitutions
router.post('/substitutions', 
  authenticateToken,
  requirePlan(['basic', 'pro', 'pro_yearly']),
  checkSubscriptionLimits,
  validateRequest(substitutionSchema), 
  async (req, res) => {
    try {
      const { ingredient, restrictions } = req.body;
      
      const substitutions = await AIService.suggestSubstitutions(ingredient, restrictions);
      
      logger.info(`Substitutions generated for: ${ingredient} for user: ${req.user?.email}`);
      
      res.json({
        success: true,
        data: substitutions,
        message: 'Substitutions found successfully'
      });
    } catch (error) {
      logger.error('Substitution generation failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate substitutions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export { router as recipeRoutes };