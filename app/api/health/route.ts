/**
 * Health check endpoint
 * Returns 200 if app is healthy, 503 if not
 * Checks:
 * - Environment variables are valid
 * - Database is reachable
 * - Dataset can be loaded
 */

import { getDatasetSafe } from "@/lib/dataset-loader";
import { getEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface HealthCheckResult {
  status: "healthy" | "unhealthy";
  timestamp: string;
  checks: {
    env: { status: "ok" | "error"; message?: string };
    database: { status: "ok" | "error"; message?: string };
    dataset: { status: "ok" | "error"; message?: string };
  };
  version?: string;
}

export async function GET() {
  const result: HealthCheckResult = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    checks: {
      env: { status: "ok" },
      database: { status: "ok" },
      dataset: { status: "ok" },
    },
  };

  let allHealthy = true;

  // Check 1: Environment variables
  try {
    getEnv();
    result.checks.env.status = "ok";
  } catch (error) {
    result.checks.env.status = "error";
    result.checks.env.message =
      error instanceof Error ? error.message : "Environment validation failed";
    allHealthy = false;
  }

  // Check 2: Database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    result.checks.database.status = "ok";
  } catch (error) {
    result.checks.database.status = "error";
    result.checks.database.message =
      error instanceof Error ? error.message : "Database connection failed";
    allHealthy = false;
  }

  // Check 3: Dataset loading
  try {
    const dataset = getDatasetSafe();
    if (!dataset || dataset.drugs.length === 0) {
      throw new Error("Dataset is empty or invalid");
    }
    result.checks.dataset.status = "ok";
  } catch (error) {
    result.checks.dataset.status = "error";
    result.checks.dataset.message = error instanceof Error ? error.message : "Dataset load failed";
    allHealthy = false;
  }

  // Set overall status
  result.status = allHealthy ? "healthy" : "unhealthy";

  // Add version if available
  try {
    const packageJson = require("@/package.json");
    result.version = packageJson.version;
  } catch {
    // Version not critical
  }

  // Return appropriate HTTP status code
  return NextResponse.json(result, {
    status: allHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Content-Type": "application/json",
    },
  });
}
