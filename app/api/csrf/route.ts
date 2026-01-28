import { auth } from "@/auth";
import { generateCsrfToken } from "@/lib/csrf";
import { NextResponse } from "next/server";

/**
 * GET /api/csrf
 * Returns a CSRF token for the current session
 * This token should be included in all state-changing requests
 */
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = generateCsrfToken();

  // In a production app, you'd store this in the session or a secure store
  // For now, we return it for the client to include in subsequent requests
  return NextResponse.json({
    csrfToken: token,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
  });
}
