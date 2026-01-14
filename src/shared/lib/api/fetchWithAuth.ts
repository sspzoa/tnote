/**
 * 인증이 필요한 API 요청을 위한 fetch wrapper
 * 401 응답 시 refresh token으로 갱신을 시도하고, 실패하면 로그인 페이지로 리다이렉트
 */

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

const refreshTokens = async (): Promise<boolean> => {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    return response.ok;
  } catch {
    return false;
  }
};

const handleRefresh = async (): Promise<boolean> => {
  // 이미 refresh 중이면 해당 Promise를 재사용
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = refreshTokens().finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });

  return refreshPromise;
};

const redirectToLogin = (): void => {
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

export const fetchWithAuth = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const response = await fetch(input, {
    ...init,
    credentials: "include",
  });

  // 401이 아니면 그대로 반환
  if (response.status !== 401) {
    return response;
  }

  // 로그인/회원가입 API는 refresh 시도하지 않음
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url.includes("/api/auth/login") || url.includes("/api/auth/register") || url.includes("/api/auth/refresh")) {
    return response;
  }

  // Refresh token으로 갱신 시도
  const refreshSuccess = await handleRefresh();

  if (!refreshSuccess) {
    // Refresh도 실패하면 로그인 페이지로
    redirectToLogin();
    return response;
  }

  // 갱신 성공 시 원래 요청 재시도
  const retryResponse = await fetch(input, {
    ...init,
    credentials: "include",
  });

  // 재시도도 401이면 로그인 페이지로
  if (retryResponse.status === 401) {
    redirectToLogin();
  }

  return retryResponse;
};
