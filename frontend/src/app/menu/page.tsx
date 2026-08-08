"use client";

import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import Logo from "@/components/Logo";
import PageBackground from "@/components/PageBackground";
import { isAuthenticated } from "@/lib/auth";

/* ── Menu item definitions ─────────────────────────────────────────────── */
const primaryActions = [
  { label: "Multiplayer",  icon: "⚔",  action: "auth",     sub: "Global ranked matches"           },
  { label: "VS AI",        icon: "◈",  action: "auth",     sub: "Adaptive AI opponents"            },
  { label: "Join Game",    icon: "⬡",  action: "auth",     sub: "Enter session code"               },
];

const secondaryActions = [
  { label: "Tutorial",     icon: "◎",  action: "tutorial", sub: "Learn the mechanics"              },
  { label: "Quit Game",    icon: "⏻",  action: "quit",     sub: "Exit to desktop",  muted: true    },
];

/* ── Animation variants ─────────────────────────────────────────────────── */
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};
const slideIn: Variants = {
  hidden: { opacity: 0, x: -18 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Sub-component: a single menu button ─────────────────────────────────── */
function MenuItem({
  label,
  icon,
  sub,
  muted,
  onClick,
}: {
  label: string;
  icon: string;
  sub: string;
  muted?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div variants={slideIn}>
      <button
        onClick={onClick}
        className="group relative w-full text-left cursor-pointer transition-all duration-200"
      >
        {/* Background glass panel */}
        <div
          className="relative flex items-center gap-4 px-5 py-3.5 overflow-hidden"
          style={{
            background: muted
              ? "rgba(6,20,26,0.45)"
              : "rgba(8,26,34,0.65)",
            border: muted
              ? "1px solid rgba(29,233,214,0.08)"
              : "1px solid rgba(29,233,214,0.18)",
            borderRadius: "8px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!muted) {
              const el = e.currentTarget as HTMLDivElement;
              el.style.borderColor = "rgba(29,233,214,0.55)";
              el.style.background = "rgba(29,233,214,0.07)";
              el.style.boxShadow = "0 0 24px rgba(29,233,214,0.10), inset 0 1px 0 rgba(29,233,214,0.08)";
            }
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.borderColor = muted ? "rgba(29,233,214,0.08)" : "rgba(29,233,214,0.18)";
            el.style.background = muted ? "rgba(6,20,26,0.45)" : "rgba(8,26,34,0.65)";
            el.style.boxShadow = "none";
          }}
        >
          {/* Icon */}
          <span
            className="text-xl w-8 text-center transition-all duration-200"
            style={{ color: muted ? "var(--text-faint)" : "var(--teal)" }}
          >
            {icon}
          </span>

          {/* Labels */}
          <div className="flex flex-col min-w-0 flex-1">
            <span
              className="font-black text-sm uppercase tracking-widest transition-colors duration-200"
              style={{ color: muted ? "var(--text-faint)" : "var(--text-primary)" }}
            >
              {label}
            </span>
            <span
              className="text-[10px] uppercase tracking-wider mt-0.5"
              style={{ color: "var(--text-faint)" }}
            >
              {sub}
            </span>
          </div>

          {/* Arrow */}
          {!muted && (
            <span
              className="text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0"
              style={{ color: "var(--teal)" }}
            >
              ▶
            </span>
          )}

          {/* Corner notches */}
          {!muted && (
            <>
              <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[rgba(29,233,214,0.4)] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[rgba(29,233,214,0.4)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </>
          )}
        </div>
      </button>
    </motion.div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function MainMenu() {
  const router = useRouter();

  function handle(action: string) {
    if (action === "auth") {
      // Skip login page if the user already has a valid session
      router.push(isAuthenticated() ? "/lobby" : "/login");
    }
    if (action === "tutorial") router.push("/tutorial");
    if (action === "quit" && typeof window !== "undefined") window.close();
  }

  return (
    <div className="relative flex h-full min-h-screen overflow-hidden">
      <PageBackground />

      <div className="flex flex-col lg:flex-row w-full">
        {/* ── LEFT — Brand panel ───────────────────────────────────────── */}
        <motion.div
          className="flex flex-col justify-center items-start px-10 lg:px-20 py-16 lg:py-0 lg:w-[54%]"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <Logo size="lg" animate />

          {/* Tagline */}
          <motion.p
            className="mt-8 max-w-md text-sm leading-relaxed font-light"
            style={{ color: "var(--text-muted)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            High Interaction Simulation of{" "}
            <span style={{ color: "var(--teal)" }} className="font-semibold">Leadership</span>,{" "}
            <span style={{ color: "var(--teal)" }} className="font-semibold">Negotiation</span>{" "}
            &{" "}
            <span style={{ color: "var(--gold)" }} className="font-semibold">Psychology</span>
          </motion.p>

          {/* Stat bars */}
          <motion.div
            className="mt-14 flex flex-col gap-4 w-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            {[
              { label: "Strategy Depth",  val: 92, color: "var(--teal)"  },
              { label: "Replayability",   val: 97, color: "var(--gold)"  },
              { label: "Skill Ceiling",   val: 88, color: "var(--teal)"  },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                  <span style={{ color: "var(--text-faint)" }}>{label}</span>
                  <span style={{ color }}>{val}%</span>
                </div>
                <div
                  className="h-px rounded-full overflow-hidden"
                  style={{ background: "rgba(29,233,214,0.08)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${val}%` }}
                    transition={{ delay: 1.1, duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </motion.div>

          {/* Version badge */}
          <motion.div
            className="mt-12 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <span
              className="text-[9px] uppercase tracking-[0.4em]"
              style={{ color: "var(--text-faint)" }}
            >
              v0.1.0-alpha · Modern Mint Studio
            </span>
          </motion.div>
        </motion.div>

        {/* ── RIGHT — Menu panel ───────────────────────────────────────── */}
        <motion.div
          className="flex flex-col justify-center px-10 lg:px-14 py-16 lg:py-0 lg:w-[46%]"
          style={{ borderLeft: "1px solid rgba(29,233,214,0.07)" }}
        >
          {/* Section label — gold, like Figma headers */}
          <motion.p
            className="text-[9px] uppercase tracking-[0.45em] font-black mb-6"
            style={{ color: "var(--gold)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            ◈ Command Interface
          </motion.p>

          {/* Primary actions */}
          <motion.div
            className="flex flex-col gap-2.5"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {primaryActions.map((item) => (
              <MenuItem
                key={item.label}
                {...item}
                onClick={() => handle(item.action)}
              />
            ))}
          </motion.div>

          {/* Divider */}
          <motion.div
            className="my-5 h-px"
            style={{
              background:
                "linear-gradient(90deg, rgba(29,233,214,0.25), rgba(212,168,67,0.15), transparent)",
            }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          />

          {/* Secondary actions */}
          <motion.div
            className="flex flex-col gap-2.5"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {secondaryActions.map((item) => (
              <MenuItem
                key={item.label}
                {...item}
                onClick={() => handle(item.action)}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
