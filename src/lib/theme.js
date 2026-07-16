// Design tokens with light + dark palettes and a theme context.
// Screens read the active palette with `useC()`; styles are built per-render
// via `useMemo(() => makeStyles(C), [C])`.
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { Appearance, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const lightC = {
  bg: "#eef2f8",
  bg2: "#f5f8fc",
  surface: "#ffffff",
  surface2: "#f8fafc",
  border: "#e6eaf1",
  borderStrong: "#d3d9e4",
  text: "#0f172a",
  text2: "#475569",
  text3: "#94a3b8",
  accent: "#10b981",
  accentDark: "#059669",
  accentLight: "#5eead4",
  violet: "#7c3aed",
  violetLight: "#a78bfa",
  sky: "#0ea5e9",
  pink: "#ec4899",
  orange: "#f97316",
  cyan: "#06b6d4",
  gold: "#eab308",
  danger: "#e11d48",
  white: "#ffffff",
};

export const darkC = {
  bg: "#0b1220",
  bg2: "#0f1930",
  surface: "#141d2f",
  surface2: "#1b2539",
  border: "#26324a",
  borderStrong: "#38466280",
  text: "#e6edf6",
  text2: "#9fb0c6",
  text3: "#6b7c93",
  accent: "#10b981",
  accentDark: "#34d399",
  accentLight: "#5eead4",
  violet: "#a78bfa",
  violetLight: "#c4b5fd",
  sky: "#38bdf8",
  pink: "#f472b6",
  orange: "#fb923c",
  cyan: "#22d3ee",
  gold: "#eab308",
  danger: "#fb7185",
  white: "#ffffff",
};

// Backward-compatible default (light) for any non-themed usage.
export const C = lightC;

// nav / entity accent colours (match web)
export const NAV_COLORS = {
  home: "#10b981",
  calendar: "#7c3aed",
  bookings: "#0ea5e9",
  contacts: "#ec4899",
  products: "#f97316",
  employees: "#06b6d4",
  invoices: "#eab308",
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };
export const space = (n) => n * 4;

export const shadow = (elevation = 6) => ({
  shadowColor: "#0a0f1e",
  shadowOffset: { width: 0, height: elevation / 2 },
  shadowOpacity: 0.14,
  shadowRadius: elevation,
  elevation,
});

// ─────────────────────────────────────────────────────────── theme context
const ThemeCtx = createContext({ colors: lightC, mode: "light", toggle: () => {} });

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("light");

  useEffect(() => {
    AsyncStorage.getItem("spa-theme").then((t) => {
      if (t === "dark" || t === "light") setMode(t);
      else setMode(Appearance.getColorScheme() === "dark" ? "dark" : "light");
    }).catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setMode((m) => {
      const next = m === "dark" ? "light" : "dark";
      AsyncStorage.setItem("spa-theme", next).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ colors: mode === "dark" ? darkC : lightC, mode, toggle }),
    [mode, toggle]
  );
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useC = () => useContext(ThemeCtx).colors;
export const useThemeMode = () => useContext(ThemeCtx);

// Turn a `(C) => ({...})` style factory into a hook that rebuilds the
// StyleSheet whenever the theme changes. Usage:
//   const useStyles = makeStyles((C) => ({ box: { backgroundColor: C.bg } }));
//   function Screen() { const s = useStyles(); ... }
export function makeStyles(factory) {
  return function useStyles() {
    const colors = useC();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}
