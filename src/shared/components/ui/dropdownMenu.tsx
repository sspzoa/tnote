"use client";

export interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
  dividerAfter?: boolean;
}

interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: DropdownMenuItem[];
}

export function DropdownMenu({ isOpen, onClose, items }: DropdownMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute top-full right-0 z-20 mt-spacing-100 min-w-[120px] whitespace-nowrap rounded-radius-300 border border-line-outline bg-components-fill-standard-primary py-spacing-200 shadow-lg">
        {items.map((item, index) => (
          <div key={index}>
            <button
              onClick={() => {
                onClose();
                item.onClick();
              }}
              className={`w-full px-spacing-400 py-spacing-200 text-left text-body transition-colors ${
                item.variant === "danger"
                  ? "text-core-status-negative hover:bg-solid-translucent-red"
                  : "text-content-standard-primary hover:bg-components-interactive-hover"
              }`}>
              {item.label}
            </button>
            {item.dividerAfter && <div className="my-spacing-100 border-line-divider border-t" />}
          </div>
        ))}
      </div>
    </>
  );
}

interface MoreOptionsButtonProps {
  onClick: () => void;
}

export function MoreOptionsButton({ onClick }: MoreOptionsButtonProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-radius-200 px-spacing-300 py-spacing-200 transition-colors hover:bg-components-fill-standard-secondary">
      <svg className="h-5 w-5 text-content-standard-tertiary" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
      </svg>
    </button>
  );
}
