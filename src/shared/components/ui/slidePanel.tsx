"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { IconButton } from "./iconButton";

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: "sm" | "md" | "lg";
}

const widthStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function SlidePanel({ isOpen, onClose, title, subtitle, children, width = "md" }: SlidePanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const isOpenRef = useRef(isOpen);
  const hasAnimatedIn = useRef(false);

  useEffect(() => {
    const wasOpen = isOpenRef.current;
    isOpenRef.current = isOpen;

    if (isOpen && !wasOpen) {
      hasAnimatedIn.current = false;
      setIsVisible(true);
      setIsAnimating(false);

      const timer = setTimeout(() => {
        setIsAnimating(true);
        hasAnimatedIn.current = true;
      }, 10);

      document.body.style.overflow = "hidden";
      return () => clearTimeout(timer);
    }

    if (!isOpen && wasOpen) {
      setIsAnimating(false);
      hasAnimatedIn.current = false;

      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);

      document.body.style.overflow = "";
      return () => clearTimeout(timer);
    }

    if (isOpen && hasAnimatedIn.current) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-solid-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-full ${widthStyles[width]} flex-col border-line-outline border-l bg-components-fill-standard-primary transition-transform duration-300 ease-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}>
        <div className="flex items-center justify-between border-line-divider border-b px-spacing-600 py-spacing-500">
          <div>
            <h2 className="font-bold text-content-standard-primary text-heading">{title}</h2>
            {subtitle && <p className="text-content-standard-tertiary text-label">{subtitle}</p>}
          </div>
          <IconButton onClick={onClose} aria-label="닫기">
            <X className="size-5" />
          </IconButton>
        </div>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}
