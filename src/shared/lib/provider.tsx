"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import { type PropsWithChildren, useState } from "react";

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 60 * 1000,
      },
      mutations: {
        retry: 1,
      },
    },
  });

export function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(createQueryClient);

  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </JotaiProvider>
  );
}
