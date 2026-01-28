"use client";

import { ErrorPage } from "@/components/error-page";

interface ErrorProps {
  error: Error & { digest?: string };
}

export default function ProtectedError({ error }: ErrorProps) {
  // Log to console in client-side
  if (typeof window !== "undefined") {
    console.error("[ProtectedRouteError]", error);
  }

  return (
    <ErrorPage
      title="Something Went Wrong"
      message="An error occurred on this page. Our team has been notified."
      statusCode={500}
    />
  );
}
