# AI Recipe Hub Microservice with Payment Integration

A comprehensive AI-powered microservice for recipe applications, featuring intelligent recipe generation, nutritional analysis, meal planning, cooking assistance, and subscription-based payment system.

## 🚀 Features

### Core AI Capabilities
- **Recipe Generation**: Create recipes from available ingredients with dietary preferences
- **Nutritional Analysis**: Comprehensive health scoring and recommendations
- **Meal Planning**: Smart weekly meal plans with shopping lists
- **Ingredient Substitutions**: Find alternatives with conversion ratios
- **Cooking Assistant**: Real-time chat support for cooking questions
- **Image Recognition**: Analyze food photos for recipes and nutrition

### Payment & Subscription System
- **Multiple Subscription Tiers**: Free, Basic Chef, Pro Chef (Monthly/Yearly)
- **Secure Payment Processing**: Stripe integration with webhooks
- **Usage Tracking**: Monitor API requests and enforce limits
- **Billing Management**: Customer portal for subscription management
- **Authentication System**: JWT-based user authentication

### Technical Features
- **Microservice Architecture**: Standalone service with REST API
- **Modern Frontend**: React with TypeScript and Tailwind CSS
- **AI Integration**: OpenAI GPT-4 for intelligent responses
- **Payment Processing**: Stripe for secure transactions
- **Real-time Chat**: Interactive cooking assistant
- **File Upload**: Image analysis with drag-and-drop
- **Responsive Design**: Works on all devices
- **Error Handling**: Comprehensive error management
- **Rate Limiting**: API protection and security

## 🏗️ Architecture

```
├── server/                 # Node.js Express API
│   ├── src/
│   │   ├── routes/        # API endpoints (auth, subscription, AI features)
│   │   ├── services/      # AI service integration & Stripe service
│   │   ├── middleware/    # Auth, validation, error handling
│   │   ├── schemas/       # Request validation schemas
│   │   └── utils/         # Logging, helpers
├── src/                   # React frontend
│   ├── components/        # UI components
│   │   ├── Auth/         # Authentication components
│   │   └── Subscription/ # Payment & subscription components
│   ├── contexts/         # React contexts (Auth, Stripe)
│   ├── services/         # API client
│   └── App.tsx           # Main application
```

## 💳 Subscription Plans

### Free Plan
- 5 AI recipe generations per month
- Basic nutrition analysis
- Limited chat assistant
- **Price**: Free

### Basic Chef ($9.99/month)
- 50 AI recipe generations per month
- Full nutrition analysis with health scores
- Ingredient substitutions
- Unlimited chat assistant
- Basic meal planning (7 days)

### Pro Chef ($19.99/month or $199.99/year)
- Unlimited AI recipe generations
- Advanced nutrition analysis
- Smart meal planning (30 days)
- Image recipe analysis
- Priority chat support
- Custom dietary preferences
- Shopping list optimization

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key
- Stripe account (for payments)
- Modern web browser

### Installation

1. **Clone and install dependencies:**
```bash
npm install
cd server && npm install
```

2. **Configure environment variables:**

**Server Environment (`server/.env`):**
```bash
# Copy example environment file
cp server/.env.example server/.env

# Edit server/.env with your keys:
OPENAI_API_KEY=your_openai_api_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
JWT_SECRET=your_jwt_secret_here
```

**Client Environment (`.env`):**
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your Stripe publishable key:
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

3. **Set up Stripe:**
   - Create a Stripe account at https://stripe.com
   - Get your API keys from the Stripe Dashboard
   - Create products and prices in Stripe Dashboard:
     - Basic Chef Monthly: `price_basic_monthly`
     - Pro Chef Monthly: `price_pro_monthly`
     - Pro Chef Yearly: `price_pro_yearly`
   - Set up webhook endpoint: `http://localhost:3001/api/subscriptions/webhook`
   - Update the price IDs in `server/src/services/stripeService.ts`

4. **Start the development servers:**
```bash
npm run dev
```

This starts both the React frontend (port 5173) and Node.js API server (port 3001).

## 📡 API Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Subscription Management
```
GET /api/subscriptions/plans
POST /api/subscriptions/create-checkout-session
POST /api/subscriptions/create-portal-session
GET /api/subscriptions/status
POST /api/subscriptions/webhook
```

### AI Features (Authenticated)
```
POST /api/recipes/generate
POST /api/nutrition/analyze
POST /api/meal-plans/generate
POST /api/recipes/substitutions (Basic+ plans)
POST /api/chat/message
POST /api/images/analyze (Pro plans only)
```

## 🔐 Authentication & Authorization

The system uses JWT tokens for authentication and implements role-based access control:

- **Free users**: Limited access to basic features
- **Basic subscribers**: Access to most features with usage limits
- **Pro subscribers**: Unlimited access to all features

Middleware functions handle:
- Token validation
- Subscription status checking
- Usage limit enforcement
- Plan requirement validation

## 💰 Payment Flow

1. **User Registration**: Users start with a free account
2. **Plan Selection**: Users choose a subscription plan
3. **Stripe Checkout**: Secure payment processing via Stripe
4. **Webhook Processing**: Subscription status updates via webhooks
5. **Access Control**: Features unlocked based on subscription status

## 🔧 Integration with Your RecipeHub App

### 1. Microservice Integration
```javascript
// Add to your existing GraphQL resolvers
const aiService = 'http://localhost:3001/api';

const resolvers = {
  Mutation: {
    generateRecipe: async (_, { ingredients }, { user }) => {
      const response = await fetch(`${aiService}/recipes/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.aiServiceToken}`
        },
        body: JSON.stringify({ ingredients })
      });
      return response.json();
    }
  }
};
```

### 2. Frontend Integration
```javascript
// Import components into your React app
import { RecipeGenerator } from './ai-components/RecipeGenerator';
import { AuthProvider } from './ai-components/contexts/AuthContext';

// Wrap your app with providers
<AuthProvider>
  <RecipeGenerator onRecipeGenerated={handleNewRecipe} />
</AuthProvider>
```

### 3. Database Integration
```javascript
// Save AI-generated recipes to your Prisma database
const saveAIRecipe = async (recipeData, userId) => {
  return prisma.recipe.create({
    data: {
      ...recipeData,
      source: 'AI_GENERATED',
      userId: userId,
      aiServiceUsed: true
    }
  });
};
```

### 4. User Sync
```javascript
// Sync users between your main app and AI service
const syncUserToAIService = async (user) => {
  const response = await fetch(`${aiService}/auth/sync-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      email: user.email,
      name: user.name,
      subscription: user.aiSubscription
    })
  });
  return response.json();
};
```

## 🚀 Deployment

### Environment Variables for Production
```env
# Server (.env)
OPENAI_API_KEY=your_production_openai_key
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=production
CLIENT_URL=https://your-recipe-app.com
DATABASE_URL=your_production_db_url

# Client (.env)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key
```

### Docker Deployment
```dockerfile
# Build production version
npm run build

# Deploy server to your preferred platform
# Frontend can be deployed to Vercel, Netlify, etc.
```

## 🔒 Security Features

- JWT-based authentication with secure token handling
- Request validation with Joi schemas
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Stripe webhook signature verification
- File upload size limits (5MB)
- Error message sanitization
- Helmet.js security headers
- Password hashing with bcrypt

## 📊 Subscription Management

### Features by Plan

| Feature | Free | Basic Chef | Pro Chef |
|---------|------|------------|----------|
| Recipe Generation | 5/month | 50/month | Unlimited |
| Nutrition Analysis | Basic | Full | Advanced |
| Meal Planning | ❌ | 7 days | 30 days |
| Ingredient Substitutions | ❌ | ✅ | ✅ |
| Image Analysis | ❌ | ❌ | ✅ |
| Chat Assistant | Limited | Unlimited | Priority |
| Shopping Lists | ❌ | ✅ | Optimized |

### Billing Management
- Automatic subscription renewal
- Prorated upgrades/downgrades
- Failed payment handling
- Subscription cancellation
- Billing history access
- Invoice generation

## 🤖 AI Integration Details

Uses OpenAI GPT-4 for:
- Recipe generation with structured outputs
- Nutritional analysis and health recommendations
- Meal planning optimization
- Natural language cooking assistance
- Ingredient substitution suggestions
- Image analysis (with Vision API)

## 📈 Scaling Considerations

- Implement Redis for session management and caching
- Add database storage for user data and subscription history
- Consider multiple AI model integration
- Implement user analytics and usage tracking
- Add email notifications for subscription events
- Implement recipe rating and feedback systems
- Add admin dashboard for subscription management

## 🐛 Troubleshooting

**Payment Issues:**
- Verify Stripe keys are correct (test vs live)
- Check webhook endpoint is accessible
- Ensure webhook secret matches Stripe dashboard

**API Connection Issues:**
- Verify OpenAI API key is valid
- Check network connectivity
- Ensure correct ports (3001 for API, 5173 for frontend)

**Authentication Problems:**
- Check JWT secret is set
- Verify token expiration settings
- Ensure CORS is properly configured

**Subscription Sync Issues:**
- Monitor webhook delivery in Stripe dashboard
- Check webhook signature verification
- Verify database updates are working

This AI Recipe Hub microservice with payment integration provides a complete foundation for adding intelligent cooking features with monetization to your RecipeHub application while maintaining clean separation of concerns and scalability.