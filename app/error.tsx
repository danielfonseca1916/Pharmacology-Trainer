"use client";

import { ErrorPage } from "@/components/error-page";
import { useI18n } from "@/lib/i18n";

interface ErrorProps {
  error: Error & { digest?: string };
}

export default function RootError({ error }: ErrorProps) {
  const { t } = useI18n();

  // Log to console in client-side
  if (typeof window !== "undefined") {
    console.error("[RootError]", error);
  }

  return (
    <ErrorPage
      title={t.errors.serverError}
      message={t.errors.serverErrorMessage}
      statusCode={500}
    />
  );
}
