"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

export function DisclaimerModal() {
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    const accepted = localStorage.getItem("disclaimer_accepted");
    return !accepted;
  });
  const { t } = useI18n();

  useEffect(() => {
    // Effect runs after initial render, no state updates needed
  }, []);

  const handleAccept = () => {
    localStorage.setItem("disclaimer_accepted", "true");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-xl shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{t.disclaimer.title}</h2>
        <p className="text-gray-700 mb-4">{t.disclaimer.content}</p>
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
          <p className="text-sm text-red-800 font-semibold">{t.disclaimer.clinicalWarning}</p>
        </div>
        <button
          onClick={handleAccept}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          {t.disclaimer.iUnderstand}
        </button>
      </div>
    </div>
  );
}
