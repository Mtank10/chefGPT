import Joi from 'joi';

export const nutritionAnalysisSchema = Joi.object({
  recipe: Joi.object({
    title: Joi.string().required(),
    ingredients: Joi.array().required(),
    instructions: Joi.array().required()
  }).required()
});