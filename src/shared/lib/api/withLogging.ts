import { after, NextResponse } from "next/server";
import { getSession, type Session } from "@/shared/lib/supabase/auth";
import { createClient } from "@/shared/lib/supabase/server";
import { createLogger, type LogAction } from "@/shared/lib/utils/logger";

export interface ApiContext {
  request: Request;
  session: Session;
  supabase: Awaited<ReturnType<typeof createClient>>;
  params?: Record<string, string>;
}

export interface PublicApiContext {
  request: Request;
  session: Session | null;
}

type ApiHandler<T extends ApiContext | PublicApiContext> = (context: T) => Promise<NextResponse>;

interface WithLoggingOptions {
  resource: string;
  action?: LogAction;
  requireAuth?: boolean;
  allowedRoles?: Array<"owner" | "admin" | "student">;
}

const createErrorResponse = (error: Error | string, statusCode: number, defaultMessage: string): NextResponse => {
  const errorMessage = error instanceof Error ? error.message : error;

  if (errorMessage === "Unauthorized") {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  if (errorMessage === "Forbidden") {
    return NextResponse.json({ error: "접근 권한이 없습니다." }, { status: 403 });
  }

  return NextResponse.json({ error: defaultMessage }, { status: statusCode });
};

const getResourceIdFromParams = (params?: Record<string, string>): string | undefined => {
  if (!params) return undefined;
  return params.id || params.historyId || Object.values(params)[0];
};

export const withLogging = (handler: ApiHandler<ApiContext>, options: WithLoggingOptions) => {
  return async (request: Request, context?: { params?: Promise<Record<string, string>> }) => {
    const session = await getSession();
    const { resource, action = "read", requireAuth = true, allowedRoles } = options;
    const logger = createLogger(request, session, action, resource);
    const resolvedParams = context?.params ? await context.params : undefined;

    try {
      if (requireAuth && !session) {
        after(async () => {
          await logger.log("warn", 401);
          await logger.flush();
        });
        return createErrorResponse("Unauthorized", 401, "로그인이 필요합니다.");
      }

      if (session && allowedRoles && !allowedRoles.includes(session.role)) {
        after(async () => {
          await logger.log("warn", 403);
          await logger.flush();
        });
        return createErrorResponse("Forbidden", 403, "접근 권한이 없습니다.");
      }

      const supabase = await createClient();

      const response = await handler({
        request,
        session: session!,
        supabase,
        params: resolvedParams,
      });

      const status = response.status;
      const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
      const resourceId = getResourceIdFromParams(resolvedParams);

      after(async () => {
        await logger.log(level, status, undefined, resourceId);
        await logger.flush();
      });
      return response;
    } catch (error: unknown) {
      let err: Error;
      if (error instanceof Error) {
        err = error;
      } else if (error && typeof error === "object" && "message" in error) {
        err = new Error(String(error.message));
      } else if (error && typeof error === "object") {
        err = new Error(JSON.stringify(error));
      } else {
        err = new Error(String(error));
      }

      const resourceId = getResourceIdFromParams(resolvedParams);

      after(async () => {
        await logger.log("error", 500, err, resourceId);
        await logger.flush();
      });

      return createErrorResponse(err, 500, `${resource} 처리 중 오류가 발생했습니다.`);
    }
  };
};

export const withPublicLogging = (
  handler: ApiHandler<PublicApiContext>,
  options: Omit<WithLoggingOptions, "requireAuth">,
) => {
  return async (request: Request) => {
    const session = await getSession();
    const { resource, action = "read" } = options;
    const logger = createLogger(request, session, action, resource);

    try {
      const response = await handler({
        request,
        session,
      });

      const status = response.status;
      const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";

      after(async () => {
        await logger.log(level, status);
        await logger.flush();
      });
      return response;
    } catch (error: unknown) {
      let err: Error;
      if (error instanceof Error) {
        err = error;
      } else if (error && typeof error === "object" && "message" in error) {
        err = new Error(String(error.message));
      } else if (error && typeof error === "object") {
        err = new Error(JSON.stringify(error));
      } else {
        err = new Error(String(error));
      }

      after(async () => {
        await logger.log("error", 500, err);
        await logger.flush();
      });

      return NextResponse.json({ error: `${resource} 처리 중 오류가 발생했습니다.` }, { status: 500 });
    }
  };
};
