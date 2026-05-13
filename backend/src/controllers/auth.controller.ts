import type { Request, Response } from "express";
import { AuthService } from "../services/auth.services";
import { USER_ROLES } from "../models/users.model";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function looksLikeEmail(value: string): boolean {
  const t = value.trim();
  return t.length <= 320 && t.includes("@") && !/\s/.test(t);
}

function isUserRole(value: unknown): value is (typeof USER_ROLES)[number] {
  return typeof value === "string" && (USER_ROLES as readonly string[]).includes(value);
}

function toSingleParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(req: Request, res: Response) {
    try {
      const { email, password, role } = req.body as Record<string, unknown>;
      if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
        return res.status(400).json({ message: "email and password are required" });
      }
      if (!looksLikeEmail(email)) {
        return res.status(400).json({ message: "invalid email" });
      }
      if (!isUserRole(role)) {
        return res.status(400).json({ message: "role must be \"student\" or \"tutor\"" });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: "password must be at least 8 characters" });
      }

      const user = await this.authService.register(email, password, role);
      const token = this.authService.signToken(user.userId, user.role);
      return res.status(201).json({ token, user });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Email already registered") {
          return res.status(409).json({ message: "An account with this email already exists" });
        }
        if (error.message === "email is required" || error.message === "password is required") {
          return res.status(400).json({ message: error.message });
        }
      }
      return res.status(500).json({ message: "Registration failed" });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body as Record<string, unknown>;
      if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
        return res.status(400).json({ message: "email and password are required" });
      }
      if (!looksLikeEmail(email)) {
        return res.status(400).json({ message: "invalid email" });
      }

      const user = await this.authService.login(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = this.authService.signToken(user.userId, user.role);
      return res.status(200).json({ token, user });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "email is required" || error.message === "password is required") {
          return res.status(400).json({ message: error.message });
        }
      }
      return res.status(500).json({ message: "Login failed" });
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = toSingleParam(req.params.userId);
      if (!userId || userId.trim().length === 0) {
        return res.status(400).json({ message: "userId is required" });
      }
      const user = await this.authService.getPublicUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json(user);
    } catch (error) {
      if (error instanceof Error && error.message === "userId is required") {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Failed to get user" });
    }
  }
}
