import { Router } from 'express';
import { AIService } from '../services/aiService.js';
import { validateRequest } from '../middleware/validation.js';
import { mealPlanSchema } from '../schemas/mealplan.schemas.js';
import { authenticateToken, checkSubscriptionLimits, incrementUsage } from '../middleware/auth.js';
import { Database } from '../config/database.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Generate meal plan
router.post('/generate', 
  authenticateToken,
  checkSubscriptionLimits,
  validateRequest(mealPlanSchema), 
  incrementUsage,
  async (req, res) => {
    try {
      const preferences = req.body;
      
      const mealPlan = await AIService.createMealPlan(preferences);
      
      // Save meal plan to database
      const mealPlanData = {
        user_id: req.user.id,
        name: `${preferences.days || 7}-Day Meal Plan`,
        days: preferences.days || 7,
        meal_plan_data: mealPlan.mealPlan,
        shopping_list: mealPlan.shoppingList,
        preferences: preferences
      };

      const savedMealPlan = await Database.createMealPlan(mealPlanData);
      
      logger.info(`Meal plan generated and saved for ${preferences.days || 7} days for user: ${req.user.email}`);
      
      res.json({
        success: true,
        data: { ...mealPlan, id: savedMealPlan.id },
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
  }
);

// Get user's meal plans
router.get('/', 
  authenticateToken,
  async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      
      const mealPlans = await Database.getUserMealPlans(req.user.id, parseInt(limit), offset);
      
      res.json({
        success: true,
        data: mealPlans,
        message: 'Meal plans retrieved successfully'
      });
    } catch (error) {
      logger.error('Error retrieving meal plans:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve meal plans',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get specific meal plan
router.get('/:id', 
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const mealPlan = await Database.getMealPlanById(id, req.user.id);
      
      if (!mealPlan) {
        return res.status(404).json({
          success: false,
          message: 'Meal plan not found'
        });
      }
      
      res.json({
        success: true,
        data: mealPlan,
        message: 'Meal plan retrieved successfully'
      });
    } catch (error) {
      logger.error('Error retrieving meal plan:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve meal plan',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Update meal plan
router.put('/:id', 
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const mealPlan = await Database.updateMealPlan(id, req.user.id, updates);
      
      res.json({
        success: true,
        data: mealPlan,
        message: 'Meal plan updated successfully'
      });
    } catch (error) {
      logger.error('Error updating meal plan:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update meal plan',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Delete meal plan
router.delete('/:id', 
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      await Database.deleteMealPlan(id, req.user.id);
      
      res.json({
        success: true,
        message: 'Meal plan deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting meal plan:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete meal plan',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export { router as mealPlanRoutes };