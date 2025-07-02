import OpenAI from 'openai';
import { logger } from '../utils/logger.js';

const OPENAI = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: OPENAI,
});

export class AIService {
  static async generateRecipe(ingredients, dietaryRestrictions = [], cuisine = 'any') {
    try {
      const prompt = `Create a detailed recipe using these ingredients: ${ingredients.join(', ')}.
      ${dietaryRestrictions.length > 0 ? `Dietary restrictions: ${dietaryRestrictions.join(', ')}.` : ''}
      ${cuisine !== 'any' ? `Cuisine style: ${cuisine}.` : ''}
      
      Return a JSON object with the following structure:
      {
        "title": "Recipe Name",
        "description": "Brief description",
        "ingredients": [
          {"name": "ingredient", "amount": "quantity", "unit": "measurement"}
        ],
        "instructions": ["step 1", "step 2", ...],
        "prepTime": "minutes",
        "cookTime": "minutes",
        "servings": number,
        "difficulty": "Easy|Medium|Hard",
        "tags": ["tag1", "tag2"],
        "nutritionEstimate": {
          "calories": number,
          "protein": "grams",
          "carbs": "grams",
          "fat": "grams"
        }
      }`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a professional chef and nutritionist. Create detailed, practical recipes with accurate measurements and clear instructions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const recipeText = completion.choices[0].message.content;
      if (!recipeText) throw new Error('No recipe generated');

      return JSON.parse(recipeText);
    } catch (error) {
      logger.error('Error generating recipe:', error);
      throw new Error('Failed to generate recipe');
    }
  }

  static async analyzeNutrition(recipe) {
    try {
      const prompt = `Analyze the nutritional content of this recipe and provide health recommendations:
      
      Recipe: ${JSON.stringify(recipe)}
      
      Return a JSON object with:
      {
        "nutrition": {
          "calories": number,
          "protein": number,
          "carbohydrates": number,
          "fat": number,
          "fiber": number,
          "sugar": number,
          "sodium": number,
          "vitamins": ["vitamin1", "vitamin2"],
          "minerals": ["mineral1", "mineral2"]
        },
        "healthScore": number (1-10),
        "recommendations": ["recommendation1", "recommendation2"],
        "improvements": ["improvement1", "improvement2"],
        "allergens": ["allergen1", "allergen2"],
        "dietaryFlags": ["flag1", "flag2"]
      }`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a certified nutritionist. Provide accurate nutritional analysis and helpful health recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const analysisText = completion.choices[0].message.content;
      if (!analysisText) throw new Error('No analysis generated');

      return JSON.parse(analysisText);
    } catch (error) {
      logger.error('Error analyzing nutrition:', error);
      throw new Error('Failed to analyze nutrition');
    }
  }

  static async suggestSubstitutions(ingredient, restrictions = []) {
    try {
      const prompt = `Suggest ingredient substitutions for "${ingredient}".
      ${restrictions.length > 0 ? `Consider these dietary restrictions: ${restrictions.join(', ')}.` : ''}
      
      Return a JSON object with:
      {
        "original": "${ingredient}",
        "substitutions": [
          {
            "ingredient": "substitute name",
            "ratio": "conversion ratio",
            "notes": "any important notes",
            "healthBenefit": "nutritional comparison",
            "availability": "common|specialty|rare"
          }
        ]
      }`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a culinary expert specializing in ingredient substitutions. Provide practical alternatives with accurate conversion ratios."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 800
      });

      const substitutionsText = completion.choices[0].message.content;
      if (!substitutionsText) throw new Error('No substitutions generated');

      return JSON.parse(substitutionsText);
    } catch (error) {
      logger.error('Error suggesting substitutions:', error);
      throw new Error('Failed to suggest substitutions');
    }
  }

  static async createMealPlan(preferences) {
    try {
      const {
        days = 7,
        dietaryRestrictions = [],
        budget = 'medium',
        cookingTime = 'medium',
        cuisine = 'varied',
        healthGoals = []
      } = preferences;

      const prompt = `Create a ${days}-day meal plan with the following preferences:
      - Dietary restrictions: ${dietaryRestrictions.join(', ') || 'none'}
      - Budget: ${budget}
      - Available cooking time: ${cookingTime}
      - Cuisine preference: ${cuisine}
      - Health goals: ${healthGoals.join(', ') || 'general wellness'}
      
      Return a JSON object with:
      {
        "mealPlan": [
          {
            "day": number,
            "date": "YYYY-MM-DD",
            "meals": {
              "breakfast": {"name": "meal name", "prepTime": "minutes", "calories": number},
              "lunch": {"name": "meal name", "prepTime": "minutes", "calories": number},
              "dinner": {"name": "meal name", "prepTime": "minutes", "calories": number},
              "snacks": [{"name": "snack name", "calories": number}]
            },
            "totalCalories": number,
            "macros": {"protein": number, "carbs": number, "fat": number}
          }
        ],
        "shoppingList": [
          {"item": "ingredient", "quantity": "amount", "category": "produce|dairy|meat|etc"}
        ],
        "tips": ["tip1", "tip2"],
        "totalEstimatedCost": "$amount"
      }`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a professional meal planning nutritionist. Create balanced, practical meal plans with accurate nutritional information."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 2000
      });

      const mealPlanText = completion.choices[0].message.content;
      if (!mealPlanText) throw new Error('No meal plan generated');

      return JSON.parse(mealPlanText);
    } catch (error) {
      logger.error('Error creating meal plan:', error);
      throw new Error('Failed to create meal plan');
    }
  }

  static async chatAssistant(message, context = {}) {
    try {
      const systemPrompt = `You are a friendly AI cooking assistant for RecipeHub. You help users with:
      - Recipe questions and cooking techniques
      - Ingredient substitutions and measurements
      - Cooking tips and troubleshooting
      - Nutritional advice and dietary concerns
      - Meal planning suggestions
      
      Be conversational, helpful, and concise. If you're unsure about food safety, always recommend consulting reliable sources.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `${context.recipe ? `Current recipe context: ${JSON.stringify(context.recipe)}. ` : ''}${message}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return completion.choices[0].message.content || 'I apologize, but I couldn\'t process your request. Please try again.';
    } catch (error) {
      logger.error('Error in chat assistant:', error);
      throw new Error('Failed to process chat message');
    }
  }
}