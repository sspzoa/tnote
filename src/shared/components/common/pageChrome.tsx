"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

/**
 * The incremental-migration seam between a page and the persistent CommandBar.
 * A page's <PageShell> teleports its primary CTA into the bar's action slot and (optionally)
 * pushes a trailing breadcrumb crumb (e.g. a record name). The bar renders generic chrome
 * (sidebar trigger · pathname breadcrumb · theme · user) until a page fills these — so an
 * un-migrated page never renders chrome-less, and a migrated one never renders chrome twice.
 */
interface PageChrome {
  actionSlot: HTMLElement | null;
  setActionSlot: (el: HTMLElement | null) => void;
  /** Trailing breadcrumb label a detail page pushes once its record resolves. */
  crumb: string | null;
  setCrumb: (c: string | null) => void;
}

const PageChromeContext = createContext<PageChrome | null>(null);

export function PageChromeProvider({ children }: { children: ReactNode }) {
  const [actionSlot, setActionSlot] = useState<HTMLElement | null>(null);
  const [crumb, setCrumb] = useState<string | null>(null);
  return (
    <PageChromeContext.Provider value={{ actionSlot, setActionSlot, crumb, setCrumb }}>
      {children}
    </PageChromeContext.Provider>
  );
}

export function usePageChrome(): PageChrome {
  const ctx = useContext(PageChromeContext);
  if (!ctx) throw new Error("usePageChrome must be used within PageChromeProvider");
  return ctx;
}
