import { NextResponse } from "next/server";

export function middleware() {
  const response = NextResponse.next();

  // Security Headers
  const headers = {
    // Content Security Policy (CSP-lite for development flexibility)
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-inline for Next.js dev
      "style-src 'self' 'unsafe-inline'", // unsafe-inline for Tailwind
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; "),

    // Prevent clickjacking
    "X-Frame-Options": "DENY",

    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",

    // Referrer policy
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Permissions policy (disable unnecessary features)
    "Permissions-Policy": [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "interest-cohort=()",
    ].join(", "),

    // XSS Protection (legacy but harmless)
    "X-XSS-Protection": "1; mode=block",
  };

  // Apply all security headers
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
