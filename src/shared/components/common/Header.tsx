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
    <div className="mb-spacing-700">
      {backLink && (
        <Link
          href={backLink.href}
          className="group mb-spacing-400 inline-flex items-center gap-spacing-100 text-body text-core-accent transition-all duration-150 hover:gap-spacing-200">
          <span className="group-hover:-translate-x-spacing-50 transition-transform duration-150">←</span>
          <span>{backLink.label}</span>
        </Link>
      )}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="mb-spacing-200 font-bold text-content-standard-primary text-title">{title}</h1>
          {subtitle && <p className="text-body text-content-standard-secondary">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
