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
import { usePathname, useRouter } from "next/navigation";

import {
  bffFetch,
  BffRequestError,
  isTransientHttpStatus,
  type MeResponse,
} from "@/lib/auth/bff-client";
import { clearOtpChallenge } from "@/lib/auth/challenge-storage";
import { isAuthorizedAdminSession } from "@/lib/auth/session-policy";
import { AUTH_LOGIN_PATH } from "@/lib/auth/auth-routes";
import { shouldAuthProviderProbeSession } from "@/lib/auth/session-probe";
import type { ApiUserPublic } from "@/types/api/user";

type AuthContextValue = {
  user: ApiUserPublic | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionUnavailable: boolean;
  accessDenied: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  setUserFromVerify: (user: ApiUserPublic) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<ApiUserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionUnavailable, setSessionUnavailable] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const refreshUser = useCallback(async () => {
    setSessionUnavailable(false);
    setAccessDenied(false);

    try {
      const res = await bffFetch<MeResponse>("/api/auth/me", {
        skipRefreshRetry: true,
      });
      const sessionUser = res.data?.user ?? null;
      if (!isAuthorizedAdminSession(sessionUser)) {
        setUser(null);
        return;
      }
      setUser(sessionUser);
    } catch (error) {
      if (error instanceof BffRequestError) {
        if (isTransientHttpStatus(error.status) || error.status === 503) {
          setSessionUnavailable(true);
          return;
        }
        if (error.status === 403) {
          setUser(null);
          setAccessDenied(true);
          return;
        }
        if (error.status === 401) {
          setUser(null);
          return;
        }
      }
      setSessionUnavailable(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!shouldAuthProviderProbeSession(pathname)) {
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      await refreshUser();
      if (!cancelled) {
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUser, pathname]);

  const logout = useCallback(async () => {
    try {
      await bffFetch("/api/auth/logout", { method: "POST", body: {} });
    } catch {
      /* Nettoyage local même si le BFF est indisponible. */
    } finally {
      clearOtpChallenge();
      setUser(null);
      setSessionUnavailable(false);
      setAccessDenied(false);
      router.replace(AUTH_LOGIN_PATH);
      router.refresh();
    }
  }, [router]);

  const setUserFromVerify = useCallback((sessionUser: ApiUserPublic) => {
    if (isAuthorizedAdminSession(sessionUser)) {
      setUser(sessionUser);
      setSessionUnavailable(false);
      setAccessDenied(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: isAuthorizedAdminSession(user),
      sessionUnavailable,
      accessDenied,
      refreshUser,
      logout,
      setUserFromVerify,
    }),
    [
      user,
      isLoading,
      sessionUnavailable,
      accessDenied,
      refreshUser,
      logout,
      setUserFromVerify,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé dans AuthProvider.");
  }
  return ctx;
}