import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ShoppingCart, DollarSign, Clock } from 'lucide-react';
import { aiApi } from '../services/api';
import { LoadingSpinner } from './LoadingSpinner';

interface MealPlan {
  mealPlan: Array<{
    day: number;
    date: string;
    meals: {
      breakfast: { name: string; prepTime: string; calories: number };
      lunch: { name: string; prepTime: string; calories: number };
      dinner: { name: string; prepTime: string; calories: number };
      snacks: Array<{ name: string; calories: number }>;
    };
    totalCalories: number;
    macros: { protein: number; carbs: number; fat: number };
  }>;
  shoppingList: Array<{ item: string; quantity: string; category: string }>;
  tips: string[];
  totalEstimatedCost: string;
}

export const MealPlanner: React.FC = () => {
  const [preferences, setPreferences] = useState({
    days: 7,
    dietaryRestrictions: [] as string[],
    budget: 'medium',
    cookingTime: 'medium',
    cuisine: 'varied',
    healthGoals: [] as string[]
  });
  
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiApi.generateMealPlan(preferences);
      setMealPlan(response.data);
    } catch (err) {
      setError('Failed to generate meal plan. Please try again.');
      console.error('Meal plan generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addDietaryRestriction = (restriction: string) => {
    if (!preferences.dietaryRestrictions.includes(restriction)) {
      setPreferences({
        ...preferences,
        dietaryRestrictions: [...preferences.dietaryRestrictions, restriction]
      });
    }
  };

  const removeDietaryRestriction = (restriction: string) => {
    setPreferences({
      ...preferences,
      dietaryRestrictions: preferences.dietaryRestrictions.filter(r => r !== restriction)
    });
  };

  const addHealthGoal = (goal: string) => {
    if (!preferences.healthGoals.includes(goal)) {
      setPreferences({
        ...preferences,
        healthGoals: [...preferences.healthGoals, goal]
      });
    }
  };

  const commonRestrictions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 
    'Nut-Free', 'Low-Carb', 'Keto', 'Paleo'
  ];

  const healthGoals = [
    'Weight Loss', 'Muscle Gain', 'Heart Health', 'Better Energy',
    'Improved Digestion', 'Lower Cholesterol', 'Diabetes Management'
  ];

  const groupedShoppingList = mealPlan?.shoppingList.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof mealPlan.shoppingList>);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          AI Meal Planner
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Create personalized meal plans based on your preferences, dietary needs, and lifestyle. 
          Get complete shopping lists and cooking tips for stress-free meal preparation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preferences Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-500" />
            Meal Plan Preferences
          </h3>

          <div className="space-y-6">
            {/* Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Days
              </label>
              <select
                value={preferences.days}
                onChange={(e) => setPreferences({ ...preferences, days: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {[3, 5, 7, 14].map(days => (
                  <option key={days} value={days}>{days} days</option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['low', 'medium', 'high'].map(budget => (
                  <button
                    key={budget}
                    onClick={() => setPreferences({ ...preferences, budget })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                      preferences.budget === budget
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {budget}
                  </button>
                ))}
              </div>
            </div>

            {/* Cooking Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Cooking Time
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['quick', 'medium', 'long'].map(time => (
                  <button
                    key={time}
                    onClick={() => setPreferences({ ...preferences, cookingTime: time })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                      preferences.cookingTime === time
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {time === 'quick' ? '< 30min' : time === 'medium' ? '30-60min' : '> 60min'}
                  </button>
                ))}
              </div>
            </div>

            {/* Cuisine */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuisine Preference
              </label>
              <select
                value={preferences.cuisine}
                onChange={(e) => setPreferences({ ...preferences, cuisine: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="varied">Varied</option>
                <option value="Mediterranean">Mediterranean</option>
                <option value="Asian">Asian</option>
                <option value="Mexican">Mexican</option>
                <option value="Italian">Italian</option>
                <option value="American">American</option>
              </select>
            </div>

            {/* Dietary Restrictions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dietary Restrictions
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {commonRestrictions.map(restriction => (
                  <button
                    key={restriction}
                    onClick={() => addDietaryRestriction(restriction)}
                    disabled={preferences.dietaryRestrictions.includes(restriction)}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      preferences.dietaryRestrictions.includes(restriction)
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {restriction}
                  </button>
                ))}
              </div>
            </div>

            {/* Health Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Health Goals
              </label>
              <div className="flex flex-wrap gap-2">
                {healthGoals.map(goal => (
                  <button
                    key={goal}
                    onClick={() => addHealthGoal(goal)}
                    disabled={preferences.healthGoals.includes(goal)}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      preferences.healthGoals.includes(goal)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <motion.button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                <span>Generate Meal Plan</span>
              </>
            )}
          </motion.button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </motion.div>

        {/* Meal Plan Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          {mealPlan ? (
            <>
              {/* Overview */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Your {preferences.days}-Day Meal Plan</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{mealPlan.totalEstimatedCost}</span>
                    </div>
                  </div>
                </div>

                {/* Daily Meals */}
                <div className="space-y-4">
                  {mealPlan.mealPlan.map((day) => (
                    <motion.div
                      key={day.day}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: day.day * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg">Day {day.day}</h4>
                        <div className="text-sm text-gray-600">
                          {day.totalCalories} calories
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <h5 className="font-medium text-orange-600">Breakfast</h5>
                          <div>
                            <div className="font-medium">{day.meals.breakfast.name}</div>
                            <div className="text-sm text-gray-600 flex items-center space-x-2">
                              <Clock className="w-3 h-3" />
                              <span>{day.meals.breakfast.prepTime}</span>
                              <span>• {day.meals.breakfast.calories} cal</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h5 className="font-medium text-green-600">Lunch</h5>
                          <div>
                            <div className="font-medium">{day.meals.lunch.name}</div>
                            <div className="text-sm text-gray-600 flex items-center space-x-2">
                              <Clock className="w-3 h-3" />
                              <span>{day.meals.lunch.prepTime}</span>
                              <span>• {day.meals.lunch.calories} cal</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h5 className="font-medium text-purple-600">Dinner</h5>
                          <div>
                            <div className="font-medium">{day.meals.dinner.name}</div>
                            <div className="text-sm text-gray-600 flex items-center space-x-2">
                              <Clock className="w-3 h-3" />
                              <span>{day.meals.dinner.prepTime}</span>
                              <span>• {day.meals.dinner.calories} cal</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {day.meals.snacks.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <h5 className="font-medium text-blue-600 mb-2">Snacks</h5>
                          <div className="flex flex-wrap gap-2">
                            {day.meals.snacks.map((snack, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                {snack.name} ({snack.calories} cal)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Shopping List */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2 text-blue-500" />
                  Shopping List
                </h3>
                
                {groupedShoppingList && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(groupedShoppingList).map(([category, items]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="font-semibold text-gray-900 capitalize border-b pb-1">
                          {category}
                        </h4>
                        <ul className="space-y-1">
                          {items.map((item, index) => (
                            <li key={index} className="flex justify-between items-center text-sm">
                              <span>{item.item}</span>
                              <span className="text-gray-500 font-medium">{item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tips */}
              {mealPlan.tips.length > 0 && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                  <h3 className="text-xl font-semibold mb-4">Meal Prep Tips</h3>
                  <ul className="space-y-2">
                    {mealPlan.tips.map((tip, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/20 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ready to Plan Your Meals?
              </h3>
              <p className="text-gray-600">
                Set your preferences and let our AI create a personalized meal plan with shopping list and prep tips.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};