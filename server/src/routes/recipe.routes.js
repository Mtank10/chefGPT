import { Router } from 'express';
import { AIService } from '../services/aiService.js';
import { validateRequest } from '../middleware/validation.js';
import { recipeGenerationSchema, substitutionSchema } from '../schemas/recipe.schemas.js';
import { authenticateToken, checkSubscriptionLimits, requirePlan, incrementUsage } from '../middleware/auth.js';
import { Database } from '../config/database.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Generate recipe from ingredients
router.post('/generate', 
  authenticateToken,
  checkSubscriptionLimits,
  validateRequest(recipeGenerationSchema), 
  incrementUsage,
  async (req, res) => {
    try {
      const { ingredients, dietaryRestrictions, cuisine } = req.body;
      
      const recipe = await AIService.generateRecipe(ingredients, dietaryRestrictions, cuisine);
      
      // Save recipe to database
      const recipeData = {
        user_id: req.user.id,
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prep_time: recipe.prepTime,
        cook_time: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        tags: recipe.tags,
        nutrition_estimate: recipe.nutritionEstimate,
        source: 'AI_GENERATED'
      };

      const savedRecipe = await Database.createRecipe(recipeData);
      
      logger.info(`Recipe generated and saved: ${recipe.title} for user: ${req.user.email}`);
      
      res.json({
        success: true,
        data: { ...recipe, id: savedRecipe.id },
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

// Get user's recipes
router.get('/', 
  authenticateToken,
  async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      
      const recipes = await Database.getUserRecipes(req.user.id, parseInt(limit), offset);
      
      res.json({
        success: true,
        data: recipes,
        message: 'Recipes retrieved successfully'
      });
    } catch (error) {
      logger.error('Error retrieving recipes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve recipes',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get specific recipe
router.get('/:id', 
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const recipe = await Database.getRecipeById(id, req.user.id);
      
      if (!recipe) {
        return res.status(404).json({
          success: false,
          message: 'Recipe not found'
        });
      }
      
      res.json({
        success: true,
        data: recipe,
        message: 'Recipe retrieved successfully'
      });
    } catch (error) {
      logger.error('Error retrieving recipe:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve recipe',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Update recipe
router.put('/:id', 
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const recipe = await Database.updateRecipe(id, req.user.id, updates);
      
      res.json({
        success: true,
        data: recipe,
        message: 'Recipe updated successfully'
      });
    } catch (error) {
      logger.error('Error updating recipe:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update recipe',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Delete recipe
router.delete('/:id', 
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      await Database.deleteRecipe(id, req.user.id);
      
      res.json({
        success: true,
        message: 'Recipe deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting recipe:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete recipe',
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
  incrementUsage,
  async (req, res) => {
    try {
      const { ingredient, restrictions } = req.body;
      
      const substitutions = await AIService.suggestSubstitutions(ingredient, restrictions);
      
      logger.info(`Substitutions generated for: ${ingredient} for user: ${req.user.email}`);
      
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