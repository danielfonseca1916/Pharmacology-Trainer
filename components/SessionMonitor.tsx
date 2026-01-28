"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Session monitor that handles expired sessions
 * Redirects to login on 401 responses
 */
export function SessionMonitor() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    const handleUnauthorized = (event: CustomEvent<{ status: number }>) => {
      if (event.detail.status === 401) {
        // Session expired, redirect to login
        router.push("/login?session=expired");
      }
    };

    window.addEventListener("unauthorized" as any, handleUnauthorized);

    return () => {
      window.removeEventListener("unauthorized" as any, handleUnauthorized);
    };
  }, [router]);

  // Show warning 5 minutes before session expiry (25 min into 30-min session)
  useEffect(() => {
    if (status !== "authenticated" || !session) return;

    // Session expires in 30 days, warn 5 minutes before
    // For practical purposes, we'll check every 5 minutes
    const checkInterval = setInterval(
      () => {
        // Ping session endpoint to keep session alive if user is active
        fetch("/api/auth/session")
          .then((res) => {
            if (!res.ok && res.status === 401) {
              window.dispatchEvent(new CustomEvent("unauthorized", { detail: { status: 401 } }));
            }
          })
          .catch(console.error);
      },
      5 * 60 * 1000
    ); // Every 5 minutes

    return () => clearInterval(checkInterval);
  }, [status, session]);

  return null;
}
