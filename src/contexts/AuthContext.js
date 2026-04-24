import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loginRequest, meRequest } from '../services/authService';
import { clearSession, getStoredUser, persistSession } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('realenergy_access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await meRequest();
      setUser(response.data.user);
      localStorage.setItem('realenergy_user', JSON.stringify(response.data.user));
    } catch (error) {
      clearSession();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const response = await loginRequest({ email, password });
    persistSession(response.data);
    setUser(response.data.user);
    return response.data;
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, logout, reloadUser: loadUser, isAuthenticated: Boolean(user) }),
    [user, loading, loadUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
