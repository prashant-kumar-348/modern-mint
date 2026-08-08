"use client";

import type { RoomPrivacy } from "@/lib/lobby/types";

interface PrivacyOptionProps {
  value:    RoomPrivacy;
  selected: RoomPrivacy;
  onSelect: (v: RoomPrivacy) => void;
}

// Figma: each privacy option has a circular icon (globe / padlock / key)
const OPTIONS: Array<{ value: RoomPrivacy; label: string; sub: string; icon: React.ReactNode }> = [
  {
    value: "open",
    label: "Open",
    sub: "Anyone can join",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 3c-2.4 3-3.5 6-3.5 9s1.1 6 3.5 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 3c2.4 3 3.5 6 3.5 9s-1.1 6-3.5 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M3 12h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: "closed",
    label: "Closed",
    sub: "Invite Only",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: "password",
    label: "Password",
    sub: "Password to enter",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function PrivacyOption({
  value,
  selected,
  onSelect,
}: PrivacyOptionProps) {
  const opt    = OPTIONS.find((o) => o.value === value)!;
  const active = selected === value;

  return (
    <button
      onClick={() => onSelect(value)}
      className="flex items-center gap-3 w-full py-2.5 rounded-lg px-2 cursor-pointer transition-all"
      style={{
        background: active ? "rgba(34,196,98,0.08)" : "transparent",
        border: "1px solid transparent",
        borderColor: active ? "rgba(34,196,98,0.20)" : "transparent",
      }}
    >
      {/* Circular icon container — matches Figma */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          background: active ? "rgba(34,196,98,0.15)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${active ? "rgba(34,196,98,0.40)" : "rgba(255,255,255,0.12)"}`,
          color: active ? "#22c462" : "rgba(200,220,210,0.50)",
        }}
      >
        {opt.icon}
      </div>

      <div className="text-left">
        <div
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: active ? "#ffffff" : "rgba(200,220,210,0.60)" }}
        >
          {opt.label}
        </div>
        <div
          className="text-[9px] tracking-wider"
          style={{ color: "rgba(200,220,210,0.35)" }}
        >
          {opt.sub}
        </div>
      </div>
    </button>
  );
}
