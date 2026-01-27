"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { en } from "./en";
import { cs } from "./cs";
import type { I18nDict } from "./en";

type Language = "en" | "cs";

const dicts: Record<Language, I18nDict> = { en, cs };

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: I18nDict;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    const stored = localStorage.getItem("language") as Language | null;
    return stored && ["en", "cs"].includes(stored) ? stored : "en";
  });
  const [mounted] = useState(typeof window === "undefined" ? false : true);

  useEffect(() => {
    // Ensure component is mounted after hydration
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  if (!mounted) return <>{children}</>;

  return (
    <I18nContext.Provider value={{ language, setLanguage, t: dicts[language] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  // Default to English if context is not available (during SSR)
  if (!ctx) return { language: "en" as Language, setLanguage: () => {}, t: dicts.en };
  return ctx;
}

export function getLangValue<T extends { en: string; cs: string }>(obj: T, lang: Language): string {
  return obj[lang];
}
