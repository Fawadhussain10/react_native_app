import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { View, Text } from "react-native";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "../store/authSlice";
import * as api from "./api";
import { makeStyles, radius, shadow } from "./theme";

const Ctx = createContext(null);
export const useData = () => useContext(Ctx);

function Toast({ toast }) {
  const ts = useToastStyles();
  return (
    <View pointerEvents="none" style={ts.wrap}>
      <View style={[ts.toast, toast.kind === "err" && ts.err, toast.kind === "ok" && ts.ok, shadow(10)]}>
        <Text style={ts.txt}>{toast.msg}</Text>
      </View>
    </View>
  );
}

export function DataProvider({ children }) {
  const dispatch = useDispatch();
  const session = api.getSession() || {};

  const [company, setCompany] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [today, setToday] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const currency = company?.currency_symbol || "$";

  const notify = useCallback((msg, kind = "ok") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2600);
  }, []);

  const doLogout = useCallback(async () => {
    await api.logout();
    dispatch(logoutAction());
  }, [dispatch]);

  const refreshInvoices = useCallback(async () => {
    try {
      const [inv, tod, sum] = await Promise.all([
        api.getInvoices({ limit: 500 }), api.getTodayInvoices(), api.getInvoiceSummary(),
      ]);
      setInvoices(inv.invoices || []); setToday(tod); setSummary(sum);
    } catch { /* ignore */ }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    const [comp, cust, prod, emp] = await Promise.allSettled([
      api.getCompany(), api.getCustomers({ limit: 1000 }),
      api.getProducts({ limit: 1000 }), api.getEmployees({ limit: 1000 }),
    ]);
    if ([comp, cust, prod, emp].some((r) => r.status === "rejected" && r.reason?.status === 401)) {
      setLoading(false); return doLogout();
    }
    if (comp.status === "fulfilled" && comp.value) setCompany(comp.value);
    if (cust.status === "fulfilled") setCustomers(cust.value.customers || []);
    if (prod.status === "fulfilled") setProducts(prod.value.products || []);
    if (emp.status === "fulfilled") setEmployees(emp.value.employees || []);
    const failed = [comp, cust, prod, emp].find((r) => r.status === "rejected");
    if (failed) notify(failed.reason?.message || "Some data failed to load", "err");
    setLoading(false);
    refreshInvoices();
  }, [doLogout, notify, refreshInvoices]);

  useEffect(() => { refreshAll(); }, [refreshAll]);
  useEffect(() => {
    const id = setInterval(() => refreshInvoices(), 15000);
    return () => clearInterval(id);
  }, [refreshInvoices]);

  const value = {
    session, company, customers, products, employees, invoices, today, summary,
    loading, currency, notify, doLogout, refreshAll, refreshInvoices,
  };
  return (
    <Ctx.Provider value={value}>
      {children}
      {toast && <Toast toast={toast} />}
    </Ctx.Provider>
  );
}

const useToastStyles = makeStyles((C) => ({
  wrap: { position: "absolute", bottom: 30, left: 0, right: 0, alignItems: "center", zIndex: 999 },
  toast: { backgroundColor: "#14151d", paddingHorizontal: 18, paddingVertical: 12, borderRadius: radius.md, maxWidth: "90%" },
  err: { backgroundColor: "#9f1239" },
  ok: { backgroundColor: "#065f46" },
  txt: { color: "#fff", fontWeight: "600", fontSize: 13 },
}));
