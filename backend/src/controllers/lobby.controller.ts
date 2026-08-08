import { Response, NextFunction } from "express";
import {
  listRooms,
  getRoom,
  createRoom,
  joinRoom,
  joinRoomWithPassword,
} from "../services/lobby.service";
import { AuthRequest } from "../types/lobby.types";

// ── GET /api/lobby ─────────────────────────────────────────────────────────

export async function listRoomsController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rooms = await listRooms(req.user?.sub);
    res.json({ success: true, data: rooms });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/lobby/:id ─────────────────────────────────────────────────────

export async function getRoomController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const room = await getRoom(req.params.id, req.user?.sub);
    res.json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/lobby/create ─────────────────────────────────────────────────

export async function createRoomController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.sub;
    const room = await createRoom(userId, req.body);
    res.status(201).json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/lobby/:id/join ───────────────────────────────────────────────

export async function joinRoomController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.sub;
    const room = await joinRoom(req.params.id, userId, req.body);
    res.json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/lobby/:id/join-password ─────────────────────────────────────

export async function joinWithPasswordController(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.sub;
    const room = await joinRoomWithPassword(req.params.id, userId, req.body);
    res.json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
}
