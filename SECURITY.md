# Security Documentation

## Overview

This document outlines the security measures implemented in the Pharmacology Trainer application.

## Authentication & Session Management

### NextAuth Configuration

- **Session Strategy**: JWT-based sessions
- **Session Duration**: 30 days (configurable via `maxAge`)
- **Cookie Settings**:
  - `httpOnly: true` - Prevents JavaScript access to cookies
  - `sameSite: 'lax'` - CSRF protection
  - `secure: true` (production only) - HTTPS-only cookies
  - Secure cookie names in production (`__Secure-` prefix)

### Password Policy

Passwords must meet the following requirements:
- Minimum 8 characters
- At least one number
- At least one letter
- Cannot contain common patterns (password, 123456, qwerty, etc.)

Error messages are provided in both English and Czech.

## Rate Limiting

### Implementation

**Development**: Simple in-memory rate limiter (current implementation)
**Production**: Consider Redis-based solution (e.g., `@upstash/ratelimit`)

### Limits

- **Login**: 5 attempts per 15 minutes per IP
- **Registration**: 3 attempts per hour per IP
- **API calls**: 100 requests per minute per IP

### Rate Limit Headers

When rate limited, responses include:
- HTTP 429 status code
- `Retry-After` header with seconds until reset

## Input Validation

All user inputs are validated using Zod schemas:

### API Routes with Validation

1. **Login** (`/api/login`)
   - Email format validation
   - Password presence check

2. **Registration** (`/api/register`)
   - Email format validation
   - Password strength validation
   - Language option validation

3. **Admin Dataset Import** (`/api/admin/import`)
   - File size limits (handled by Next.js)
   - JSON structure validation
   - Metadata validation (name, description)

4. **Admin Override Management** (`/api/admin/overrides/[id]`)
   - ID format validation (numeric only)
   - Prevents injection attacks

## Security Headers

Applied via middleware to all routes:

### Content Security Policy (CSP)
```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self' data:;
connect-src 'self';
frame-ancestors 'none';
```

**Note**: `unsafe-inline` and `unsafe-eval` are required for Next.js development mode. For production, consider nonce-based CSP.

### Additional Headers

- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer info
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` - Disables unnecessary features
- `X-XSS-Protection: 1; mode=block` - Legacy XSS protection

## Authorization

### Admin Protection

Admin routes (`/admin/*`) are protected by the `requireAdmin()` middleware:

1. Checks for valid session
2. Verifies user has ADMIN role
3. Redirects unauthorized users:
   - No session → `/login`
   - Non-admin → `/dashboard`

### Testing

Authorization is tested in `tests/auth-protection.test.ts`:
- Unauthenticated access blocked
- Regular users blocked from admin routes
- Admin users granted access

## Production Recommendations

### 1. Environment Variables

Ensure these are set in production:
```env
AUTH_SECRET=<strong-random-secret>
AUTH_URL=https://your-domain.com
DATABASE_URL=<production-database-url>
NODE_ENV=production
```

### 2. Rate Limiting

For production, replace in-memory rate limiting with Redis:

```bash
npm install @upstash/ratelimit @upstash/redis
```

Update `lib/rate-limit.ts`:
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const loginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
});
```

### 3. Content Security Policy

For production, use nonce-based CSP with stricter policies:
- Remove `unsafe-inline` and `unsafe-eval`
- Add nonces to script and style tags
- Consider using `next.config.ts` for header configuration

### 4. HTTPS

Always use HTTPS in production:
- Enables secure cookies
- Prevents man-in-the-middle attacks
- Required for modern browser features

### 5. Database Security

- Use connection pooling
- Enable SSL/TLS for database connections
- Regular backups
- Principle of least privilege for database users

### 6. Monitoring

Consider adding:
- Error tracking (Sentry, Bugsnag)
- Security event logging
- Failed login attempt monitoring
- Rate limit violation alerts

## Security Testing

Run security tests:
```bash
npm test tests/security.test.ts
npm test tests/auth-protection.test.ts
```

## Reporting Security Issues

If you discover a security vulnerability, please email: [security contact email]

Do not create public GitHub issues for security vulnerabilities.
