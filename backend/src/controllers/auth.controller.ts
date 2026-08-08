import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { SignupBody, LoginBody } from "../types/auth.types";

/**
 * POST /api/auth/signup
 * Body: { username, email, password }
 */
export async function signupController(
  req: Request<object, object, SignupBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.signup(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function loginController(
  req: Request<object, object, LoginBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
