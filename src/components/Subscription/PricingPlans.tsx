import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { aiApi } from '../../services/api';
import { LoadingSpinner } from '../LoadingSpinner';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
  requestLimit: number;
  popular?: boolean;
  icon: React.ComponentType<any>;
  gradient: string;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      '5 AI recipe generations per month',
      'Basic nutrition analysis',
      'Limited chat assistant'
    ],
    stripePriceId: '',
    requestLimit: 5,
    icon: Star,
    gradient: 'from-gray-500 to-gray-600'
  },
  {
    id: 'basic',
    name: 'Basic Chef',
    price: 9.99,
    interval: 'month',
    features: [
      '50 AI recipe generations per month',
      'Full nutrition analysis with health scores',
      'Ingredient substitutions',
      'Unlimited chat assistant',
      'Basic meal planning (7 days)'
    ],
    stripePriceId: 'price_basic_monthly',
    requestLimit: 50,
    popular: true,
    icon: Zap,
    gradient: 'from-blue-500 to-purple-500'
  },
  {
    id: 'pro',
    name: 'Pro Chef',
    price: 19.99,
    interval: 'month',
    features: [
      'Unlimited AI recipe generations',
      'Advanced nutrition analysis',
      'Smart meal planning (30 days)',
      'Image recipe analysis',
      'Priority chat support',
      'Custom dietary preferences',
      'Shopping list optimization'
    ],
    stripePriceId: 'price_pro_monthly',
    requestLimit: -1,
    icon: Crown,
    gradient: 'from-orange-500 to-red-500'
  },
  {
    id: 'pro_yearly',
    name: 'Pro Chef (Yearly)',
    price: 199.99,
    interval: 'year',
    features: [
      'Unlimited AI recipe generations',
      'Advanced nutrition analysis',
      'Smart meal planning (30 days)',
      'Image recipe analysis',
      'Priority chat support',
      'Custom dietary preferences',
      'Shopping list optimization',
      '2 months free!'
    ],
    stripePriceId: 'price_pro_yearly',
    requestLimit: -1,
    icon: Crown,
    gradient: 'from-purple-500 to-pink-500'
  }
];

interface PricingPlansProps {
  onPlanSelect?: (planId: string) => void;
}

export const PricingPlans: React.FC<PricingPlansProps> = ({ onPlanSelect }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPlan = async (plan: Plan) => {
    if (!user) {
      onPlanSelect?.('auth_required');
      return;
    }

    if (plan.id === 'free') {
      return; // Free plan doesn't require payment
    }

    setLoading(plan.id);
    setError(null);

    try {
      const response = await aiApi.createCheckoutSession({ planId: plan.id });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create checkout session');
    } finally {
      setLoading(null);
    }
  };

  const isCurrentPlan = (planId: string) => {
    return user?.subscription.plan === planId;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Cooking Journey
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Unlock the full potential of AI-powered cooking with our flexible subscription plans. 
          Start free and upgrade anytime to access premium features.
        </p>
      </div>

      {error && (
        <div className="max-w-4xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          const isPopular = plan.popular;
          const isCurrent = isCurrentPlan(plan.id);
          const isLoading = loading === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
                isPopular ? 'border-blue-500 scale-105' : 'border-gray-200 hover:border-gray-300'
              } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="p-6">
                <div className="text-center mb-6">
                  <div className={`w-12 h-12 bg-gradient-to-r ${plan.gradient} rounded-xl flex items-center justify-center mb-4 mx-auto`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-gray-500 ml-1">
                      /{plan.interval}
                    </span>
                  </div>
                  {plan.interval === 'year' && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      Save $40/year
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isLoading || isCurrent}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                    isCurrent
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : plan.id === 'free'
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg transform hover:scale-105`
                  }`}
                  whileHover={!isCurrent ? { scale: 1.02 } : {}}
                  whileTap={!isCurrent ? { scale: 0.98 } : {}}
                >
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : isCurrent ? (
                    <span>Current Plan</span>
                  ) : plan.id === 'free' ? (
                    <span>Get Started</span>
                  ) : (
                    <span>Upgrade Now</span>
                  )}
                </motion.button>

                {plan.requestLimit > 0 && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    {plan.requestLimit} requests per month
                  </p>
                )}
                {plan.requestLimit === -1 && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Unlimited requests
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500 mb-4">
          All plans include a 7-day free trial. Cancel anytime.
        </p>
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>No setup fees</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Secure payments</span>
          </div>
        </div>
      </div>
    </div>
  );
};