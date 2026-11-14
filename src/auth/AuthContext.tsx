//! Session state: login/logout against /auth/* and effective permission
//! codes from /auth/me. Hiding UI without permissions never replaces the
//! backend's own RBAC check — it only shapes what the operator can see.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api, setToken, getToken, ApiError } from "../api/client";

export interface Me {
  id: string;
  email: string;
  display_name: string;
  roles: string[];
  permissions: string[];
}

interface LoginResponse {
  token: string;
  user: { id: string; email: string; display_name: string };
  roles: string[];
  permissions: string[];
}

type Status = "loading" | "anonymous" | "ready";

interface AuthState {
  status: Status;
  me: Me | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (code: string) => boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [status, setStatus] = useState<Status>(getToken() ? "loading" : "anonymous");

  useEffect(() => {
    let cancelled = false;
    if (!getToken()) return;
    api<Me>("/auth/me")
      .then((data) => {
        if (!cancelled) {
          setMe(data);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setToken(null);
          setStatus("anonymous");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api<LoginResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setToken(response.token);
    // /auth/me is the single source of truth for the session shape.
    const data = await api<Me>("/auth/me");
    setMe(data);
    setStatus("ready");
  }, []);

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      // The session may already be gone; clearing locally is enough.
    }
    setToken(null);
    setMe(null);
    setStatus("anonymous");
  }, []);

  const hasPermission = useCallback(
    (code: string) => me?.permissions.includes(code) ?? false,
    [me],
  );

  const value = useMemo<AuthState>(
    () => ({ status, me, login, logout, hasPermission }),
    [status, me, login, logout, hasPermission],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}

/** True when the error means "wrong credentials" (shows inline in the form). */
export function isBadCredentials(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}
