import { randomBytes } from "crypto";

/**
 * CSRF Protection Utilities
 * Implements synchronizer token pattern for protecting state-changing operations
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_SECRET = process.env.CSRF_SECRET || process.env.NEXTAUTH_SECRET;

if (!CSRF_SECRET) {
  throw new Error("CSRF_SECRET or NEXTAUTH_SECRET must be defined");
}

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

/**
 * Validate CSRF token from request against session token
 * @param requestToken - Token from request body/headers
 * @param sessionToken - Token stored in session
 * @returns true if tokens match
 */
export function validateCsrfToken(
  requestToken: string | undefined,
  sessionToken: string | undefined
): boolean {
  if (!requestToken || !sessionToken) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  if (requestToken.length !== sessionToken.length) {
    return false;
  }

  const requestBuffer = Buffer.from(requestToken);
  const sessionBuffer = Buffer.from(sessionToken);

  // Use crypto.timingSafeEqual for constant-time comparison
  try {
    const crypto = require("crypto");
    return crypto.timingSafeEqual(requestBuffer, sessionBuffer);
  } catch {
    return false;
  }
}

/**
 * CSRF middleware for API routes
 * Validates CSRF token on state-changing operations (POST, PUT, DELETE, PATCH)
 */
export async function validateCsrfMiddleware(
  request: Request,
  csrfToken: string | undefined
): Promise<{ valid: boolean; error?: string }> {
  const method = request.method;

  // Only validate on state-changing operations
  if (!["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    return { valid: true };
  }

  // Get token from header
  const headerToken = request.headers.get("x-csrf-token");

  // Get token from body (for form submissions)
  let bodyToken: string | undefined;
  try {
    const contentType = request.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const body = await request.clone().json();
      bodyToken = body._csrf;
    } else if (contentType?.includes("application/x-www-form-urlencoded")) {
      const body = await request.clone().formData();
      bodyToken = body.get("_csrf") as string | undefined;
    }
  } catch {
    // Body parsing failed, continue with header-only validation
  }

  const requestToken = headerToken || bodyToken;

  if (!validateCsrfToken(requestToken, csrfToken)) {
    return {
      valid: false,
      error: "Invalid or missing CSRF token",
    };
  }

  return { valid: true };
}
