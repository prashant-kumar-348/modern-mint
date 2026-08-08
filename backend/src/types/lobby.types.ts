import { Request } from "express";
import { JwtPayload } from "./auth.types";

// ── Enums ──────────────────────────────────────────────────────────────────

export type GameMode     = "60mins" | "short" | "full";
export type RoomPrivacy  = "open" | "closed" | "password";
export type PlayerRole   = "founder" | "investor";
export type AIDifficulty = "easy" | "medium" | "hard" | "unfair" | "expert" | "legendary";
export type RoomStatus   = "waiting" | "in_progress" | "finished";
export type SlotKind     = "you" | "human" | "ai" | "open";

// ── DB row shapes ──────────────────────────────────────────────────────────

export interface RoomRow {
  id:            string;
  name:          string;
  host_user_id:  string;
  mode:          GameMode;
  privacy:       RoomPrivacy;
  password_hash: string | null;
  ai_difficulty: AIDifficulty;
  max_founders:  number;
  max_investors: number;
  status:        RoomStatus;
  created_at:    Date;
  updated_at:    Date;
}

export interface RoomPlayerRow {
  id:           string;
  room_id:      string;
  user_id:      string | null;
  role:         PlayerRole;
  avatar_id:    number;
  display_name: string;
  is_ai:        boolean;
  joined_at:    Date;
}

/** room_players LEFT JOINed with users — adds the player's profile-image info. */
export interface RoomPlayerJoinedRow extends RoomPlayerRow {
  profile_image_url: string | null;
  user_updated_at:   Date | null;
}

// ── API request bodies ─────────────────────────────────────────────────────

export interface CreateRoomBody {
  name:          string;
  mode:          GameMode;
  privacy:       RoomPrivacy;
  password?:     string;
  ai_difficulty: AIDifficulty;
  max_founders:  number;   // 1–4
  max_investors: number;   // 0–2
  ai_founders:   number;   // how many AI founder slots to pre-fill
  ai_investors:  number;   // how many AI investor slots to pre-fill
  avatar_id:     number;
  display_name:  string;
}

export interface JoinRoomBody {
  role:         PlayerRole;
  avatar_id:    number;
  display_name: string;
}

export interface JoinWithPasswordBody extends JoinRoomBody {
  password: string;
}

// ── API response shapes ────────────────────────────────────────────────────

export interface PlayerSlotResponse {
  kind:     SlotKind;
  avatarId?: number;
  name?:    string;
  status?:  "online" | "away";
  userId?:  string;
  // Display-only: a small versioned URL to the player's profile image, when set.
  // Absent → the frontend falls back to the avatarId game-avatar system.
  profileImageUrl?: string;
}

export interface RoomResponse {
  id:            string;
  name:          string;
  host_user_id:  string;
  mode:          GameMode;
  privacy:       RoomPrivacy;
  ai_difficulty: AIDifficulty;
  status:        RoomStatus;
  founders:      PlayerSlotResponse[];
  investors:     PlayerSlotResponse[];
  created_at:    string;
}

// ── Augmented request ──────────────────────────────────────────────────────

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
