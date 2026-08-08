"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 30, title: "text-lg",   sub: "text-[8px]",  gap: "gap-2.5" },
  md: { icon: 42, title: "text-2xl",  sub: "text-[9px]",  gap: "gap-3"   },
  lg: { icon: 58, title: "text-4xl",  sub: "text-[11px]", gap: "gap-4"   },
  xl: { icon: 84, title: "text-6xl",  sub: "text-[13px]", gap: "gap-5"   },
};

export default function Logo({ size = "md", animate = false, className }: LogoProps) {
  const s = sizes[size];
  const Wrapper = animate ? motion.div : "div";
  const wrapperProps = animate
    ? {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 1, ease: "easeOut" },
      }
    : {};

  return (
    <Wrapper
      {...(wrapperProps as object)}
      className={clsx("flex items-center", s.gap, className)}
    >
      {/* ── Hexagonal icon mark (matches board centre geometry) ── */}
      <div className="relative flex-shrink-0" style={{ width: s.icon, height: s.icon }}>
        <svg
          viewBox="0 0 84 84"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width={s.icon}
          height={s.icon}
        >
          {/* Outermost hex ring — teal glow chrome like Figma board border */}
          <polygon
            points="42,3 78,22.5 78,61.5 42,81 6,61.5 6,22.5"
            stroke="#1de9d6"
            strokeWidth="1.5"
            fill="none"
            opacity="0.25"
          />
          {/* Main hex — slightly bolder */}
          <polygon
            points="42,8 74,25.5 74,58.5 42,76 10,58.5 10,25.5"
            stroke="#1de9d6"
            strokeWidth="2"
            fill="rgba(29,233,214,0.05)"
          />
          {/* Inner hex fill — warm board centre tone */}
          <polygon
            points="42,16 66,29.5 66,54.5 42,68 18,54.5 18,29.5"
            stroke="#d4a843"
            strokeWidth="1"
            strokeOpacity="0.4"
            fill="rgba(212,168,67,0.04)"
          />
          {/* "M" letterform */}
          <path
            d="M28 56V30L42 47L56 30V56"
            stroke="#d4a843"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Centre diamond — matches board diamond in Figma */}
          <polygon
            points="42,36 48,42 42,48 36,42"
            stroke="#1de9d6"
            strokeWidth="1.5"
            fill="rgba(29,233,214,0.15)"
          />
        </svg>

        {/* Pulsing glow ring */}
        {animate && (
          <motion.div
            className="absolute inset-0"
            style={{
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(29,233,214,0.18) 0%, transparent 70%)",
            }}
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>

      {/* ── Wordmark — gold "MODERN" + teal "MINT" matching Figma ── */}
      <div className="flex flex-col leading-none">
        <span
          className={clsx(
            "font-black tracking-[0.22em] uppercase glow-gold",
            s.title
          )}
          style={{ color: "#d4a843" }}
        >
          MODERN
        </span>
        <span
          className={clsx(
            "font-bold tracking-[0.45em] uppercase glow-teal",
            s.sub
          )}
          style={{ color: "#1de9d6", marginTop: "1px" }}
        >
          MINT
        </span>
      </div>
    </Wrapper>
  );
}
