import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and rehydrate user session on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // Verify & re-fetch fresh user profile in background from /auth/me
          const response = await api.get('/auth/me');
          const freshUser = response?.data?.user || response?.user || response?.data;
          if (freshUser && (freshUser._id || freshUser.id)) {
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          }
        } catch (error) {
          console.warn('Session verification error:', error?.message);
          // Only clear session if token is explicitly unauthorized (401)
          if (error?.response?.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const data = response?.data || response;

    const accessToken = data?.accessToken || data?.token;
    const refreshToken = data?.refreshToken;
    const userData = data?.user;

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('token', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }

    return userData;
  };

  // Signup handler
  const signup = async (formData) => {
    const response = await api.post('/auth/signup', formData);
    const data = response?.data || response;

    const accessToken = data?.accessToken || data?.token;
    const refreshToken = data?.refreshToken;
    const userData = data?.user;

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('token', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }

    return userData;
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error on server:', err?.message);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // Update local user profile state
  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    role: user?.role || null,
    login,
    signup,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to consume AuthContext safely
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
