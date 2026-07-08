// Backend domain suffix used for company codes: <code> -> https://<code>.asrbpo.com
export const API_DOMAIN = "asrbpo.com";
export const APP_NAME = "Booking Calendar";

// Resolve the API base URL + database from the login "Server" + "Database"
// fields. Mirrors the web app's sub-domain mapping, but the phone has no URL so
// the user types the company code (or a full local address).
//   "test"                 -> https://test.asrbpo.com   db "test"
//   "192.168.1.9:8069"     -> http://192.168.1.9:8069   db <database field>
//   "http://10.0.2.2:8069" -> http://10.0.2.2:8069      db <database field>
export function resolveServer(serverInput, dbInput) {
  const raw = (serverInput || "").trim().replace(/\/+$/, "");
  const db = (dbInput || "").trim();
  if (/:\/\//.test(raw)) {
    return { baseUrl: raw, db, tenant: raw };
  }
  if (/[:/]/.test(raw) || /^\d{1,3}(\.\d{1,3}){3}/.test(raw) || raw.toLowerCase().startsWith("localhost")) {
    return { baseUrl: "http://" + raw, db, tenant: raw };
  }
  // plain company code
  return { baseUrl: `https://${raw}.${API_DOMAIN}`, db: db || raw, tenant: raw };
}

export function getTz() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}
