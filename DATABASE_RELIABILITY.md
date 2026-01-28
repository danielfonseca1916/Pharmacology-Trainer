# Database Reliability Guide

This document describes the database layer reliability improvements implemented for the Pharmacology Trainer application.

## Overview

The database layer has been hardened with:

- **Prisma constraints and indexes** for data integrity and query performance
- **Deterministic seed script** that can be run repeatedly without duplicates
- **Database reset utility** for development
- **Comprehensive unit tests** verifying schema constraints and seeding

## Schema Improvements

### Constraints

#### User Model

- **Unique email**: Enforces unique email addresses across the system
  ```prisma
  email String @unique
  ```

#### ProgressByTag Model

- **Composite unique constraint**: Prevents duplicate progress entries per user/module/block/tag combination
  ```prisma
  @@unique([userId, module, courseBlock, tag])
  ```

#### Other Models

- **Cascade delete**: All related records (Attempts, Progress, etc.) are automatically deleted when a user is deleted, maintaining referential integrity

### Indexes for Performance

#### Attempt Model

```prisma
@@index([userId, createdAt])      // For user history queries
@@index([userId, entityType, entityId])  // For attempt lookups
```

#### ProgressByTag Model

```prisma
@@index([userId, module, courseBlock, tag])  // For progress queries
```

#### SpacedRepetitionItem Model

```prisma
@@index([userId, nextReviewAt])   // For review scheduling
```

#### User Model

```prisma
@@index([email])                  // For email lookups
```

#### DatasetOverride Model

```prisma
@@index([isActive])               // For filtering active overrides
@@index([createdById])            // For user dataset queries
```

## Deterministic Seed Script

The seed script (`prisma/seed.ts`) is designed to be **idempotent** - it can be run repeatedly without creating duplicates or errors.

### Features

- Uses `upsert` operations to create or update records without conflicts
- Preserves existing user roles during re-runs
- Automatically updates timestamps on progress data
- Provides detailed logging of operations

### Default Seeded Users

```typescript
demo@pharmtrainer.test (USER)      // Password: Password123!
admin@pharmtrainer.test (ADMIN)    // Password: AdminPassword123!
```

### Seeded Progress Data

- 4 sample progress records for the demo user across different modules
- Cardiology (arrhythmias, hypertension)
- Pulmonary (asthma)
- Pharmacokinetics (dosing)

## Database Management Scripts

### Reset Database (Development Only)

```bash
pnpm db:reset
```

Completely resets the database and re-runs migrations:

1. Drops all tables
2. Re-applies all migrations
3. Runs the seed script
4. Returns to a known-good state

**⚠️ WARNING**: This destructive operation is only for development. Use with caution.

### Seed Database

```bash
pnpm db:seed
```

Runs the seed script without resetting. Safe to run multiple times.

### Migrate Database

```bash
pnpm prisma:migrate
```

Creates and applies new migrations based on schema changes.

### Prisma Studio

```bash
pnpm prisma:studio
```

Opens an interactive database browser at `http://localhost:5555`

## Testing

### Database Schema Tests

Run tests to verify all constraints and indexes work correctly:

```bash
pnpm test -- tests/database-schema.test.ts
```

### Test Coverage

- ✅ Unique constraints (User.email, ProgressByTag composite)
- ✅ Index queries (Attempt, ProgressByTag)
- ✅ Enum types (AttemptEntityType, Role)
- ✅ Cascade deletes
- ✅ Seed script validation
- ✅ Role-based access control

All tests pass: **77/77 tests** ✅

## Best Practices

### For Development

1. Use `pnpm db:reset` to start fresh
2. Run `pnpm db:seed` to populate test data
3. Use `pnpm prisma:studio` to inspect data

### For Migrations

1. Make schema changes in `prisma/schema.prisma`
2. Run `pnpm prisma:migrate` and name the migration descriptively
3. Test migration with `pnpm db:reset`
4. Commit both schema and migration files

### For New Features

1. Add new constraints/indexes to schema
2. Update seed script if new seeded data needed
3. Add tests in `tests/database-schema.test.ts`
4. Run full test suite: `pnpm test`

## Performance Considerations

### Indexes

The implemented indexes optimize common query patterns:

- User lookups by email
- Attempt history by user and date
- Progress queries filtered by user/module/block/tag
- SRS review scheduling

### Query Optimization

Prisma will automatically use indexes for:

```typescript
// Uses @@index([userId, createdAt])
await prisma.attempt.findMany({
  where: { userId: 123 },
  orderBy: { createdAt: "desc" },
});

// Uses @@unique constraint
await prisma.progressByTag.findUnique({
  where: {
    userId_module_courseBlock_tag: {
      userId: 123,
      module: "questions",
      courseBlock: "cardiology",
      tag: "arrhythmias",
    },
  },
});
```

## Troubleshooting

### Database Locked Error

If you get "database is locked" errors:

1. Stop all running processes using the database
2. Run `pnpm db:reset` to clear locks
3. Restart your dev server

### Migration Conflicts

If migrations fail:

1. Check if `prisma/migrations/` is in sync with schema
2. Run `pnpm prisma:migrate` to resolve
3. Use `pnpm db:reset` if issues persist

### Seed Failures

If seeding fails:

1. Check database connectivity
2. Ensure schema is migrated: `pnpm prisma:migrate`
3. View detailed logs: run seed with `pnpm seed`
4. Clean start: `pnpm db:reset`

## Migration from Old Schema

If upgrading from a previous version:

1. Back up your database: `cp prisma/dev.db prisma/dev.db.bak`
2. Run migrations: `pnpm prisma:migrate`
3. Verify data integrity: `pnpm test -- tests/database-schema.test.ts`
4. Reseed if needed: `pnpm db:seed`

## References

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Indexes](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#index)
