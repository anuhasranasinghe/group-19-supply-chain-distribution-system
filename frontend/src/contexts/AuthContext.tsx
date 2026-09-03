// ============================================================
// Auth Context — React Context for Authentication State
// ============================================================
// Provides authentication state (current user, loading status)
// to the entire component tree. Any component can check if the
// user is logged in, access their role, or trigger login/logout
// by using the useAuth() hook.
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi } from '../api/client';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: Record<string, string>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated (on page load/refresh).
  // This calls GET /api/auth/me which reads the HttpOnly cookie.
  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.me();
      setUser(response.data.data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (username: string, password: string) => {
    const response = await authApi.login(username, password);
    setUser(response.data.data.user);
  };

  const register = async (data: Record<string, string>) => {
    const response = await authApi.register(data);
    setUser(response.data.data.user);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for accessing auth context.
// Throws if used outside AuthProvider — catches programming errors early.
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
