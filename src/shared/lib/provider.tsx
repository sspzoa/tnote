"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import { type PropsWithChildren, useState } from "react";
import { ConfirmDialogProvider } from "@/shared/components/ui/confirmDialog";
import { Toaster } from "@/shared/components/ui/sonner";

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000,
      },
      mutations: {
        retry: false,
      },
    },
  });

export function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(createQueryClient);

  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
        <Toaster />
      </QueryClientProvider>
    </JotaiProvider>
  );
}
