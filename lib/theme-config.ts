/**
 * DaisyUI theme configuration
 * These theme names must match the themes defined in app/globals.css
 */
export const THEMES = {
    light: "retro",
    dark: "forest",
} as const;

export type ThemeName = typeof THEMES.light | typeof THEMES.dark;

export const THEME_NAMES: string[] = [THEMES.light, THEMES.dark];

