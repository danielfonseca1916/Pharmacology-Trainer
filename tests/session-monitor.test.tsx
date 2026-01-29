import { SessionMonitor } from "@/components/SessionMonitor";
import { render, waitFor } from "@testing-library/react";
import { SessionProvider } from "next-auth/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock next-auth
vi.mock("next-auth/react", async () => {
  const actual = await vi.importActual("next-auth/react");
  return {
    ...actual,
    useSession: vi.fn(),
    SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("SessionMonitor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should redirect to login on 401 unauthorized event", async () => {
    const { useSession } = await import("next-auth/react");
    (useSession as any).mockReturnValue({
      data: { user: { id: "1", email: "test@example.com" } },
      status: "authenticated",
    });

    render(
      <SessionProvider>
        <SessionMonitor />
      </SessionProvider>
    );

    // Simulate 401 event
    const event = new CustomEvent("unauthorized");
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login?session=expired");
    });
  });

  it("should ping session endpoint every 5 minutes when authenticated", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    const { useSession } = await import("next-auth/react");
    (useSession as any).mockReturnValue({
      data: { user: { id: "1", email: "test@example.com" } },
      status: "authenticated",
    });

    render(
      <SessionProvider>
        <SessionMonitor />
      </SessionProvider>
    );

    // Fast-forward 5 minutes
    vi.advanceTimersByTime(5 * 60 * 1000);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/session");
    });
  });

  it("should not ping session when unauthenticated", async () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    const { useSession } = await import("next-auth/react");
    (useSession as any).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(
      <SessionProvider>
        <SessionMonitor />
      </SessionProvider>
    );

    // Fast-forward 10 minutes
    vi.advanceTimersByTime(10 * 60 * 1000);

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should cleanup interval and event listener on unmount", async () => {
    const { useSession } = await import("next-auth/react");
    (useSession as any).mockReturnValue({
      data: { user: { id: "1", email: "test@example.com" } },
      status: "authenticated",
    });

    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(
      <SessionProvider>
        <SessionMonitor />
      </SessionProvider>
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("unauthorized", expect.any(Function));
  });
});
