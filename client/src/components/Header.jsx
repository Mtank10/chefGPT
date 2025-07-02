import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChefHat, 
  Sparkles, 
  Calculator, 
  Calendar, 
  MessageCircle, 
  RefreshCw,
  Camera,
  User,
  LogOut,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './Auth/AuthModal';

export const Header = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const tabs = [
    { id: 'generate', label: 'Recipe Generator', icon: ChefHat },
    { id: 'nutrition', label: 'Nutrition Analyzer', icon: Calculator },
    { id: 'meal-plan', label: 'Meal Planner', icon: Calendar },
    { id: 'substitutions', label: 'Substitutions', icon: RefreshCw },
    { id: 'image', label: 'Image Analyzer', icon: Camera },
    { id: 'chat', label: 'AI Assistant', icon: MessageCircle },
  ];

  const handleTabClick = (tabId) => {
    if (!user && tabId !== 'generate') {
      setShowAuthModal(true);
      return;
    }
    setActiveTab(tabId);
  };

  const getPlanDisplayName = (plan) => {
    switch (plan) {
      case 'free': return 'Free';
      case 'basic': return 'Basic';
      case 'pro': return 'Pro';
      case 'pro_yearly': return 'Pro';
      default: return plan;
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-700';
      case 'basic': return 'bg-blue-100 text-blue-700';
      case 'pro': return 'bg-orange-100 text-orange-700';
      case 'pro_yearly': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  AI Recipe Hub
                </h1>
                <p className="text-sm text-gray-600">Intelligent Cooking Assistant</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPlanColor(user.subscription.plan)}`}>
                          {getPlanDisplayName(user.subscription.plan)}
                        </span>
                        {user.subscription.requestLimit > 0 && (
                          <span className="text-xs text-gray-500">
                            {user.subscription.requestsUsed}/{user.subscription.requestLimit}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <button
                        onClick={() => {
                          setActiveTab('subscription');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Subscription</span>
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
          
          <nav className="pb-4">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isLocked = !user && tab.id !== 'generate';
                
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 relative ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : isLocked
                        ? 'text-gray-400 hover:text-gray-500 cursor-pointer'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {isLocked && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </nav>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};