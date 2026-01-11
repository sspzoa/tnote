import Link from "next/link";

interface HeaderProps {
  title: string;
  subtitle?: string;
  backLink?: string;
  action?: React.ReactNode;
}

export default function Header({ title, subtitle, backLink, action }: HeaderProps) {
  return (
    <div className="mb-spacing-700">
      {backLink && (
        <Link href={backLink} className="mb-spacing-400 inline-block text-body text-core-accent hover:underline">
          ← 홈으로 돌아가기
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
