"use client";

import { useI18n } from "@/lib/i18n";

export function LanguageToggle() {
  const { language, setLanguage } = useI18n();

  return (
    <button
      onClick={() => setLanguage(language === "en" ? "cs" : "en")}
      className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 transition"
    >
      {language === "en" ? "CZ" : "EN"}
    </button>
  );
}
