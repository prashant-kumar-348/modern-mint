import { Pool, PoolClient } from "pg";
import crypto from "crypto";

// Use standard PG pool if DATABASE_URL is configured
const hasUrl = !!process.env.DATABASE_URL;

interface DbUser {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  profile_image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

interface DbRoom {
  id: string;
  name: string;
  host_user_id: string;
  mode: string;
  privacy: string;
  password_hash: string | null;
  ai_difficulty: string;
  max_founders: number;
  max_investors: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}

interface DbRoomPlayer {
  id: string;
  room_id: string;
  user_id: string | null;
  role: string;
  avatar_id: number;
  display_name: string;
  is_ai: boolean;
  joined_at: Date;
}

// Global in-memory storage for developer convenience when PostgreSQL is not installed/running
const users: DbUser[] = [];
const rooms: DbRoom[] = [];
const roomPlayers: DbRoomPlayer[] = [];

// Seed default users and a room to allow instant login and join
import { hashPassword } from "../utils/hash";
async function seedDefaultUserAndRoom() {
  const userHp = await hashPassword("Password123");
  const roomHp = await hashPassword("1234");
  
  const hostUserId = "d3b07384-d113-4ec6-a558-7c3e1e20cf3d"; // priya
  const gmUserId = "c2a96291-d113-4ec6-a558-7c3e1e20cf3d";   // gamemaster
  const roomId = "e5c18402-d113-4ec6-a558-7c3e1e20cf3d";     // room

  // Priya (Player)
  users.push({
    id: hostUserId,
    username: "priya",
    email: "priya@example.com",
    password_hash: userHp,
    profile_image_url: null,
    created_at: new Date(),
    updated_at: new Date()
  });

  // GameMaster (Host of Default Arena)
  users.push({
    id: gmUserId,
    username: "GameMaster",
    email: "gamemaster@example.com",
    password_hash: userHp,
    profile_image_url: null,
    created_at: new Date(),
    updated_at: new Date()
  });

  // Default Room
  rooms.push({
    id: roomId,
    name: "Default Arena",
    host_user_id: gmUserId,
    mode: "short",
    privacy: "password",
    password_hash: roomHp,
    ai_difficulty: "medium",
    max_founders: 4,
    max_investors: 2,
    status: "waiting",
    created_at: new Date(),
    updated_at: new Date()
  });

  // Add Host to Room Players
  roomPlayers.push({
    id: crypto.randomUUID(),
    room_id: roomId,
    user_id: gmUserId,
    role: "founder",
    avatar_id: 1,
    display_name: "GameMaster",
    is_ai: false,
    joined_at: new Date()
  });

  // Add an AI Bot to show activity
  roomPlayers.push({
    id: crypto.randomUUID(),
    room_id: roomId,
    user_id: null,
    role: "founder",
    avatar_id: 2,
    display_name: "AI Bot 1",
    is_ai: true,
    joined_at: new Date()
  });
}
seedDefaultUserAndRoom().catch(console.error);

// Helper function to normalize SQL query strings for robust pattern matching
function cleanSql(sql: string): string {
  return sql
    .replace(/\s+/g, " ")
    .replace(/\s*=\s*/g, "=")
    .replace(/\s*,\s*/g, ",")
    .replace(/\s*\(\s*/g, "(")
    .replace(/\s*\)\s*/g, ")")
    .trim()
    .toUpperCase();
}

// SQL query processor for the in-memory database
function processInMemoryQuery(sql: string, params: any[] = []): any {
  const norm = cleanSql(sql);

  if (norm.includes("SELECT NOW()")) {
    return { rows: [{ now: new Date() }], rowCount: 1 };
  }

  // Schema creation & migrations
  if (
    norm.includes("BEGIN") ||
    norm.includes("COMMIT") ||
    norm.includes("ROLLBACK") ||
    norm.includes("CREATE TABLE") ||
    norm.includes("CREATE INDEX") ||
    norm.includes("ALTER TABLE")
  ) {
    return { rows: [], rowCount: 0 };
  }

  // Signup email/username check
  if (norm.includes("SELECT 'EMAIL' AS FIELD") && norm.includes("UNION ALL")) {
    const email = (params[0] || "").toLowerCase();
    const username = params[1] || "";
    const emailExists = users.some(u => u.email.toLowerCase() === email);
    if (emailExists) {
      return { rows: [{ field: "email" }], rowCount: 1 };
    }
    const usernameExists = users.some(u => u.username === username);
    if (usernameExists) {
      return { rows: [{ field: "username" }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // Create user
  if (norm.includes("INSERT INTO USERS")) {
    const username = params[0];
    const email = (params[1] || "").toLowerCase();
    const password_hash = params[2];
    const newUser: DbUser = {
      id: crypto.randomUUID(),
      username,
      email,
      password_hash,
      profile_image_url: null,
      created_at: new Date(),
      updated_at: new Date()
    };
    users.push(newUser);
    return { rows: [newUser], rowCount: 1 };
  }

  // Get user by email
  if (norm.includes("FROM USERS WHERE EMAIL=")) {
    const email = (params[0] || "").toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === email);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  // Update profile image
  if (norm.includes("UPDATE USERS SET PROFILE_IMAGE_URL=")) {
    const image = params[0];
    const id = params[1];
    const user = users.find(u => u.id === id);
    if (user) {
      user.profile_image_url = image;
      user.updated_at = new Date();
      return { rows: [{ updated_at: user.updated_at }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // Get profile image URL
  if (norm.includes("SELECT PROFILE_IMAGE_URL FROM USERS")) {
    const id = params[0];
    const user = users.find(u => u.id === id);
    return {
      rows: user ? [{ profile_image_url: user.profile_image_url }] : [],
      rowCount: user ? 1 : 0
    };
  }

  // List rooms (waiting list)
  if (norm.includes("SELECT * FROM ROOMS WHERE STATUS='WAITING'")) {
    const waiting = rooms
      .filter(r => r.status === "waiting")
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, 50);
    return { rows: waiting, rowCount: waiting.length };
  }

  // Join Room Player lookup with Users table (LEFT JOIN)
  if (norm.includes("FROM ROOM_PLAYERS RP LEFT JOIN USERS U")) {
    let filtered: DbRoomPlayer[] = [];
    if (norm.includes("ANY($1::UUID[])")) {
      const roomIds = params[0] || [];
      filtered = roomPlayers.filter(rp => roomIds.includes(rp.room_id));
    } else if (norm.includes("RP.ROOM_ID=$1")) {
      const roomId = params[0];
      filtered = roomPlayers.filter(rp => rp.room_id === roomId);
    } else {
      filtered = [...roomPlayers];
    }

    const joined = filtered.map(rp => {
      const user = rp.user_id ? users.find(u => u.id === rp.user_id) : null;
      return {
        ...rp,
        profile_image_url: user ? user.profile_image_url : null,
        user_updated_at: user ? user.updated_at : null
      };
    }).sort((a, b) => a.joined_at.getTime() - b.joined_at.getTime());

    return { rows: joined, rowCount: joined.length };
  }

  // Get single room details
  if (norm.includes("FROM ROOMS WHERE ID=$1")) {
    const roomId = params[0];
    const room = rooms.find(r => r.id === roomId);
    return { rows: room ? [room] : [], rowCount: room ? 1 : 0 };
  }

  // Insert room
  if (norm.includes("INSERT INTO ROOMS")) {
    const name = params[0];
    const host_user_id = params[1];
    const mode = params[2];
    const privacy = params[3];
    const password_hash = params[4];
    const ai_difficulty = params[5];
    const max_founders = params[6];
    const max_investors = params[7];

    const newRoom: DbRoom = {
      id: crypto.randomUUID(),
      name,
      host_user_id,
      mode,
      privacy,
      password_hash,
      ai_difficulty,
      max_founders,
      max_investors,
      status: "waiting",
      created_at: new Date(),
      updated_at: new Date()
    };
    rooms.push(newRoom);
    return { rows: [newRoom], rowCount: 1 };
  }

  // Insert room player
  if (norm.includes("INSERT INTO ROOM_PLAYERS")) {
    const room_id = params[0];
    let user_id: string | null = null;
    let role = "";
    let avatar_id = 1;
    let display_name = "";
    let is_ai = false;

    if (norm.includes("NULL,'FOUNDER',1,$2,TRUE")) {
      user_id = null;
      role = "founder";
      avatar_id = 1;
      display_name = params[1];
      is_ai = true;
    } else if (norm.includes("NULL,'INVESTOR',1,$2,TRUE")) {
      user_id = null;
      role = "investor";
      avatar_id = 1;
      display_name = params[1];
      is_ai = true;
    } else if (norm.includes("'FOUNDER',$3,$4,FALSE")) {
      user_id = params[1];
      role = "founder";
      avatar_id = params[2];
      display_name = params[3];
      is_ai = false;
    } else {
      // General match: (room_id, user_id, role, avatar_id, display_name, is_ai) VALUES ($1,$2,$3,$4,$5,false)
      user_id = params[1];
      role = params[2];
      avatar_id = params[3];
      display_name = params[4];
      is_ai = false;
    }

    const newPlayer: DbRoomPlayer = {
      id: crypto.randomUUID(),
      room_id,
      user_id,
      role,
      avatar_id,
      display_name,
      is_ai,
      joined_at: new Date()
    };
    roomPlayers.push(newPlayer);
    return { rows: [], rowCount: 0 };
  }

  // Already in room player check
  if (norm.includes("FROM ROOM_PLAYERS WHERE ROOM_ID=$1 AND USER_ID=$2")) {
    const roomId = params[0];
    const userId = params[1];
    const rp = roomPlayers.find(p => p.room_id === roomId && p.user_id === userId);
    return { rows: rp ? [rp] : [], rowCount: rp ? 1 : 0 };
  }

  // Count human players in room in role
  if (norm.includes("FROM ROOM_PLAYERS WHERE ROOM_ID=$1 AND ROLE=$2 AND IS_AI=FALSE")) {
    const roomId = params[0];
    const role = params[1];
    const count = roomPlayers.filter(
      p => p.room_id === roomId && p.role === role && !p.is_ai
    ).length;
    return { rows: [{ count: String(count) }], rowCount: 1 };
  }

  // Check password hash and privacy
  if (norm.includes("SELECT PASSWORD_HASH, PRIVACY FROM ROOMS")) {
    const roomId = params[0];
    const room = rooms.find(r => r.id === roomId && r.status === "waiting");
    return {
      rows: room ? [{ password_hash: room.password_hash, privacy: room.privacy }] : [],
      rowCount: room ? 1 : 0
    };
  }

  console.warn(`[MockDB] Unsupported SQL query: ${sql}`);
  return { rows: [], rowCount: 0 };
}

// In-Memory Database Pool mock
class InMemoryPool {
  async query(sql: string, params: any[] = []): Promise<any> {
    return processInMemoryQuery(sql, params);
  }

  async connect(): Promise<any> {
    const client = {
      query: async (sql: string, params: any[] = []) => {
        return processInMemoryQuery(sql, params);
      },
      release: () => {}
    };
    return client;
  }
}

// Export either real Pool or Mock In-Memory database Pool
export const pool = hasUrl
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    })
  : (new InMemoryPool() as unknown as Pool);

export default pool;
