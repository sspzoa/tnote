import type { TagColor } from "@/shared/types";

export const TAG_COLOR_CLASSES: Record<TagColor, { bg: string; text: string }> = {
  red: { bg: "bg-solid-translucent-red", text: "text-solid-red" },
  orange: { bg: "bg-solid-translucent-orange", text: "text-solid-orange" },
  yellow: { bg: "bg-solid-translucent-yellow", text: "text-solid-yellow" },
  green: { bg: "bg-solid-translucent-green", text: "text-solid-green" },
  blue: { bg: "bg-solid-translucent-blue", text: "text-solid-blue" },
  indigo: { bg: "bg-solid-translucent-indigo", text: "text-solid-indigo" },
  purple: { bg: "bg-solid-translucent-purple", text: "text-solid-purple" },
  pink: { bg: "bg-solid-translucent-pink", text: "text-solid-pink" },
  brown: { bg: "bg-solid-translucent-brown", text: "text-solid-brown" },
  black: { bg: "bg-solid-translucent-black", text: "text-solid-black" },
  white: { bg: "bg-components-fill-standard-secondary", text: "text-content-standard-primary" },
};

export const TAG_FILTER_COLOR_CLASSES: Record<TagColor, { bg: string; text: string; activeBg: string }> = {
  red: { bg: "bg-solid-translucent-red/50", text: "text-solid-red", activeBg: "bg-solid-translucent-red" },
  orange: { bg: "bg-solid-translucent-orange/50", text: "text-solid-orange", activeBg: "bg-solid-translucent-orange" },
  yellow: { bg: "bg-solid-translucent-yellow/50", text: "text-solid-yellow", activeBg: "bg-solid-translucent-yellow" },
  green: { bg: "bg-solid-translucent-green/50", text: "text-solid-green", activeBg: "bg-solid-translucent-green" },
  blue: { bg: "bg-solid-translucent-blue/50", text: "text-solid-blue", activeBg: "bg-solid-translucent-blue" },
  indigo: { bg: "bg-solid-translucent-indigo/50", text: "text-solid-indigo", activeBg: "bg-solid-translucent-indigo" },
  purple: { bg: "bg-solid-translucent-purple/50", text: "text-solid-purple", activeBg: "bg-solid-translucent-purple" },
  pink: { bg: "bg-solid-translucent-pink/50", text: "text-solid-pink", activeBg: "bg-solid-translucent-pink" },
  brown: { bg: "bg-solid-translucent-brown/50", text: "text-solid-brown", activeBg: "bg-solid-translucent-brown" },
  black: { bg: "bg-solid-translucent-black/50", text: "text-solid-black", activeBg: "bg-solid-translucent-black" },
  white: {
    bg: "bg-components-fill-standard-secondary",
    text: "text-content-standard-primary",
    activeBg: "bg-components-fill-standard-tertiary",
  },
};

export const TAG_COLOR_STYLES: Record<TagColor, { bg: string; text: string; ring: string }> = {
  red: { bg: "bg-solid-translucent-red", text: "text-solid-red", ring: "ring-solid-red" },
  orange: { bg: "bg-solid-translucent-orange", text: "text-solid-orange", ring: "ring-solid-orange" },
  yellow: { bg: "bg-solid-translucent-yellow", text: "text-solid-yellow", ring: "ring-solid-yellow" },
  green: { bg: "bg-solid-translucent-green", text: "text-solid-green", ring: "ring-solid-green" },
  blue: { bg: "bg-solid-translucent-blue", text: "text-solid-blue", ring: "ring-solid-blue" },
  indigo: { bg: "bg-solid-translucent-indigo", text: "text-solid-indigo", ring: "ring-solid-indigo" },
  purple: { bg: "bg-solid-translucent-purple", text: "text-solid-purple", ring: "ring-solid-purple" },
  pink: { bg: "bg-solid-translucent-pink", text: "text-solid-pink", ring: "ring-solid-pink" },
  brown: { bg: "bg-solid-translucent-brown", text: "text-solid-brown", ring: "ring-solid-brown" },
  black: { bg: "bg-solid-translucent-black", text: "text-solid-black", ring: "ring-solid-black" },
  white: { bg: "bg-solid-translucent-white", text: "text-solid-white", ring: "ring-solid-white" },
};

export const TAG_SOLID_COLORS: Record<TagColor, string> = {
  red: "bg-solid-red",
  orange: "bg-solid-orange",
  yellow: "bg-solid-yellow",
  green: "bg-solid-green",
  blue: "bg-solid-blue",
  indigo: "bg-solid-indigo",
  purple: "bg-solid-purple",
  pink: "bg-solid-pink",
  brown: "bg-solid-brown",
  black: "bg-solid-black",
  white: "bg-solid-white border border-line-outline",
};

export const TAG_COLORS: TagColor[] = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "indigo",
  "purple",
  "pink",
  "brown",
  "black",
  "white",
];
