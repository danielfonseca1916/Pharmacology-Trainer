import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies BEFORE importing the route
vi.mock("@/lib/env", () => ({
  getEnv: vi.fn(),
}));

vi.mock("@/lib/dataset-loader", () => ({
  getDatasetSafe: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

vi.mock("@/package.json", () => ({
  default: { version: "0.1.0" },
}));

import { GET } from "@/app/api/health/route";
import { getDatasetSafe } from "@/lib/dataset-loader";
import { getEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

describe("/api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 and healthy status when all checks pass", async () => {
    // Mock all checks to succeed
    vi.mocked(getEnv).mockReturnValue({
      DATABASE_URL: "file:./test.db",
      NEXTAUTH_SECRET: "test-secret-min-32-characters-long",
      NEXTAUTH_URL: "http://localhost:3000",
      NODE_ENV: "test" as const,
    });

    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ "1": 1 }]);

    vi.mocked(getDatasetSafe).mockReturnValue({
      courseBlocks: [],
      drugs: [{ id: "test", nameEn: "Test Drug", nameCs: "Test Drug" } as any],
      questions: [],
      caseStudies: [],
      interactions: [],
      dosageCalculations: [],
      flashcards: [],
    });

    const response = await GET();

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toMatchObject({
      status: "healthy",
      checks: {
        env: { status: "ok" },
        database: { status: "ok" },
        dataset: { status: "ok" },
      },
    });
    expect(data.timestamp).toBeDefined();
    // Version is optional and may not be available during tests
  });

  it("should return 503 and unhealthy status when env validation fails", async () => {
    // Mock env validation to fail
    vi.mocked(getEnv).mockImplementation(() => {
      throw new Error("Environment validation failed");
    });

    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ "1": 1 }]);
    vi.mocked(getDatasetSafe).mockReturnValue({
      courseBlocks: [],
      drugs: [{ id: "test" } as any],
      questions: [],
      caseStudies: [],
      interactions: [],
      dosageCalculations: [],
      flashcards: [],
    });

    const response = await GET();

    expect(response.status).toBe(503);

    const data = await response.json();
    expect(data.status).toBe("unhealthy");
    expect(data.checks.env.status).toBe("error");
    expect(data.checks.env.message).toContain("Environment validation failed");
  });

  it("should return 503 and unhealthy status when database connection fails", async () => {
    // Mock database connection to fail
    vi.mocked(getEnv).mockReturnValue({
      DATABASE_URL: "file:./test.db",
      NEXTAUTH_SECRET: "test-secret-min-32-characters-long",
      NEXTAUTH_URL: "http://localhost:3000",
      NODE_ENV: "test" as const,
    });

    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error("Database connection failed"));

    vi.mocked(getDatasetSafe).mockReturnValue({
      courseBlocks: [],
      drugs: [{ id: "test" } as any],
      questions: [],
      caseStudies: [],
      interactions: [],
      dosageCalculations: [],
      flashcards: [],
    });

    const response = await GET();

    expect(response.status).toBe(503);

    const data = await response.json();
    expect(data.status).toBe("unhealthy");
    expect(data.checks.database.status).toBe("error");
    expect(data.checks.database.message).toContain("Database connection failed");
  });

  it("should return 503 and unhealthy status when dataset loading fails", async () => {
    // Mock dataset loading to fail
    vi.mocked(getEnv).mockReturnValue({
      DATABASE_URL: "file:./test.db",
      NEXTAUTH_SECRET: "test-secret-min-32-characters-long",
      NEXTAUTH_URL: "http://localhost:3000",
      NODE_ENV: "test" as const,
    });

    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ "1": 1 }]);

    vi.mocked(getDatasetSafe).mockImplementation(() => {
      throw new Error("Dataset load failed");
    });

    const response = await GET();

    expect(response.status).toBe(503);

    const data = await response.json();
    expect(data.status).toBe("unhealthy");
    expect(data.checks.dataset.status).toBe("error");
    expect(data.checks.dataset.message).toContain("Dataset load failed");
  });

  it("should return 503 when dataset has no drugs", async () => {
    // Mock dataset with no drugs (invalid state)
    vi.mocked(getEnv).mockReturnValue({
      DATABASE_URL: "file:./test.db",
      NEXTAUTH_SECRET: "test-secret-min-32-characters-long",
      NEXTAUTH_URL: "http://localhost:3000",
      NODE_ENV: "test" as const,
    });

    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ "1": 1 }]);

    vi.mocked(getDatasetSafe).mockReturnValue({
      courseBlocks: [],
      drugs: [], // Empty drugs array
      questions: [],
      caseStudies: [],
      interactions: [],
      dosageCalculations: [],
      flashcards: [],
    });

    const response = await GET();

    expect(response.status).toBe(503);

    const data = await response.json();
    expect(data.status).toBe("unhealthy");
    expect(data.checks.dataset.status).toBe("error");
    expect(data.checks.dataset.message).toContain("Dataset is empty");
  });

  it("should include proper cache headers", async () => {
    // Mock all checks to succeed
    vi.mocked(getEnv).mockReturnValue({
      DATABASE_URL: "file:./test.db",
      NEXTAUTH_SECRET: "test-secret-min-32-characters-long",
      NEXTAUTH_URL: "http://localhost:3000",
      NODE_ENV: "test" as const,
    });

    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ "1": 1 }]);

    vi.mocked(getDatasetSafe).mockReturnValue({
      courseBlocks: [],
      drugs: [{ id: "test" } as any],
      questions: [],
      caseStudies: [],
      interactions: [],
      dosageCalculations: [],
      flashcards: [],
    });

    const response = await GET();

    // Check cache headers
    expect(response.headers.get("Cache-Control")).toBe("no-cache, no-store, must-revalidate");
    expect(response.headers.get("Content-Type")).toBe("application/json");
  });

  it("should return consistent response structure", async () => {
    // Mock all checks to succeed
    vi.mocked(getEnv).mockReturnValue({
      DATABASE_URL: "file:./test.db",
      NEXTAUTH_SECRET: "test-secret-min-32-characters-long",
      NEXTAUTH_URL: "http://localhost:3000",
      NODE_ENV: "test" as const,
    });

    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ "1": 1 }]);

    vi.mocked(getDatasetSafe).mockReturnValue({
      courseBlocks: [],
      drugs: [{ id: "test" } as any],
      questions: [],
      caseStudies: [],
      interactions: [],
      dosageCalculations: [],
      flashcards: [],
    });

    const response = await GET();

    const data = await response.json();

    // Validate response structure
    expect(data).toHaveProperty("status");
    expect(data).toHaveProperty("timestamp");
    expect(data).toHaveProperty("checks");
    // Version is optional

    expect(data.checks).toHaveProperty("env");
    expect(data.checks).toHaveProperty("database");
    expect(data.checks).toHaveProperty("dataset");

    expect(data.checks.env).toHaveProperty("status");
    expect(data.checks.database).toHaveProperty("status");
    expect(data.checks.dataset).toHaveProperty("status");
  });
});
