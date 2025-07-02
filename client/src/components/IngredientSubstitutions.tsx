import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { aiApi } from '../services/api';
import { LoadingSpinner } from './LoadingSpinner';

interface Substitution {
  ingredient: string;
  ratio: string;
  notes: string;
  healthBenefit: string;
  availability: 'common' | 'specialty' | 'rare';
}

interface SubstitutionResult {
  original: string;
  substitutions: Substitution[];
}

export const IngredientSubstitutions: React.FC = () => {
  const [ingredient, setIngredient] = useState('');
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [result, setResult] = useState<SubstitutionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!ingredient.trim()) {
      setError('Please enter an ingredient');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await aiApi.getSubstitutions({
        ingredient: ingredient.trim(),
        restrictions
      });
      
      setResult(response.data);
    } catch (err) {
      setError('Failed to find substitutions. Please try again.');
      console.error('Substitution search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addRestriction = (restriction: string) => {
    if (!restrictions.includes(restriction)) {
      setRestrictions([...restrictions, restriction]);
    }
  };

  const removeRestriction = (restriction: string) => {
    setRestrictions(restrictions.filter(r => r !== restriction));
  };

  const commonRestrictions = [
    'Dairy-Free', 'Gluten-Free', 'Vegan', 'Vegetarian', 
    'Nut-Free', 'Low-Carb', 'Keto', 'Paleo', 'Low-Sodium'
  ];

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'common': return 'text-green-600 bg-green-100';
      case 'specialty': return 'text-yellow-600 bg-yellow-100';
      case 'rare': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const commonIngredients = [
    'Butter', 'Eggs', 'Milk', 'Flour', 'Sugar', 'Cream',
    'Sour Cream', 'Yogurt', 'Cheese', 'Honey', 'Vanilla Extract'
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ingredient Substitutions
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Find smart alternatives for any ingredient based on your dietary needs and availability. 
          Get detailed conversion ratios and cooking tips for perfect results.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Search className="w-5 h-5 mr-2 text-blue-500" />
            Find Substitutions
          </h3>

          <div className="space-y-6">
            {/* Ingredient Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredient to Substitute
              </label>
              <input
                type="text"
                value={ingredient}
                onChange={(e) => setIngredient(e.target.value)}
                placeholder="Enter ingredient name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Common Ingredients */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or choose a common ingredient:
              </label>
              <div className="flex flex-wrap gap-2">
                {commonIngredients.map(commonIngredient => (
                  <button
                    key={commonIngredient}
                    onClick={() => setIngredient(commonIngredient)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                  >
                    {commonIngredient}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dietary Restrictions (Optional)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {commonRestrictions.map(restriction => (
                  <button
                    key={restriction}
                    onClick={() => addRestriction(restriction)}
                    disabled={restrictions.includes(restriction)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      restrictions.includes(restriction)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {restriction}
                  </button>
                ))}
              </div>
              
              {restrictions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {restrictions.map(restriction => (
                    <div
                      key={restriction}
                      className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{restriction}</span>
                      <button
                        onClick={() => removeRestriction(restriction)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <motion.button
            onClick={handleSearch}
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                <span>Find Substitutions</span>
              </>
            )}
          </motion.button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
        >
          {result ? (
            <div className="space-y-6">
              <div className="text-center pb-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Substitutes for <span className="text-blue-600">{result.original}</span>
                </h3>
              </div>

              <div className="space-y-4">
                {result.substitutions.map((substitution, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {substitution.ingredient}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getAvailabilityColor(substitution.availability)}`}>
                        {substitution.availability}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h5 className="font-medium text-blue-900 mb-1 flex items-center">
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Conversion Ratio
                        </h5>
                        <p className="text-blue-800 font-mono">{substitution.ratio}</p>
                      </div>

                      {substitution.notes && (
                        <div className="bg-yellow-50 rounded-lg p-3">
                          <h5 className="font-medium text-yellow-900 mb-1 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Cooking Notes
                          </h5>
                          <p className="text-yellow-800 text-sm">{substitution.notes}</p>
                        </div>
                      )}

                      {substitution.healthBenefit && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <h5 className="font-medium text-green-900 mb-1 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Nutritional Comparison
                          </h5>
                          <p className="text-green-800 text-sm">{substitution.healthBenefit}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Pro Tip:</strong> Always test substitutions in small batches first, 
                  especially for baking where ratios are critical. Some substitutions may affect 
                  texture, flavor, or cooking time.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ready to Find Alternatives?
              </h3>
              <p className="text-gray-600">
                Enter an ingredient and discover smart substitutions with detailed conversion ratios and cooking tips.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};