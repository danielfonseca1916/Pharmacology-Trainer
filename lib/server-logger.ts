import { headers } from "next/headers";

export class ServerLogger {
  constructor(private component: string) {}

  private formatLog(level: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const baseLog = `[${timestamp}] [${level}] [${this.component}] ${message}`;

    if (data) {
      console.log(baseLog, JSON.stringify(data, null, 2));
    } else {
      console.log(baseLog);
    }
  }

  info(message: string, data?: any) {
    this.formatLog("INFO", message, data);
  }

  warn(message: string, data?: any) {
    this.formatLog("WARN", message, data);
  }

  error(message: string, data?: any) {
    console.error(this.formatLog("ERROR", message, data));
  }

  debug(message: string, data?: any) {
    this.formatLog("DEBUG", message, data);
  }
}

export function createLogger(component: string): ServerLogger {
  return new ServerLogger(component);
}

export async function getRequestId(): Promise<string> {
  try {
    const headersList = await headers();
    const requestId = headersList.get("x-request-id");
    return requestId || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
