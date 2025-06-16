import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar usuario al montar si hay token
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await authService.getUser(token);
          setUser(res.data);
        } catch (err) {
          setUser(null);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  // Login
  const login = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(data);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      const userRes = await authService.getUser(res.data.token);
      setUser(userRes.data);
      setError(null);
      return res;
    } catch (err) {
      setError('Credenciales inválidas');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout(token);
    } catch (err) {
      // Ignorar error de logout
    }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    setUser,
    setToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 