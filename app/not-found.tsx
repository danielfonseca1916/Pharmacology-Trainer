import { ErrorPage } from "@/components/error-page";
import { createLogger } from "@/lib/server-logger";

export default function NotFound() {
  const logger = createLogger("NotFound");
  logger.warn("404 - Page not found");

  return (
    <ErrorPage
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      statusCode={404}
      language="en"
    />
  );
}
