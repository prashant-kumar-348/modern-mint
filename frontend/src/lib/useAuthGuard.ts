"use client";

import { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

/**
 * Route guard for lobby pages.
 *
 * - Runs after the first client render (localStorage is available).
 * - If the user is NOT authenticated, immediately redirects to /login.
 * - Returns `true` only once authentication is confirmed, allowing the
 *   protected page to render.
 * - Returns `false` while the check is pending or while redirecting —
 *   callers should render nothing (or a skeleton) in that state.
 */
export function useAuthGuard(): boolean {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      startTransition(() => setReady(true));
    } else {
      router.replace("/login");
    }
  }, [router]);

  return ready;
}
