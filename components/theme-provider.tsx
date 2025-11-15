"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import type { ReactNode } from "react";
import { THEMES, THEME_NAMES } from "@/lib/theme-config";

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps & { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme={THEMES.light}
      enableSystem={false}
      themes={THEME_NAMES}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

