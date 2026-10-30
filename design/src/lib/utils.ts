import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { namedUtilities, themeScale } from "@/styles/tokens";

const twMerge = extendTailwindMerge<keyof typeof namedUtilities>({
  extend: {
    theme: Object.fromEntries(Object.entries(themeScale).map(([key, names]) => [key, [...names]])),
    classGroups: Object.fromEntries(Object.entries(namedUtilities).map(([group, names]) => [group, [...names]])),
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
