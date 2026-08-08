import { PoolClient } from "pg";
import pool from "../config/database";
import { hashPassword, verifyPassword } from "../utils/hash";
import {
  RoomRow,
  RoomPlayerJoinedRow,
  RoomResponse,
  PlayerSlotResponse,
  CreateRoomBody,
  JoinRoomBody,
  JoinWithPasswordBody,
  PlayerRole,
  SlotKind,
} from "../types/lobby.types";

// room_players joined with the player's user row (for profile images).
// Reused by every read so list/get/join/create responses are consistent.
const PLAYER_SELECT = `
  SELECT rp.*, u.profile_image_url, u.updated_at AS user_updated_at
  FROM room_players rp
  LEFT JOIN users u ON u.id = rp.user_id
`;

// ── Helper: assemble a RoomResponse from raw DB rows ──────────────────────

function assembleRoom(
  room: RoomRow,
  players: RoomPlayerJoinedRow[],
  currentUserId?: string
): RoomResponse {
  function buildSlots(role: PlayerRole, max: number): PlayerSlotResponse[] {
    const rolePlayers = players
      .filter((p) => p.role === role)
      .sort((a, b) => a.joined_at.getTime() - b.joined_at.getTime());

    const slots: PlayerSlotResponse[] = rolePlayers.map((p) => {
      const kind: SlotKind = p.is_ai
        ? "ai"
        : p.user_id === currentUserId
        ? "you"
        : "human";

      // Display-only: human players with a saved photo get a versioned avatar URL.
      // No photo (or AI) → omit it so the frontend falls back to the avatar_id system.
      const profileImageUrl =
        !p.is_ai && p.user_id && p.profile_image_url
          ? `/api/users/${p.user_id}/avatar?v=${p.user_updated_at ? p.user_updated_at.getTime() : 0}`
          : undefined;

      return {
        kind,
        avatarId: p.avatar_id,
        name:     p.display_name,
        status:   p.is_ai ? undefined : ("online" as const),
        userId:   p.user_id ?? undefined,
        profileImageUrl,
      };
    });

    while (slots.length < max) {
      slots.push({ kind: "open" });
    }

    return slots;
  }

  return {
    id:            room.id,
    name:          room.name,
    host_user_id:  room.host_user_id,
    mode:          room.mode,
    privacy:       room.privacy,
    ai_difficulty: room.ai_difficulty,
    status:        room.status,
    founders:      buildSlots("founder",  room.max_founders),
    investors:     buildSlots("investor", room.max_investors),
    created_at:    room.created_at.toISOString(),
  };
}

// ── listRooms ──────────────────────────────────────────────────────────────

export async function listRooms(currentUserId?: string): Promise<RoomResponse[]> {
  // Only show waiting rooms, newest first, cap at 50
  const roomsResult = await pool.query<RoomRow>(
    `SELECT * FROM rooms
     WHERE status = 'waiting'
     ORDER BY created_at DESC
     LIMIT 50`
  );
  const rooms = roomsResult.rows;
  if (rooms.length === 0) return [];

  const roomIds = rooms.map((r) => r.id);
  const playersResult = await pool.query<RoomPlayerJoinedRow>(
    `${PLAYER_SELECT} WHERE rp.room_id = ANY($1::uuid[]) ORDER BY rp.joined_at ASC`,
    [roomIds]
  );
  const players = playersResult.rows;

  return rooms.map((room) => {
    const roomPlayers = players.filter((p) => p.room_id === room.id);
    return assembleRoom(room, roomPlayers, currentUserId);
  });
}

// ── getRoom ────────────────────────────────────────────────────────────────

export async function getRoom(
  roomId: string,
  currentUserId?: string
): Promise<RoomResponse> {
  const roomResult = await pool.query<RoomRow>(
    `SELECT * FROM rooms WHERE id = $1 LIMIT 1`,
    [roomId]
  );
  if (roomResult.rowCount === 0) {
    throw { status: 404, message: "Room not found." };
  }
  const room = roomResult.rows[0];

  const playersResult = await pool.query<RoomPlayerJoinedRow>(
    `${PLAYER_SELECT} WHERE rp.room_id = $1 ORDER BY rp.joined_at ASC`,
    [roomId]
  );

  return assembleRoom(room, playersResult.rows, currentUserId);
}

// ── createRoom ─────────────────────────────────────────────────────────────

export async function createRoom(
  hostUserId: string,
  body: CreateRoomBody
): Promise<RoomResponse> {
  const {
    name,
    mode,
    privacy,
    password,
    ai_difficulty,
    max_founders,
    max_investors,
    ai_founders,
    ai_investors,
    avatar_id,
    display_name,
  } = body;

  // Validation
  if (!name || name.trim().length === 0) {
    throw { status: 400, message: "Room name is required." };
  }
  if (name.trim().length > 80) {
    throw { status: 400, message: "Room name must be 80 characters or fewer." };
  }
  if (!["60mins", "short", "full"].includes(mode)) {
    throw { status: 400, message: "Invalid game mode." };
  }
  if (!["open", "closed", "password"].includes(privacy)) {
    throw { status: 400, message: "Invalid privacy setting." };
  }
  if (privacy === "password" && (!password || password.trim().length === 0)) {
    throw { status: 400, message: "Password is required for password-protected rooms." };
  }
  if (max_founders < 1 || max_founders > 4) {
    throw { status: 400, message: "max_founders must be between 1 and 4." };
  }
  if (max_investors < 0 || max_investors > 2) {
    throw { status: 400, message: "max_investors must be between 0 and 2." };
  }
  if (!display_name || display_name.trim().length === 0) {
    throw { status: 400, message: "display_name is required." };
  }

  const passwordHash = privacy === "password" && password
    ? await hashPassword(password)
    : null;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insert room
    const roomResult = await client.query<RoomRow>(
      `INSERT INTO rooms
         (name, host_user_id, mode, privacy, password_hash, ai_difficulty,
          max_founders, max_investors, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'waiting')
       RETURNING *`,
      [
        name.trim(),
        hostUserId,
        mode,
        privacy,
        passwordHash,
        ai_difficulty,
        max_founders,
        max_investors,
      ]
    );
    const room = roomResult.rows[0];

    // Creator auto-joins as founder
    await client.query(
      `INSERT INTO room_players
         (room_id, user_id, role, avatar_id, display_name, is_ai)
       VALUES ($1,$2,'founder',$3,$4,false)`,
      [room.id, hostUserId, avatar_id, display_name.trim()]
    );

    // Pre-fill AI founder slots
    const safeAiFounders = Math.min(
      Math.max(0, ai_founders ?? 0),
      max_founders - 1  // reserve at least 1 for the host
    );
    for (let i = 0; i < safeAiFounders; i++) {
      await client.query(
        `INSERT INTO room_players
           (room_id, user_id, role, avatar_id, display_name, is_ai)
         VALUES ($1,NULL,'founder',1,$2,true)`,
        [room.id, `AI Bot ${i + 1}`]
      );
    }

    // Pre-fill AI investor slots
    const safeAiInvestors = Math.min(
      Math.max(0, ai_investors ?? 0),
      max_investors
    );
    for (let i = 0; i < safeAiInvestors; i++) {
      await client.query(
        `INSERT INTO room_players
           (room_id, user_id, role, avatar_id, display_name, is_ai)
         VALUES ($1,NULL,'investor',1,$2,true)`,
        [room.id, `AI Investor ${i + 1}`]
      );
    }

    await client.query("COMMIT");

    // Fetch all players for the response
    const playersResult = await pool.query<RoomPlayerJoinedRow>(
      `${PLAYER_SELECT} WHERE rp.room_id = $1 ORDER BY rp.joined_at ASC`,
      [room.id]
    );

    return assembleRoom(room, playersResult.rows, hostUserId);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ── Shared insert helper (called inside an open transaction) ──────────────

async function insertPlayer(
  client: PoolClient,
  roomId: string,
  userId: string,
  room: RoomRow,
  role: PlayerRole,
  avatar_id: number,
  display_name: string
): Promise<void> {
  // Check if already in the room
  const alreadyIn = await client.query(
    `SELECT id FROM room_players WHERE room_id=$1 AND user_id=$2 LIMIT 1`,
    [roomId, userId]
  );
  if (alreadyIn.rowCount && alreadyIn.rowCount > 0) {
    throw { status: 409, message: "You are already in this room." };
  }

  // Count current human players in the requested role
  const countResult = await client.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM room_players
     WHERE room_id=$1 AND role=$2 AND is_ai=false`,
    [roomId, role]
  );
  const currentCount = parseInt(countResult.rows[0].count, 10);
  const max = role === "founder" ? room.max_founders : room.max_investors;

  if (currentCount >= max) {
    throw { status: 409, message: `No ${role} slots available.` };
  }

  // Insert player
  await client.query(
    `INSERT INTO room_players
       (room_id, user_id, role, avatar_id, display_name, is_ai)
     VALUES ($1,$2,$3,$4,$5,false)`,
    [roomId, userId, role, avatar_id, display_name.trim()]
  );
}

// ── joinRoom (open rooms only) ────────────────────────────────────────────

export async function joinRoom(
  roomId: string,
  userId: string,
  body: JoinRoomBody
): Promise<RoomResponse> {
  const { role, avatar_id, display_name } = body;

  if (!["founder", "investor"].includes(role)) {
    throw { status: 400, message: "Role must be founder or investor." };
  }
  if (!display_name || display_name.trim().length === 0) {
    throw { status: 400, message: "display_name is required." };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock the room row to prevent concurrent joins racing for the last slot
    const roomResult = await client.query<RoomRow>(
      `SELECT * FROM rooms WHERE id = $1 AND status = 'waiting' FOR UPDATE`,
      [roomId]
    );
    if (roomResult.rowCount === 0) {
      throw { status: 404, message: "Room not found or no longer accepting players." };
    }
    const room = roomResult.rows[0];

    // Only allow joining open rooms through this endpoint
    if (room.privacy === "closed") {
      throw { status: 403, message: "This room is closed." };
    }
    if (room.privacy === "password") {
      throw { status: 403, message: "This room requires a password." };
    }

    await insertPlayer(client, roomId, userId, room, role, avatar_id, display_name);

    await client.query("COMMIT");

    // Return fresh room state
    const playersResult = await pool.query<RoomPlayerJoinedRow>(
      `${PLAYER_SELECT} WHERE rp.room_id=$1 ORDER BY rp.joined_at ASC`,
      [roomId]
    );
    return assembleRoom(room, playersResult.rows, userId);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ── joinRoomWithPassword ───────────────────────────────────────────────────

export async function joinRoomWithPassword(
  roomId: string,
  userId: string,
  body: JoinWithPasswordBody
): Promise<RoomResponse> {
  const { password, role, avatar_id, display_name } = body;

  if (!["founder", "investor"].includes(role)) {
    throw { status: 400, message: "Role must be founder or investor." };
  }
  if (!display_name || display_name.trim().length === 0) {
    throw { status: 400, message: "display_name is required." };
  }
  if (!password) {
    throw { status: 400, message: "Password is required." };
  }

  // Fetch room to verify password before acquiring the lock
  const roomCheck = await pool.query<Pick<RoomRow, "password_hash" | "privacy">>(
    `SELECT password_hash, privacy FROM rooms WHERE id=$1 AND status='waiting' LIMIT 1`,
    [roomId]
  );
  if (roomCheck.rowCount === 0) {
    throw { status: 404, message: "Room not found or no longer accepting players." };
  }

  const { privacy, password_hash } = roomCheck.rows[0];
  if (privacy !== "password") {
    throw { status: 400, message: "This room does not require a password." };
  }
  if (!password_hash) {
    throw { status: 500, message: "Room password configuration error." };
  }

  const valid = await verifyPassword(password, password_hash);
  if (!valid) {
    throw { status: 401, message: "Incorrect room password." };
  }

  // Now join under a transaction with SELECT FOR UPDATE
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const roomResult = await client.query<RoomRow>(
      `SELECT * FROM rooms WHERE id=$1 AND status='waiting' FOR UPDATE`,
      [roomId]
    );
    if (roomResult.rowCount === 0) {
      throw { status: 404, message: "Room no longer accepting players." };
    }
    const room = roomResult.rows[0];

    await insertPlayer(client, roomId, userId, room, role, avatar_id, display_name);

    await client.query("COMMIT");

    const playersResult = await pool.query<RoomPlayerJoinedRow>(
      `${PLAYER_SELECT} WHERE rp.room_id=$1 ORDER BY rp.joined_at ASC`,
      [roomId]
    );
    return assembleRoom(room, playersResult.rows, userId);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
