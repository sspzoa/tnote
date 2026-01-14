"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/shared/lib/api/fetchWithAuth";

export interface LogEntry {
  id: string;
  created_at: string;
  level: "info" | "warn" | "error" | "debug";
  action: string;
  resource: string;
  resource_id: string | null;
  message: string;
  metadata: Record<string, unknown> | null;
  user_id: string | null;
  user_name: string | null;
  user_role: string | null;
  workspace: string | null;
  ip_address: string | null;
  user_agent: string | null;
  method: string | null;
  path: string | null;
  status_code: number | null;
  duration_ms: number | null;
}

export interface LogFilters {
  level?: string;
  action?: string;
  resource?: string;
  userId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface LogStats {
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  summary: {
    total: number;
    byLevel: Record<string, number>;
    byAction: Record<string, number>;
    byResource: Record<string, number>;
  };
  dailyActivity: Record<string, number>;
  recentErrors: LogEntry[];
}

export const useLogs = (filters: LogFilters = {}) => {
  const queryString = new URLSearchParams();

  if (filters.level) queryString.set("level", filters.level);
  if (filters.action) queryString.set("action", filters.action);
  if (filters.resource) queryString.set("resource", filters.resource);
  if (filters.userId) queryString.set("userId", filters.userId);
  if (filters.search) queryString.set("search", filters.search);
  if (filters.startDate) queryString.set("startDate", filters.startDate);
  if (filters.endDate) queryString.set("endDate", filters.endDate);
  if (filters.limit) queryString.set("limit", filters.limit.toString());
  if (filters.offset) queryString.set("offset", filters.offset.toString());

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["logs", filters],
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/logs?${queryString.toString()}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result as {
        data: LogEntry[];
        pagination: {
          total: number;
          limit: number;
          offset: number;
          hasMore: boolean;
        };
      };
    },
  });

  return {
    logs: data?.data || [],
    pagination: data?.pagination || { total: 0, limit: 100, offset: 0, hasMore: false },
    isLoading,
    error,
    refetch,
  };
};

export const useLogStats = (days: number = 7) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["logStats", days],
    queryFn: async () => {
      const response = await fetchWithAuth(`/api/logs/stats?days=${days}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      return result.data as LogStats;
    },
  });

  return {
    stats: data,
    isLoading,
    error,
    refetch,
  };
};
