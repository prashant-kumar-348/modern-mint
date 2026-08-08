"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PlayerAvatar from "./PlayerAvatar";
import type { GameRoom } from "@/lib/lobby/types";

// ── Mode badge ────────────────────────────────────────────────────────────

function ModeBadge({ mode }: { mode: GameRoom["mode"] }) {
  const cfg = {
    "60mins": { icon: "⏱", label: "60 mins"    },
    short:    { icon: "⚡", label: "Short Mode" },
    full:     { icon: "👑", label: "Full Mode"  },
  }[mode];

  return (
    <div className="flex items-center gap-1.5 w-28">
      <span className="text-sm opacity-90">{cfg.icon}</span>
      <span
        className="text-[11px] font-semibold tracking-wide"
        style={{ color: "rgba(190,224,205,0.80)" }}
      >
        {cfg.label}
      </span>
    </div>
  );
}

// ── Slot group ────────────────────────────────────────────────────────────

function SlotGroup({ slots }: { slots: GameRoom["founders"] }) {
  return (
    <div className="flex items-center gap-1">
      {slots.map((slot, i) => {
        // Human/you slot represents the PERSON: profile photo when they have one,
        // otherwise their name initials (same as the navbar). Open slots keep "+",
        // AI keeps the bot icon. Game avatar is no longer used for display here.
        const isPlayer = slot.kind === "human" || slot.kind === "you";
        return (
          <PlayerAvatar
            key={i}
            kind={slot.kind}
            avatarId={slot.avatarId}
            imageSrc={isPlayer ? slot.profileImageUrl : undefined}
            personName={isPlayer ? (slot.name ?? "") : undefined}
            size="sm"
            showStatus={slot.status === "online"}
          />
        );
      })}
    </div>
  );
}

// ── Password unlock panel ─────────────────────────────────────────────────

function PasswordPanel({
  onSubmit,
  onCancel,
}: {
  onSubmit: (pw: string) => void;
  onCancel: () => void;
}) {
  const [pw, setPw] = useState("");
  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0.85 }}
      animate={{ opacity: 1, scaleY: 1 }}
      exit={{ opacity: 0, scaleY: 0.85 }}
      className="flex items-center gap-2 mt-2 origin-top"
    >
      <input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && pw.trim() && onSubmit(pw)}
        placeholder="Enter password"
        className="flex-1 px-3 py-1.5 text-xs rounded border focus:outline-none"
        style={{
          background: "rgba(6,20,26,0.85)",
          border: "1px solid rgba(29,233,214,0.25)",
          color: "var(--text-primary)",
          maxWidth: 140,
        }}
        autoFocus
      />
      <button
        onClick={() => pw.trim() && onSubmit(pw)}
        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded cursor-pointer transition-all"
        style={{
          background: "rgba(29,233,214,0.12)",
          border: "1px solid rgba(29,233,214,0.4)",
          color: "#1de9d6",
        }}
      >
        JOIN
      </button>
      <button
        onClick={onCancel}
        className="text-[10px] uppercase tracking-wider cursor-pointer transition-colors"
        style={{ color: "var(--text-faint)" }}
      >
        Cancel
      </button>
    </motion.div>
  );
}

// ── RoomRow ───────────────────────────────────────────────────────────────

interface RoomRowProps {
  room:  GameRoom;
  index: number;
}

export default function RoomRow({ room, index }: RoomRowProps) {
  const router     = useRouter();
  const [showPw, setShowPw] = useState(false);
  const isPassword = room.privacy === "password";

  function handleJoin() {
    if (isPassword) {
      setShowPw((v) => !v);
    } else {
      router.push(`/lobby/join/${room.id}`);
    }
  }

  function handlePwSubmit(pw: string) {
    // Remember the verified password so the join page doesn't ask again.
    try { sessionStorage.setItem(`mm_room_pw_${room.id}`, pw); } catch { /* ignore */ }
    router.push(`/lobby/join/${room.id}`);
  }

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      {/* Capsule row — glassmorphism: green glass fading to transparent on the right,
          so the JOIN/PASSWORD pill appears to float over the artwork (matches Figma). */}
      <div
        className="group relative w-full rounded-full transition-all duration-150"
        style={{
          background:
            "linear-gradient(90deg, rgba(2,44,34,0.45) 0%, rgba(6,78,59,0.22) 46%, rgba(6,78,59,0) 100%)",
          border: "1px solid rgba(120,255,180,0.16)",
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          boxShadow:
            "inset 0 1px 0 rgba(120,255,180,0.12), 0 1px 8px rgba(0,0,0,0.16)",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.background =
            "linear-gradient(90deg, rgba(4,60,44,0.55) 0%, rgba(8,96,72,0.30) 46%, rgba(6,78,59,0.04) 100%)";
          el.style.boxShadow =
            "inset 0 1px 0 rgba(120,255,180,0.18), 0 0 18px rgba(43,214,115,0.18)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.background =
            "linear-gradient(90deg, rgba(2,44,34,0.45) 0%, rgba(6,78,59,0.22) 46%, rgba(6,78,59,0) 100%)";
          el.style.boxShadow =
            "inset 0 1px 0 rgba(120,255,180,0.12), 0 1px 8px rgba(0,0,0,0.16)";
        }}
      >
        {/* Main row */}
        <div className="flex items-center gap-4 pl-6 pr-2.5 py-2.5 min-h-[60px]">
          {/* Game name */}
          <div className="flex-1 min-w-0">
            <span
              className="text-xs font-bold tracking-wide truncate block"
              style={{ color: "#eafff2" }}
            >
              {room.name}
            </span>
          </div>

          {/* Mode */}
          <div className="w-28 flex-shrink-0">
            <ModeBadge mode={room.mode} />
          </div>

          {/* Founders */}
          <div className="w-[150px] flex-shrink-0">
            <SlotGroup slots={room.founders} />
          </div>

          {/* Investors */}
          <div className="w-[80px] flex-shrink-0">
            <SlotGroup slots={room.investors} />
          </div>

          {/* Join / Password — Figma: rounded pill at the row's right edge */}
          <div className="w-[116px] flex-shrink-0 flex justify-end">
            {isPassword ? (
              <button
                onClick={handleJoin}
                className="w-full py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.18em] transition-all cursor-pointer"
                style={{
                  background: showPw
                    ? "rgba(43,214,115,0.18)"
                    : "rgba(6,32,17,0.92)",
                  border: "1px solid rgba(43,214,115,0.45)",
                  color: "#bff0d2",
                }}
              >
                PASSWORD
              </button>
            ) : (
              <button
                onClick={handleJoin}
                className="w-full py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer"
                style={{
                  background:
                    "linear-gradient(180deg, #2fd877 0%, #18a258 100%)",
                  border: "1px solid rgba(120,255,180,0.45)",
                  color: "#04240f",
                  boxShadow: "0 0 14px rgba(43,214,115,0.30)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background =
                    "linear-gradient(180deg, #46e98c 0%, #1eb866 100%)";
                  el.style.boxShadow = "0 0 22px rgba(43,214,115,0.50)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background =
                    "linear-gradient(180deg, #2fd877 0%, #18a258 100%)";
                  el.style.boxShadow = "0 0 14px rgba(43,214,115,0.30)";
                }}
              >
                JOIN
              </button>
            )}
          </div>
        </div>

        {/* Inline password panel */}
        <AnimatePresence>
          {showPw && (
            <div className="px-6 pb-3">
              <PasswordPanel
                onSubmit={handlePwSubmit}
                onCancel={() => setShowPw(false)}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
