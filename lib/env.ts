/**
 * Environment variable validation with Zod
 * Validates all required environment variables at runtime
 * Fails fast if configuration is invalid
 */

import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .describe("Database connection string (e.g., file:./prisma/dev.db)"),

  // NextAuth
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters for security")
    .describe("Secret key for NextAuth.js session encryption"),

  NEXTAUTH_URL: z
    .string()
    .url("NEXTAUTH_URL must be a valid URL")
    .describe("Canonical URL of your application (e.g., https://example.com)"),

  // Node environment
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development")
    .describe("Node environment"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 * Call this at the start of your application
 * @throws {Error} If validation fails
 */
export function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Environment validation failed");
  }

  return parsed.data;
}

/**
 * Get validated environment variables
 * Safe to use after validateEnv() has been called
 */
let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

/**
 * Check if app is in production mode
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === "production";
}

/**
 * Check if app is in development mode
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === "development";
}
