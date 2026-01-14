import type React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function Container({ children, className = "" }: ContainerProps) {
  const baseClasses = "min-h-dvh p-spacing-600 md:p-spacing-800";

  return (
    <div className={`${baseClasses} ${className}`}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
}
