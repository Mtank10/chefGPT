# AI Recipe Hub with Supabase PostgreSQL

A comprehensive AI-powered recipe microservice with Supabase PostgreSQL database integration, featuring intelligent recipe generation, nutritional analysis, meal planning, and subscription-based payment system.

## 🚀 Features

### Core AI Capabilities
- **Recipe Generation**: Create recipes from available ingredients with dietary preferences
- **Nutritional Analysis**: Comprehensive health scoring and recommendations
- **Meal Planning**: Smart weekly meal plans with shopping lists
- **Ingredient Substitutions**: Find alternatives with conversion ratios
- **Cooking Assistant**: Real-time chat support for cooking questions
- **Image Recognition**: Analyze food photos for recipes and nutrition

### Database Features (Supabase PostgreSQL)
- **User Management**: Secure user registration and authentication
- **Recipe Storage**: Save and manage AI-generated recipes
- **Meal Plan Storage**: Store and retrieve meal plans with preferences
- **Usage Tracking**: Monitor API requests and enforce limits
- **Subscription Management**: Handle subscription plans and billing
- **Row Level Security**: Secure data access with RLS policies

### Payment & Subscription System
- **Multiple Subscription Tiers**: Free, Basic Chef, Pro Chef (Monthly/Yearly)
- **Secure Payment Processing**: Stripe integration with webhooks
- **Usage Tracking**: Monitor API requests and enforce limits
- **Billing Management**: Customer portal for subscription management

## 🏗️ Architecture

```
├── supabase/
│   └── migrations/           # Database schema and migrations
├── server/                   # Node.js Express API
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # AI service & Stripe integration
│   │   ├── middleware/      # Auth, validation, error handling
│   │   └── schemas/         # Request validation schemas
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── contexts/        # React contexts
│   │   └── services/        # API client
```

## 🗄️ Database Schema

### Tables
- **users**: User accounts with authentication
- **subscriptions**: User subscription plans and status
- **usage_tracking**: Monthly API usage tracking
- **recipes**: AI-generated and user recipes
- **meal_plans**: Meal plans with shopping lists

### Security
- Row Level Security (RLS) enabled on all tables
- User-specific data access policies
- Service role access for server operations

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- OpenAI API key
- Stripe account (for payments)

### 1. Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database migration**:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase/migrations/create_initial_schema.sql`
   - Run the migration

3. **Get your Supabase credentials**:
   - Project URL
   - Anon key
   - Service role key

### 2. Environment Configuration

**Server Environment (`server/.env`)**:
```bash
# Copy from server/.env.example
OPENAI_API_KEY=your_openai_api_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
JWT_SECRET=your_super_secure_random_string
PORT=3001
CLIENT_URL=http://localhost:5173

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Client Environment (`client/.env`)**:
```bash
# Copy from client/.env.example
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_AI_SERVICE_URL=http://localhost:3001
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Installation

```bash
# Install client dependencies
npm install

# Install server dependencies
cd server && npm install
```

### 4. Start Development

```bash
# Start both client and server
npm run dev

# Or start individually:
# Server: cd server && npm run dev
# Client: npm run client
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Recipes
- `POST /api/recipes/generate` - Generate AI recipe
- `GET /api/recipes` - Get user recipes
- `GET /api/recipes/:id` - Get specific recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe
- `POST /api/recipes/substitutions` - Get ingredient substitutions

### Meal Plans
- `POST /api/meal-plans/generate` - Generate meal plan
- `GET /api/meal-plans` - Get user meal plans
- `GET /api/meal-plans/:id` - Get specific meal plan
- `PUT /api/meal-plans/:id` - Update meal plan
- `DELETE /api/meal-plans/:id` - Delete meal plan

### Subscriptions
- `GET /api/subscriptions/plans` - Get subscription plans
- `POST /api/subscriptions/create-checkout-session` - Create Stripe checkout
- `POST /api/subscriptions/create-portal-session` - Create billing portal
- `GET /api/subscriptions/status` - Get subscription status
- `POST /api/subscriptions/webhook` - Stripe webhook handler

### Other Features
- `POST /api/nutrition/analyze` - Nutrition analysis
- `POST /api/chat/message` - AI chat assistant
- `POST /api/images/analyze` - Image analysis (Pro only)

## 🔐 Authentication & Authorization

- JWT-based authentication with secure token handling
- Row Level Security (RLS) for database access
- Plan-based feature access control
- Usage limit enforcement
- Subscription status validation

## 💳 Subscription Plans

| Feature | Free | Basic Chef | Pro Chef |
|---------|------|------------|----------|
| Recipe Generation | 5/month | 50/month | Unlimited |
| Recipe Storage | ✅ | ✅ | ✅ |
| Nutrition Analysis | Basic | Full | Advanced |
| Meal Planning | ❌ | 7 days | 30 days |
| Ingredient Substitutions | ❌ | ✅ | ✅ |
| Image Analysis | ❌ | ❌ | ✅ |
| Chat Assistant | Limited | Unlimited | Priority |

## 🚀 Deployment

### Database (Supabase)
- Already hosted and managed by Supabase
- Automatic backups and scaling
- Built-in authentication and security

### Server Deployment
```bash
# Build and deploy to your preferred platform
# Environment variables must be set in production

# Example for Railway:
railway login
railway init
railway add
railway deploy
```

### Client Deployment
```bash
# Build for production
npm run build

# Deploy to Vercel, Netlify, or your preferred platform
```

## 🔧 Database Operations

The `Database` class in `server/src/config/database.js` provides methods for:

- **User Management**: Create, read, update user accounts
- **Subscription Management**: Handle subscription plans and status
- **Usage Tracking**: Monitor and enforce API limits
- **Recipe Storage**: CRUD operations for recipes
- **Meal Plan Storage**: CRUD operations for meal plans

## 🛡️ Security Features

- **Row Level Security**: Database-level access control
- **JWT Authentication**: Secure token-based auth
- **Request Validation**: Joi schema validation
- **Rate Limiting**: API protection
- **CORS Protection**: Cross-origin request security
- **Stripe Webhook Verification**: Secure payment processing
- **Password Hashing**: bcrypt encryption

## 📊 Usage Tracking

- Monthly usage limits per subscription plan
- Automatic usage increment on API calls
- Usage reset on successful payments
- Real-time usage monitoring in UI

## 🔄 Data Persistence

All user data is now persisted in Supabase PostgreSQL:

- **Recipes**: Saved with full metadata and nutrition info
- **Meal Plans**: Stored with preferences and shopping lists
- **User Preferences**: Dietary restrictions and settings
- **Usage History**: Complete audit trail of API usage
- **Subscription History**: Full billing and plan change history

This integration provides a robust, scalable foundation for your AI Recipe Hub with enterprise-grade database capabilities.