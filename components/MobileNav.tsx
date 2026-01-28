"use client";

import { useI18n } from "@/lib/i18n";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { LanguageToggle } from "./LanguageToggle";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 text-gray-800 hover:bg-gray-100 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          // X icon
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          // Hamburger icon
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {/* Desktop Nav */}
      <nav className="hidden md:flex gap-4 items-center" aria-label="Primary navigation">
        <LanguageToggle />
        <Link
          href="/progress"
          className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1 transition"
          aria-label={t.nav.progress}
        >
          {t.nav.progress}
        </Link>
        <Link
          href="/drugs"
          className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1 transition"
          aria-label={t.nav.drugs}
        >
          {t.nav.drugs}
        </Link>
        <Link
          href="/account"
          className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1 transition"
          aria-label={t.nav.account}
        >
          {t.nav.account}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login", redirect: true })}
          className="text-sm text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1 transition"
          aria-label={t.nav.logout}
        >
          {t.nav.logout}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg z-50">
          <nav className="flex flex-col p-4 space-y-2" aria-label="Mobile navigation">
            <div className="pb-2 border-b">
              <LanguageToggle />
            </div>
            <Link
              href="/progress"
              className="text-gray-800 hover:bg-gray-100 rounded px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setIsOpen(false)}
            >
              {t.nav.progress}
            </Link>
            <Link
              href="/drugs"
              className="text-gray-800 hover:bg-gray-100 rounded px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setIsOpen(false)}
            >
              {t.nav.drugs}
            </Link>
            <Link
              href="/account"
              className="text-gray-800 hover:bg-gray-100 rounded px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setIsOpen(false)}
            >
              {t.nav.account}
            </Link>
            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: "/login", redirect: true });
              }}
              className="text-red-600 hover:bg-red-50 rounded px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {t.nav.logout}
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
