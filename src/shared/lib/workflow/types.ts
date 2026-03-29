import type { QueryKey } from "@tanstack/react-query";

export interface WorkflowMutationConfig {
  baseEndpoint: string;
  invalidateKeys: QueryKey[];
}

export interface WorkflowListConfig {
  baseEndpoint: string;
  queryKeyFn: (filter: string) => QueryKey;
  errorMessage?: string;
}

export interface WorkflowHistoryConfig {
  baseEndpoint: string;
  historyQueryKeyFn: (id: string) => QueryKey;
  fallbackKey: QueryKey;
  errorMessage?: string;
}

export interface WorkflowAllHistoryConfig {
  baseEndpoint: string;
  historyAllQueryKey: QueryKey;
}

export interface WorkflowNoteData {
  note?: string | null;
}

export interface WorkflowPostponeData {
  newDate: string;
  note?: string | null;
}
