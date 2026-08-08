import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import {
  listRoomsController,
  getRoomController,
  createRoomController,
  joinRoomController,
  joinWithPasswordController,
} from "../controllers/lobby.controller";

const router = Router();

// All lobby routes require authentication
router.use(requireAuth);

// GET  /api/lobby          — list all waiting rooms
router.get("/", listRoomsController);

// POST /api/lobby/create   — create a new room (must be before /:id)
router.post("/create", createRoomController);

// GET  /api/lobby/:id      — get a single room
router.get("/:id", getRoomController);

// POST /api/lobby/:id/join          — join an open room
router.post("/:id/join", joinRoomController);

// POST /api/lobby/:id/join-password — join a password-protected room
router.post("/:id/join-password", joinWithPasswordController);

export default router;
