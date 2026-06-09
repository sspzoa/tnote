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
          className="group inline-flex h-8 w-fit items-center gap-1.5 rounded-full bg-muted/60 px-3 text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-foreground">
          <ArrowLeft className="group-hover:-translate-x-0.5 size-4 transition-transform" />
          <span>{backLink.label}</span>
        </Link>
      )}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-2xl text-foreground tracking-[-0.02em]">{title}</h1>
          {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
        </div>
        {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
      </div>
    </div>
  );
}
