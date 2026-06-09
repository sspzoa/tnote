"use client";

import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/shared/components/ui/sidebar";
import { useUser } from "@/shared/hooks/useUser";
import { adminNavItems, studentNavItems } from "@/shared/lib/nav";
import { cn } from "@/shared/lib/utils/cn";

/**
 * Persistent bottom tab bar for mobile (<md). Shows the role's top destinations; "더보기" opens the
 * existing mobile sidebar Sheet for the overflow + user menu (logout / password / theme). Reads nav.ts.
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAdmin } = useUser();
  const { setOpenMobile } = useSidebar();

  const items = (isAdmin ? adminNavItems : studentNavItems).slice(0, 4);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden print:hidden">
      <div className="flex items-stretch justify-around">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 px-1 py-2 text-xs transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}>
              <span
                className={cn(
                  "flex h-8 w-12 items-center justify-center rounded-full transition-colors [&_svg]:size-5",
                  active && "bg-primary-soft",
                )}>
                <item.icon />
              </span>
              <span className="max-w-full truncate font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setOpenMobile(true)}
          className="flex flex-1 flex-col items-center gap-1 px-1 py-2 text-muted-foreground text-xs transition-colors">
          <span className="flex h-8 w-12 items-center justify-center rounded-full [&_svg]:size-5">
            <MoreHorizontal />
          </span>
          <span className="font-medium">더보기</span>
        </button>
      </div>
    </nav>
  );
}
