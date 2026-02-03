import type React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function Container({ children, className = "" }: ContainerProps) {
  const baseClasses = "min-h-screen p-spacing-600 md:p-spacing-800";

  return (
    <div className={`${baseClasses} ${className}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-spacing-600">{children}</div>
    </div>
  );
}
