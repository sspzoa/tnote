interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "toggle";
}

export function FilterButton({ active, onClick, children, variant = "default" }: FilterButtonProps) {
  const baseStyles =
    "rounded-radius-300 px-spacing-400 py-spacing-200 font-medium text-label transition-all duration-150 border";

  if (variant === "toggle") {
    return (
      <button
        onClick={onClick}
        className={`${baseStyles} ${
          active
            ? "border-core-status-positive/30 bg-solid-translucent-green text-solid-green"
            : "border-line-outline bg-components-fill-standard-secondary text-content-standard-secondary hover:border-core-accent/30 hover:bg-components-interactive-hover"
        }`}>
        {children}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${
        active
          ? "border-core-accent bg-core-accent text-solid-white"
          : "border-line-outline bg-components-fill-standard-secondary text-content-standard-secondary hover:border-core-accent/30 hover:bg-components-interactive-hover"
      }`}>
      {children}
    </button>
  );
}
