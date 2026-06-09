import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  backLink?: {
    href: string;
    label: string;
  };
}

export default function Header({ title, subtitle, action, backLink }: HeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      {backLink && (
        <Link
          href={backLink.href}
          className="group inline-flex w-fit items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground">
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          <span>{backLink.label}</span>
        </Link>
      )}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-foreground text-xl">{title}</h1>
          {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
        </div>
        {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
      </div>
    </div>
  );
}
