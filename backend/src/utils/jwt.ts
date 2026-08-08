import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/auth.types";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set.");
  return secret;
}

/** Sign and return a JWT for the given payload. */
export function signToken(payload: JwtPayload): string {
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"];
  return jwt.sign(payload, getSecret(), { expiresIn });
}

/** Verify and decode a JWT. Throws if invalid or expired. */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getSecret()) as JwtPayload;
}
