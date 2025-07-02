import Joi from 'joi';

export const chatSchema = Joi.object({
  message: Joi.string().min(1).required(),
  context: Joi.object().optional()
});