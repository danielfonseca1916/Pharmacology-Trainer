"use client";

import { ErrorPage } from "@/components/error-page";

interface ErrorProps {
  error: Error & { digest?: string };
}

export default function RootError({ error }: ErrorProps) {
  // Log to console in client-side
  if (typeof window !== "undefined") {
    console.error("[RootError]", error);
  }

  return (
    <ErrorPage
      title="Oops! Something went wrong"
      message="An unexpected error has occurred. Please try refreshing the page."
      statusCode={500}
    />
  );
}
