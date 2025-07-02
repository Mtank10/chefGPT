// Example integration for your existing RecipeHub application

// 1. API Service Integration
class AIRecipeService {
  constructor(baseURL = 'http://localhost:3001', authToken = null) {
    this.baseURL = baseURL;
    this.authToken = authToken;
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}/api${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI Service request failed:', error);
      throw error;
    }
  }

  // AI Recipe Generation
  async generateRecipe(ingredients, dietaryRestrictions = [], cuisine = 'any') {
    return this.makeRequest('/recipes/generate', {
      method: 'POST',
      body: JSON.stringify({
        ingredients,
        dietaryRestrictions,
        cuisine
      })
    });
  }

  // Nutrition Analysis
  async analyzeNutrition(recipe) {
    return this.makeRequest('/nutrition/analyze', {
      method: 'POST',
      body: JSON.stringify({ recipe })
    });
  }

  // Meal Planning
  async generateMealPlan(preferences) {
    return this.makeRequest('/meal-plans/generate', {
      method: 'POST',
      body: JSON.stringify(preferences)
    });
  }

  // Ingredient Substitutions
  async getSubstitutions(ingredient, restrictions = []) {
    return this.makeRequest('/recipes/substitutions', {
      method: 'POST',
      body: JSON.stringify({ ingredient, restrictions })
    });
  }

  // Chat Assistant
  async chatWithAssistant(message, context = {}) {
    return this.makeRequest('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, context })
    });
  }

  // Image Analysis
  async analyzeImage(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.makeRequest('/images/analyze', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
  }

  // Subscription Management
  async createCheckoutSession(planId) {
    return this.makeRequest('/subscriptions/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ planId })
    });
  }

  async getSubscriptionStatus() {
    return this.makeRequest('/subscriptions/status');
  }

  async createPortalSession() {
    return this.makeRequest('/subscriptions/create-portal-session', {
      method: 'POST'
    });
  }
}

// 2. React Hook for AI Service
import { useState, useEffect, useContext, createContext } from 'react';

const AIServiceContext = createContext();

export const AIServiceProvider = ({ children, authToken }) => {
  const [aiService] = useState(() => new AIRecipeService(
    process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:3001',
    authToken
  ));

  useEffect(() => {
    aiService.setAuthToken(authToken);
  }, [authToken, aiService]);

  return (
    <AIServiceContext.Provider value={aiService}>
      {children}
    </AIServiceContext.Provider>
  );
};

export const useAIService = () => {
  const context = useContext(AIServiceContext);
  if (!context) {
    throw new Error('useAIService must be used within AIServiceProvider');
  }
  return context;
};

// 3. Recipe Generator Component for your RecipeHub
export const AIRecipeGenerator = ({ onRecipeGenerated }) => {
  const [ingredients, setIngredients] = useState(['']);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [cuisine, setCuisine] = useState('any');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const aiService = useAIService();

  const handleGenerateRecipe = async () => {
    const validIngredients = ingredients.filter(ing => ing.trim());
    
    if (validIngredients.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await aiService.generateRecipe(
        validIngredients,
        dietaryRestrictions,
        cuisine
      );
      
      if (response.success) {
        onRecipeGenerated(response.data);
      } else {
        setError(response.message || 'Failed to generate recipe');
      }
    } catch (err) {
      setError('Failed to generate recipe. Please try again.');
      console.error('Recipe generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const updateIngredient = (index, value) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  return (
    <div className="ai-recipe-generator">
      <h3>AI Recipe Generator</h3>
      
      {/* Ingredients Input */}
      <div className="ingredients-section">
        <label>Ingredients:</label>
        {ingredients.map((ingredient, index) => (
          <div key={index} className="ingredient-input">
            <input
              type="text"
              value={ingredient}
              onChange={(e) => updateIngredient(index, e.target.value)}
              placeholder="Enter ingredient..."
            />
            {ingredients.length > 1 && (
              <button onClick={() => removeIngredient(index)}>Remove</button>
            )}
          </div>
        ))}
        <button onClick={addIngredient}>Add Ingredient</button>
      </div>

      {/* Cuisine Selection */}
      <div className="cuisine-section">
        <label>Cuisine:</label>
        <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
          <option value="any">Any Cuisine</option>
          <option value="Italian">Italian</option>
          <option value="Asian">Asian</option>
          <option value="Mexican">Mexican</option>
          <option value="Mediterranean">Mediterranean</option>
        </select>
      </div>

      {/* Dietary Restrictions */}
      <div className="restrictions-section">
        <label>Dietary Restrictions:</label>
        {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'].map(restriction => (
          <label key={restriction}>
            <input
              type="checkbox"
              checked={dietaryRestrictions.includes(restriction)}
              onChange={(e) => {
                if (e.target.checked) {
                  setDietaryRestrictions([...dietaryRestrictions, restriction]);
                } else {
                  setDietaryRestrictions(dietaryRestrictions.filter(r => r !== restriction));
                }
              }}
            />
            {restriction}
          </label>
        ))}
      </div>

      {error && <div className="error">{error}</div>}
      }

      <button 
        onClick={handleGenerateRecipe} 
        disabled={loading}
        className="generate-button"
      >
        {loading ? 'Generating...' : 'Generate Recipe'}
      </button>
    </div>
  );
};

// 4. User Synchronization Utility
export const syncUserWithAIService = async (user, aiService) => {
  try {
    // Register/update user in AI service
    const response = await aiService.makeRequest('/auth/sync-user', {
      method: 'POST',
      body: JSON.stringify({
        userId: user.id,
        email: user.email,
        name: user.name,
        subscription: user.aiSubscription || 'free'
      })
    });

    return response;
  } catch (error) {
    console.error('User sync failed:', error);
    throw error;
  }
};

// 5. Integration with your existing Recipe model
export const enhanceRecipeWithAI = async (recipe, aiService) => {
  try {
    // Get AI nutrition analysis
    const nutritionAnalysis = await aiService.analyzeNutrition(recipe);
    
    // Get ingredient substitutions
    const substitutions = await Promise.all(
      recipe.ingredients.map(ingredient => 
        aiService.getSubstitutions(ingredient.name)
      )
    );

    return {
      ...recipe,
      aiEnhanced: true,
      nutritionAnalysis: nutritionAnalysis.data,
      ingredientSubstitutions: substitutions.map(s => s.data),
      enhancedAt: new Date()
    };
  } catch (error) {
    console.error('Recipe AI enhancement failed:', error);
    return recipe;
  }
};

// 6. Subscription Integration Component
export const AISubscriptionManager = ({ user, onSubscriptionChange }) => {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const aiService = useAIService();

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const [plansResponse, statusResponse] = await Promise.all([
        aiService.makeRequest('/subscriptions/plans'),
        aiService.getSubscriptionStatus()
      ]);

      setPlans(plansResponse.data);
      setCurrentSubscription(statusResponse.data);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    }
  };

  const handleUpgrade = async (planId) => {
    setLoading(true);
    try {
      const response = await aiService.createCheckoutSession(planId);
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await aiService.createPortalSession();
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
    }
  };

  return (
    <div className="ai-subscription-manager">
      <h3>AI Features Subscription</h3>
      
      {currentSubscription && (
        <div className="current-subscription">
          <p>Current Plan: {currentSubscription.plan}</p>
          <p>Status: {currentSubscription.status}</p>
          <p>Requests Used: {currentSubscription.requestsUsed} / {currentSubscription.requestLimit}</p>
          
          {currentSubscription.plan !== 'free' && (
            <button onClick={handleManageBilling}>
              Manage Billing
            </button>
          )}
        </div>
      )}

      <div className="available-plans">
        {plans.map(plan => (
          <div key={plan.id} className="plan-card">
            <h4>{plan.name}</h4>
            <p>${plan.price}/{plan.interval}</p>
            <ul>
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            
            {plan.id !== currentSubscription?.plan && (
              <button 
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading}
              >
                {plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 7. Error Boundary for AI Features
export class AIFeatureErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AI Feature Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="ai-error-fallback">
          <h3>AI Feature Temporarily Unavailable</h3>
          <p>We're experiencing issues with our AI service. Please try again later.</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 8. Usage in your main RecipeHub App
export const RecipeHubWithAI = () => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    // Load user and auth token from your existing auth system
    const token = localStorage.getItem('authToken');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    setAuthToken(token);
    setUser(userData);
  }, []);

  const handleRecipeGenerated = (aiRecipe) => {
    // Save AI-generated recipe to your database
    console.log('AI Recipe Generated:', aiRecipe);
    
    // You can integrate this with your existing recipe saving logic
    // saveRecipeToDatabase({ ...aiRecipe, source: 'AI_GENERATED' });
  };

  return (
    <AIServiceProvider authToken={authToken}>
      <div className="recipehub-app">
        <h1>RecipeHub with AI</h1>
        
        <AIFeatureErrorBoundary>
          <AIRecipeGenerator onRecipeGenerated={handleRecipeGenerated} />
        </AIFeatureErrorBoundary>
        
        <AIFeatureErrorBoundary>
          <AISubscriptionManager 
            user={user} 
            onSubscriptionChange={(subscription) => {
              setUser({ ...user, aiSubscription: subscription });
            }}
          />
        </AIFeatureErrorBoundary>
        
        {/* Your existing RecipeHub components */}
      </div>
    </AIServiceProvider>
  );
};