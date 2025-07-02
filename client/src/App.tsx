import React, { useState } from 'react';
import { Header } from './components/Header';
import { RecipeGenerator } from './components/RecipeGenerator';
import { NutritionAnalyzer } from './components/NutritionAnalyzer';
import { MealPlanner } from './components/MealPlanner';
import { CookingAssistant } from './components/CookingAssistant';
import { IngredientSubstitutions } from './components/IngredientSubstitutions';
import { ImageAnalyzer } from './components/ImageAnalyzer';
import { PricingPlans } from './components/Subscription/PricingPlans';
import { SubscriptionStatus } from './components/Subscription/SubscriptionStatus';
import { AuthProvider } from './contexts/AuthContext';
import { StripeProvider } from './contexts/StripeContext';

type ActiveTab = 'generate' | 'nutrition' | 'meal-plan' | 'chat' | 'substitutions' | 'image' | 'subscription';

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('generate');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'generate':
        return <RecipeGenerator />;
      case 'nutrition':
        return <NutritionAnalyzer />;
      case 'meal-plan':
        return <MealPlanner />;
      case 'chat':
        return <CookingAssistant />;
      case 'substitutions':
        return <IngredientSubstitutions />;
      case 'image':
        return <ImageAnalyzer />;
      case 'subscription':
        return (
          <div className="space-y-12">
            <SubscriptionStatus />
            <PricingPlans />
          </div>
        );
      default:
        return <RecipeGenerator />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {renderActiveComponent()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <StripeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </StripeProvider>
  );
}

export default App;