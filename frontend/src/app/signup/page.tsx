"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { signupSchema, type SignupInput } from "@/lib/validations";
import { authApi, ApiError } from "@/lib/api";
import { setSession } from "@/lib/auth";
import Logo from "@/components/Logo";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import PageBackground from "@/components/PageBackground";

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  const password = watch("password", "");
  const strengthChecks = [
    { label: "8+ chars",   ok: password.length >= 8    },
    { label: "Uppercase",  ok: /[A-Z]/.test(password)  },
    { label: "Number",     ok: /[0-9]/.test(password)  },
  ];
  const score = strengthChecks.filter((c) => c.ok).length;
  const strengthColor =
    score === 0 ? "rgba(29,233,214,0.08)"
    : score === 1 ? "#ef4444"
    : score === 2 ? "#f59e0b"
    : "var(--teal)";

  async function onSubmit(data: SignupInput) {
    setServerError(null);
    try {
      const result = await authApi.signup({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      setSession(result.token, result.user);
      router.push("/lobby");
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Unable to connect. Please check your connection and try again.");
      }
    }
  }

  return (
    <div className="relative flex h-full min-h-screen items-center justify-center p-4 py-12 overflow-hidden">
      <PageBackground />

      <motion.div
        className="w-full max-w-[420px]"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 mb-8 text-[10px] uppercase tracking-[0.35em] font-bold transition-colors duration-150"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--teal)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
        >
          ◀ Main Menu
        </Link>

        <Card className="p-8">
          {/* ── Header ── */}
          <div className="flex flex-col items-center mb-8">
            <Logo size="md" />
            <div className="mt-6 text-center">
              <h1
                className="text-xl font-black uppercase tracking-[0.18em]"
                style={{ color: "var(--text-primary)" }}
              >
                Enlist as Commander
              </h1>
              <p className="mt-2 text-xs uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
                Create your account to join the battlefield
              </p>
            </div>
          </div>

          {/* Step tracker */}
          <div className="flex items-center gap-3 mb-8">
            {["Account", "Security", "Confirm"].map((step, i) => (
              <div key={step} className="flex items-center gap-2 flex-1">
                <div
                  className="w-6 h-6 flex items-center justify-center text-[10px] font-black border rounded-sm"
                  style={{
                    borderColor: i === 0 ? "var(--teal)" : "rgba(29,233,214,0.15)",
                    color: i === 0 ? "var(--teal)" : "var(--text-faint)",
                    background: i === 0 ? "rgba(29,233,214,0.08)" : "transparent",
                  }}
                >
                  {i + 1}
                </div>
                <span
                  className="text-[9px] uppercase tracking-widest font-bold"
                  style={{ color: i === 0 ? "var(--teal)" : "var(--text-faint)" }}
                >
                  {step}
                </span>
                {i < 2 && (
                  <div
                    className="flex-1 h-px ml-1"
                    style={{ background: "rgba(29,233,214,0.10)" }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Gold divider */}
          <div
            className="h-px mb-8"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(212,168,67,0.35) 40%, rgba(29,233,214,0.25) 60%, transparent)",
            }}
          />

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex flex-col gap-5">
              <Input
                label="Username / Call Sign"
                type="text"
                placeholder="YourCallSign"
                autoComplete="username"
                hint="Letters, numbers, underscores only"
                error={errors.username?.message}
                {...register("username")}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="commander@modernmint.gg"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />

              <div className="flex flex-col gap-2">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  error={errors.password?.message}
                  {...register("password")}
                />

                {/* Strength meter */}
                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col gap-1.5 pl-0.5"
                  >
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-0.5 flex-1 rounded-full transition-all duration-300"
                          style={{
                            background: i < score ? strengthColor : "rgba(29,233,214,0.08)",
                            boxShadow: i < score ? `0 0 6px ${strengthColor}` : "none",
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-3">
                      {strengthChecks.map(({ label, ok }) => (
                        <span
                          key={label}
                          className="text-[9px] uppercase tracking-widest font-bold transition-colors"
                          style={{ color: ok ? "var(--teal)" : "var(--text-faint)" }}
                        >
                          {ok ? "✓ " : "○ "}{label}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat your password"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />

              {serverError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-4 py-3 text-xs text-red-400"
                  style={{
                    background: "rgba(239,68,68,0.07)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: "6px",
                  }}
                >
                  ▲ {serverError}
                </motion.div>
              )}

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={isSubmitting}
                className="mt-2"
              >
                Create Account
              </Button>
            </div>
          </form>

          <p
            className="mt-6 text-center text-[11px] uppercase tracking-widest"
            style={{ color: "var(--text-faint)" }}
          >
            Already enlisted?{" "}
            <Link
              href="/login"
              className="font-black transition-colors duration-150"
              style={{ color: "var(--teal)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--gold)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--teal)")}
            >
              Sign in
            </Link>
          </p>
        </Card>

        <p
          className="mt-5 text-center text-[9px] uppercase tracking-[0.4em]"
          style={{ color: "var(--text-faint)" }}
        >
          By signing up you agree to our Terms of Service
        </p>
      </motion.div>
    </div>
  );
}
