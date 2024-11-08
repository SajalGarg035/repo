import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:3000/api/login', {
        username,
        password,
      });
      
      const { user, token } = response.data;
      setUser(user);
      setToken(token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:3000/api/register', userData);
      const { user, token } = response.data;
      setUser(user);
      setToken(token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    login,
    register,
    logout,
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
