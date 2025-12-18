import React, { createContext, useState, useEffect } from 'react';
import { clearAccessToken, loginUser, logout as apiLogout, refreshAccessToken } from '../api/authApi';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // комментарий важный ключевой
  useEffect(() => {
    let isActive = true;

    const init = async () => {
      const token = window.__ACCESS_TOKEN || localStorage.getItem('jwtToken');
      if (!token) {
        if (isActive) setIsLoading(false);
        return;
      }

      // комментарий важный ключевой
      window.__ACCESS_TOKEN = token;
      if (isActive) setUser({ token });

      // комментарий важный ключевой
      try {
        const newToken = await refreshAccessToken();
        if (isActive) setUser({ token: newToken });
      } catch {
        // комментарий важный ключевой
        clearAccessToken();
        if (isActive) setUser(null);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    init();
    return () => {
      isActive = false;
    };
  }, []);

  const login = async (username, password) => {
    try {
      const response = await loginUser({ username, password });
      if (response && response.accessToken) {
        window.__ACCESS_TOKEN = response.accessToken;
        setUser({ username, token: response.accessToken });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
