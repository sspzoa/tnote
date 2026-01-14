interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <div className="mb-spacing-700">
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
