import { HTMLAttributes } from "react";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Use teal glow (default) or gold glow border */
  accent?: "teal" | "gold";
  /** Disable the backdrop glass effect */
  glass?: boolean;
}

/**
 * Glassmorphism card that matches the Figma panel aesthetic:
 * dark teal glass, glowing border, corner notch accents.
 */
export default function Card({
  children,
  accent = "teal",
  glass = true,
  className,
  style,
  ...props
}: CardProps) {
  const borderColor =
    accent === "gold"
      ? "rgba(212,168,67,0.28)"
      : "rgba(29,233,214,0.22)";

  const glowShadow =
    accent === "gold"
      ? "0 0 0 1px rgba(212,168,67,0.14), 0 8px 48px rgba(0,0,0,0.65), 0 0 32px rgba(212,168,67,0.06), inset 0 1px 0 rgba(212,168,67,0.07)"
      : "0 0 0 1px rgba(29,233,214,0.10), 0 8px 48px rgba(0,0,0,0.65), 0 0 32px rgba(29,233,214,0.06), inset 0 1px 0 rgba(29,233,214,0.07)";

  return (
    <div
      className={clsx("relative rounded-xl overflow-hidden", className)}
      style={{
        background: glass
          ? "rgba(6,20,26,0.82)"
          : "rgba(8,24,30,0.95)",
        border: `1px solid ${borderColor}`,
        boxShadow: glowShadow,
        backdropFilter: glass ? "blur(20px)" : undefined,
        ...style,
      }}
      {...props}
    >
      {/* Corner notch decorations — match Figma card corners */}
      <span
        className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 rounded-tl-sm pointer-events-none z-10"
        style={{ borderColor: accent === "gold" ? "rgba(212,168,67,0.55)" : "rgba(29,233,214,0.55)" }}
      />
      <span
        className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 rounded-tr-sm pointer-events-none z-10"
        style={{ borderColor: accent === "gold" ? "rgba(212,168,67,0.55)" : "rgba(29,233,214,0.55)" }}
      />
      <span
        className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 rounded-bl-sm pointer-events-none z-10"
        style={{ borderColor: accent === "gold" ? "rgba(212,168,67,0.55)" : "rgba(29,233,214,0.55)" }}
      />
      <span
        className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 rounded-br-sm pointer-events-none z-10"
        style={{ borderColor: accent === "gold" ? "rgba(212,168,67,0.55)" : "rgba(29,233,214,0.55)" }}
      />

      {children}
    </div>
  );
}
