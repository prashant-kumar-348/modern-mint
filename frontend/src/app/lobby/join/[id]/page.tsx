"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PageBackground from "@/components/PageBackground";
import LobbyNavBar   from "@/components/lobby/LobbyNavBar";
import RoleCard       from "@/components/lobby/RoleCard";
import Button         from "@/components/ui/Button";
import { getUser }    from "@/lib/auth";
import { fetchRoom, joinRoom, joinRoomWithPassword } from "@/lib/lobby/api";
import { ApiError } from "@/lib/api";
import type { GameRoom, GameMode, PlayerRole } from "@/lib/lobby/types";
import { useAuthGuard } from "@/lib/useAuthGuard";

// ── Role-specific avatars (external Modern Mint artwork) ────────────────────
// Founders pick from 4 avatars, investors from 2. The numeric `id` is what we
// send to the backend as `avatar_id` (avatar-selection logic preserved).
const FOUNDER_AVATARS = [
  { id: 1, src: "https://modernmintgame.com/cdn/shop/files/01.png?v=1772091663&width=2000" },
  { id: 2, src: "https://modernmintgame.com/cdn/shop/files/03.png?v=1772091662&width=2000" },
  { id: 3, src: "https://modernmintgame.com/cdn/shop/files/02.png?v=1772091663&width=2000" },
  { id: 4, src: "https://modernmintgame.com/cdn/shop/files/05.png?v=1772091663&width=2000" },
];
const INVESTOR_AVATARS = [
  { id: 5, src: "https://modernmintgame.com/cdn/shop/files/04.png?v=1772091663&width=2000" },
  { id: 6, src: "https://modernmintgame.com/cdn/shop/files/06.png?v=1772091663&width=2000" },
];

function avatarsForRole(role: PlayerRole) {
  return role === "founder" ? FOUNDER_AVATARS : INVESTOR_AVATARS;
}

// ── Section label — gold pill ──────────────────────────────────────────────
function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full"
      style={{
        color: "var(--gold)",
        border: "1px solid rgba(222,186,98,0.45)",
        background: "rgba(10,40,22,0.45)",
      }}
    >
      {children}
    </span>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function JoinGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ready    = useAuthGuard();
  const { id }   = use(params);
  const router   = useRouter();

  const [room,      setRoom]      = useState<GameRoom | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [role,      setRole]      = useState<PlayerRole>("founder");
  const [name,      setName]      = useState("");
  const [avatarId,  setAvatarId]  = useState<number | null>(FOUNDER_AVATARS[0].id);
  const [starting,  setStarting]  = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Display name comes from the signed-in user (no visible input, per Figma).
  useEffect(() => {
    const user = getUser();
    if (user?.username) setName(user.username);
    else if (user?.email) setName(user.email);
  }, []);

  // Fetch the room on mount
  useEffect(() => {
    if (!ready) return;

    async function load() {
      try {
        const result = await fetchRoom(id);
        setRoom(result);
      } catch (err) {
        setFetchError(
          err instanceof ApiError ? err.message : "Failed to load room."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [ready, id]);

  const modeLabel: Record<GameMode, string> = {
    "60mins": "60 Mins",
    short:    "Short Mode",
    full:     "Full Mode",
  };

  // Switching role immediately swaps the avatar set and selects its first avatar.
  function selectRole(r: PlayerRole) {
    setRole(r);
    setAvatarId(avatarsForRole(r)[0].id);
  }

  async function handleStart() {
    if (!name.trim() || !avatarId) return;
    setJoinError(null);
    setStarting(true);

    try {
      // Password rooms are already authenticated in the lobby — reuse the password
      // that was entered there (stored in sessionStorage), no second prompt here.
      if (room?.privacy === "password") {
        const storedPw =
          (typeof window !== "undefined" && sessionStorage.getItem(`mm_room_pw_${id}`)) || "";
        await joinRoomWithPassword(id, {
          role,
          avatar_id:    avatarId,
          display_name: name.trim(),
          password:     storedPw,
        });
      } else {
        await joinRoom(id, {
          role,
          avatar_id:    avatarId,
          display_name: name.trim(),
        });
      }
      // In production: navigate to game scene / Unity bridge
      router.push("/menu");
    } catch (err) {
      setJoinError(
        err instanceof ApiError ? err.message : "Failed to join room."
      );
      setStarting(false);
    }
  }

  if (!ready) return null;

  // ── Loading state ──
  if (loading) {
    return (
      <div className="relative flex flex-col h-screen overflow-hidden">
        <PageBackground variant="lobby" />
        <LobbyNavBar title="Join Game" />
        <div className="flex-1 flex items-center justify-center">
          <span
            className="text-[11px] font-black uppercase tracking-[0.35em] animate-pulse"
            style={{ color: "var(--text-muted)" }}
          >
            Loading room...
          </span>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (fetchError || !room) {
    return (
      <div className="relative flex flex-col h-screen overflow-hidden">
        <PageBackground variant="lobby" />
        <LobbyNavBar title="Join Game" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p
            className="text-[11px] font-black uppercase tracking-[0.3em]"
            style={{ color: "#ef4444" }}
          >
            ▲ {fetchError ?? "Room not found."}
          </p>
          <Button variant="ghost" size="md" onClick={() => router.push("/lobby")}>
            ◀ Back to Lobby
          </Button>
        </div>
      </div>
    );
  }

  const avatars = avatarsForRole(role);

  return (
    <div className="relative flex flex-col h-screen overflow-hidden">
      <PageBackground variant="lobby" />
      <LobbyNavBar title="Join Game" />

      {/* Body — panel height-capped to the viewport; inner content scrolls only if tight */}
      <div className="flex-1 min-h-0 px-6 py-3 flex items-center justify-center">
        <motion.div
          className="w-full max-w-[1060px] max-h-full flex"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ── Single gold-bordered floating panel ── */}
          <div
            className="relative overflow-hidden rounded-[28px] flex flex-col w-full max-h-full"
            style={{
              background: "rgba(16,46,30,0.26)",
              border: "1.5px solid rgba(222,186,98,0.70)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow:
                "0 12px 60px rgba(0,0,0,0.40), 0 0 38px rgba(222,186,98,0.18), inset 0 1px 0 rgba(222,186,98,0.22)",
            }}
          >
            {/* Scrollable content — scrolls internally only when vertical space is tight.
                overflow-x-hidden prevents a stray horizontal scrollbar (the green strip). */}
            <div className="min-h-0 overflow-y-auto overflow-x-hidden px-10 py-9">
            <div className="grid grid-cols-[1fr_auto_300px] gap-10 items-stretch">
              {/* ── LEFT: title + meta + role cards ── */}
              <div className="flex flex-col">
                <div className="mb-4">
                  <p
                    className="text-[9px] font-bold uppercase tracking-[0.45em] mb-1 text-center"
                    style={{ color: "rgba(200,220,210,0.50)" }}
                  >
                    You are joining
                  </p>
                  {/* Large room title — always the ROOM's name */}
                  <h1
                    className="font-black uppercase text-center break-words"
                    style={{
                      fontSize: "clamp(24px, 2.6vw, 40px)",
                      color: "#eef3ee",
                      letterSpacing: "0.06em",
                      textShadow: "0 0 30px rgba(34,196,98,0.25)",
                      lineHeight: 1.05,
                    }}
                  >
                    {room.name || "Game Room"}
                  </h1>

                  {/* Small room metadata */}
                  <div
                    className="flex items-center justify-center gap-2 text-[11px] mt-2"
                    style={{ color: "rgba(200,220,210,0.55)" }}
                  >
                    <span>⏱ {modeLabel[room.mode]}</span>
                    {(room.privacy === "password" || room.privacy === "closed") && (
                      <>
                        <span style={{ color: "rgba(200,220,210,0.25)" }}>|</span>
                        <span>
                          {room.privacy === "password" ? "🔒 Password Protected" : "🔒 Invite Only"}
                        </span>
                      </>
                    )}
                    {room.privacy === "open" && (
                      <>
                        <span style={{ color: "rgba(200,220,210,0.25)" }}>|</span>
                        <span style={{ color: "#22c462" }}>✓ Open Room</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Two large role cards */}
                <div className="grid grid-cols-2 gap-6 flex-1">
                  {/* role cards stretch to fill the left column for prominence */}
                  <RoleCard role="founder"  selected={role === "founder"}  onSelect={() => selectRole("founder")}  />
                  <RoleCard role="investor" selected={role === "investor"} onSelect={() => selectRole("investor")} />
                </div>
              </div>

              {/* Vertical divider */}
              <div className="w-px self-stretch" style={{ background: "rgba(222,186,98,0.22)" }} />

              {/* ── RIGHT: avatar selection + Join ── */}
              <div className="flex flex-col items-center">
                <div className="mb-5">
                  <PanelLabel>Choose Your Avatar</PanelLabel>
                </div>

                {/* Role-specific avatar grid — founders 2×2, investors stacked vertically */}
                <div className={`grid gap-6 ${role === "investor" ? "grid-cols-1" : "grid-cols-2"}`}>
                  {avatars.map((a) => {
                    const active = avatarId === a.id;
                    return (
                      <button
                        key={a.id}
                        onClick={() => setAvatarId(a.id)}
                        className="rounded-full overflow-hidden cursor-pointer transition-all"
                        style={{
                          width: 112,
                          height: 112,
                          border: `3px solid ${active ? "var(--gold)" : "rgba(222,186,98,0.30)"}`,
                          boxShadow: active
                            ? "0 0 30px rgba(222,186,98,0.65), 0 0 0 4px rgba(222,186,98,0.20)"
                            : "none",
                          transform: active ? "scale(1.06)" : "scale(1)",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={a.src} alt="Avatar" className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>

                {/* Join — directly beneath the avatar section, centered */}
                <div className="mt-auto pt-8 w-full flex flex-col items-center gap-2">
                  <Button
                    size="lg"
                    loading={starting}
                    disabled={!name.trim() || !avatarId}
                    onClick={handleStart}
                  >
                    ▶ Join
                  </Button>
                  {joinError && (
                    <span className="text-[11px] text-center" style={{ color: "#ef4444" }}>
                      {joinError}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Back — bottom-left */}
            <div className="flex items-center pt-5">
              <button
                onClick={() => router.push("/lobby")}
                className="text-[10px] uppercase tracking-[0.3em] font-bold flex items-center gap-2 cursor-pointer transition-colors duration-150"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#22c462")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
              >
                ← BACK
              </button>
            </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
