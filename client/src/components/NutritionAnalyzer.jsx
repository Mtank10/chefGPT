import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Heart, TrendingUp, AlertTriangle } from 'lucide-react';
import { aiApi } from '../services/api';
import { LoadingSpinner } from './LoadingSpinner';

export const NutritionAnalyzer = () => {
  const [recipe, setRecipe] = useState({
    title: '',
    ingredients: [],
    instructions: []
  });
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!recipe.title.trim()) {
      setError('Please enter a recipe title');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await aiApi.analyzeNutrition({ recipe });
      setAnalysis(response.data);
    } catch (err) {
      setError('Failed to analyze nutrition. Please try again.');
      console.error('Nutrition analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Nutrition Analyzer
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Get detailed nutritional analysis and health recommendations for any recipe. 
          Our AI provides comprehensive insights to help you make healthier choices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Calculator className="w-5 h-5 mr-2 text-green-500" />
            Recipe Details
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Title
              </label>
              <input
                type="text"
                value={recipe.title}
                onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
                placeholder="Enter recipe name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredients (one per line)
              </label>
              <textarea
                value={recipe.ingredients.join('\n')}
                onChange={(e) => setRecipe({ 
                  ...recipe, 
                  ingredients: e.target.value.split('\n').filter(i => i.trim())
                })}
                placeholder="1 cup flour&#10;2 eggs&#10;1 tsp salt"
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions (optional)
              </label>
              <textarea
                value={recipe.instructions.join('\n')}
                onChange={(e) => setRecipe({ 
                  ...recipe, 
                  instructions: e.target.value.split('\n').filter(i => i.trim())
                })}
                placeholder="Mix ingredients..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <motion.button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-200 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <Calculator className="w-5 h-5" />
                <span>Analyze Nutrition</span>
              </>
            )}
          </motion.button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </motion.div>

        {/* Analysis Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
        >
          {analysis ? (
            <div className="space-y-6">
              {/* Health Score */}
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold ${getHealthScoreColor(analysis.healthScore)}`}>
                  {analysis.healthScore}/10
                </div>
                <p className="mt-2 text-sm text-gray-600">Health Score</p>
              </div>

              {/* Macronutrients */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Nutritional Breakdown
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-medium text-blue-900">Calories</div>
                    <div className="text-2xl font-bold text-blue-600">{analysis.nutrition.calories}</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="font-medium text-purple-900">Protein</div>
                    <div className="text-2xl font-bold text-purple-600">{analysis.nutrition.protein}g</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="font-medium text-orange-900">Carbs</div>
                    <div className="text-2xl font-bold text-orange-600">{analysis.nutrition.carbohydrates}g</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="font-medium text-yellow-900">Fat</div>
                    <div className="text-2xl font-bold text-yellow-600">{analysis.nutrition.fat}g</div>
                  </div>
                </div>
              </div>

              {/* Micronutrients */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Rich in Vitamins</h5>
                  <div className="space-y-1">
                    {analysis.nutrition.vitamins.map((vitamin, index) => (
                      <span key={index} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-1">
                        {vitamin}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Rich in Minerals</h5>
                  <div className="space-y-1">
                    {analysis.nutrition.minerals.map((mineral, index) => (
                      <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1">
                        {mineral}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-red-500" />
                  Health Recommendations
                </h4>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Allergens */}
              {analysis.allergens.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                    Potential Allergens
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.allergens.map((allergen, index) => (
                      <span key={index} className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dietary Flags */}
              {analysis.dietaryFlags.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Dietary Properties</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.dietaryFlags.map((flag, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ready for Analysis
              </h3>
              <p className="text-gray-600">
                Enter your recipe details to get comprehensive nutritional insights and health recommendations.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};