"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageBackground from "@/components/PageBackground";
import LobbyNavBar   from "@/components/lobby/LobbyNavBar";
import RoomRow        from "@/components/lobby/RoomRow";
import Button         from "@/components/ui/Button";
import { fetchRooms } from "@/lib/lobby/api";
import { useAuthGuard } from "@/lib/useAuthGuard";
import type { GameRoom } from "@/lib/lobby/types";

// ── Join-with-Password modal ──────────────────────────────────────────────

function JoinWithPasswordModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [pw,   setPw]   = useState("");

  function handleSubmit() {
    if (!code.trim()) return;
    // Remember the entered password so the join page doesn't ask again.
    try { sessionStorage.setItem(`mm_room_pw_${code.trim()}`, pw); } catch { /* ignore */ }
    router.push(`/lobby/join/${code.trim()}`);
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="w-full max-w-sm rounded-2xl p-7"
        style={{
          background: "rgba(6,20,26,0.97)",
          border: "1px solid rgba(29,233,214,0.25)",
          boxShadow: "0 0 60px rgba(29,233,214,0.10)",
          backdropFilter: "blur(24px)",
        }}
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
      >
        {/* Header */}
        <div className="mb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.35em]"
            style={{ color: "var(--gold)" }}>
            🔒 Join with Password
          </span>
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
            Enter the room code and password to join a private game.
          </p>
        </div>

        {/* Room code */}
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-[10px] font-black uppercase tracking-[0.28em]"
            style={{ color: "var(--gold)" }}>
            Room Code
          </label>
          <div className="relative">
            <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l z-10"
              style={{ borderColor: "rgba(29,233,214,0.45)" }} />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. MINT-4729"
              className="w-full px-4 py-2.5 text-sm rounded focus:outline-none"
              style={{
                background: "rgba(6,20,26,0.80)",
                border: "1px solid rgba(29,233,214,0.18)",
                color: "var(--text-primary)",
              }}
              autoFocus
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5 mb-6">
          <label className="text-[10px] font-black uppercase tracking-[0.28em]"
            style={{ color: "var(--gold)" }}>
            Password
          </label>
          <div className="relative">
            <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l z-10"
              style={{ borderColor: "rgba(29,233,214,0.45)" }} />
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 text-sm rounded focus:outline-none"
              style={{
                background: "rgba(6,20,26,0.80)",
                border: "1px solid rgba(29,233,214,0.18)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="ghost" size="md" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button size="md" className="flex-1" onClick={handleSubmit}>
            Join Room
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Table header row ──────────────────────────────────────────────────────

function TableHeader() {
  const cls = "text-[10px] font-black uppercase tracking-[0.22em]";
  const col = { color: "#e8cf7a" };
  return (
    <div
      className="flex items-center gap-4 pl-6 pr-2.5 pt-1 pb-3 sticky top-0 z-10"
      style={{ background: "rgba(6,10,7,0.45)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
    >
      <div className="flex-1">
        <span className={cls} style={col}>Game Name</span>
      </div>
      <div className="w-28 flex-shrink-0">
        <span className={cls} style={col}>Mode</span>
      </div>
      <div className="w-[150px] flex-shrink-0">
        <span className={cls} style={col}>Founders (Max&nbsp;4)</span>
      </div>
      <div className="w-[80px] flex-shrink-0">
        <span className={cls} style={col}>Investors (Max&nbsp;2)</span>
      </div>
      <div className="w-[116px] flex-shrink-0 flex justify-end">
        <span className={cls} style={col}>Join</span>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <span className="text-3xl opacity-30">🎮</span>
      <p
        className="text-[11px] font-black uppercase tracking-[0.35em]"
        style={{ color: "var(--text-muted)" }}
      >
        No rooms available
      </p>
      <p
        className="text-[10px] uppercase tracking-widest"
        style={{ color: "var(--text-faint)" }}
      >
        Be the first — create a game!
      </p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function LobbyPage() {
  const ready     = useAuthGuard();
  const router    = useRouter();
  const [showPwModal, setShowPwModal] = useState(false);
  const [rooms,    setRooms]    = useState<GameRoom[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchRooms();
      setRooms(data);
    } catch (err) {
      setError((err as Error).message ?? "Failed to load rooms.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    startTransition(() => { loadRooms(); });
    // Poll so the list reflects current room state — joined players replace
    // their "+" placeholders automatically without a manual refresh.
    const poll = setInterval(() => {
      startTransition(() => { loadRooms(); });
    }, 5000);
    return () => clearInterval(poll);
  }, [ready, loadRooms]);

  if (!ready) return null;

  return (
    <div className="relative flex flex-col h-screen overflow-hidden">
      <PageBackground variant="lobby" />

      {/* Nav bar */}
      <LobbyNavBar />

      {/* Body — scrollable, padded */}
      <div className="flex-1 overflow-y-auto px-8 pb-6 pt-1">
        <motion.div
          className="flex flex-col h-full max-w-[1160px] w-full mx-auto"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >

          {/* ── Translucent green-glass panel with gold border.
                Low opacity so the emblem artwork glows through/around it (no blur, so it stays crisp). ── */}
          <div
            className="relative overflow-hidden rounded-[28px] flex flex-col flex-1 pt-5 my-1.5"
            style={{
              // Green-tinted translucent glass (like the Figma card) — reads as emerald glass
              // over the artwork instead of a black/dark block, while staying see-through.
              background: "rgba(16,46,30,0.26)",
              border: "1.5px solid rgba(222,186,98,0.70)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow:
                "0 12px 60px rgba(0,0,0,0.40), 0 0 38px rgba(222,186,98,0.18), inset 0 1px 0 rgba(222,186,98,0.22)",
            }}
          >
            {/* ── Artwork layer — INSIDE the panel, fills the interior, behind the rows.
                  overflow-hidden on the panel clips it to the rounded corners. ── */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/lobby-bg.jpg"
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            />

            {/* ── Soft emerald radial glow — above the artwork, below the rows ── */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 72% 62% at 50% 44%, rgba(43,214,115,0.22) 0%, rgba(20,120,66,0.10) 45%, transparent 76%)",
              }}
            />

            {/* Scrollable room list with sticky column headers — header shares the exact
                same px-4 + pl-6/pr-2.5 box as the rows, so the columns align perfectly. */}
            <div className="relative z-10 flex-1 overflow-y-auto px-4">
              <TableHeader />
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <span
                    className="text-[11px] font-black uppercase tracking-[0.35em] animate-pulse"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Loading rooms...
                  </span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em]" style={{ color: "#ef4444" }}>
                    ▲ {error}
                  </p>
                  <Button size="sm" variant="ghost" onClick={loadRooms}>Retry</Button>
                </div>
              ) : rooms.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="flex flex-col gap-2 pb-2">
                  {rooms.map((room, i) => <RoomRow key={room.id} room={room} index={i} />)}
                </div>
              )}
            </div>

            {/* Bottom action buttons — amber-bordered green capsules, inside the panel */}
            <div className="relative z-10 flex-shrink-0 flex items-center gap-4 px-4 py-3">
              {/* CREATE YOUR OWN GAME */}
              <button
                onClick={() => router.push("/lobby/create")}
                className="flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.18em] cursor-pointer transition-all duration-150"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(120,92,34,0.34) 0%, rgba(74,54,18,0.34) 100%)",
                  border: "1.5px solid rgba(214,178,90,0.60)",
                  color: "#f0d89a",
                  boxShadow: "inset 0 1px 0 rgba(214,178,90,0.22), 0 0 14px rgba(43,214,115,0.08)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.boxShadow = "inset 0 1px 0 rgba(214,178,90,0.25), 0 0 22px rgba(43,214,115,0.25)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.boxShadow = "inset 0 1px 0 rgba(214,178,90,0.18), 0 0 14px rgba(43,214,115,0.10)";
                }}
              >
                Create Your Own Game
              </button>

              {/* JOIN WITH PASSWORD */}
              <button
                onClick={() => setShowPwModal(true)}
                className="flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.18em] cursor-pointer transition-all duration-150"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(120,92,34,0.34) 0%, rgba(74,54,18,0.34) 100%)",
                  border: "1.5px solid rgba(214,178,90,0.60)",
                  color: "#f0d89a",
                  boxShadow: "inset 0 1px 0 rgba(214,178,90,0.22), 0 0 14px rgba(43,214,115,0.08)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.boxShadow = "inset 0 1px 0 rgba(214,178,90,0.25), 0 0 22px rgba(43,214,115,0.25)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.boxShadow = "inset 0 1px 0 rgba(214,178,90,0.18), 0 0 14px rgba(43,214,115,0.10)";
                }}
              >
                Join with Password
              </button>
            </div>
          </div>

          {/* ← BACK — green pill below the panel */}
          <div className="flex items-center pt-4">
            <button
              onClick={() => router.push("/menu")}
              className="px-7 py-2.5 rounded-xl text-[11px] uppercase tracking-[0.22em] font-bold flex items-center gap-2 cursor-pointer transition-all duration-150"
              style={{
                background: "rgba(10,40,22,0.78)",
                border: "1.5px solid rgba(222,186,98,0.60)",
                color: "#f0d89a",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = "0 0 16px rgba(222,186,98,0.25)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = "none";
              }}
            >
              ← Back
            </button>
          </div>
        </motion.div>
      </div>

      {/* Modal overlay */}
      <AnimatePresence>
        {showPwModal && (
          <JoinWithPasswordModal onClose={() => setShowPwModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
