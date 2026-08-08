// ── Domain types ──────────────────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  email: string;
  profile_image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

/** Full row returned from the DB — never sent to clients */
export interface UserRow extends User {
  password_hash: string;
}

// ── Request / response shapes ──────────────────────────────────────────────

export interface SignupBody {
  username: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ── JWT payload ────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string;   // user id
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

// ── Express augmentation ───────────────────────────────────────────────────
// Attach the decoded JWT to req.user inside protected routes.

import { Request } from "express";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
