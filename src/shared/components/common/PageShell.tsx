"use client";

import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/lib/utils/cn";
import { usePageChrome } from "./pageChrome";

interface PageShellProps {
  title?: string;
  /** Custom header band (e.g. a DetailHeader) rendered in place of the default title/subtitle/stats. */
  header?: ReactNode;
  subtitle?: ReactNode;
  /** Trailing breadcrumb crumb pushed up to the CommandBar (e.g. a record name). */
  crumb?: string;
  /** Primary actions, teleported into the CommandBar's action slot. */
  actions?: ReactNode;
  /** Optional metric ribbon (StatStrip) rendered under the title. */
  stats?: ReactNode;
  /** "desk" = wide console width; "narrow" = calm reading width (/my/* + detail). */
  width?: "desk" | "narrow";
  /** Drop the centered max-width column and inner gap (full-bleed consoles, calendar). */
  bleed?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * The page body of the app frame — replaces the old per-page <Container> + <Header>.
 * Renders the in-body title/subtitle + optional stat ribbon, then the content, and teleports
 * the page's primary actions + breadcrumb crumb up into the persistent CommandBar.
 */
export function PageShell({
  title,
  header,
  subtitle,
  crumb,
  actions,
  stats,
  width = "desk",
  bleed = false,
  className,
  children,
}: PageShellProps) {
  const { actionSlot, setCrumb } = usePageChrome();

  useEffect(() => {
    setCrumb(crumb ?? null);
    return () => setCrumb(null);
  }, [crumb, setCrumb]);

  return (
    <div className={cn("px-5 py-6 pb-24 md:px-8 md:pb-10", className)}>
      <div className={cn("mx-auto flex w-full flex-col gap-6", width === "narrow" ? "max-w-3xl" : "max-w-[1600px]")}>
        {header ?? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              {title && <h1 className="font-bold text-2xl text-foreground tracking-[-0.02em]">{title}</h1>}
              {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
            </div>
            {stats}
          </div>
        )}
        {bleed ? children : <div className="flex flex-col gap-6">{children}</div>}
      </div>

      {actionSlot && actions ? createPortal(actions, actionSlot) : null}
    </div>
  );
}
