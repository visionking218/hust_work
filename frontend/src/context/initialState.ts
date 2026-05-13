import type { AuthUser, InitState } from "../@types";
import {
  LOCAL_STORAGE_AUTH_KEY,
  LOCAL_STORAGE_USER_ROLE_KEY,
} from "../lib/localStorageKeys";

const defaults: InitState = {
  tutors: [],
  currentTutorId: "",
  currentTutorInfo: null,
  isLoading: false,
  error: null,
  userRole: "unset",
  authToken: null,
  authUser: null,
};

/** Hydrate from `localStorage` once at app boot (client only). */
export function getInitialState(): InitState {
  if (typeof window === "undefined") {
    return defaults;
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as {
        token?: unknown;
        user?: unknown;
      };
      const token =
        typeof parsed.token === "string" ? parsed.token : undefined;
      const u = parsed.user as AuthUser | undefined;
      if (
        token &&
        u &&
        typeof u.userId === "string" &&
        typeof u.email === "string" &&
        (u.role === "student" || u.role === "tutor") &&
        typeof u.ispaid === "boolean"
      ) {
        return {
          ...defaults,
          authToken: token,
          authUser: u,
          userRole: u.role,
        };
      }
    }
  } catch {
    /* ignore */
  }

  try {
    const role = localStorage.getItem(LOCAL_STORAGE_USER_ROLE_KEY);
    if (role === "tutor" || role === "student") {
      return { ...defaults, userRole: role };
    }
  } catch {
    /* ignore */
  }

  return defaults;
}
