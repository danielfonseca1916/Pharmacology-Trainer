"use client";

import { ErrorPage } from "@/components/error-page";
import { createLogger } from "@/lib/server-logger";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
}

export default function RootError({ error }: ErrorProps) {
  useEffect(() => {
    const logger = createLogger("RootError");
    logger.error("Root error", error);
  }, [error]);

  return (
    <ErrorPage
      title="Oops! Something went wrong"
      message="An unexpected error has occurred. Please try refreshing the page."
      statusCode={500}
    />
  );
}
