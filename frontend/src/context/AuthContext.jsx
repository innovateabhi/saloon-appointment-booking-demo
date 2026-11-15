import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data?.authenticated && response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data);
      toast.success(response.message || 'Signed in successfully');
      return response.data;
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
      throw err;
    }
  };

  const register = async (data) => {
    try {
      const response = await api.post('/auth/register', data);
      setUser(response.data);
      toast.success(response.message || 'Welcome to Aurelia!');
      return response.data;
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      toast.success('Signed out successfully');
    } catch (err) {
      setUser(null);
      toast.error(err.message || 'Signed out');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser: checkAuth,
    isAuthenticated: !!user,
    isAdmin: user?.role_slug === 'admin' || user?.role_slug === 'owner',
    isStaff: user?.role_slug === 'staff',
    isCustomer: user?.role_slug === 'customer',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

