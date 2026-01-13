import { NextResponse } from "next/server";
import { getSession, type Session } from "@/shared/lib/supabase/auth";
import { createClient } from "@/shared/lib/supabase/server";
import { type ApiLogger, createLogger, type LogAction } from "@/shared/lib/utils/logger";

export interface ApiContext {
  request: Request;
  session: Session;
  supabase: Awaited<ReturnType<typeof createClient>>;
  logger: ApiLogger;
  params?: Record<string, string>;
}

export interface PublicApiContext {
  request: Request;
  session: Session | null;
  logger: ApiLogger;
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

export const withLogging = (handler: ApiHandler<ApiContext>, options: WithLoggingOptions) => {
  return async (request: Request, context?: { params?: Promise<Record<string, string>> }) => {
    const startTime = Date.now();
    const session = await getSession();
    const logger = createLogger(request, session);
    const { resource, action = "read", requireAuth = true, allowedRoles } = options;

    try {
      // 인증 확인
      if (requireAuth && !session) {
        await logger.logAuth("auth", "Unauthorized access attempt", false);
        return createErrorResponse("Unauthorized", 401, "로그인이 필요합니다.");
      }

      // 역할 확인
      if (session && allowedRoles && !allowedRoles.includes(session.role)) {
        await logger.logAuth("auth", `Forbidden: role ${session.role} not allowed`, false);
        return createErrorResponse("Forbidden", 403, "접근 권한이 없습니다.");
      }

      const supabase = await createClient();
      const resolvedParams = context?.params ? await context.params : undefined;

      // 요청 로그
      await logger.info(action, resource, `${request.method} ${resource} request started`);

      // 핸들러 실행
      const response = await handler({
        request,
        session: session!,
        supabase,
        logger,
        params: resolvedParams,
      });

      // 응답 로그
      const duration = Date.now() - startTime;
      const status = response.status;
      const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";

      if (level === "error") {
        await logger.error(action, resource, `Request failed with status ${status}`, {
          statusCode: status,
          duration,
        });
      } else if (level === "warn") {
        await logger.warn(action, resource, `Request completed with warning status ${status}`, {
          statusCode: status,
          duration,
        });
      } else {
        await logger.info(action, resource, `Request completed successfully`, {
          statusCode: status,
          duration,
        });
      }

      return response;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));

      await logger.logError(resource, err, 500);

      console.error(`[${resource}] Error: ${err.message}`, err.stack);

      return createErrorResponse(err, 500, `${resource} 처리 중 오류가 발생했습니다.`);
    }
  };
};

export const withPublicLogging = (
  handler: ApiHandler<PublicApiContext>,
  options: Omit<WithLoggingOptions, "requireAuth">,
) => {
  return async (request: Request) => {
    const startTime = Date.now();
    const session = await getSession();
    const logger = createLogger(request, session);
    const { resource, action = "read" } = options;

    try {
      await logger.info(action, resource, `${request.method} ${resource} request started`);

      const response = await handler({
        request,
        session,
        logger,
      });

      const duration = Date.now() - startTime;
      const status = response.status;

      if (status >= 400) {
        await logger.warn(action, resource, `Request completed with status ${status}`, {
          statusCode: status,
          duration,
        });
      } else {
        await logger.info(action, resource, `Request completed successfully`, {
          statusCode: status,
          duration,
        });
      }

      return response;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));

      await logger.logError(resource, err, 500);

      console.error(`[${resource}] Error: ${err.message}`, err.stack);

      return NextResponse.json({ error: `${resource} 처리 중 오류가 발생했습니다.` }, { status: 500 });
    }
  };
};
