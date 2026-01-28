"use client";

import { ErrorPage } from "@/components/error-page";
import { createLogger } from "@/lib/server-logger";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    const logger = createLogger("RootError");
    logger.error("Uncaught error", error);
  }, [error]);

  return (
    <ErrorPage
      title="Application Error"
      message="An unexpected error occurred in the application."
      statusCode={500}
      isDevelopment={process.env.NODE_ENV === "development"}
      error={error}
      language="en"
    />
  );
}
