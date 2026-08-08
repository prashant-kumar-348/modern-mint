"use client";

import { useState, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageBackground  from "@/components/PageBackground";
import LobbyNavBar     from "@/components/lobby/LobbyNavBar";
import SlotCard        from "@/components/lobby/SlotCard";
import ModeCard        from "@/components/lobby/ModeCard";
import PrivacyOption   from "@/components/lobby/PrivacyOption";
import Button          from "@/components/ui/Button";
import Input           from "@/components/ui/Input";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { getUser }     from "@/lib/auth";
import { createRoom }  from "@/lib/lobby/api";
import { ApiError }    from "@/lib/api";
import type {
  AIDifficulty,
  GameMode,
  RoomPrivacy,
  SlotDropdown,
  CreateSlot,
} from "@/lib/lobby/types";

// ── Initial slots ─────────────────────────────────────────────────────────

function makeFounderSlots(username: string): CreateSlot[] {
  return [
    { dropdown: "You",    avatarId: 2, name: username },  // always "You"
    { dropdown: "Open",   avatarId: 5, name: "" },
    { dropdown: "Open",   avatarId: 5, name: "" },
    { dropdown: "AI",     avatarId: 1, name: "" },
  ];
}

function makeInvestorSlots(): CreateSlot[] {
  return [
    { dropdown: "Open",   avatarId: 5, name: "" },
    { dropdown: "Open",   avatarId: 5, name: "" },
  ];
}

// ── Difficulty toggle — Figma: pill-shaped on/off switch, 4 levels ───────────

// Figma shows 4 difficulty levels. We map them to the 4 closest backend values.
const DIFFICULTY_OPTIONS: { label: string; value: AIDifficulty; color: string }[] = [
  { label: "Easy",       value: "easy",   color: "#22c462" },
  { label: "Medium",     value: "medium", color: "#d4a843" },
  { label: "Hard",       value: "hard",   color: "#ff7a2a" },
  { label: "Super Hard", value: "unfair", color: "#ef4444" },
];

// Selected → Modern Mint green treatment (matches the Mode cards);
// unselected → gold border/text, with a gold glow on hover.
const DIFF_GREEN = "#22c462";
const DIFF_GOLD  = "#d4a843";

function DifficultyToggle({
  label,
  active,
  onSelect,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center justify-between w-full py-2 px-3 rounded-lg cursor-pointer"
      style={{
        // Minimal, premium look: unselected rows are quiet (subtle dark, no border/glow),
        // hover gently brings in the gold, selected is an elegant green with a soft gold
        // influence — no strong neon.
        background: active
          ? "rgba(34,196,98,0.10)"
          : hovered
          ? "rgba(212,168,67,0.06)"
          : "rgba(8,20,14,0.35)",
        border: `1.5px solid ${
          active
            ? "rgba(43,214,115,0.55)"
            : hovered
            ? "rgba(212,168,67,0.55)"
            : "transparent"
        }`,
        boxShadow: active
          ? "inset 0 0 0 1px rgba(212,168,67,0.18), 0 0 10px rgba(34,196,98,0.15)"
          : hovered
          ? "0 0 12px rgba(212,168,67,0.22)"
          : "none",
        transition: "all 0.18s",
      }}
    >
      {/* Label — white when selected, muted gold otherwise (full gold on hover) */}
      <span
        className="text-sm font-bold tracking-wide"
        style={{ color: active ? "#ffffff" : hovered ? DIFF_GOLD : "rgba(212,168,67,0.72)" }}
      >
        {label}
      </span>

      {/* Toggle pill — green when active */}
      <div
        className="relative flex-shrink-0 rounded-full transition-all duration-200"
        style={{
          width: 44,
          height: 22,
          background: active ? DIFF_GREEN : "rgba(255,255,255,0.10)",
          border: `1.5px solid ${active ? DIFF_GREEN : "rgba(255,255,255,0.15)"}`,
          boxShadow: active ? `0 0 10px ${DIFF_GREEN}66` : "none",
        }}
      >
        <motion.div
          className="absolute top-0.5 rounded-full"
          style={{ width: 16, height: 16, background: "#ffffff" }}
          animate={{ left: active ? 24 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
}

// ── Section label — gold pill (Difficulty / Mode / Privacy), matches Figma ──

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center mb-2">
      <span
        className="text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full"
        style={{
          color: "var(--gold)",
          border: "1px solid rgba(222,186,98,0.45)",
          background: "rgba(10,40,22,0.45)",
        }}
      >
        {children}
      </span>
    </div>
  );
}

// ── Group header — Founders / Investors (light centered text, matches Figma) ─

function GroupHeader({ label, max }: { label: string; max: number }) {
  return (
    <div className="text-center mb-2">
      <span
        className="text-xs font-black uppercase tracking-[0.25em]"
        style={{ color: "#dfeee6" }}
      >
        {label}{" "}
        <span style={{ color: "var(--gold)" }}>(Max&nbsp;{max})</span>
      </span>
    </div>
  );
}

// ── Password modal — centered popup over a dimmed/blurred page ───────────────

function PasswordModal({
  password,
  onChange,
  onConfirm,
  onCancel,
}: {
  password: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.62)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <motion.div
        className="w-full max-w-sm rounded-2xl p-7"
        style={{
          background: "rgba(12,34,21,0.97)",
          border: "1.5px solid rgba(222,186,98,0.60)",
          boxShadow: "0 0 60px rgba(0,0,0,0.55), 0 0 38px rgba(222,186,98,0.18)",
        }}
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
      >
        <div className="mb-5">
          <span className="text-[10px] font-black uppercase tracking-[0.35em]" style={{ color: "var(--gold)" }}>
            🔒 Set Room Password
          </span>
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
            Players will need this password to join the room.
          </p>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && password.trim() && onConfirm()}
          placeholder="••••••••"
          autoFocus
          className="w-full px-4 py-2.5 text-sm rounded-lg focus:outline-none mb-6"
          style={{
            background: "rgba(4,18,8,0.90)",
            border: "1px solid rgba(34,196,98,0.30)",
            color: "#ffffff",
          }}
        />

        <div className="flex gap-3">
          <Button variant="ghost" size="md" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="md" className="flex-1" disabled={!password.trim()} onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function CreateGamePage() {
  const ready   = useAuthGuard();
  const router  = useRouter();

  // getUser() uses localStorage — must be client-side only.
  // Declare state before the effect so the effect can reference the setter.
  const [username,     setUsername]     = useState("You");
  const [roomName,     setRoomName]     = useState("");
  const [founderSlots, setFounderSlots] = useState<CreateSlot[]>(() => makeFounderSlots("You"));

  useEffect(() => {
    const user = getUser();
    if (user?.username) {
      startTransition(() => {
        setUsername(user.username);
        setFounderSlots(makeFounderSlots(user.username));
      });
    }
  }, []);
  const [investorSlots, setInvestorSlots] = useState<CreateSlot[]>(makeInvestorSlots);
  const [difficulty,    setDifficulty]    = useState<AIDifficulty>("easy");
  const [mode,          setMode]          = useState<GameMode>("60mins");
  const [privacy,       setPrivacy]       = useState<RoomPrivacy>("open");
  const [password,      setPassword]      = useState("");
  const [starting,      setStarting]      = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  // Password popup (UI-only): "Password" privacy opens a modal instead of an inline field.
  const [showPwModal, setShowPwModal] = useState(false);
  const [prevPrivacy, setPrevPrivacy] = useState<RoomPrivacy>("open");

  // Update founder slot dropdown
  function updateFounder(i: number, dropdown: SlotDropdown) {
    setFounderSlots((prev) => prev.map((s, idx) => idx === i ? { ...s, dropdown } : s));
  }

  // Update investor slot dropdown
  function updateInvestor(i: number, dropdown: SlotDropdown) {
    setInvestorSlots((prev) => prev.map((s, idx) => idx === i ? { ...s, dropdown } : s));
  }

  // Privacy selection — "password" opens the modal; others apply directly.
  function handlePrivacySelect(v: RoomPrivacy) {
    if (v === "password") {
      setPrevPrivacy(privacy === "password" ? prevPrivacy : privacy);
      setPrivacy("password");
      setShowPwModal(true);
    } else {
      setPrivacy(v);
    }
  }

  async function handleStart() {
    if (!roomName.trim()) {
      setError("Please enter a room name.");
      return;
    }
    setError(null);
    setStarting(true);

    try {
      // Count AI slots from the UI config
      const aiFounders  = founderSlots.filter((s, i) => i !== 0 && s.dropdown === "AI").length;
      const aiInvestors = investorSlots.filter((s) => s.dropdown === "AI").length;

      const room = await createRoom({
        name:          roomName.trim(),
        mode,
        privacy,
        password:      privacy === "password" ? password : undefined,
        ai_difficulty: difficulty,
        max_founders:  4,
        max_investors: 2,
        ai_founders:   aiFounders,
        ai_investors:  aiInvestors,
        avatar_id:     founderSlots[0].avatarId,
        display_name:  username,
      });

      router.push(`/lobby/join/${room.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create room.");
      setStarting(false);
    }
  }

  if (!ready) return null;

  return (
    <div className="relative flex flex-col h-screen overflow-hidden">
      <PageBackground variant="lobby" />
      <LobbyNavBar title="Create New Game" />

      {/* Body — the panel is height-capped to the viewport; only the inner content
          scrolls when space is tight (never the page) and the action bar stays pinned. */}
      <div className="flex-1 min-h-0 px-6 py-3 flex items-center justify-center">
        <motion.div
          className="w-full max-w-[1180px] max-h-full flex"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ── Single gold-bordered floating panel ── */}
          <div
            className="relative overflow-hidden rounded-[28px] flex flex-col w-full max-h-full"
            style={{
              background: "rgba(16,46,30,0.26)",
              border: "1.5px solid rgba(222,186,98,0.70)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow:
                "0 12px 60px rgba(0,0,0,0.40), 0 0 38px rgba(222,186,98,0.18), inset 0 1px 0 rgba(222,186,98,0.22)",
            }}
          >
            {/* Scrollable content — scrolls internally only when vertical space is tight */}
            <div
              className="flex flex-col gap-2 min-h-0 overflow-y-auto overflow-x-hidden px-7"
              style={{ paddingTop: "clamp(14px, 2.2vh, 22px)" }}
            >
            {/* Room name — slim bar at the top of the panel (functionality preserved) */}
            <Input
              label="Room Name"
              placeholder="e.g. Global Leaders Summit"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              maxLength={80}
            />

            {/* ── TOP: Founders | divider | Investors ── */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-7 items-start">
              {/* Founders (left half) */}
              <div>
                <GroupHeader label="Founders" max={4} />
                <div className="flex gap-3">
                  {founderSlots.map((slot, i) => (
                    <SlotCard
                      key={i}
                      index={i}
                      dropdown={slot.dropdown}
                      avatarId={slot.avatarId}
                      name={slot.name}
                      onChange={(d) => updateFounder(i, d)}
                      isYou={i === 0}
                    />
                  ))}
                </div>
              </div>

              {/* Vertical divider */}
              <div className="w-px self-stretch" style={{ background: "rgba(222,186,98,0.25)" }} />

              {/* Investors (right half) */}
              <div>
                <GroupHeader label="Investors" max={2} />
                <div className="flex gap-3">
                  {investorSlots.map((slot, i) => (
                    <SlotCard
                      key={i}
                      index={i}
                      dropdown={slot.dropdown}
                      avatarId={slot.avatarId}
                      name={slot.name}
                      onChange={(d) => updateInvestor(i, d)}
                    />
                  ))}
                  {/* Spacer to keep the two investor cards left-aligned */}
                  <div className="flex-1 invisible" />
                  <div className="flex-1 invisible" />
                </div>
              </div>
            </div>

            {/* Horizontal divider */}
            <div
              className="h-px w-full"
              style={{ background: "linear-gradient(90deg, transparent, rgba(222,186,98,0.30), transparent)" }}
            />

            {/* ── MIDDLE: Difficulty | Mode | Privacy ── */}
            <div className="grid grid-cols-[0.9fr_1.6fr_0.9fr] gap-7 items-start">
              {/* Difficulty (left) */}
              <div>
                <PanelLabel>Difficulty Level</PanelLabel>
                <div className="flex flex-col gap-1.5">
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <DifficultyToggle
                      key={opt.value}
                      label={opt.label}
                      active={difficulty === opt.value}
                      onSelect={() => setDifficulty(opt.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Mode (center, wider — 3 cards side by side) */}
              <div>
                <PanelLabel>Mode</PanelLabel>
                <div className="flex gap-3">
                  {(["60mins", "short", "full"] as GameMode[]).map((m) => (
                    <div key={m} className="flex-1">
                      <ModeCard
                        mode={m}
                        selected={mode === m}
                        onSelect={() => setMode(m)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy (right) */}
              <div>
                <PanelLabel>Game Privacy</PanelLabel>
                <div className="flex flex-col gap-1">
                  {(["open", "closed", "password"] as RoomPrivacy[]).map((v) => (
                    <PrivacyOption
                      key={v}
                      value={v}
                      selected={privacy}
                      onSelect={handlePrivacySelect}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ── Error banner ── */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="px-4 py-3 text-xs rounded-lg"
                style={{
                  background: "rgba(239,68,68,0.07)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#ef4444",
                }}
              >
                ▲ {error}
              </motion.div>
            )}
            </div>

            {/* ── Pinned action bar: Back (left) · Start Game (center) — always visible ── */}
            <div
              className="flex-shrink-0 relative flex items-center justify-center px-7 pt-2"
              style={{ paddingBottom: "clamp(14px, 2.2vh, 22px)" }}
            >
              <button
                onClick={() => router.push("/lobby")}
                className="absolute left-7 text-[10px] uppercase tracking-[0.3em] font-bold flex items-center gap-2 cursor-pointer transition-colors duration-150"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#22c462")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
              >
                ← BACK
              </button>

              <Button
                size="lg"
                loading={starting}
                disabled={!roomName.trim()}
                onClick={handleStart}
              >
                ▶ Start Game
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Password modal */}
      <AnimatePresence>
        {showPwModal && (
          <PasswordModal
            password={password}
            onChange={setPassword}
            onConfirm={() => setShowPwModal(false)}
            onCancel={() => {
              setShowPwModal(false);
              setPrivacy(prevPrivacy);
              setPassword("");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
