"use client";

import { ErrorPage } from "@/components/error-page";
import { createLogger } from "@/lib/server-logger";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProtectedError({ error, reset }: ErrorProps) {
  useEffect(() => {
    const logger = createLogger("ProtectedRouteError");
    logger.error("Error in protected route", error);
  }, [error]);

  return (
    <ErrorPage
      title="Something Went Wrong"
      message="An error occurred while loading this page. Please try again."
      statusCode={500}
      isDevelopment={process.env.NODE_ENV === "development"}
      error={error}
      language="en"
    />
  );
}
