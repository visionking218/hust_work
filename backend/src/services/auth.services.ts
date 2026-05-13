import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Types } from "mongoose";
import { USER_ROLES, User } from "../models/users.model";

const SALT_ROUNDS = 10;
type UserRole = (typeof USER_ROLES)[number];

export type PublicUser = {
  userId: string;
  email: string;
  role: UserRole;
  ispaid: boolean;
};

type UserWithSecret = {
  _id: Types.ObjectId;
  email: string;
  role: UserRole;
  ispaid: boolean;
  passwordHash: string;
};

export class AuthService {
  private jwtSecret(): string {
    const s = process.env.JWT_SECRET?.trim();
    if (!s) {
      console.warn(
        "[auth] JWT_SECRET is not set; using an insecure dev default. Set JWT_SECRET in production.",
      );
      return "hustwork-dev-jwt-secret-replace-me";
    }
    return s;
  }

  signToken(userId: string, role: UserRole): string {
    return jwt.sign({ sub: userId, role }, this.jwtSecret(), { expiresIn: "7d" });
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toPublicUser(doc: {
    _id: Types.ObjectId | string;
    email: string;
    role: UserRole;
    ispaid?: boolean;
  }): PublicUser {
    return {
      userId: String(doc._id),
      email: doc.email,
      role: doc.role,
      ispaid: Boolean(doc.ispaid),
    };
  }

  async register(
    email: string,
    password: string,
    role: UserRole,
  ): Promise<PublicUser> {
    const normalized = this.normalizeEmail(email);
    if (normalized.length === 0) {
      throw new Error("email is required");
    }
    if (typeof password !== "string" || password.length === 0) {
      throw new Error("password is required");
    }

    const taken = await User.findOne({ email: normalized });
    if (taken !== null) {
      throw new Error("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const created = await User.create({
      email: normalized,
      passwordHash,
      role,
    });
    const plain = created.toObject({ versionKey: false });
    return this.toPublicUser({
      _id: plain._id,
      email: String(plain.email),
      role: plain.role as UserRole,
      ispaid: Boolean(plain.ispaid),
    });
  }

  async login(email: string, password: string): Promise<PublicUser | null> {
    const normalized = this.normalizeEmail(email);
    if (normalized.length === 0) {
      throw new Error("email is required");
    }
    if (typeof password !== "string" || password.length === 0) {
      throw new Error("password is required");
    }

    const user = await User.findOne({ email: normalized })
      .select("+passwordHash")
      .lean<UserWithSecret | null>();

    if (!user) {
      return null;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return null;
    }
    return this.toPublicUser(user);
  }

  async getPublicUserById(userId: string): Promise<PublicUser | null> {
    if (typeof userId !== "string" || userId.trim().length === 0) {
      throw new Error("userId is required");
    }
    const user = await User.findById(userId).lean<{
      _id: Types.ObjectId;
      email: string;
      role: UserRole;
      ispaid?: boolean;
    } | null>();
    if (!user) return null;
    return this.toPublicUser(user);
  }
}
