import { Router } from "express";
import { signupController, loginController } from "../controllers/auth.controller";

const router = Router();

// POST /api/auth/signup
router.post("/signup", signupController);

// POST /api/auth/login
router.post("/login", loginController);

export default router;
