import type { Session } from "@/shared/lib/supabase/auth";
import { createServiceClient } from "@/shared/lib/supabase/server";

export type LogLevel = "info" | "warn" | "error" | "debug";
export type LogAction = "create" | "read" | "update" | "delete" | "login" | "logout" | "auth" | "error" | "other";

export interface LogEntry {
  level: LogLevel;
  action: LogAction;
  resource: string;
  resourceId?: string;
  message: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  userName?: string;
  userRole?: string;
  workspace?: string;
  ipAddress?: string;
  userAgent?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
}

interface LogContext {
  session?: Session | null;
  request?: Request;
  startTime?: number;
}

const extractClientInfo = (request?: Request) => {
  if (!request) return {};

  const headers = request.headers;
  const forwardedFor = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
  const userAgent = headers.get("user-agent") || "unknown";
  const url = new URL(request.url);

  return {
    ipAddress,
    userAgent,
    method: request.method,
    path: url.pathname,
  };
};

const formatLogMessage = (entry: LogEntry): string => {
  const timestamp = new Date().toISOString();
  const level = entry.level.toUpperCase().padEnd(5);
  const user = entry.userName ? `[${entry.userName}]` : "[anonymous]";
  const resource = entry.resourceId ? `${entry.resource}:${entry.resourceId}` : entry.resource;

  return `${timestamp} ${level} ${user} ${entry.action.toUpperCase()} ${resource} - ${entry.message}`;
};

const consoleLog = (entry: LogEntry) => {
  const message = formatLogMessage(entry);

  switch (entry.level) {
    case "error": {
      const stack = entry.metadata?.stack;
      if (stack) {
        console.error(message, "\n", stack);
      } else {
        console.error(message, entry.metadata ? JSON.stringify(entry.metadata) : "");
      }
      break;
    }
    case "warn":
      console.warn(message, entry.metadata ? JSON.stringify(entry.metadata) : "");
      break;
    case "debug":
      console.debug(message, entry.metadata ? JSON.stringify(entry.metadata) : "");
      break;
    default:
      console.log(message, entry.metadata ? JSON.stringify(entry.metadata) : "");
  }
};

const saveLogToDatabase = async (entry: LogEntry) => {
  try {
    const supabase = await createServiceClient();

    await supabase.from("ApiLogs").insert({
      level: entry.level,
      action: entry.action,
      resource: entry.resource,
      resource_id: entry.resourceId || null,
      message: entry.message,
      metadata: entry.metadata || null,
      user_id: entry.userId || null,
      user_name: entry.userName || null,
      user_role: entry.userRole || null,
      workspace: entry.workspace || null,
      ip_address: entry.ipAddress || null,
      user_agent: entry.userAgent || null,
      method: entry.method || null,
      path: entry.path || null,
      status_code: entry.statusCode || null,
      duration_ms: entry.duration || null,
    });
  } catch (error) {
    console.error("Failed to save log to database:", error);
  }
};

export class ApiLogger {
  private context: LogContext;
  private startTime: number;

  constructor(context: LogContext = {}) {
    this.context = context;
    this.startTime = context.startTime || Date.now();
  }

  private createEntry(
    level: LogLevel,
    action: LogAction,
    resource: string,
    message: string,
    options: Partial<LogEntry> = {},
  ): LogEntry {
    const clientInfo = extractClientInfo(this.context.request);
    const session = this.context.session;

    return {
      level,
      action,
      resource,
      message,
      userId: session?.userId,
      userName: session?.name,
      userRole: session?.role,
      workspace: session?.workspace,
      ...clientInfo,
      ...options,
    };
  }

  private async log(entry: LogEntry) {
    consoleLog(entry);
    await saveLogToDatabase(entry);
  }

  async info(action: LogAction, resource: string, message: string, options?: Partial<LogEntry>) {
    await this.log(this.createEntry("info", action, resource, message, options));
  }

  async warn(action: LogAction, resource: string, message: string, options?: Partial<LogEntry>) {
    await this.log(this.createEntry("warn", action, resource, message, options));
  }

  async error(action: LogAction, resource: string, message: string, options?: Partial<LogEntry>) {
    await this.log(this.createEntry("error", action, resource, message, options));
  }

  async debug(action: LogAction, resource: string, message: string, options?: Partial<LogEntry>) {
    if (process.env.NODE_ENV === "development") {
      await this.log(this.createEntry("debug", action, resource, message, options));
    }
  }

  async logRequest(resource: string, message: string = "Request received") {
    await this.info("read", resource, message);
  }

  async logResponse(resource: string, statusCode: number, message: string = "Response sent") {
    const duration = Date.now() - this.startTime;
    const level: LogLevel = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
    const action: LogAction = statusCode >= 400 ? "error" : "read";

    await this.log(
      this.createEntry(level, action, resource, message, {
        statusCode,
        duration,
      }),
    );
  }

  async logCreate(resource: string, resourceId: string, message: string = "Resource created") {
    const duration = Date.now() - this.startTime;
    await this.info("create", resource, message, { resourceId, duration });
  }

  async logUpdate(resource: string, resourceId: string, message: string = "Resource updated") {
    const duration = Date.now() - this.startTime;
    await this.info("update", resource, message, { resourceId, duration });
  }

  async logDelete(resource: string, resourceId: string, message: string = "Resource deleted") {
    const duration = Date.now() - this.startTime;
    await this.info("delete", resource, message, { resourceId, duration });
  }

  async logAuth(action: "login" | "logout" | "auth", message: string, success: boolean = true) {
    const duration = Date.now() - this.startTime;
    const level: LogLevel = success ? "info" : "warn";
    await this.log(this.createEntry(level, action, "auth", message, { duration }));
  }

  async logError(resource: string, error: Error | string, statusCode: number = 500) {
    const duration = Date.now() - this.startTime;
    const errorMessage = error instanceof Error ? error.message : error;
    const metadata = error instanceof Error ? { stack: error.stack } : undefined;

    await this.error("error", resource, errorMessage, {
      statusCode,
      duration,
      metadata,
    });
  }
}

export const createLogger = (request?: Request, session?: Session | null): ApiLogger => {
  return new ApiLogger({
    request,
    session,
    startTime: Date.now(),
  });
};
