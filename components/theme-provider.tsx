"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import type { ReactNode } from "react";

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps & { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      themes={["light", "dark"]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

