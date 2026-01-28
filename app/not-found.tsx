import { ErrorPage } from "@/components/error-page";
import { en } from "@/lib/i18n/en";
import { createLogger } from "@/lib/server-logger";

export default function NotFound() {
  const logger = createLogger("NotFound");
  logger.warn("404 - Page not found");

  return (
    <ErrorPage
      title={en.errors.pageNotFound}
      message={en.errors.pageNotFoundMessage}
      statusCode={404}
      language="en"
    />
  );
}
