"use client";

import { ErrorPage } from "@/components/error-page";
import { createLogger } from "@/lib/server-logger";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
}

export default function ProtectedError({ error }: ErrorProps) {
  useEffect(() => {
    const logger = createLogger("ProtectedRouteError");
    logger.error("Error in protected route", error);
  }, [error]);

  return (
    <ErrorPage
      title="Something Went Wrong"
      message="An error occurred on this page. Our team has been notified."
      statusCode={500}
    />
  );
}
