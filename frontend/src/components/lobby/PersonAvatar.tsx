"use client";

/**
 * Shared "person" representation used by both the navbar and the lobby slots:
 * the uploaded profile photo when available, otherwise name initials — always
 * the person, never the selected game character.
 */

/** Derive initials from a display name (e.g. "Priya R" → "PR", "Jordan" → "JO"). */
export function personInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase() || "?";
}

interface PersonAvatarProps {
  src?:        string | null;
  initials:    string;
  size:        number;
  borderWidth?: number;
  glowPx?:     number;
}

export default function PersonAvatar({
  src,
  initials,
  size,
  borderWidth = 2,
  glowPx,
}: PersonAvatarProps) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-black overflow-hidden select-none flex-shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(8, Math.round(size * 0.3)),
        background: src
          ? "#04190d"
          : "radial-gradient(circle at 38% 32%, rgba(40,220,110,0.55), rgba(4,26,13,0.96))",
        border: `${borderWidth}px solid #f2f7f3`,
        color: "#d6ffe6",
        boxShadow: glowPx
          ? `0 0 ${glowPx}px rgba(43,214,115,0.55), inset 0 0 ${Math.round(glowPx * 0.6)}px rgba(43,214,115,0.25)`
          : undefined,
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
