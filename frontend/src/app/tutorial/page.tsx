"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageBackground from "@/components/PageBackground";

const chapters = [
  { num: "01", title: "The Art of Leadership",   desc: "Command mechanics, resource flow, and unit hierarchy."  },
  { num: "02", title: "Negotiation Tactics",      desc: "Alliance building, diplomatic pressure, and deal-making." },
  { num: "03", title: "Psychological Warfare",    desc: "Bluffs, reads, counter-strategies, and the meta-game."   },
  { num: "04", title: "End-Game Theory",          desc: "Late-game pivots, decisive maneuvers, and board control." },
];

export default function TutorialPage() {
  return (
    <div className="relative flex h-full min-h-screen p-6 md:p-14 overflow-hidden">
      <PageBackground />

      <div className="w-full max-w-2xl mx-auto">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 mb-10 text-[10px] uppercase tracking-[0.35em] font-bold transition-colors duration-150"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--teal)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
        >
          ◀ Main Menu
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Logo size="sm" />
            <span
              className="text-[9px] uppercase tracking-[0.4em] font-bold"
              style={{ color: "var(--text-faint)" }}
            >
              / Academy
            </span>
          </div>

          <h1
            className="text-3xl font-black uppercase tracking-[0.15em] mt-5"
            style={{ color: "var(--text-primary)" }}
          >
            Commander Academy
          </h1>
          <p
            className="mt-2 text-sm max-w-md"
            style={{ color: "var(--text-muted)" }}
          >
            Master the fundamentals before entering the battlefield.
          </p>

          {/* Coming-soon badge — gold, like Figma rank labels */}
          <div
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-black"
            style={{
              background: "rgba(212,168,67,0.07)",
              border: "1px solid rgba(212,168,67,0.30)",
              borderRadius: "6px",
              color: "var(--gold)",
            }}
          >
            ◈ Content unlocks at Early Access
          </div>
        </motion.div>

        {/* Chapter cards */}
        <div className="mt-10 flex flex-col gap-3">
          {chapters.map(({ num, title, desc }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.45 }}
            >
              <Card className="px-6 py-4 flex items-center gap-5" style={{ opacity: 0.55 }}>
                <span
                  className="text-3xl font-black font-mono w-12 flex-shrink-0 text-right"
                  style={{ color: "rgba(29,233,214,0.15)" }}
                >
                  {num}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-black text-sm uppercase tracking-widest"
                    style={{ color: "rgba(216,234,236,0.6)" }}
                  >
                    {title}
                  </p>
                  <p
                    className="text-[11px] mt-0.5"
                    style={{ color: "var(--text-faint)" }}
                  >
                    {desc}
                  </p>
                </div>
                <span
                  className="flex-shrink-0 text-[9px] uppercase tracking-widest font-bold px-2.5 py-1"
                  style={{
                    color: "var(--text-faint)",
                    border: "1px solid rgba(29,233,214,0.10)",
                    borderRadius: "4px",
                  }}
                >
                  Locked
                </span>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Link href="/menu">
            <Button variant="secondary" size="md">
              ◀ Return to Menu
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
