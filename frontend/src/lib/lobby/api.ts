/**
 * Lobby API client — wraps all /api/lobby/* endpoints.
 * Uses the shared `request` helper from lib/api.ts and injects the auth token.
 */

import { request, API_BASE_URL } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type {
  GameRoom,
  PlayerSlot,
  GameMode,
  RoomPrivacy,
  AIDifficulty,
  PlayerRole,
} from "./types";

// ── Response shape from the backend ───────────────────────────────────────
// (mirrors backend/src/types/lobby.types.ts → RoomResponse)

export interface RoomResponse {
  id:            string;
  name:          string;
  host_user_id:  string;
  mode:          GameMode;
  privacy:       RoomPrivacy;
  ai_difficulty: AIDifficulty;
  status:        "waiting" | "in_progress" | "finished";
  founders:      PlayerSlotResponse[];
  investors:     PlayerSlotResponse[];
  created_at:    string;
}

interface PlayerSlotResponse {
  kind:     "you" | "human" | "ai" | "open";
  avatarId?: number;
  name?:    string;
  status?:  "online" | "away";
  userId?:  string;
  profileImageUrl?: string;   // backend returns a relative serve path
}

// ── Normalise backend response → frontend GameRoom ─────────────────────────

function toGameRoom(r: RoomResponse): GameRoom {
  function toSlot(s: PlayerSlotResponse): PlayerSlot {
    if (s.kind === "open") return { kind: "open" };
    if (s.kind === "ai")   return { kind: "ai",    avatarId: s.avatarId, name: s.name };
    // "you" and "human" both map to human slot shape; kind passes through.
    // Resolve the relative profile-image path to an absolute URL for <img src>.
    return {
      kind: s.kind as "you" | "human",
      avatarId: s.avatarId,
      name: s.name,
      status: s.status,
      profileImageUrl: s.profileImageUrl ? `${API_BASE_URL}${s.profileImageUrl}` : undefined,
    };
  }

  return {
    id:       r.id,
    name:     r.name,
    mode:     r.mode,
    privacy:  r.privacy,
    founders: r.founders.map(toSlot),
    investors: r.investors.map(toSlot),
  };
}

// ── Request bodies ─────────────────────────────────────────────────────────

export interface CreateRoomBody {
  name:          string;
  mode:          GameMode;
  privacy:       RoomPrivacy;
  password?:     string;
  ai_difficulty: AIDifficulty;
  max_founders:  number;
  max_investors: number;
  ai_founders:   number;
  ai_investors:  number;
  avatar_id:     number;
  display_name:  string;
}

export interface JoinRoomBody {
  role:         PlayerRole;
  avatar_id:    number;
  display_name: string;
}

// ── API functions ──────────────────────────────────────────────────────────

function token() {
  return getToken() ?? "";
}

/** GET /api/lobby — list all waiting rooms */
export async function fetchRooms(): Promise<GameRoom[]> {
  const rooms = await request<RoomResponse[]>("/api/lobby", { token: token() });
  return rooms.map(toGameRoom);
}

/** GET /api/lobby/:id — get a single room */
export async function fetchRoom(id: string): Promise<GameRoom & { raw: RoomResponse }> {
  const raw = await request<RoomResponse>(`/api/lobby/${id}`, { token: token() });
  return { ...toGameRoom(raw), raw };
}

/** POST /api/lobby/create — create a new room */
export async function createRoom(body: CreateRoomBody): Promise<GameRoom> {
  const raw = await request<RoomResponse>("/api/lobby/create", {
    method: "POST",
    body:   JSON.stringify(body),
    token:  token(),
  });
  return toGameRoom(raw);
}

/** POST /api/lobby/:id/join — join an open room */
export async function joinRoom(id: string, body: JoinRoomBody): Promise<GameRoom> {
  const raw = await request<RoomResponse>(`/api/lobby/${id}/join`, {
    method: "POST",
    body:   JSON.stringify(body),
    token:  token(),
  });
  return toGameRoom(raw);
}

/** POST /api/lobby/:id/join-password — join a password-protected room */
export async function joinRoomWithPassword(
  id: string,
  body: JoinRoomBody & { password: string }
): Promise<GameRoom> {
  const raw = await request<RoomResponse>(`/api/lobby/${id}/join-password`, {
    method: "POST",
    body:   JSON.stringify(body),
    token:  token(),
  });
  return toGameRoom(raw);
}
