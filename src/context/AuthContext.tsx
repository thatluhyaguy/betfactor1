'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthUser {
  id: string;
  emailOrPhone: string;
  tier: string;
}

interface AuthState {
  role: 'admin' | 'user' | 'guest';
  isAdmin: boolean;
  isUser: boolean;
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  role: 'guest',
  isAdmin: false,
  isUser: false,
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<Omit<AuthState, 'refresh' | 'logout'>>({
    role: 'guest',
    isAdmin: false,
    isUser: false,
    user: null,
    loading: true,
  });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      setState({
        role: data.role,
        isAdmin: data.isAdmin ?? false,
        isUser: data.isUser ?? false,
        user: data.user ?? null,
        loading: false,
      });
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setState({ role: 'guest', isAdmin: false, isUser: false, user: null, loading: false });
    router.push('/');
  }, [router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ ...state, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
