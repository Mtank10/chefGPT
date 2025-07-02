import Joi from 'joi';

export const mealPlanSchema = Joi.object({
  days: Joi.number().min(1).max(30).default(7),
  dietaryRestrictions: Joi.array().items(Joi.string()),
  budget: Joi.string().valid('low', 'medium', 'high').default('medium'),
  cookingTime: Joi.string().valid('quick', 'medium', 'long').default('medium'),
  cuisine: Joi.string().default('varied'),
  healthGoals: Joi.array().items(Joi.string())
});