// Wall-clock date helpers. Odoo strings ("YYYY-MM-DD HH:MM:SS") are the API's
// local time (the server converts to/from UTC using the request tz).
export const pad = (n) => String(n).padStart(2, "0");

export function toOdoo(date) {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

export function fromOdoo(str) {
  if (!str) return null;
  const [d, t = "00:00:00"] = String(str).replace("T", " ").split(" ");
  const [y, m, day] = d.split("-").map(Number);
  const [hh, mm, ss] = t.split(":").map(Number);
  return new Date(y, (m || 1) - 1, day || 1, hh || 0, mm || 0, ss || 0);
}

export const addMinutes = (date, mins) => new Date(date.getTime() + mins * 60000);
export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};
export const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};
export const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 0);
  return d;
};
export const dateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const sameDay = (a, b) => dateKey(a) === dateKey(b);

export function fmtTime(date, ampm = true) {
  if (!date) return "";
  let h = date.getHours();
  const m = date.getMinutes();
  if (!ampm) return `${pad(h)}:${pad(m)}`;
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${pad(m)} ${suffix}`;
}

const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
export const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));
export const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function fmtDate(date) {
  return `${DAYS_SHORT[date.getDay()]}, ${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
export function fmtDateShort(date) {
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`;
}
