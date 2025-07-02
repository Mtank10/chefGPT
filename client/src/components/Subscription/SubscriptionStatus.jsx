import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Calendar, TrendingUp, Settings, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { aiApi } from '../../services/api';
import { LoadingSpinner } from '../LoadingSpinner';

export const SubscriptionStatus = () => {
  const { user, refreshSubscription } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    refreshSubscription();
  }, []);

  const handleManageSubscription = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiApi.createPortalSession();
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const { subscription } = user;
  const usagePercentage = subscription.requestLimit > 0 
    ? (subscription.requestsUsed / subscription.requestLimit) * 100 
    : 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'past_due': return 'text-yellow-600 bg-yellow-100';
      case 'canceled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPlanDisplayName = (plan) => {
    switch (plan) {
      case 'free': return 'Free Plan';
      case 'basic': return 'Basic Chef';
      case 'pro': return 'Pro Chef';
      case 'pro_yearly': return 'Pro Chef (Yearly)';
      default: return plan;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Subscription Status
        </h2>
        <p className="text-gray-600">
          Manage your subscription and track your usage
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center">
              <Crown className="w-5 h-5 mr-2 text-orange-500" />
              Current Plan
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(subscription.status)}`}>
              {subscription.status}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-2xl font-bold text-gray-900">
                {getPlanDisplayName(subscription.plan)}
              </h4>
              <p className="text-gray-600">
                {subscription.plan === 'free' 
                  ? 'Get started with basic AI features'
                  : 'Premium AI cooking assistant'
                }
              </p>
            </div>

            {subscription.plan !== 'free' && (
              <motion.button
                onClick={handleManageSubscription}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <Settings className="w-5 h-5" />
                    <span>Manage Subscription</span>
                  </>
                )}
              </motion.button>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Usage Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            Usage This Month
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  AI Requests
                </span>
                <span className="text-sm text-gray-600">
                  {subscription.requestsUsed} / {subscription.requestLimit === -1 ? '∞' : subscription.requestLimit}
                </span>
              </div>
              
              {subscription.requestLimit > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      usagePercentage >= 90 
                        ? 'bg-red-500' 
                        : usagePercentage >= 70 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
              )}
              
              {subscription.requestLimit === -1 && (
                <div className="w-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full h-2" />
              )}
            </div>

            {usagePercentage >= 80 && subscription.requestLimit > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">
                    You're approaching your monthly limit. Consider upgrading for unlimited access.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {subscription.requestsUsed}
                </div>
                <div className="text-sm text-gray-600">Requests Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {subscription.requestLimit === -1 
                    ? '∞' 
                    : Math.max(0, subscription.requestLimit - subscription.requestsUsed)
                  }
                </div>
                <div className="text-sm text-gray-600">Remaining</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upgrade Prompt for Free Users */}
      {subscription.plan === 'free' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white"
        >
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Ready to Cook Like a Pro?</h3>
            <p className="mb-4 opacity-90">
              Upgrade to unlock unlimited AI recipe generation, advanced nutrition analysis, and more!
            </p>
            <motion.button
              className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Plans
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};