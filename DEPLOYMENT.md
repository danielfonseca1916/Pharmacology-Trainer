# Deployment Guide

This document provides guidance for deploying the Pharmacology Trainer application to production.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Database Considerations](#database-considerations)
3. [Recommended Hosting Options](#recommended-hosting-options)
4. [Pre-Deployment Checklist](#pre-deployment-checklist)
5. [Health Checks](#health-checks)
6. [Security Hardening](#security-hardening)

## Environment Variables

### Required Variables

All environment variables are validated at startup using Zod. The application will fail fast if required variables are missing or invalid.

```bash
# Database connection
DATABASE_URL="file:./prisma/dev.db"  # For SQLite
# DATABASE_URL="postgresql://user:pass@host:5432/dbname"  # For PostgreSQL

# NextAuth.js session encryption
# Generate: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-key-min-32-characters"

# Application URL (canonical URL)
NEXTAUTH_URL="https://pharmtrainer.example.com"

# Node environment
NODE_ENV="production"
```

### Generate Secure Secret

```bash
# On Linux/macOS:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Configuration File

Copy `.env.example` to `.env` and fill in production values:

```bash
cp .env.example .env
# Edit .env with your production values
```

## Database Considerations

### SQLite (Default)

**Pros:**

- Zero configuration
- File-based, easy backups
- Perfect for demos and small deployments
- No separate database server needed

**Cons:**

- Not suitable for high-concurrency production (10+ simultaneous writes)
- Single file - can't scale horizontally
- Limited by disk I/O

**Best for:** Small teams (< 50 users), internal tools, demos, development

**Deployment Notes:**

- Ensure SQLite file has write permissions
- Back up `prisma/dev.db` regularly
- Consider mounting the database file to a persistent volume in containerized deployments

### PostgreSQL (Recommended for Production)

**Pros:**

- Production-grade reliability
- Handles high concurrency
- Scales horizontally with replicas
- Advanced features (full-text search, JSON support, etc.)

**Cons:**

- Requires separate database server
- More complex setup

**Migration from SQLite:**

1. Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

2. Update `DATABASE_URL` in `.env`:

```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

3. Generate new migration:

```bash
npx prisma migrate dev --name switch_to_postgresql
npx prisma generate
```

4. Seed the database:

```bash
npm run seed
```

### MySQL/MariaDB

Also supported. Change `provider` to `"mysql"` in `prisma/schema.prisma`.

## Recommended Hosting Options

### 1. Vercel (Easiest)

**Best for:** Most use cases, rapid deployment

**Setup:**

1. Push code to GitHub
2. Import repository in Vercel dashboard
3. Add environment variables in Vercel settings
4. Deploy

**Database Options:**

- Vercel Postgres (recommended)
- Neon (serverless PostgreSQL)
- PlanetScale (MySQL)

**Pros:**

- Zero-config deployment
- Automatic HTTPS
- Edge network CDN
- Preview deployments
- Free tier available

**Cons:**

- SQLite not recommended (ephemeral filesystem)

**Configuration:**

```bash
# vercel.json (optional)
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

### 2. Netlify

Similar to Vercel, supports Next.js with serverless functions.

### 3. Railway

**Best for:** SQLite deployments, simple setup

**Pros:**

- Persistent volumes for SQLite
- PostgreSQL database included
- Simple pricing

**Setup:**

1. Connect GitHub repository
2. Add environment variables
3. Add persistent volume for SQLite (if using)
4. Deploy

### 4. Docker + VPS (Most Control)

**Best for:** Full control, custom infrastructure

**Dockerfile:**

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
```

**docker-compose.yml (with PostgreSQL):**

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "postgresql://postgres:password@db:5432/pharmtrainer"
      NEXTAUTH_SECRET: "${NEXTAUTH_SECRET}"
      NEXTAUTH_URL: "${NEXTAUTH_URL}"
      NODE_ENV: "production"
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: pharmtrainer
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### 5. AWS (ECS/Fargate + RDS)

**Best for:** Enterprise deployments, high availability

**Components:**

- ECS/Fargate: Container orchestration
- RDS PostgreSQL: Managed database
- ALB: Load balancer
- CloudFront: CDN

## Pre-Deployment Checklist

### 1. Environment Setup

- [ ] Generate secure `NEXTAUTH_SECRET` (min 32 chars)
- [ ] Set correct `NEXTAUTH_URL` (production domain)
- [ ] Configure `DATABASE_URL` for production database
- [ ] Set `NODE_ENV=production`
- [ ] Verify all environment variables with `npm run check:env` (if available)

### 2. Database

- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Seed database: `npm run seed`
- [ ] Create admin user: `npm run admin:promote -- --email=admin@example.com`
- [ ] Test database connection
- [ ] Set up automated backups

### 3. Security

- [ ] Enable HTTPS (Let's Encrypt, Cloudflare, or provider SSL)
- [ ] Set secure headers (see `next.config.ts`)
- [ ] Review CORS settings if needed
- [ ] Enable rate limiting (consider Vercel/Cloudflare protection)
- [ ] Review authentication settings

### 4. Testing

- [ ] Run full test suite: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Health check passes: `curl https://your-domain.com/api/health`
- [ ] Test authentication flow
- [ ] Test all modules (Questions, Cases, Drugs, etc.)

### 5. Monitoring

- [ ] Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Configure error tracking (Sentry, LogRocket, etc.)
- [ ] Set up log aggregation
- [ ] Configure alerts for health check failures

### 6. Performance

- [ ] Enable Next.js image optimization
- [ ] Review bundle size: `npm run build` (check output)
- [ ] Enable compression (Vercel does this automatically)
- [ ] Configure CDN if not using Vercel

## Health Checks

### Endpoint

`GET /api/health`

Returns JSON with application health status.

**Response (200 OK):**

```json
{
  "status": "healthy",
  "timestamp": "2026-01-28T12:00:00.000Z",
  "checks": {
    "env": { "status": "ok" },
    "database": { "status": "ok" },
    "dataset": { "status": "ok" }
  },
  "version": "0.1.0"
}
```

**Response (503 Service Unavailable):**

```json
{
  "status": "unhealthy",
  "timestamp": "2026-01-28T12:00:00.000Z",
  "checks": {
    "env": { "status": "ok" },
    "database": {
      "status": "error",
      "message": "Database connection failed"
    },
    "dataset": { "status": "ok" }
  }
}
```

### Monitoring Setup

**UptimeRobot:**

1. Add new monitor (HTTP(s))
2. URL: `https://your-domain.com/api/health`
3. Interval: 5 minutes
4. Alert: Email/SMS on failure

**Docker Health Check:**

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1
```

**Kubernetes Liveness/Readiness Probes:**

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 30

readinessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
```

## Security Hardening

### 1. Headers

Already configured in `next.config.ts`. Verify:

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### 2. HTTPS

Always use HTTPS in production. Most hosting providers handle this automatically.

### 3. Rate Limiting

Consider adding rate limiting middleware:

```typescript
// middleware.ts (example)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiter (use Redis in production)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const limit = rateLimit.get(ip);

  if (limit && now < limit.resetTime) {
    if (limit.count >= 100) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
    limit.count++;
  } else {
    rateLimit.set(ip, { count: 1, resetTime: now + 60000 }); // 1 min
  }

  return NextResponse.next();
}
```

### 4. Secrets Management

Never commit `.env` to git. Use platform secret management:

- Vercel: Environment Variables in dashboard
- AWS: Systems Manager Parameter Store or Secrets Manager
- Docker: Docker secrets or environment variables

### 5. Database Security

- Use connection pooling (Prisma does this automatically)
- Enable SSL for database connections in production
- Restrict database access by IP
- Regular backups with encryption

## Backup Strategy

### Database Backups

**PostgreSQL:**

```bash
# Automated daily backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20260128.sql
```

**SQLite:**

```bash
# Copy file
cp prisma/dev.db backups/backup-$(date +%Y%m%d).db

# Or use sqlite3
sqlite3 prisma/dev.db ".backup 'backup.db'"
```

### Automated Backups

Set up cron job or use platform-specific backup services:

- Vercel Postgres: Automatic backups
- Railway: Point-in-time recovery
- AWS RDS: Automated backups with retention

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues

```bash
# Test connection
npx prisma db pull

# Reset database (⚠️ DESTRUCTIVE)
npx prisma migrate reset
```

### Health Check Fails

```bash
# Check locally
curl http://localhost:3000/api/health

# Check logs
npm run dev  # Look for errors
```

## Scaling Considerations

### Horizontal Scaling

- Use PostgreSQL or MySQL (not SQLite)
- Enable session persistence (database-backed sessions)
- Consider Redis for caching
- Use CDN for static assets

### Performance Optimization

- Enable Next.js image optimization
- Use ISR (Incremental Static Regeneration) where appropriate
- Implement caching headers
- Monitor bundle size

### High Availability

- Deploy to multiple regions
- Use load balancer
- Database replicas for read scaling
- Implement graceful shutdown

## Support

For deployment issues:

1. Check health endpoint: `/api/health`
2. Review application logs
3. Verify environment variables
4. Test database connection
5. Check platform-specific documentation

---

**Last Updated:** January 2026  
**Next Review:** Before each major release
