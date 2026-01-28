"use client";

import { createFocusTrap } from "@/lib/focus-trap";
import { useI18n } from "@/lib/i18n";
import { useEffect, useRef, useState } from "react";

export function DisclaimerModal() {
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    const accepted = localStorage.getItem("disclaimer_accepted");
    return !accepted;
  });
  const { t } = useI18n();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !modalRef.current) return;

    // Create focus trap and set initial focus
    const cleanup = createFocusTrap(modalRef.current);

    // Handle dialog close event
    const handleDialogClose = () => {
      setOpen(false);
    };
    modalRef.current.addEventListener("close-dialog", handleDialogClose);

    // Prevent background scroll
    document.body.style.overflow = "hidden";

    return () => {
      cleanup();
      modalRef.current?.removeEventListener("close-dialog", handleDialogClose);
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const handleAccept = () => {
    localStorage.setItem("disclaimer_accepted", "true");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      role="presentation"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-8 max-w-xl shadow-lg"
        role="dialog"
        aria-labelledby="disclaimer-title"
        aria-describedby="disclaimer-content"
        aria-modal="true"
      >
        <h2 id="disclaimer-title" className="text-2xl font-bold text-red-600 mb-4">
          {t.disclaimer.title}
        </h2>
        <p id="disclaimer-content" className="text-gray-700 mb-4">
          {t.disclaimer.content}
        </p>
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
          <p className="text-sm text-red-800 font-semibold" role="alert">
            {t.disclaimer.clinicalWarning}
          </p>
        </div>
        <button
          onClick={handleAccept}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
          aria-label={t.disclaimer.iUnderstand}
        >
          {t.disclaimer.iUnderstand}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="mt-3 w-full bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition"
          aria-label="Close disclaimer (ESC key)"
        >
          Close (ESC)
        </button>
      </div>
    </div>
  );
}
