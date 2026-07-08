import AsyncStorage from "@react-native-async-storage/async-storage";
import { resolveServer, getTz } from "./config";

const SESSION_KEY = "spa_session_v2";
const LAST_KEY = "spa_last_login";

let session = null; // in-memory copy of the current session

// ─────────────────────────────────────────────────────────── session
export async function initSession() {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    session = raw ? JSON.parse(raw) : null;
  } catch {
    session = null;
  }
  return session;
}
export function getSession() { return session; }
export function isLoggedIn() { return !!(session && session.token); }

async function saveSession(s) {
  session = s;
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(s));
}
export async function clearSession() {
  session = null;
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function getLastLogin() {
  try {
    const raw = await AsyncStorage.getItem(LAST_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ─────────────────────────────────────────────────────────── transport
async function post(baseUrl, path, params) {
  let res;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", params }),
    });
  } catch (e) {
    throw new Error(`Cannot reach ${baseUrl}. Check the server address and your connection.`);
  }
  let data;
  try { data = await res.json(); }
  catch { throw new Error(`Server returned an invalid response (HTTP ${res.status}).`); }

  const result = data?.result ?? data;
  if (data?.error) {
    throw new Error(data.error?.data?.message || data.error?.message || "Request failed");
  }
  if (result?.success === false) {
    const err = new Error(result.message || "Request failed");
    err.status = result.status;
    if (result.status === 401) clearSession();
    throw err;
  }
  return result?.data ?? result;
}

function request(path, body = {}) {
  if (!session) return Promise.reject(new Error("Not logged in"));
  const tz = getTz();
  return post(session.baseUrl, path, {
    db: session.db,
    ...(tz ? { tz } : {}),
    ...(session.token ? { token: session.token } : {}),
    ...body,
  });
}

// ─────────────────────────────────────────────────────────── auth
export async function login(serverInput, dbInput, username, password) {
  const { baseUrl, db } = resolveServer(serverInput, dbInput);
  if (!baseUrl || !db) throw new Error("Enter a company code / server and database.");
  const tz = getTz();
  const data = await post(baseUrl, "/spa/api/login", {
    db, login: username, password, ...(tz ? { tz } : {}),
  });
  const sess = { ...data, baseUrl, db, server: serverInput, dbInput: db };
  await saveSession(sess);
  await AsyncStorage.setItem(LAST_KEY, JSON.stringify({ server: serverInput, db }));
  return sess;
}

export async function logout() {
  try { await request("/spa/api/logout"); } catch {}
  await clearSession();
}

// ─────────────────────────────────────────────────────────── data
export const getCompany = () => request("/spa/api/company");
export const getCustomers = (p = {}) => request("/spa/api/customers", p);
export const getProducts = (p = {}) => request("/spa/api/products", p);
export const getEmployees = (p = {}) => request("/spa/api/employees", p);
export const getInvoices = (p = {}) => request("/spa/api/invoices", p);
export const getTodayInvoices = () => request("/spa/api/invoices/today");
export const getInvoiceSummary = () => request("/spa/api/invoices/summary");
export const postInvoice = (id) => request("/spa/api/invoices/post", { id });
export const cancelInvoice = (id) => request("/spa/api/invoices/cancel", { id });

export const getBookings = (p = {}) => request("/spa/api/bookings", p);
export const getAllBookings = (p = {}) => request("/spa/api/bookings", { all_states: true, ...p });
export const saveBooking = (payload) => request("/spa/api/bookings/save", payload);
export const deleteBooking = (id) => request("/spa/api/bookings/delete", { id });
export const cancelBooking = (id, state = "cancelled") => request("/spa/api/bookings/cancel", { id, state });
export const invoiceBooking = (id) => request("/spa/api/bookings/invoice", { id });
