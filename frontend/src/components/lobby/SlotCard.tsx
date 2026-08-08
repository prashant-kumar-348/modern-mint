"use client";

import { motion } from "framer-motion";
import { AVATARS } from "@/lib/lobby/types";
import PlayerAvatar from "./PlayerAvatar";
import type { SlotDropdown } from "@/lib/lobby/types";

interface SlotCardProps {
  index:      number;
  dropdown:   SlotDropdown;
  avatarId:   number;
  name:       string;
  onChange:   (dropdown: SlotDropdown) => void;
  isYou?:     boolean; // first slot is always "You" and locked
}

const DROPDOWN_OPTIONS: SlotDropdown[] = ["You", "Friend", "Open", "AI"];

export default function SlotCard({
  index,
  dropdown,
  avatarId,
  name,
  onChange,
  isYou = false,
}: SlotCardProps) {
  const avt = AVATARS.find((a) => a.id === avatarId) ?? AVATARS[0];

  // Derive visual kind from dropdown
  const kind =
    dropdown === "AI"   ? "ai"
    : dropdown === "Open" ? "open"
    : dropdown === "You"  ? "you"
    : "human";

  // Status dot color / label
  const statusLabel =
    dropdown === "AI"   ? "AI"
    : dropdown === "Open" ? "Open Slot"
    : "Online";

  const statusColor =
    dropdown === "AI"   ? "#1de9d6"
    : dropdown === "Open" ? "var(--text-faint)"
    : "#2aff7a";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl"
      style={{
        background: "rgba(6,20,26,0.70)",
        border: "1px solid rgba(29,233,214,0.12)",
        minWidth: 100,
        flex: 1,
      }}
    >
      {/* Close button (hidden for "You" slot and "Open") */}
      {!isYou && dropdown !== "Open" && (
        <button
          onClick={() => onChange("Open")}
          className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center cursor-pointer transition-all"
          style={{
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#f87171",
            fontSize: 9,
          }}
          title="Remove"
        >
          ×
        </button>
      )}

      {/* Avatar */}
      <PlayerAvatar
        kind={kind}
        avatarId={avatarId}
        size="lg"
        showStatus={dropdown === "You" || dropdown === "Friend"}
      />

      {/* Name */}
      <span
        className="text-[11px] font-bold text-center truncate w-full"
        style={{ color: "var(--text-primary)" }}
      >
        {dropdown === "Open" ? "Open Slot"
          : dropdown === "AI" ? "AI Bot"
          : name}
      </span>

      {/* Status */}
      <div className="flex items-center gap-1">
        {dropdown === "AI" ? (
          <span
            className="text-[9px] uppercase tracking-wider font-bold"
            style={{ color: "#1de9d6" }}
          >
            ◈ AI
          </span>
        ) : dropdown === "Open" ? null : (
          <>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: statusColor, boxShadow: `0 0 4px ${statusColor}` }}
            />
            <span
              className="text-[9px] uppercase tracking-wider"
              style={{ color: statusColor }}
            >
              {statusLabel}
            </span>
          </>
        )}
      </div>

      {/* Dropdown selector */}
      <select
        value={dropdown}
        onChange={(e) => onChange(e.target.value as SlotDropdown)}
        disabled={isYou}
        className="w-full text-[10px] font-bold uppercase tracking-wider rounded px-2 py-1 cursor-pointer focus:outline-none"
        style={{
          background: "rgba(6,20,26,0.90)",
          border: "1px solid rgba(29,233,214,0.20)",
          color: isYou ? avt.accent : "var(--text-primary)",
          appearance: "none",
          textAlign: "center",
          opacity: isYou ? 0.8 : 1,
        }}
      >
        {DROPDOWN_OPTIONS.map((opt) => (
          <option key={opt} value={opt}
            style={{ background: "#060e12", color: "var(--text-primary)" }}>
            {opt}
          </option>
        ))}
      </select>
    </motion.div>
  );
}
