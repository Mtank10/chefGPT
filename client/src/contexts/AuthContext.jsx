import React, { createContext, useContext, useState, useEffect } from 'react';
import { aiApi } from '../services/api';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      aiApi.setAuthToken(storedToken);
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await aiApi.login({ email, password });
      const { token: newToken, user: newUser } = response.data;
      
      setToken(newToken);
      setUser(newUser);
      
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_user', JSON.stringify(newUser));
      
      aiApi.setAuthToken(newToken);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email, password, name) => {
    try {
      const response = await aiApi.register({ email, password, name });
      console.log(response.data)
      const { token: newToken, user: newUser } = response.data;
      
      setToken(newToken);
      setUser(newUser);
      
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_user', JSON.stringify(newUser));
      
      aiApi.setAuthToken(newToken);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    aiApi.setAuthToken(null);
  };

  const refreshSubscription = async () => {
    if (!token) return;
    
    try {
      const response = await aiApi.getSubscriptionStatus();
      const updatedUser = { ...user, subscription: response.data };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    refreshSubscription
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};