interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <div className="mb-spacing-500 md:mb-spacing-700">
      <div className="flex flex-col gap-spacing-400 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-spacing-100 font-bold text-content-standard-primary text-heading md:mb-spacing-200 md:text-title">
            {title}
          </h1>
          {subtitle && <p className="text-content-standard-secondary text-label md:text-body">{subtitle}</p>}
        </div>
        {action && <div className="flex shrink-0 flex-wrap gap-spacing-200 md:gap-spacing-300">{action}</div>}
      </div>
    </div>
  );
}
