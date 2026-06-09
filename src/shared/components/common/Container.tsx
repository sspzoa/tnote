import type React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function Container({ children, className = "" }: ContainerProps) {
  const baseClasses = "min-h-screen p-6 md:p-8";

  return (
    <div className={`${baseClasses} ${className}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">{children}</div>
    </div>
  );
}
