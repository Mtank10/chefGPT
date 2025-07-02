# AI Recipe Hub Integration Guide

## 🚀 Quick Start Integration

### Step 1: Get Required API Keys

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

#### Stripe API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Create an account or sign in
3. Go to Developers → API Keys
4. Copy both:
   - Publishable key (starts with `pk_test_`)
   - Secret key (starts with `sk_test_`)

### Step 2: Environment Configuration

#### Server Environment (`server/.env`)
```bash
OPENAI_API_KEY=sk-your_openai_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
JWT_SECRET=your_super_secure_random_string_here
PORT=3001
CLIENT_URL=http://localhost:3000
```

#### Client Environment (`.env`)
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_AI_SERVICE_URL=http://localhost:3001
```

### Step 3: Installation & Setup

#### Install Dependencies
```bash
# Install main project dependencies
npm install

# Install server dependencies
cd server && npm install
```

#### Start Development Servers
```bash
# Start both client and server
npm run dev

# Or start individually:
# Server: cd server && npm run dev
# Client: npm run client
```

## 🔗 Integration with Your RecipeHub App

### Option 1: Standalone Integration (Recommended)

Run the AI microservice as a separate service alongside your main RecipeHub app:

```
Port 3000: Your RecipeHub App
Port 3001: AI Recipe Microservice
```

#### Integration Steps:

1. **API Client Setup in Your RecipeHub**
```javascript
// services/aiService.js
const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:3001';

export const aiService = {
  async generateRecipe(ingredients, restrictions = []) {
    const response = await fetch(`${AI_SERVICE_URL}/api/recipes/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ ingredients, dietaryRestrictions: restrictions })
    });
    return response.json();
  },

  async analyzeNutrition(recipe) {
    const response = await fetch(`${AI_SERVICE_URL}/api/nutrition/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ recipe })
    });
    return response.json();
  }
};
```

2. **User Sync Between Apps**
```javascript
// utils/userSync.js
export const syncUserToAIService = async (user) => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/auth/sync-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        email: user.email,
        name: user.name,
        subscription: user.aiSubscription || 'free'
      })
    });
    return response.json();
  } catch (error) {
    console.error('User sync failed:', error);
  }
};
```

3. **Add AI Features to Your RecipeHub Components**
```jsx
// components/AIRecipeGenerator.jsx
import { useState } from 'react';
import { aiService } from '../services/aiService';

export const AIRecipeGenerator = ({ onRecipeGenerated }) => {
  const [ingredients, setIngredients] = useState(['']);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const recipe = await aiService.generateRecipe(
        ingredients.filter(i => i.trim())
      );
      onRecipeGenerated(recipe.data);
    } catch (error) {
      console.error('Recipe generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-recipe-generator">
      {/* Your UI components */}
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Recipe'}
      </button>
    </div>
  );
};
```

### Option 2: Component Integration

Copy specific components from the AI microservice into your RecipeHub:

1. **Copy Components**
```bash
# Copy AI components to your RecipeHub
cp -r src/components/RecipeGenerator your-recipehub/components/AI/
cp -r src/components/NutritionAnalyzer your-recipehub/components/AI/
cp -r src/services/api.ts your-recipehub/services/aiApi.ts
```

2. **Update API URLs**
```javascript
// In your copied aiApi.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:3001/api';
```

## 🔐 Authentication & User Management

### Approach 1: Shared Authentication

Use the same JWT tokens between your RecipeHub and AI service:

```javascript
// middleware/aiAuth.js in your RecipeHub
export const withAIAuth = (handler) => {
  return async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    // Verify token with your existing auth system
    const user = await verifyToken(token);
    
    // Add AI service token to headers when calling AI endpoints
    req.aiServiceHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    return handler(req, res);
  };
};
```

### Approach 2: Token Exchange

Create an endpoint to exchange your app tokens for AI service tokens:

```javascript
// pages/api/ai/auth.js
export default async function handler(req, res) {
  const user = await getCurrentUser(req);
  
  // Create AI service user if doesn't exist
  const aiUser = await createOrUpdateAIUser(user);
  
  // Return AI service token
  res.json({ aiToken: aiUser.token });
}
```

## 💳 Subscription & Payment Integration

### Option 1: Unified Billing

Handle all subscriptions in your main RecipeHub app:

```javascript
// services/subscriptionService.js
export const subscriptionService = {
  async upgradeToAIPlan(userId, planId) {
    // Create Stripe subscription
    const subscription = await stripe.subscriptions.create({
      customer: user.stripeCustomerId,
      items: [{ price: planId }]
    });
    
    // Update user in your database
    await updateUser(userId, {
      aiSubscription: planId,
      aiRequestsUsed: 0,
      aiRequestLimit: getPlanLimit(planId)
    });
    
    // Sync with AI service
    await syncUserToAIService(user);
  }
};
```

### Option 2: Separate AI Billing

Keep AI subscriptions separate and redirect users to the AI service for billing:

```javascript
// components/AIPricingModal.jsx
export const AIPricingModal = () => {
  const handleUpgrade = (planId) => {
    // Redirect to AI service subscription page
    window.location.href = `${AI_SERVICE_URL}/subscription?plan=${planId}&return=${window.location.href}`;
  };
  
  return (
    <div className="pricing-modal">
      {/* Pricing UI */}
    </div>
  );
};
```

## 🚀 Deployment Guide

### Server Deployment (AI Microservice)

#### Option 1: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway add
railway deploy
```

#### Option 2: Heroku
```bash
# Create Heroku app
heroku create your-ai-recipe-service

# Set environment variables
heroku config:set OPENAI_API_KEY=your_key
heroku config:set STRIPE_SECRET_KEY=your_key
heroku config:set JWT_SECRET=your_secret

# Deploy
git subtree push --prefix server heroku main
```

#### Option 3: DigitalOcean App Platform
1. Connect your GitHub repository
2. Select the `server` folder as root
3. Set environment variables in the dashboard
4. Deploy

### Client Deployment

#### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

#### Option 2: Netlify
```bash
# Build the project
npm run build

# Deploy to Netlify (drag & drop dist folder)
# Or use Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Environment Variables for Production

#### Server (Production)
```bash
OPENAI_API_KEY=sk-live_your_production_key
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
JWT_SECRET=your_super_secure_production_secret
CLIENT_URL=https://your-recipehub-domain.com
NODE_ENV=production
```

#### Client (Production)
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
VITE_AI_SERVICE_URL=https://your-ai-service-domain.com
```

## 🔄 Data Synchronization

### User Data Sync
```javascript
// utils/syncService.js
export const syncService = {
  async syncUserPreferences(userId) {
    const user = await getUserFromMainDB(userId);
    const aiUser = await getAIUser(userId);
    
    // Sync dietary preferences
    await updateAIUserPreferences(userId, {
      dietaryRestrictions: user.dietaryRestrictions,
      allergies: user.allergies,
      cuisinePreferences: user.cuisinePreferences
    });
  },

  async syncGeneratedRecipes(userId) {
    const aiRecipes = await getAIGeneratedRecipes(userId);
    
    // Save to main RecipeHub database
    for (const recipe of aiRecipes) {
      await saveRecipeToMainDB({
        ...recipe,
        userId,
        source: 'AI_GENERATED',
        createdAt: new Date()
      });
    }
  }
};
```

### Recipe Integration
```javascript
// components/RecipeCard.jsx
export const RecipeCard = ({ recipe }) => {
  const [nutritionAnalysis, setNutritionAnalysis] = useState(null);
  
  const analyzeNutrition = async () => {
    if (recipe.source === 'AI_GENERATED') {
      // Already has AI analysis
      return;
    }
    
    const analysis = await aiService.analyzeNutrition(recipe);
    setNutritionAnalysis(analysis.data);
  };
  
  return (
    <div className="recipe-card">
      {/* Recipe display */}
      {!recipe.aiAnalyzed && (
        <button onClick={analyzeNutrition}>
          Get AI Nutrition Analysis
        </button>
      )}
    </div>
  );
};
```

## 🔧 Configuration Examples

### Next.js Integration
```javascript
// next.config.js
module.exports = {
  env: {
    AI_SERVICE_URL: process.env.AI_SERVICE_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/ai/:path*',
        destination: `${process.env.AI_SERVICE_URL}/api/:path*`
      }
    ];
  }
};
```

### React Integration
```javascript
// src/config/ai.js
export const AI_CONFIG = {
  baseURL: process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:3001',
  endpoints: {
    generateRecipe: '/api/recipes/generate',
    analyzeNutrition: '/api/nutrition/analyze',
    createMealPlan: '/api/meal-plans/generate'
  }
};
```

## 📱 Mobile App Integration

### React Native
```javascript
// services/aiService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const aiService = {
  async generateRecipe(ingredients) {
    const token = await AsyncStorage.getItem('aiToken');
    
    const response = await fetch(`${AI_SERVICE_URL}/api/recipes/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ingredients })
    });
    
    return response.json();
  }
};
```

## 🧪 Testing Integration

### API Testing
```javascript
// tests/aiIntegration.test.js
describe('AI Service Integration', () => {
  test('should generate recipe from ingredients', async () => {
    const ingredients = ['chicken', 'rice', 'vegetables'];
    const recipe = await aiService.generateRecipe(ingredients);
    
    expect(recipe.success).toBe(true);
    expect(recipe.data.title).toBeDefined();
    expect(recipe.data.ingredients).toHaveLength(3);
  });
  
  test('should handle authentication errors', async () => {
    // Test without token
    await expect(aiService.generateRecipe(['test']))
      .rejects.toThrow('Authentication required');
  });
});
```

## 🚨 Error Handling

### Graceful Degradation
```javascript
// utils/aiServiceWrapper.js
export const withFallback = (aiFunction, fallbackFunction) => {
  return async (...args) => {
    try {
      return await aiFunction(...args);
    } catch (error) {
      console.warn('AI service unavailable, using fallback:', error);
      return fallbackFunction(...args);
    }
  };
};

// Usage
const generateRecipe = withFallback(
  aiService.generateRecipe,
  fallbackRecipeGeneration
);
```

## 📊 Monitoring & Analytics

### Usage Tracking
```javascript
// utils/analytics.js
export const trackAIUsage = (feature, userId, success = true) => {
  // Track in your analytics service
  analytics.track('AI Feature Used', {
    feature,
    userId,
    success,
    timestamp: new Date(),
    service: 'ai-recipe-hub'
  });
};
```

This integration guide provides multiple approaches depending on your specific needs and architecture. Choose the approach that best fits your existing RecipeHub application structure.