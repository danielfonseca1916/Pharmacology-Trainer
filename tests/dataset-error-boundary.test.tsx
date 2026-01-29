import { DatasetErrorBoundary } from "@/components/DatasetErrorBoundary";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Create a component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
}

describe("DatasetErrorBoundary", () => {
  beforeEach(() => {
    // Suppress console errors during tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render children when there is no error", () => {
    render(
      <DatasetErrorBoundary>
        <div>Test content</div>
      </DatasetErrorBoundary>
    );

    expect(screen.getByText("Test content")).toBeTruthy();
  });

  it("should render error UI when child throws", () => {
    render(
      <DatasetErrorBoundary>
        <ThrowError shouldThrow={true} />
      </DatasetErrorBoundary>
    );

    // The ErrorPage component should be shown
    expect(screen.queryByText("No error")).toBeNull();
  });

  it("should render custom fallback when provided", () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <DatasetErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </DatasetErrorBoundary>
    );

    expect(screen.getByText("Custom error message")).toBeTruthy();
  });

  it("should log error to console", () => {
    const consoleErrorSpy = vi.spyOn(console, "error");

    render(
      <DatasetErrorBoundary>
        <ThrowError shouldThrow={true} />
      </DatasetErrorBoundary>
    );

    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
