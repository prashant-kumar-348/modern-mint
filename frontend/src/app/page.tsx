"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push("/menu"), 3800);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div
      className="relative flex h-full min-h-screen items-center justify-center overflow-hidden"
      style={{ background: "var(--bg-void)" }}
    >
      {/* ── Circuit grid that fades in ── */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.3 }}
        style={{
          backgroundImage: `
            linear-gradient(rgba(29,233,214,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(29,233,214,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "52px 52px",
        }}
      />

      {/* ── Radial board atmosphere ── */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8, delay: 0.5 }}
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(29,233,214,0.07) 0%, rgba(212,168,67,0.03) 40%, transparent 70%)",
        }}
      />

      {/* ── Outer pulse rings ── */}
      {[320, 480, 640].map((size, i) => (
        <motion.div
          key={size}
          className="absolute rounded-full border"
          style={{
            width: size,
            height: size,
            borderColor: i === 0 ? "rgba(212,168,67,0.25)" : "rgba(29,233,214,0.12)",
          }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 0.7, 0.3], scale: 1 }}
          transition={{
            delay: 0.4 + i * 0.25,
            duration: 1.2,
            ease: "easeOut",
          }}
        />
      ))}

      {/* ── Breathing glow on rings after reveal ── */}
      {[320, 480].map((size, i) => (
        <motion.div
          key={`pulse-${size}`}
          className="absolute rounded-full border"
          style={{
            width: size,
            height: size,
            borderColor:
              i === 0 ? "rgba(212,168,67,0.20)" : "rgba(29,233,214,0.10)",
          }}
          animate={{ scale: [1, 1.025, 1], opacity: [0.5, 1, 0.5] }}
          transition={{
            delay: 1.8 + i * 0.3,
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* ── Logo cinematic reveal ── */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <Logo size="xl" animate />

        {/* Tagline */}
        <motion.p
          className="text-[11px] uppercase tracking-[0.45em] text-center max-w-xs leading-relaxed"
          style={{ color: "var(--text-muted)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 1 }}
        >
          High Interaction Simulation of<br />
          Leadership · Negotiation · Psychology
        </motion.p>

        {/* Progress bar — teal glow track */}
        <motion.div
          className="relative w-56 h-px overflow-hidden"
          style={{ background: "rgba(29,233,214,0.10)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div
            className="absolute inset-y-0 left-0"
            style={{
              background:
                "linear-gradient(90deg, transparent, #1de9d6, #d4a843, #1de9d6)",
              boxShadow: "0 0 8px rgba(29,233,214,0.8)",
            }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ delay: 1.3, duration: 2.2, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Status label */}
        <motion.p
          className="text-[10px] uppercase tracking-[0.4em]"
          style={{ color: "var(--teal-dark)", marginTop: -24 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.6] }}
          transition={{ delay: 1.4, duration: 1.8, repeat: 1 }}
        >
          Initializing command session…
        </motion.p>
      </motion.div>

      {/* Top chrome bar */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(29,233,214,0.6) 40%, rgba(212,168,67,0.5) 60%, transparent)",
        }}
      />

      {/* Fade to bg-deep before redirect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--bg-deep)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.2, duration: 0.6 }}
      />
    </div>
  );
}
