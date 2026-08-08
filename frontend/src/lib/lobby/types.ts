// ── Lobby / Matchmaking types ─────────────────────────────────────────────

export type GameMode    = '60mins' | 'short' | 'full';
export type RoomPrivacy = 'open'   | 'closed' | 'password';
export type SlotKind    = 'you'    | 'human'  | 'ai' | 'open' | 'locked';
export type AIDifficulty =
  | 'easy' | 'medium' | 'hard' | 'unfair' | 'expert' | 'legendary';
export type PlayerRole = 'founder' | 'investor';
export type SlotDropdown = 'You' | 'Friend' | 'Open' | 'AI';

// ── Avatar palette (8 human + 1 bot) ─────────────────────────────────────

export interface AvatarDef {
  id:       number;
  initials: string;
  bg:       string;
  accent:   string;
  name:     string;
}

export const AVATARS: AvatarDef[] = [
  { id: 1, initials: 'AX', bg: '#0d2e2e', accent: '#1de9d6', name: 'Alex'    },
  { id: 2, initials: 'RK', bg: '#0d1a38', accent: '#4a7aff', name: 'Rohit'   },
  { id: 3, initials: 'ME', bg: '#220d38', accent: '#b06aff', name: 'Meera'   },
  { id: 4, initials: 'JD', bg: '#38200d', accent: '#ff7a2a', name: 'Jordan'  },
  { id: 5, initials: 'TL', bg: '#0d2a18', accent: '#2aff7a', name: 'Taylor'  },
  { id: 6, initials: 'SG', bg: '#2a200d', accent: '#d4a843', name: 'Sage'    },
  { id: 7, initials: 'QN', bg: '#380d1a', accent: '#ff4a8a', name: 'Quinn'   },
  { id: 8, initials: 'AV', bg: '#0d1a2e', accent: '#4acfff', name: 'Avery'   },
];

// Role-specific player avatars chosen on the join page (avatar_id → image URL).
// Founders use ids 1-4, investors use ids 5-6 — matching the join-page selector.
export const AVATAR_IMAGE_BY_ID: Record<number, string> = {
  1: 'https://modernmintgame.com/cdn/shop/files/01.png?v=1772091663&width=2000',
  2: 'https://modernmintgame.com/cdn/shop/files/03.png?v=1772091662&width=2000',
  3: 'https://modernmintgame.com/cdn/shop/files/02.png?v=1772091663&width=2000',
  4: 'https://modernmintgame.com/cdn/shop/files/05.png?v=1772091663&width=2000',
  5: 'https://modernmintgame.com/cdn/shop/files/04.png?v=1772091663&width=2000',
  6: 'https://modernmintgame.com/cdn/shop/files/06.png?v=1772091663&width=2000',
};

// ── Room / Slot data ──────────────────────────────────────────────────────

export interface PlayerSlot {
  kind:      SlotKind;
  avatarId?: number;   // 1-8
  name?:     string;
  status?:   'online' | 'away' | 'offline';
  profileImageUrl?: string;   // absolute URL to the player's profile image (display-only)
}

export interface GameRoom {
  id:        string;
  name:      string;
  mode:      GameMode;
  founders:  PlayerSlot[]; // always length 4
  investors: PlayerSlot[]; // always length 2
  privacy:   RoomPrivacy;
}

// ── Chat ─────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id:        string;
  user:      string;
  userColor: string;
  text:      string;
  time:      string;
}

// ── Create-game form state ────────────────────────────────────────────────

export interface CreateSlot {
  dropdown: SlotDropdown;
  avatarId: number;   // which avatar the player chose (only for You/Friend)
  name:     string;
}

export interface CreateGameState {
  founderSlots:  CreateSlot[];
  investorSlots: CreateSlot[];
  difficulty:    AIDifficulty;
  mode:          GameMode;
  privacy:       RoomPrivacy;
  password:      string;
}
