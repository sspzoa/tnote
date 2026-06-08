import type React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function Container({ children, className = "" }: ContainerProps) {
  const baseClasses = "min-h-screen p-7 md:p-10";

  return (
    <div className={`${baseClasses} ${className}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-7">{children}</div>
    </div>
  );
}
