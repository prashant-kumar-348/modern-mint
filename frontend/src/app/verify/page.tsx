"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageBackground from "@/components/PageBackground";

const CODE_LENGTH = 6;

export default function VerifyPage() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join("");
  const isComplete = code.length === CODE_LENGTH && !digits.includes("");

  const focusNext = useCallback((i: number) => inputRefs.current[i + 1]?.focus(), []);
  const focusPrev = useCallback((i: number) => inputRefs.current[i - 1]?.focus(), []);

  function handleChange(index: number, value: string) {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    setError(null);
    if (cleaned) focusNext(index);
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index]) focusPrev(index);
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    const next = Array(CODE_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  }

  async function handleVerify() {
    if (!isComplete) return;
    setIsVerifying(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setSuccess(true);
      setTimeout(() => router.push("/menu"), 2200);
    } catch {
      setError("Invalid code. Please check and try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setIsResending(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setCooldown(60);
      const iv = setInterval(() =>
        setCooldown((c) => { if (c <= 1) { clearInterval(iv); return 0; } return c - 1; }), 1000
      );
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="relative flex h-full min-h-screen items-center justify-center p-4 overflow-hidden">
      <PageBackground />

      <motion.div
        className="w-full max-w-[420px]"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          href="/login"
          className="inline-flex items-center gap-2 mb-8 text-[10px] uppercase tracking-[0.35em] font-bold transition-colors duration-150"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--teal)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
        >
          ◀ Back to Login
        </Link>

        <Card className="p-8">
          <div className="flex flex-col items-center mb-8">
            <Logo size="md" />
            <div className="mt-6 text-center">
              <h1
                className="text-xl font-black uppercase tracking-[0.18em]"
                style={{ color: "var(--text-primary)" }}
              >
                Identity Verification
              </h1>
              <p className="mt-2 text-xs uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
                Enter the 6-digit code sent to your email
              </p>
            </div>
          </div>

          <div
            className="h-px mb-8"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(29,233,214,0.4) 40%, rgba(212,168,67,0.3) 60%, transparent)",
            }}
          />

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-5 py-10"
              >
                <motion.div
                  className="w-20 h-20 flex items-center justify-center text-4xl"
                  style={{
                    background: "rgba(29,233,214,0.07)",
                    border: "2px solid rgba(29,233,214,0.45)",
                    borderRadius: "50%",
                    boxShadow: "0 0 32px rgba(29,233,214,0.25)",
                  }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 0.6 }}
                >
                  ✓
                </motion.div>
                <p
                  className="font-black text-lg uppercase tracking-[0.18em] glow-teal"
                  style={{ color: "var(--teal)" }}
                >
                  Verified
                </p>
                <p
                  className="text-xs uppercase tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  Redirecting to command center…
                </p>
              </motion.div>
            ) : (
              <motion.div key="form" className="flex flex-col gap-6">
                {/* OTP digit inputs */}
                <div
                  className="flex justify-center gap-2.5"
                  onPaste={handlePaste}
                >
                  {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digits[i]}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className="text-center text-xl font-black transition-all duration-200 focus:outline-none"
                      style={{
                        width: 48,
                        height: 56,
                        borderRadius: 6,
                        background: "rgba(6,20,26,0.85)",
                        color: "var(--teal)",
                        border: digits[i]
                          ? "1.5px solid rgba(29,233,214,0.65)"
                          : "1.5px solid rgba(29,233,214,0.18)",
                        boxShadow: digits[i]
                          ? "0 0 14px rgba(29,233,214,0.18)"
                          : "none",
                        textShadow: digits[i]
                          ? "0 0 10px rgba(29,233,214,0.7)"
                          : "none",
                      }}
                    />
                  ))}
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-[11px] uppercase tracking-widest text-red-400"
                  >
                    ▲ {error}
                  </motion.p>
                )}

                <Button
                  fullWidth
                  size="lg"
                  disabled={!isComplete}
                  loading={isVerifying}
                  onClick={handleVerify}
                >
                  Verify &amp; Enter
                </Button>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={cooldown > 0 || isResending}
                    className="text-[10px] uppercase tracking-widest font-bold transition-colors duration-150 cursor-pointer"
                    style={{
                      color: cooldown > 0 || isResending
                        ? "var(--text-faint)"
                        : "var(--text-muted)",
                      cursor: cooldown > 0 ? "not-allowed" : "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (cooldown === 0 && !isResending)
                        (e.target as HTMLElement).style.color = "var(--gold)";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.color =
                        cooldown > 0 || isResending ? "var(--text-faint)" : "var(--text-muted)";
                    }}
                  >
                    {isResending
                      ? "Sending…"
                      : cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : "Resend verification code"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <p
          className="mt-5 text-center text-[9px] uppercase tracking-[0.4em]"
          style={{ color: "var(--text-faint)" }}
        >
          Code expires in 15 minutes
        </p>
      </motion.div>
    </div>
  );
}
