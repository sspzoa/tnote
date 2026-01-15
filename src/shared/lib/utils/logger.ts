import { Axiom } from "@axiomhq/js";
import type { Session } from "@/shared/lib/supabase/auth";

export type LogLevel = "info" | "warn" | "error";
export type LogAction = "create" | "read" | "update" | "delete" | "login" | "logout" | "auth";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  action: LogAction;
  resource: string;
  resourceId?: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  workspace?: string;
  ip?: string;
  userAgent?: string;
  requestQuery?: Record<string, string>;
  errorMessage?: string;
  errorStack?: string;
}

const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN!,
});

const getClientIp = (request: Request): string | undefined => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim();
  }
  return request.headers.get("x-real-ip") || undefined;
};

const getUserAgent = (request: Request): string | undefined => {
  return request.headers.get("user-agent") || undefined;
};

const getQueryParams = (request: Request): Record<string, string> | undefined => {
  const url = new URL(request.url);
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });
  return Object.keys(query).length > 0 ? query : undefined;
};

const formatConsoleLog = (entry: LogEntry): string => {
  const user = entry.userName ? `[${entry.userName}]` : "[anonymous]";
  const target = entry.resourceId ? `${entry.resource}:${entry.resourceId}` : entry.resource;
  const duration = `${entry.durationMs}ms`;

  return `${entry.timestamp} ${entry.level.toUpperCase().padEnd(5)} ${user} ${entry.method} ${entry.path} ${entry.statusCode} ${duration} - ${entry.action} ${target}`;
};

const consoleLog = (entry: LogEntry) => {
  if (process.env.NODE_ENV !== "development") return;

  const message = formatConsoleLog(entry);

  if (entry.level === "error") {
    console.error(message);
    if (entry.errorStack) {
      console.error(entry.errorStack);
    }
  } else if (entry.level === "warn") {
    console.warn(message);
  } else {
    console.log(message);
  }
};

const sendToAxiom = (entry: LogEntry) => {
  const dataset = process.env.AXIOM_DATASET || "tnote-logs";
  axiom.ingest(dataset, entry);
};

interface LoggerContext {
  request: Request;
  session: Session | null;
  startTime: number;
  action: LogAction;
  resource: string;
}

export class ApiLogger {
  private context: LoggerContext;

  constructor(context: LoggerContext) {
    this.context = context;
  }

  async log(level: LogLevel, statusCode: number, error?: Error, resourceId?: string): Promise<void> {
    const { request, session, startTime, action, resource } = this.context;
    const now = Date.now();
    const url = new URL(request.url);

    const entry: LogEntry = {
      timestamp: new Date(now).toISOString(),
      level,
      method: request.method,
      path: url.pathname,
      statusCode,
      durationMs: now - startTime,
      action,
      resource,
      resourceId,
      userId: session?.userId,
      userName: session?.name,
      userRole: session?.role,
      workspace: session?.workspace,
      ip: getClientIp(request),
      userAgent: getUserAgent(request),
      requestQuery: getQueryParams(request),
      errorMessage: error?.message,
      errorStack: error?.stack,
    };

    consoleLog(entry);
    sendToAxiom(entry);
  }

  async flush(): Promise<void> {
    await axiom.flush();
  }
}

export const createLogger = (
  request: Request,
  session: Session | null,
  action: LogAction,
  resource: string,
): ApiLogger => {
  return new ApiLogger({
    request,
    session,
    startTime: Date.now(),
    action,
    resource,
  });
};
