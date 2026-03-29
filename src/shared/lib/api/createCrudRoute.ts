/**
 * API Route Factory — createCrudRoute.ts
 *
 * Generates typed Next.js route handlers for common CRUD operations.
 * All handlers:
 *   - Wrap with withLogging (auth + role checks + Axiom logging)
 *   - Automatically apply workspace tenant filter
 *   - Return consistent response shapes: { data } / { success, data }
 *
 * Usage:
 *   export const GET  = createListHandler({ table: "Courses", ... });
 *   export const POST = createCreateHandler({ table: "Courses", ... });
 */

import { NextResponse } from "next/server";
import type { ApiContext } from "./withLogging";
import { withLogging } from "./withLogging";

type Role = "owner" | "admin" | "student";
type ValidationResult = NextResponse | null | Promise<NextResponse | null>;

/** Convenience helper — returns a validation error Response from inside validate/preCheck callbacks. */
export const validationError = (message: string, status = 400): NextResponse =>
  NextResponse.json({ error: message }, { status });

// ─── List Handler (GET /) ────────────────────────────────────────────────────

export interface ListHandlerConfig {
  table: string;
  resource: string;
  allowedRoles: Role[];
  /** Supabase select clause (default: "*") */
  select?: string;
  /** Column to order results by */
  orderBy?: { column: string; ascending?: boolean };
  /** Additional query filters applied after the workspace filter */
  extraFilters?: (query: any, ctx: ApiContext) => any;
  /** Transform raw DB rows before sending the response */
  transformResults?: (data: unknown[], ctx: ApiContext) => unknown[];
}

export const createListHandler = (config: ListHandlerConfig) => {
  const handler = async (ctx: ApiContext) => {
    const { supabase, session } = ctx;
    const { table, select = "*", orderBy, extraFilters, transformResults } = config;

    let query: any = supabase.from(table).select(select).eq("workspace", session.workspace);

    if (extraFilters) query = extraFilters(query, ctx);
    if (orderBy) query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });

    const { data, error } = await query;
    if (error) throw error;

    const result = transformResults ? transformResults(data as unknown[], ctx) : data;
    return NextResponse.json({ data: result });
  };

  return withLogging(handler, {
    resource: config.resource,
    action: "read",
    allowedRoles: config.allowedRoles,
  });
};

// ─── Detail Handler (GET /:id) ───────────────────────────────────────────────

export interface DetailHandlerConfig {
  table: string;
  resource: string;
  allowedRoles: Role[];
  /** Supabase select clause (default: "*") */
  select?: string;
  /** URL param name for the resource ID (default: "id") */
  idParam?: string;
  /** Error message when the ID param is missing */
  idMissingMessage?: string;
  /** Transform the DB row before sending the response */
  transformResult?: (data: unknown, ctx: ApiContext) => unknown;
}

export const createDetailHandler = (config: DetailHandlerConfig) => {
  const handler = async (ctx: ApiContext) => {
    const { supabase, session, params } = ctx;
    const { table, select = "*", idParam = "id", idMissingMessage, transformResult } = config;

    const id = params?.[idParam];
    if (!id) {
      return NextResponse.json({ error: idMissingMessage ?? `${config.resource} ID가 필요합니다.` }, { status: 400 });
    }

    const { data, error } = await supabase
      .from(table)
      .select(select)
      .eq("id", id)
      .eq("workspace", session.workspace)
      .single();

    if (error) throw error;

    const result = transformResult ? transformResult(data, ctx) : data;
    return NextResponse.json({ data: result });
  };

  return withLogging(handler, {
    resource: config.resource,
    action: "read",
    allowedRoles: config.allowedRoles,
  });
};

// ─── Create Handler (POST /) ─────────────────────────────────────────────────

export interface CreateHandlerConfig {
  table: string;
  resource: string;
  allowedRoles: Role[];
  /** Validate request body — return an error Response to abort, or null to proceed */
  validate?: (body: Record<string, unknown>, ctx: ApiContext) => ValidationResult;
  /** Build the insert payload — workspace is injected automatically */
  buildPayload: (body: Record<string, unknown>, ctx: ApiContext) => Record<string, unknown>;
  /** Error message for duplicate key (23505) violations */
  duplicateErrorMessage?: string;
}

export const createCreateHandler = (config: CreateHandlerConfig) => {
  const handler = async (ctx: ApiContext) => {
    const { request, supabase, session } = ctx;
    const { table, validate, buildPayload, duplicateErrorMessage } = config;

    const body = await request.json();

    if (validate) {
      const err = await validate(body, ctx);
      if (err) return err;
    }

    const payload = { ...buildPayload(body, ctx), workspace: session.workspace };

    const { data, error } = await supabase.from(table).insert(payload).select().single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: duplicateErrorMessage ?? "이미 존재하는 항목입니다." }, { status: 409 });
      }
      throw error;
    }
    return NextResponse.json({ success: true, data }, { status: 201 });
  };

  return withLogging(handler, {
    resource: config.resource,
    action: "create",
    allowedRoles: config.allowedRoles,
  });
};

// ─── Update Handler (PATCH /:id) ─────────────────────────────────────────────

export interface UpdateHandlerConfig {
  table: string;
  resource: string;
  allowedRoles: Role[];
  /** URL param name for the resource ID (default: "id") */
  idParam?: string;
  /** Error message when the ID param is missing */
  idMissingMessage?: string;
  /** Validate request body — return an error Response to abort, or null to proceed */
  validate?: (body: Record<string, unknown>, ctx: ApiContext) => ValidationResult;
  /**
   * Build the update payload from the request body.
   * Only include fields that should be updated (undefined fields are skipped automatically).
   * If the returned object is empty, a 400 "수정할 항목이 없습니다." response is returned.
   */
  buildPayload: (body: Record<string, unknown>, ctx: ApiContext) => Record<string, unknown>;
  /** Automatically append updated_at timestamp after buildPayload */
  autoTimestamp?: boolean;
  /** Error message for duplicate key (23505) violations */
  duplicateErrorMessage?: string;
}

export const createUpdateHandler = (config: UpdateHandlerConfig) => {
  const handler = async (ctx: ApiContext) => {
    const { request, supabase, session, params } = ctx;
    const {
      table,
      idParam = "id",
      idMissingMessage,
      validate,
      buildPayload,
      autoTimestamp,
      duplicateErrorMessage,
    } = config;

    const id = params?.[idParam];
    if (!id) {
      return NextResponse.json({ error: idMissingMessage ?? `${config.resource} ID가 필요합니다.` }, { status: 400 });
    }

    const body = await request.json();

    if (validate) {
      const err = await validate(body, ctx);
      if (err) return err;
    }

    const updateData = buildPayload(body, ctx);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "수정할 항목이 없습니다." }, { status: 400 });
    }

    if (autoTimestamp) {
      updateData.updated_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from(table)
      .update(updateData)
      .eq("id", id)
      .eq("workspace", session.workspace)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: duplicateErrorMessage ?? "이미 존재하는 항목입니다." }, { status: 409 });
      }
      throw error;
    }
    return NextResponse.json({ success: true, data });
  };

  return withLogging(handler, {
    resource: config.resource,
    action: "update",
    allowedRoles: config.allowedRoles,
  });
};

// ─── Delete Handler (DELETE /:id) ────────────────────────────────────────────

export interface DeleteHandlerConfig {
  table: string;
  resource: string;
  allowedRoles: Role[];
  /** URL param name for the resource ID (default: "id") */
  idParam?: string;
  /** Error message when the ID param is missing */
  idMissingMessage?: string;
  /** Pre-delete check — return an error Response to abort, or null to proceed */
  preCheck?: (id: string, ctx: ApiContext) => ValidationResult;
}

export const createDeleteHandler = (config: DeleteHandlerConfig) => {
  const handler = async (ctx: ApiContext) => {
    const { supabase, session, params } = ctx;
    const { table, idParam = "id", idMissingMessage, preCheck } = config;

    const id = params?.[idParam];
    if (!id) {
      return NextResponse.json({ error: idMissingMessage ?? `${config.resource} ID가 필요합니다.` }, { status: 400 });
    }

    if (preCheck) {
      const checkErr = await preCheck(id, ctx);
      if (checkErr) return checkErr;
    }

    const { error } = await supabase.from(table).delete().eq("id", id).eq("workspace", session.workspace);

    if (error) throw error;
    return NextResponse.json({ success: true });
  };

  return withLogging(handler, {
    resource: config.resource,
    action: "delete",
    allowedRoles: config.allowedRoles,
  });
};
