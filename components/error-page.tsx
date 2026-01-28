import { AlertCircle, Home, Mail, Github } from "lucide-react";

interface ErrorPageProps {
  title: string;
  message: string;
  statusCode: number;
  requestId?: string;
  isDevelopment?: boolean;
  error?: Error;
  language?: "en" | "cs";
}

const translations = {
  en: {
    goHome: "Go Home",
    reportIssue: "Report Issue",
    requestId: "Request ID",
    details: "Error Details",
    development: "Development Info",
  },
  cs: {
    goHome: "Domů",
    reportIssue: "Hlásit Problém",
    requestId: "ID Požadavku",
    details: "Detaily Chyby",
    development: "Info o Vývoji",
  },
};

const messages = {
  en: {
    404: {
      title: "Page Not Found",
      message: "The page you're looking for doesn't exist or has been moved.",
    },
    500: {
      title: "Something Went Wrong",
      message: "An unexpected error occurred. Please try again later.",
    },
    403: {
      title: "Access Denied",
      message: "You don't have permission to access this page.",
    },
    default: {
      title: "Error",
      message: "An error occurred. Please try again.",
    },
  },
  cs: {
    404: {
      title: "Stránka Nenalezena",
      message: "Stránka, kterou hledáte, neexistuje nebo byla přesunuta.",
    },
    500: {
      title: "Něco Se Pokazilo",
      message: "Došlo k neočekávané chybě. Zkuste to prosím později.",
    },
    403: {
      title: "Přístup Odepřen",
      message: "Nemáte oprávnění k přístupu na tuto stránku.",
    },
    default: {
      title: "Chyba",
      message: "Došlo k chybě. Zkuste to prosím znovu.",
    },
  },
};

export function ErrorPage({
  title,
  message,
  statusCode,
  requestId,
  isDevelopment = process.env.NODE_ENV === "development",
  error,
  language = "en",
}: ErrorPageProps) {
  const t = translations[language] || translations.en;
  const msgs = messages[language] || messages.en;

  // Get default message for status code if not provided
  const defaultMsg = msgs[statusCode as keyof typeof msgs] || msgs.default;
  const displayTitle = title || defaultMsg.title;
  const displayMessage = message || defaultMsg.message;

  const reportUrl = new URL("https://github.com/danielfonseca1916/Pharmacology-Trainer/issues/new");
  reportUrl.searchParams.set("title", `[ERROR ${statusCode}] ${displayTitle}`);
  reportUrl.searchParams.set(
    "body",
    `## Error Details\n\n**Status Code**: ${statusCode}\n**Request ID**: ${requestId || "N/A"}\n**Message**: ${displayMessage}\n\n## Steps to Reproduce\n\n1. \n\n## Expected Behavior\n\n\n## Actual Behavior\n\n${displayMessage}`
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Error Container */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="bg-red-100 rounded-full p-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          {/* Error Message */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">{statusCode}</h1>
            <h2 className="text-xl font-semibold text-gray-800">{displayTitle}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{displayMessage}</p>
          </div>

          {/* Request ID */}
          {requestId && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-1">
              <p className="text-xs font-semibold text-gray-600 uppercase">{t.requestId}</p>
              <p className="font-mono text-xs text-gray-700 break-all">{requestId}</p>
            </div>
          )}

          {/* Development Error Details */}
          {isDevelopment && error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-red-600 uppercase">{t.development}</p>
              <div className="bg-white rounded p-2 overflow-auto max-h-40">
                <p className="font-mono text-xs text-red-600 whitespace-pre-wrap break-words">
                  {error.message}
                </p>
                {error.stack && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                      Stack Trace
                    </summary>
                    <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap break-words">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {/* Home Button */}
            <a
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              {t.goHome}
            </a>

            {/* Report Issue Button */}
            <a
              href={reportUrl.toString()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              title={t.reportIssue}
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">{t.reportIssue}</span>
              <Mail className="w-4 h-4 sm:hidden" />
            </a>
          </div>

          {/* Alternative Contact */}
          <div className="text-center text-xs text-gray-500 border-t pt-4">
            <p>
              {language === "en"
                ? "Or email us at"
                : "Nebo nám napište na"}{" "}
              <a href="mailto:support@pharmtrainer.test" className="text-blue-600 hover:underline">
                support@pharmtrainer.test
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
