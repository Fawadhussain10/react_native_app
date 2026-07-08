// Shared design tokens — mirrors the web app's light theme.
export const C = {
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
  shadowColor: "#18274b",
  shadowOffset: { width: 0, height: elevation / 2 },
  shadowOpacity: 0.14,
  shadowRadius: elevation,
  elevation,
});
