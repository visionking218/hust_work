import { useCallback, useContext, useMemo } from "react";
import type { AuthUser } from "../@types";
import { GlobalContext } from "../context";
import {
  LOCAL_STORAGE_AUTH_KEY,
  LOCAL_STORAGE_USER_ROLE_KEY,
} from "../lib/localStorageKeys";
import * as authService from "../service/authService";

type UseAuthResult = {
  authUser: AuthUser | null;
  authToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    role: "student" | "tutor",
  ) => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
  logout: () => void;
};

function persistSession(token: string, user: AuthUser) {
  try {
    localStorage.setItem(
      LOCAL_STORAGE_AUTH_KEY,
      JSON.stringify({ token, user }),
    );
    localStorage.setItem(LOCAL_STORAGE_USER_ROLE_KEY, user.role);
  } catch {
    /* ignore */
  }
}

function clearSessionStorage() {
  try {
    localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
    localStorage.removeItem(LOCAL_STORAGE_USER_ROLE_KEY);
  } catch {
    /* ignore */
  }
}

/** Auth actions + session state from global context (backed by `localStorage`). */
export function useAuth(): UseAuthResult {
  const ctx = useContext(GlobalContext);

  const logout = useCallback(() => {
    clearSessionStorage();
    ctx?.update({
      authToken: null,
      authUser: null,
      userRole: "unset",
      error: null,
    });
  }, [ctx]);

  const login = useCallback(
    async (email: string, password: string) => {
      if (!ctx?.update) return;
      const { token, user } = await authService.login({ email, password });
      persistSession(token, user);
      ctx.update({
        authToken: token,
        authUser: user,
        userRole: user.role,
        error: null,
      });
    },
    [ctx],
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      role: "student" | "tutor",
    ) => {
      if (!ctx?.update) return;
      const { token, user } = await authService.register({
        email,
        password,
        role,
      });
      persistSession(token, user);
      ctx.update({
        authToken: token,
        authUser: user,
        userRole: user.role,
        error: null,
      });
    },
    [ctx],
  );

  const refreshCurrentUser = useCallback(async () => {
    if (!ctx?.update) return;
    const current = ctx.state.authUser;
    if (!current) return;
    const fresh = await authService.getCurrentUser(current.userId);
    if (ctx.state.authToken) {
      persistSession(ctx.state.authToken, fresh);
    }
    ctx.update({
      authUser: fresh,
      userRole: fresh.role,
    });
  }, [ctx]);

  const authUser = ctx?.state.authUser ?? null;
  const authToken = ctx?.state.authToken ?? null;

  return useMemo(
    () => ({
      authUser,
      authToken,
      isAuthenticated: authToken !== null && authUser !== null,
      login,
      register,
      refreshCurrentUser,
      logout,
    }),
    [authUser, authToken, login, register, refreshCurrentUser, logout],
  );
}
