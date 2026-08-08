"use client";

import { clsx } from "clsx";
import { AVATARS } from "@/lib/lobby/types";
import type { SlotKind } from "@/lib/lobby/types";
import PersonAvatar, { personInitials } from "./PersonAvatar";

interface PlayerAvatarProps {
  kind:      SlotKind;
  avatarId?: number;   // 1-8
  size?:     "sm" | "md" | "lg";
  showStatus?: boolean;
  selected?: boolean;
  onClick?:  () => void;
  imageSrc?: string;   // when set, a joined player's selected avatar image is shown
  // When set (lobby), the slot represents the PERSON: profile photo, else name
  // initials (like the navbar) — never the game avatar.
  personName?: string;
}

const sizes = {
  sm: { outer: 28, text: "text-[8px]",  dot: "w-2 h-2" },
  md: { outer: 36, text: "text-[10px]", dot: "w-2.5 h-2.5" },
  lg: { outer: 52, text: "text-[13px]", dot: "w-3 h-3" },
};

// ── AI Bot SVG icon ───────────────────────────────────────────────────────
function BotIcon({ size }: { size: number }) {
  const s = size * 0.55;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="8" width="18" height="12" rx="3"
        stroke="#1de9d6" strokeWidth="1.8" fill="rgba(29,233,214,0.1)" />
      <circle cx="9"  cy="14" r="2" fill="#1de9d6" />
      <circle cx="15" cy="14" r="2" fill="#1de9d6" />
      <path d="M12 5v3" stroke="#1de9d6" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="4" r="1.5" fill="#1de9d6" />
      <path d="M3 17h2M19 17h2" stroke="#1de9d6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Lock icon ─────────────────────────────────────────────────────────────
function LockIcon({ size }: { size: number }) {
  const s = size * 0.5;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="10" rx="2"
        stroke="rgba(29,233,214,0.4)" strokeWidth="1.8" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4"
        stroke="rgba(29,233,214,0.4)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// ── Plus icon ─────────────────────────────────────────────────────────────
function PlusIcon({ size }: { size: number }) {
  const s = size * 0.45;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="rgba(160,255,200,0.85)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export default function PlayerAvatar({
  kind,
  avatarId = 1,
  size = "md",
  showStatus = false,
  selected = false,
  onClick,
  imageSrc,
  personName,
}: PlayerAvatarProps) {
  const s    = sizes[size];
  const dim  = s.outer;
  const avt  = AVATARS.find((a) => a.id === avatarId) ?? AVATARS[0];

  // ── Open slot ──
  if (kind === "open") {
    return (
      <div
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        className={clsx(
          "rounded-full flex items-center justify-center flex-shrink-0",
          "transition-all duration-150",
          onClick && "cursor-pointer hover:border-[rgba(43,214,115,0.7)]"
        )}
        style={{
          width: dim,
          height: dim,
          border: "1.5px solid rgba(43,214,115,0.45)",
          background:
            "radial-gradient(circle at 38% 32%, rgba(43,214,115,0.22), rgba(6,30,16,0.85))",
          boxShadow: selected ? "0 0 0 2px #2bd673" : undefined,
        }}
      >
        <PlusIcon size={dim} />
      </div>
    );
  }

  // ── Locked slot ──
  if (kind === "locked") {
    return (
      <div
        className="rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          width: dim,
          height: dim,
          border: "1px solid rgba(29,233,214,0.12)",
          background: "rgba(6,20,26,0.6)",
        }}
      >
        <LockIcon size={dim} />
      </div>
    );
  }

  // ── AI slot ──
  if (kind === "ai") {
    return (
      <div
        className="rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          width: dim,
          height: dim,
          border: "1.5px solid rgba(29,233,214,0.30)",
          background: "rgba(29,233,214,0.07)",
          boxShadow: "0 0 8px rgba(29,233,214,0.15)",
        }}
      >
        <BotIcon size={dim} />
      </div>
    );
  }

  // ── Human / You slot ──
  return (
    <div className="relative flex-shrink-0">
      {personName !== undefined ? (
        // Lobby: represent the person — profile photo, else name initials.
        <PersonAvatar src={imageSrc} initials={personInitials(personName)} size={dim} borderWidth={1.5} />
      ) : (
        // Create page: keep the selected game-avatar representation.
        <div
          role={onClick ? "button" : undefined}
          tabIndex={onClick ? 0 : undefined}
          onClick={onClick}
          className={clsx(
            "rounded-full flex items-center justify-center flex-shrink-0 font-black select-none",
            onClick && "cursor-pointer",
            "transition-all duration-150"
          )}
          style={{
            width: dim,
            height: dim,
            overflow: "hidden",
            background: imageSrc
              ? "#04190d"
              : `radial-gradient(circle at 35% 35%, ${avt.accent}33, ${avt.bg})`,
            border: selected
              ? `2px solid ${avt.accent}`
              : `1.5px solid ${avt.accent}44`,
            boxShadow: selected ? `0 0 12px ${avt.accent}66` : undefined,
            color: avt.accent,
          }}
        >
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageSrc} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className={s.text}>{avt.initials}</span>
          )}
        </div>
      )}

      {/* Online status dot */}
      {showStatus && (
        <span
          className={clsx(
            "absolute bottom-0 right-0 rounded-full",
            s.dot,
            "border border-[#03090c]"
          )}
          style={{ background: "#2aff7a", boxShadow: "0 0 4px #2aff7a" }}
        />
      )}
    </div>
  );
}
