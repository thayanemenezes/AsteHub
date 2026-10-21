"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AuthApi,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
} from "./auth-api";

export type AuthStatus =
  "loading" | "authenticated" | "unauthenticated" | "error";

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  retry: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const api = useMemo(() => new AuthApi(), []);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  const retry = useCallback(async () => {
    setStatus("loading");
    try {
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
      setStatus(currentUser ? "authenticated" : "unauthenticated");
    } catch {
      setUser(null);
      setStatus("error");
    }
  }, [api]);

  useEffect(() => {
    void retry();
  }, [retry]);

  const login = useCallback(
    async (input: LoginInput) => {
      const authenticatedUser = await api.login(input);
      const currentUser = await api.getCurrentUser();
      setUser(currentUser ?? authenticatedUser);
      setStatus("authenticated");
    },
    [api],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const authenticatedUser = await api.register(input);
      const currentUser = await api.getCurrentUser();
      setUser(currentUser ?? authenticatedUser);
      setStatus("authenticated");
    },
    [api],
  );

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    setStatus("unauthenticated");
  }, [api]);

  const value = useMemo(
    () => ({ status, user, login, register, logout, retry }),
    [status, user, login, register, logout, retry],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
