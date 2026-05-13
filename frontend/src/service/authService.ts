import type { AuthUser } from "../@types";
import { getApiBase } from "../lib/apiBase";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  role: "student" | "tutor";
};

export type AuthResponseBody = {
  token: string;
  user: AuthUser;
};

async function readApiError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const parsed = JSON.parse(text) as { message?: string };
    if (parsed.message && typeof parsed.message === "string") {
      return parsed.message;
    }
  } catch {
    /* not JSON */
  }
  return text || res.statusText || "Request failed";
}

/** POST `/api/auth/login` */
export async function login(payload: LoginPayload): Promise<AuthResponseBody> {
  const res = await fetch(`${getApiBase()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res));
  }
  return res.json() as Promise<AuthResponseBody>;
}

/** POST `/api/auth/register` */
export async function register(
  payload: RegisterPayload,
): Promise<AuthResponseBody> {
  const res = await fetch(`${getApiBase()}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await readApiError(res));
  }
  return res.json() as Promise<AuthResponseBody>;
}

/** GET `/api/auth/me/:userId` */
export async function getCurrentUser(userId: string): Promise<AuthUser> {
  const res = await fetch(
    `${getApiBase()}/api/auth/me/${encodeURIComponent(userId)}`,
  );
  if (!res.ok) {
    throw new Error(await readApiError(res));
  }
  return res.json() as Promise<AuthUser>;
}
