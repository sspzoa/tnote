interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "toggle";
}

export function FilterButton({ active, onClick, children, variant = "default" }: FilterButtonProps) {
  const baseStyles = "rounded-radius-300 px-spacing-400 py-spacing-200 font-medium text-label transition-colors";

  if (variant === "toggle") {
    return (
      <button
        onClick={onClick}
        className={`${baseStyles} ${
          active
            ? "bg-solid-translucent-green text-solid-green"
            : "bg-components-fill-standard-secondary text-content-standard-secondary hover:bg-components-interactive-hover"
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
          ? "bg-core-accent text-solid-white"
          : "bg-components-fill-standard-secondary text-content-standard-secondary hover:bg-components-interactive-hover"
      }`}>
      {children}
    </button>
  );
}
