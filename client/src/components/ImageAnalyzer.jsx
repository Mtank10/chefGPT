import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { aiApi } from '../services/api';
import { LoadingSpinner } from './LoadingSpinner';

export const ImageAnalyzer = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedImage(file);
      setError(null);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await aiApi.analyzeImage(formData);
      setAnalysis(response.data);
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
      console.error('Image analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysis(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Recipe Image Analyzer
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload a photo of any dish and our AI will identify it, estimate ingredients, 
          and provide nutritional information and cooking suggestions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Camera className="w-5 h-5 mr-2 text-pink-500" />
            Image Upload
          </h3>

          <div className="space-y-6">
            {/* File Upload Area */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Selected dish"
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearImage();
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Remove image
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">Upload a food image</p>
                    <p className="text-sm text-gray-500">
                      Drag and drop or click to select (max 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sample Images */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Or try with sample images:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {['pasta', 'salad', 'pizza'].map((dish) => (
                  <button
                    key={dish}
                    className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <div className="text-center">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                      <span className="capitalize">{dish}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              onClick={handleAnalyze}
              disabled={!selectedImage || loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Analyze Image</span>
                </>
              )}
            </motion.button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        </motion.div>

        {/* Analysis Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
        >
          {analysis ? (
            <div className="space-y-6">
              <div className="text-center pb-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {analysis.recognizedDish}
                </h3>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    {Math.round(analysis.confidence * 100)}% confidence
                  </span>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Detected Ingredients
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>

              {/* Nutrition Estimate */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Nutrition Estimate
                </h4>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">
                        {analysis.estimatedCalories}
                      </div>
                      <div className="text-sm text-orange-800">calories</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Suggestions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  AI Suggestions
                </h4>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-purple-800 text-sm leading-relaxed">
                    {analysis.suggestions}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium text-sm">
                  Get Recipe
                </button>
                <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm">
                  Nutritional Analysis
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ready to Analyze?
              </h3>
              <p className="text-gray-600">
                Upload an image of any dish and let our AI identify ingredients, estimate nutrition, and provide cooking insights.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};