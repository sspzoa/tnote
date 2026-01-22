interface LoadingComponentProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "size-5",
  md: "size-6",
  lg: "size-8",
};

export default function LoadingComponent({ className = "min-h-[50vh]", size = "lg" }: LoadingComponentProps) {
  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-live="polite">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-core-accent border-t-transparent`}
      />
    </div>
  );
}
