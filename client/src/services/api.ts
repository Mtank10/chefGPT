import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const aiApi = {
  // Auth token management
  setAuthToken: (token: string | null) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  // Authentication
  register: async (data: { email: string; password: string; name: string }) => {
    return api.post('/auth/register', data);
  },

  login: async (data: { email: string; password: string }) => {
    return api.post('/auth/login', data);
  },

  // Subscription Management
  getSubscriptionPlans: async () => {
    return api.get('/subscriptions/plans');
  },

  createCheckoutSession: async (data: { planId: string }) => {
    return api.post('/subscriptions/create-checkout-session', data);
  },

  createPortalSession: async () => {
    return api.post('/subscriptions/create-portal-session');
  },

  getSubscriptionStatus: async () => {
    return api.get('/subscriptions/status');
  },

  // Recipe Generation
  generateRecipe: async (data: {
    ingredients: string[];
    dietaryRestrictions?: string[];
    cuisine?: string;
  }) => {
    return api.post('/recipes/generate', data);
  },

  // Nutrition Analysis
  analyzeNutrition: async (data: { recipe: any }) => {
    return api.post('/nutrition/analyze', data);
  },

  // Ingredient Substitutions
  getSubstitutions: async (data: {
    ingredient: string;
    restrictions?: string[];
  }) => {
    return api.post('/recipes/substitutions', data);
  },

  // Meal Planning
  generateMealPlan: async (data: {
    days?: number;
    dietaryRestrictions?: string[];
    budget?: string;
    cookingTime?: string;
    cuisine?: string;
    healthGoals?: string[];
  }) => {
    return api.post('/meal-plans/generate', data);
  },

  // Chat Assistant
  chatAssistant: async (data: {
    message: string;
    context?: any;
  }) => {
    return api.post('/chat/message', data);
  },

  // Image Analysis
  analyzeImage: async (formData: FormData) => {
    return api.post('/images/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;