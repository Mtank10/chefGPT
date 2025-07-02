import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database helper functions
export class Database {
  // User operations
  static async createUser(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  static async getUserByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      logger.error('Error getting user by email:', error);
      throw error;
    }
  }

  static async getUserById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting user by ID:', error);
      throw error;
    }
  }

  static async updateUser(id, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  // Subscription operations
  static async createSubscription(subscriptionData) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([subscriptionData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating subscription:', error);
      throw error;
    }
  }

  static async getSubscriptionByUserId(userId) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      logger.error('Error getting subscription:', error);
      throw error;
    }
  }

  static async updateSubscription(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating subscription:', error);
      throw error;
    }
  }

  static async getSubscriptionByStripeId(stripeSubscriptionId) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('stripe_subscription_id', stripeSubscriptionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting subscription by Stripe ID:', error);
      throw error;
    }
  }

  // Usage tracking operations
  static async getOrCreateUsageTracking(userId, month) {
    try {
      // First try to get existing record
      const { data: existing, error: getError } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)
        .single();

      if (existing) return existing;

      // If not found, create new record
      if (getError && getError.code === 'PGRST116') {
        // Get user's subscription to determine request limit
        const subscription = await this.getSubscriptionByUserId(userId);
        const requestLimit = this.getRequestLimitForPlan(subscription?.plan || 'free');

        const { data, error } = await supabase
          .from('usage_tracking')
          .insert([{
            user_id: userId,
            month,
            requests_used: 0,
            request_limit: requestLimit
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      throw getError;
    } catch (error) {
      logger.error('Error getting/creating usage tracking:', error);
      throw error;
    }
  }

  static async incrementUsage(userId, month) {
    try {
      const { data, error } = await supabase
        .from('usage_tracking')
        .update({ 
          requests_used: supabase.sql`requests_used + 1`
        })
        .eq('user_id', userId)
        .eq('month', month)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error incrementing usage:', error);
      throw error;
    }
  }

  static async resetMonthlyUsage(userId, month) {
    try {
      const { data, error } = await supabase
        .from('usage_tracking')
        .update({ requests_used: 0 })
        .eq('user_id', userId)
        .eq('month', month)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error resetting usage:', error);
      throw error;
    }
  }

  // Recipe operations
  static async createRecipe(recipeData) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .insert([recipeData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating recipe:', error);
      throw error;
    }
  }

  static async getUserRecipes(userId, limit = 20, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting user recipes:', error);
      throw error;
    }
  }

  static async getRecipeById(id, userId) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting recipe by ID:', error);
      throw error;
    }
  }

  static async updateRecipe(id, userId, updates) {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating recipe:', error);
      throw error;
    }
  }

  static async deleteRecipe(id, userId) {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error deleting recipe:', error);
      throw error;
    }
  }

  // Meal plan operations
  static async createMealPlan(mealPlanData) {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert([mealPlanData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating meal plan:', error);
      throw error;
    }
  }

  static async getUserMealPlans(userId, limit = 20, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting user meal plans:', error);
      throw error;
    }
  }

  static async getMealPlanById(id, userId) {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting meal plan by ID:', error);
      throw error;
    }
  }

  static async updateMealPlan(id, userId, updates) {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating meal plan:', error);
      throw error;
    }
  }

  static async deleteMealPlan(id, userId) {
    try {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error deleting meal plan:', error);
      throw error;
    }
  }

  // Helper methods
  static getRequestLimitForPlan(plan) {
    const limits = {
      'free': 5,
      'basic': 50,
      'pro': -1,
      'pro_yearly': -1
    };
    return limits[plan] || 5;
  }

  static getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}