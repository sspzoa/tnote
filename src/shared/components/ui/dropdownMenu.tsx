"use client";

import { useEffect, useRef, useState } from "react";

export interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
  dividerAfter?: boolean;
}

export interface MenuPosition {
  x: number;
  y: number;
}

interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: DropdownMenuItem[];
  position: MenuPosition | null;
}

export function DropdownMenu({ isOpen, onClose, items, position }: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState<MenuPosition | null>(null);

  useEffect(() => {
    if (!isOpen || !position || !menuRef.current) {
      setAdjustedPosition(null);
      return;
    }

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const padding = 8;

    let x = position.x;
    let y = position.y;

    if (x + rect.width > window.innerWidth - padding) {
      x = window.innerWidth - rect.width - padding;
    }

    if (y + rect.height > window.innerHeight - padding) {
      y = window.innerHeight - rect.height - padding;
    }

    x = Math.max(padding, x);
    y = Math.max(padding, y);

    setAdjustedPosition({ x, y });
  }, [isOpen, position]);

  if (!isOpen || !position) return null;

  const displayPosition = adjustedPosition || position;

  return (
    <>
      <div className="fixed inset-0 z-[9999]" onClick={onClose} />
      <div
        ref={menuRef}
        style={{
          position: "fixed",
          left: displayPosition.x,
          top: displayPosition.y,
        }}
        className="z-[10000] min-w-[120px] overflow-hidden whitespace-nowrap rounded-radius-300 border border-line-outline bg-components-fill-standard-primary py-spacing-100 shadow-lg">
        {items.map((item, index) => (
          <div key={index}>
            <button
              onClick={() => {
                onClose();
                item.onClick();
              }}
              className={`w-full px-spacing-400 py-spacing-200 text-left text-body transition-all duration-150 ${
                item.variant === "danger"
                  ? "text-core-status-negative hover:bg-solid-translucent-red"
                  : "text-content-standard-primary hover:bg-core-accent-translucent hover:text-core-accent"
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
  onClick: (position: MenuPosition) => void;
}

export function MoreOptionsButton({ onClick }: MoreOptionsButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick({ x: e.clientX, y: e.clientY });
  };

  return (
    <button
      onClick={handleClick}
      className="rounded-radius-200 px-spacing-300 py-spacing-200 transition-all duration-150 hover:bg-core-accent-translucent hover:text-core-accent">
      <svg className="h-5 w-5 text-content-standard-tertiary" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
      </svg>
    </button>
  );
}
