import { dateKey, fromOdoo } from "./datetime";

export const PALETTE = [
  "#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#8b5cf6", "#ef4444",
  "#10b981", "#3b82f6", "#f97316", "#06b6d4", "#d946ef", "#84cc16",
  "#e11d48", "#0ea5e9", "#a855f7", "#22c55e", "#eab308", "#f43f5e",
  "#2dd4bf", "#7c3aed",
];

export function readableText(hex) {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const lin = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.45 ? "#0b0b0f" : "#ffffff";
}

export function hexToRgba(hex, a = 1) {
  const c = hex.replace("#", "");
  return `rgba(${parseInt(c.slice(0, 2), 16)}, ${parseInt(c.slice(2, 4), 16)}, ${parseInt(c.slice(4, 6), 16)}, ${a})`;
}

// Per-day unique colour map { bookingId -> {bg, fg} } — honours stored colours.
export function assignColors(bookings) {
  const byDay = {};
  for (const b of bookings) {
    const d = fromOdoo(b.start);
    if (!d) continue;
    (byDay[dateKey(d)] = byDay[dateKey(d)] || []).push(b);
  }
  const map = {};
  for (const key of Object.keys(byDay)) {
    const list = byDay[key].sort((a, b) =>
      String(a.start).localeCompare(String(b.start)) || a.id - b.id);
    const used = new Set(
      list.map((b) => (b.color || "").toLowerCase()).filter((c) => /^#[0-9a-f]{6}$/.test(c))
    );
    let idx = 0;
    for (const b of list) {
      let bg = b.color && /^#([0-9a-f]{6})$/i.test(b.color) ? b.color.toLowerCase() : null;
      if (!bg) {
        while (used.has(PALETTE[idx % PALETTE.length]) && used.size < PALETTE.length) idx++;
        bg = PALETTE[idx % PALETTE.length]; idx++; used.add(bg);
      }
      map[b.id] = { bg, fg: readableText(bg) };
    }
  }
  return map;
}

export const nextColorForDay = (used = []) => {
  const set = new Set(used.map((c) => (c || "").toLowerCase()));
  return PALETTE.find((c) => !set.has(c)) || PALETTE[used.length % PALETTE.length];
};

export const avatarHue = (id = 0) => {
  const hues = [265, 200, 160, 32, 340, 190, 12, 100];
  const h = hues[id % 8];
  return `hsl(${h} 68% 52%)`;
};
export const initials = (n = "") =>
  n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
