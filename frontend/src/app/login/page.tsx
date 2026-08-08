"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { authApi, ApiError } from "@/lib/api";
import { setSession } from "@/lib/auth";
import Logo from "@/components/Logo";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import PageBackground from "@/components/PageBackground";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    try {
      const result = await authApi.login({ email: data.email, password: data.password });
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
    <div className="relative flex h-full min-h-screen items-center justify-center p-4 overflow-hidden">
      <PageBackground />

      <motion.div
        className="w-full max-w-[420px]"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Back link */}
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
                Commander Login
              </h1>
              <p className="mt-2 text-xs uppercase tracking-[0.25em]" style={{ color: "var(--text-muted)" }}>
                Sign in to access your strategy dashboard
              </p>
            </div>
          </div>

          {/* Teal divider */}
          <div
            className="h-px mb-8"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(29,233,214,0.4) 40%, rgba(212,168,67,0.3) 60%, transparent)",
            }}
          />

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex flex-col gap-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="commander@modernmint.gg"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />

              <div className="flex flex-col gap-1.5">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register("password")}
                />
                <div className="flex justify-end mt-0.5">
                  <button
                    type="button"
                    className="text-[10px] uppercase tracking-widest font-bold transition-colors duration-150 cursor-pointer"
                    style={{ color: "var(--text-faint)" }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--gold)")}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-faint)")}
                    onClick={() => alert("Password reset coming soon.")}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

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
                Enter the Arena
              </Button>
            </div>
          </form>

          {/* Footer */}
          <p
            className="mt-6 text-center text-[11px] uppercase tracking-widest"
            style={{ color: "var(--text-faint)" }}
          >
            New commander?{" "}
            <Link
              href="/signup"
              className="font-bold transition-colors duration-150"
              style={{ color: "var(--teal)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--gold)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--teal)")}
            >
              Create account
            </Link>
          </p>
        </Card>

        <p
          className="mt-5 text-center text-[9px] uppercase tracking-[0.4em]"
          style={{ color: "var(--text-faint)" }}
        >
          All sessions are encrypted end-to-end
        </p>
      </motion.div>
    </div>
  );
}
