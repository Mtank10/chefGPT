import Joi from 'joi';

export const recipeGenerationSchema = Joi.object({
  ingredients: Joi.array().items(Joi.string().min(1)).min(1).required(),
  dietaryRestrictions: Joi.array().items(Joi.string()),
  cuisine: Joi.string().optional()
});

export const substitutionSchema = Joi.object({
  ingredient: Joi.string().min(1).required(),
  restrictions: Joi.array().items(Joi.string())
});