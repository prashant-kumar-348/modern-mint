"use client";

import { motion } from "framer-motion";
import type { PlayerRole } from "@/lib/lobby/types";

interface RoleCardProps {
  role:     PlayerRole;
  selected: boolean;
  onSelect: () => void;
}

const ROLE_DATA = {
  founder: {
    label:   "FOUNDER",
    tagline: "Build. Risk. Survive.",
    color:   "#1de9d6",
    amounts: [
      { label: "Round 1", value: "$ 500 K" },
    ],
    desc: "Build your vision, lead your team and pitch to investors.",
    icon: (
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#1de9d6" strokeWidth="1.6"
          strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17l10 5 10-5" stroke="#1de9d6" strokeWidth="1.6"
          strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12l10 5 10-5" stroke="#1de9d6" strokeWidth="1.6"
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  investor: {
    label:   "INVESTOR",
    tagline: "Fund. Control. Multiply.",
    color:   "#d4a843",
    amounts: [
      { label: "Round 1", value: "$ 2000 K" },
      { label: "Round 4", value: "$ 5000 K" },
      { label: "Round 7", value: "$ 10000 K" },
    ],
    desc: "Fund startups, control decisions and multiply your returns.",
    icon: (
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#d4a843" strokeWidth="1.6"/>
        <path d="M12 6v12M9 9h4.5a1.5 1.5 0 0 1 0 3H9.5a1.5 1.5 0 0 0 0 3H15"
          stroke="#d4a843" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
} as const;

export default function RoleCard({ role, selected, onSelect }: RoleCardProps) {
  const data = ROLE_DATA[role];

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className="relative flex flex-col items-center p-6 rounded-2xl w-full h-full text-left cursor-pointer"
      style={{
        background: selected
          ? `rgba(${role === "founder" ? "29,233,214" : "212,168,67"},0.08)`
          : "rgba(6,20,26,0.70)",
        border: `1.5px solid ${selected ? data.color : "rgba(29,233,214,0.12)"}`,
        boxShadow: selected
          ? `0 0 28px ${data.color}22, inset 0 1px 0 ${data.color}10`
          : "none",
        transition: "all 0.18s",
      }}
    >
      {/* Selected checkmark */}
      {selected && (
        <motion.div
          className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: data.color }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="#03090c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      )}

      {/* Icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
        style={{
          background: selected
            ? `${data.color}18`
            : "rgba(29,233,214,0.05)",
          border: `1px solid ${data.color}30`,
        }}
      >
        {data.icon}
      </div>

      {/* Role name */}
      <span
        className="text-lg font-black uppercase tracking-[0.2em] mb-1.5"
        style={{ color: data.color }}
      >
        {data.label}
      </span>

      {/* Tagline */}
      <span
        className="text-[11px] font-semibold uppercase tracking-widest mb-4"
        style={{ color: "var(--text-muted)" }}
      >
        {data.tagline}
      </span>

      {/* Amounts */}
      <div className="flex flex-col gap-1 mb-3 w-full">
        {data.amounts.map((a) => (
          <div key={a.label} className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-wider"
              style={{ color: "var(--text-faint)" }}>
              {a.label}
            </span>
            <span className="text-[11px] font-bold"
              style={{ color: data.color }}>
              {a.value}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="w-full h-px mb-3"
        style={{ background: `${data.color}18` }} />

      {/* Description */}
      <p className="text-[10px] text-center leading-relaxed"
        style={{ color: "var(--text-muted)" }}>
        {data.desc}
      </p>
    </motion.button>
  );
}
