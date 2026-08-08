"use client";

import { AVATARS } from "@/lib/lobby/types";
import PlayerAvatar from "./PlayerAvatar";

interface AvatarGridProps {
  selected:  number | null; // avatarId 1-8, or null for bot
  onSelect:  (id: number | null) => void;
}

export default function AvatarGrid({ selected, onSelect }: AvatarGridProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Human avatars — row 1 (5) */}
      <div className="flex items-center gap-2">
        {AVATARS.slice(0, 5).map((avt) => (
          <button
            key={avt.id}
            onClick={() => onSelect(avt.id)}
            className="relative cursor-pointer rounded-full transition-all duration-150"
            style={{
              boxShadow: selected === avt.id
                ? `0 0 0 2px ${avt.accent}, 0 0 12px ${avt.accent}66`
                : "none",
            }}
            title={avt.name}
          >
            <PlayerAvatar
              kind="human"
              avatarId={avt.id}
              size="md"
              selected={selected === avt.id}
            />
          </button>
        ))}
      </div>

      {/* Row 2: bot + remaining humans + add */}
      <div className="flex items-center gap-2">
        {/* Bot avatar */}
        <button
          onClick={() => onSelect(null)}
          className="cursor-pointer rounded-full transition-all"
          style={{
            boxShadow: selected === null
              ? "0 0 0 2px #1de9d6, 0 0 12px rgba(29,233,214,0.4)"
              : "none",
          }}
          title="AI Bot"
        >
          <PlayerAvatar kind="ai" size="md" selected={selected === null} />
        </button>

        {/* Remaining humans */}
        {AVATARS.slice(5, 8).map((avt) => (
          <button
            key={avt.id}
            onClick={() => onSelect(avt.id)}
            className="cursor-pointer rounded-full transition-all"
            style={{
              boxShadow: selected === avt.id
                ? `0 0 0 2px ${avt.accent}, 0 0 12px ${avt.accent}66`
                : "none",
            }}
            title={avt.name}
          >
            <PlayerAvatar
              kind="human"
              avatarId={avt.id}
              size="md"
              selected={selected === avt.id}
            />
          </button>
        ))}

        {/* "+" placeholder — custom avatar (coming soon) */}
        <button
          className="cursor-not-allowed opacity-50"
          title="Custom avatar (coming soon)"
          disabled
        >
          <PlayerAvatar kind="open" size="md" />
        </button>
      </div>
    </div>
  );
}
