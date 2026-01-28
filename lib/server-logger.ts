import { headers } from "next/headers";
import { randomUUID } from "crypto";

export type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  requestId: string;
  timestamp: string;
  level: LogLevel;
  component?: string;
  message: string;
  data?: unknown;
}

/**
 * Generate or retrieve request ID from headers
 */
export function getRequestId(): string {
  try {
    const headersList = headers();
    const requestId = headersList.get("x-request-id");
    if (requestId) return requestId;
  } catch {
    // headers() is only available in server context
  }
  return randomUUID();
}

/**
 * Format log message with context
 */
function formatLog(context: LogContext): string {
  const { requestId, timestamp, level, component, message, data } = context;
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [${requestId}]${component ? ` [${component}]` : ""}`;
  const dataStr = data ? ` ${JSON.stringify(data)}` : "";
  return `${prefix} ${message}${dataStr}`;
}

/**
 * Server-side logger with request ID tracking
 */
export class ServerLogger {
  private requestId: string;
  private component?: string;

  constructor(component?: string) {
    this.requestId = getRequestId();
    this.component = component;
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const context: LogContext = {
      requestId: this.requestId,
      timestamp: new Date().toISOString(),
      level,
      component: this.component,
      message,
      data,
    };

    const formatted = formatLog(context);

    switch (level) {
      case "error":
        console.error(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "debug":
        if (process.env.DEBUG) console.log(formatted);
        break;
      case "info":
      default:
        console.log(formatted);
        break;
    }
  }

  info(message: string, data?: unknown): void {
    this.log("info", message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log("warn", message, data);
  }

  error(message: string, error?: unknown): void {
    const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : error;
    this.log("error", message, errorData);
  }

  debug(message: string, data?: unknown): void {
    this.log("debug", message, data);
  }

  /**
   * Log error with timing information
   */
  errorWithTiming(message: string, startTime: number, error?: unknown): void {
    const duration = Date.now() - startTime;
    const errorData = error instanceof Error ? { message: error.message } : error;
    this.error(`${message} (${duration}ms)`, errorData);
  }

  /**
   * Log operation with timing
   */
  logTiming(operation: string, duration: number, success: boolean): void {
    const message = `${operation}: ${duration}ms (${success ? "success" : "failed"})`;
    this.info(message, { duration, success });
  }
}

/**
 * Create logger instance for a component
 */
export function createLogger(component: string): ServerLogger {
  return new ServerLogger(component);
}
