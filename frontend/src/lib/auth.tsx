
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { ReactNode } from 'react';
import { ApiError, apiRequest } from './api';
import type { User } from './api';

const TOKEN_KEY = 'cv_token';

function readToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

type AuthValue = {
  token: string;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  request: <T>(
    path: string,
    options?: RequestInit
  ) => Promise<T>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [token, setToken] = useState<string>(readToken);
  const [user, setUser] = useState<User | null>(null);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Storage may be unavailable.
    }

    setToken('');
    setUser(null);
  }, []);

  const request = useCallback(
    async <T,>(
      path: string,
      options: RequestInit = {}
    ): Promise<T> => {
      try {
        return await apiRequest<T>(path, token, options);
      } catch (error) {
        if (
          error instanceof ApiError &&
          error.status === 401 &&
          token
        ) {
          logout();
        }

        throw error;
      }
    },
    [token, logout]
  );

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    let cancelled = false;

    request<User>('/auth/me')
      .then((currentUser) => {
        if (!cancelled) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        // Authentication errors are handled by request().
      });

    return () => {
      cancelled = true;
    };
  }, [token, request]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiRequest<{
        access_token: string;
        token_type: string;
      }>('/auth/login', '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      try {
        localStorage.setItem(TOKEN_KEY, data.access_token);
      } catch {
        // Storage may be unavailable.
      }

      setUser(null);
      setToken(data.access_token);
    },
    []
  );

  const register = useCallback(
    async (email: string, password: string) => {
      await apiRequest<User>('/auth/register', '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });
    },
    []
  );

  const value = useMemo<AuthValue>(
    () => ({
      token,
      user,
      login,
      register,
      logout,
      request,
    }),
    [token, user, login, register, logout, request]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
}
