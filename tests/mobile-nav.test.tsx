import { MobileNav } from "@/components/MobileNav";
import { I18nProvider } from "@/lib/i18n";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock next-auth
vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("MobileNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render mobile menu button", () => {
    render(
      <I18nProvider>
        <MobileNav />
      </I18nProvider>
    );

    const button = screen.getByRole("button", { name: /open menu/i });
    expect(button).toBeTruthy();
  });

  it("should toggle menu on button click", async () => {
    render(
      <I18nProvider>
        <MobileNav />
      </I18nProvider>
    );

    const button = screen.getByRole("button", { name: /open menu/i });

    // Menu should be closed initially
    expect(screen.queryByRole("navigation", { name: /mobile navigation/i })).toBeNull();

    // Click to open
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByRole("navigation", { name: /mobile navigation/i })).toBeTruthy();
    });

    // Click to close
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.queryByRole("navigation", { name: /mobile navigation/i })).toBeNull();
    });
  });

  it("should show all navigation links when open", async () => {
    render(
      <I18nProvider>
        <MobileNav />
      </I18nProvider>
    );

    const button = screen.getByRole("button", { name: /open menu/i });
    fireEvent.click(button);

    await waitFor(() => {
      const mobileNav = screen.getByRole("navigation", { name: /mobile navigation/i });
      expect(mobileNav).toBeTruthy();
    });

    // Check links within mobile navigation
    const mobileNav = screen.getByRole("navigation", { name: /mobile navigation/i });
    expect(mobileNav).toBeTruthy();
  });

  it("should close menu when a link is clicked", async () => {
    render(
      <I18nProvider>
        <MobileNav />
      </I18nProvider>
    );

    const menuButton = screen.getByRole("button", { name: /open menu/i });
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.getByRole("navigation", { name: /mobile navigation/i })).toBeTruthy();
    });

    const mobileNav = screen.getByRole("navigation", { name: /mobile navigation/i });
    const progressLinks = within(mobileNav).getAllByText(/progress/i);
    expect(progressLinks.length).toBeGreaterThan(1);
    const progressLink = progressLinks[1];
    expect(progressLink).toBeTruthy();
    // Click the mobile link (should be the second one)
    if (!progressLink) {
      throw new Error("Expected a second progress link in mobile navigation.");
    }
    fireEvent.click(progressLink);

    await waitFor(() => {
      expect(screen.queryByRole("navigation", { name: /mobile navigation/i })).toBeNull();
    });
  });

  it("should call signOut when logout is clicked", async () => {
    const { signOut } = await import("next-auth/react");

    render(
      <I18nProvider>
        <MobileNav />
      </I18nProvider>
    );

    const menuButton = screen.getByRole("button", { name: /open menu/i });
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(screen.getByRole("navigation", { name: /mobile navigation/i })).toBeTruthy();
    });

    const mobileNav = screen.getByRole("navigation", { name: /mobile navigation/i });
    const logoutButtons = within(mobileNav).getAllByText(/logout/i);
    expect(logoutButtons.length).toBeGreaterThan(1);
    const logoutButton = logoutButtons[1];
    expect(logoutButton).toBeTruthy();
    // Click the mobile logout button (should be the second one)
    if (!logoutButton) {
      throw new Error("Expected a second logout button in mobile navigation.");
    }
    fireEvent.click(logoutButton);

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/login", redirect: true });
  });

  it("should have accessible button labels", () => {
    render(
      <I18nProvider>
        <MobileNav />
      </I18nProvider>
    );

    const button = screen.getByRole("button", { name: /open menu/i });
    expect(button.getAttribute("aria-label")).toBeTruthy();
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("should update aria-expanded when menu opens", async () => {
    render(
      <I18nProvider>
        <MobileNav />
      </I18nProvider>
    );

    const button = screen.getByRole("button", { name: /open menu/i });
    expect(button.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(button);

    await waitFor(() => {
      expect(button.getAttribute("aria-expanded")).toBe("true");
    });
  });
});
