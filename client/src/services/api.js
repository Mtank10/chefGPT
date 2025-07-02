import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:3001/api';

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
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  // Authentication
  register: async (data) => {
    return api.post('/auth/register', data);
  },

  login: async (data) => {
    return api.post('/auth/login', data);
  },

  // Subscription Management
  getSubscriptionPlans: async () => {
    return api.get('/subscriptions/plans');
  },

  createCheckoutSession: async (data) => {
    return api.post('/subscriptions/create-checkout-session', data);
  },

  createPortalSession: async () => {
    return api.post('/subscriptions/create-portal-session');
  },

  getSubscriptionStatus: async () => {
    return api.get('/subscriptions/status');
  },

  // Recipe Management
  generateRecipe: async (data) => {
    return api.post('/recipes/generate', data);
  },

  getUserRecipes: async (page = 1, limit = 20) => {
    return api.get(`/recipes?page=${page}&limit=${limit}`);
  },

  getRecipe: async (id) => {
    return api.get(`/recipes/${id}`);
  },

  updateRecipe: async (id, data) => {
    return api.put(`/recipes/${id}`, data);
  },

  deleteRecipe: async (id) => {
    return api.delete(`/recipes/${id}`);
  },

  // Nutrition Analysis
  analyzeNutrition: async (data) => {
    return api.post('/nutrition/analyze', data);
  },

  // Ingredient Substitutions
  getSubstitutions: async (data) => {
    return api.post('/recipes/substitutions', data);
  },

  // Meal Planning
  generateMealPlan: async (data) => {
    return api.post('/meal-plans/generate', data);
  },

  getUserMealPlans: async (page = 1, limit = 20) => {
    return api.get(`/meal-plans?page=${page}&limit=${limit}`);
  },

  getMealPlan: async (id) => {
    return api.get(`/meal-plans/${id}`);
  },

  updateMealPlan: async (id, data) => {
    return api.put(`/meal-plans/${id}`, data);
  },

  deleteMealPlan: async (id) => {
    return api.delete(`/meal-plans/${id}`);
  },

  // Chat Assistant
  chatAssistant: async (data) => {
    return api.post('/chat/message', data);
  },

  // Image Analysis
  analyzeImage: async (formData) => {
    return api.post('/images/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;