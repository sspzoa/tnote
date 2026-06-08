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
    <div className="flex flex-col gap-4">
      {backLink && (
        <Link
          href={backLink.href}
          className="group inline-flex items-center gap-1 text-base text-primary transition-all duration-150 hover:gap-2">
          <span className="transition-transform duration-150 group-hover:-translate-x-0.5">←</span>
          <span>{backLink.label}</span>
        </Link>
      )}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-bold text-2xl text-foreground">{title}</h1>
          {subtitle && <p className="text-base text-muted-foreground">{subtitle}</p>}
        </div>
        {action && <div className="flex flex-wrap gap-3">{action}</div>}
      </div>
    </div>
  );
}
