import { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useData } from "../lib/AppData";
import * as api from "../lib/api";
import { useC, makeStyles, radius, shadow } from "../lib/theme";
import { money, Avatar, IconAvatar, StatePill } from "../components/ui";
import Icon from "../components/Icon";
import PickerModal from "../components/PickerModal";
import { printBookingReceipt } from "../lib/receipt";
import { fromOdoo, addMinutes, toOdoo, fmtTime, fmtDate } from "../lib/datetime";
import { PALETTE } from "../lib/colors";

export default function BookingFormScreen({ route, navigation }) {
  const C = useC();
  const s = useStyles();
  const { customers, products, employees, currency, notify, refreshInvoices, company } = useData();
  const { mode, booking, draft } = route.params || {};
  const editing = mode === "edit";

  const initCustomer = editing
    ? customers.find((c) => c.id === booking.partner_id) || { id: booking.partner_id, name: booking.partner_name }
    : null;
  const initServices = editing && booking.lines?.length
    ? booking.lines.map((l) => ({
        product: products.find((p) => p.variant_id === l.product_id) || {
          id: l.product_id, variant_id: l.product_id, name: l.product_name, list_price: l.price_unit, duration: l.duration || 30,
        },
        qty: l.quantity || 1,
      }))
    : [];

  const [customer, setCustomer] = useState(initCustomer);
  const [services, setServices] = useState(initServices);
  const [employeeId, setEmployeeId] = useState(editing ? booking.employee_id || null : null);
  const [start, setStart] = useState(editing ? fromOdoo(booking.start) : (draft?.start ? new Date(draft.start) : new Date()));
  const [note, setNote] = useState(editing ? booking.note || "" : "");
  const [busy, setBusy] = useState(false);
  const [picker, setPicker] = useState(null);
  const [dtMode, setDtMode] = useState(null); // 'date' | 'time'
  const [invoiceList, setInvoiceList] = useState(editing ? (booking.invoices || []) : []);
  const hasActiveInvoice = invoiceList.some((i) => i.state !== "cancel");
  // a POSTED invoice freezes the booking (services, timing, staff, delete, cancel)
  const locked = invoiceList.some((i) => i.state === "posted");

  const employee = employees.find((e) => e.id === employeeId);
  const totalDuration = services.reduce((s, x) => s + (x.product.duration || 30) * x.qty, 0);
  const totalPrice = services.reduce((s, x) => s + (x.product.list_price || 0) * x.qty, 0);
  const end = addMinutes(start, totalDuration || 30);

  const addService = (p) => setServices((prev) => {
    const i = prev.findIndex((x) => x.product.id === p.id);
    if (i >= 0) { const c = [...prev]; c[i] = { ...c[i], qty: c[i].qty + 1 }; return c; }
    return [...prev, { product: p, qty: 1 }];
  });
  const setQty = (pid, qty) => setServices((prev) => prev.map((x) => x.product.id === pid ? { ...x, qty: Math.max(1, qty) } : x));
  const removeService = (pid) => setServices((prev) => prev.filter((x) => x.product.id !== pid));

  const onDT = (event, selected) => {
    const cur = dtMode;
    setDtMode(null);
    if (event?.type === "dismissed" || !selected) return;
    if (cur === "date") {
      const d = new Date(start); d.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      setStart(d); setTimeout(() => setDtMode("time"), 250);
    } else {
      const d = new Date(start); d.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      setStart(d);
    }
  };

  async function save() {
    if (!customer || services.length === 0) { notify("Add a customer and a service", "err"); return; }
    setBusy(true);
    try {
      const payload = {
        partner_id: customer.id,
        employee_id: employeeId || false,
        start: toOdoo(start),
        stop: toOdoo(end),
        note,
        color: editing ? booking.color : PALETTE[Math.abs(start.getHours() * 4 + services.length) % PALETTE.length],
        lines: services.map((x) => ({
          product_id: x.product.variant_id || x.product.id, quantity: x.qty,
          duration: x.product.duration || 30, price_unit: x.product.list_price,
        })),
      };
      if (editing) payload.id = booking.id;
      await api.saveBooking(payload);
      notify("Booking saved", "ok");
      refreshInvoices();
      navigation.goBack();
    } catch (e) { notify(e.message || "Could not save", "err"); }
    finally { setBusy(false); }
  }
  async function doAction(fn, okMsg) {
    setBusy(true);
    try { await fn(); notify(okMsg, "ok"); refreshInvoices(); navigation.goBack(); }
    catch (e) { notify(e.message || "Failed", "err"); }
    finally { setBusy(false); }
  }
  async function handlePrint() {
    try {
      const activeInv = invoiceList.find((i) => i.state !== "cancel");
      let rcptServices, rcptTotal;
      if (activeInv && activeInv.lines?.length) {
        // bill from the invoice: tax folded into each line total (no separate tax line)
        rcptServices = activeInv.lines.map((l) => ({
          name: l.product_name || l.description,
          qty: l.quantity,
          price: l.quantity ? l.price_total / l.quantity : l.price_total,
          amount: l.price_total,
        }));
        rcptTotal = activeInv.amount_total;
      } else {
        rcptServices = services.map((x) => ({ name: x.product.name, qty: x.qty, price: x.product.list_price, duration: x.product.duration || 30 }));
        rcptTotal = totalPrice;
      }
      await printBookingReceipt({
        companyName: company?.name || "SPA",
        companyAddress: company?.address, companyPhone: company?.phone, companyEmail: company?.email,
        currency,
        ref: editing ? booking.name : "",
        customerName: customer?.name,
        employeeName: employee?.name || "Unassigned",
        start, end, durationMin: totalDuration,
        services: rcptServices,
        total: rcptTotal,
        invoice: activeInv ? { name: activeInv.name, state: activeInv.state } : null,
        note,
      });
    } catch (e) { notify(e.message || "Could not print", "err"); }
  }

  // invoice ops keep the form open and refresh the linked-invoice list live
  async function invoiceOp(fn, okMsg) {
    setBusy(true);
    try {
      const res = await fn();
      setInvoiceList(res.booking?.invoices || []);
      notify(okMsg, "ok");
      refreshInvoices();
    } catch (e) { notify(e.message || "Failed", "err"); }
    finally { setBusy(false); }
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.hTitle}>{editing ? "Booking" : "New booking"}</Text>
          {editing ? <Text style={s.hRef}>{booking.name}</Text> : <Text style={s.hSub}>Fill in the details</Text>}
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.close}><Icon name="close" size={18} color={C.text2} /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
        {locked && (
          <View style={s.lockBanner}>
            <Icon name="receipt" size={15} color="#9a6a00" />
            <Text style={s.lockTxt}>This booking has a posted invoice and is locked. Cancel the invoice to change services, timing or staff.</Text>
          </View>
        )}
        {/* customer */}
        <Text style={s.label}>Customer</Text>
        <TouchableOpacity style={[s.select, locked && s.selLocked]} disabled={locked} onPress={() => setPicker("customer")}>
          {customer ? (
            <><Avatar name={customer.name} id={customer.id} size={34} />
              <Text style={s.selTxt} numberOfLines={1}>{customer.name}</Text></>
          ) : <Text style={s.selPlaceholder}>Select a customer</Text>}
          {!locked && <Icon name="chevronDown" size={18} color={C.text3} />}
        </TouchableOpacity>

        {/* services */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16 }}>
          <Text style={[s.label, { flex: 1, marginTop: 0 }]}>Services</Text>
          {!locked && (
            <TouchableOpacity style={s.addBtn} onPress={() => setPicker("service")}>
              <Icon name="plus" size={14} color={C.accentDark} /><Text style={s.addBtnT}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={[s.cart, shadow(3)]}>
          {services.length === 0 && <Text style={s.cartEmpty}>No services yet — tap “Add”.</Text>}
          {services.map((x) => (
            <View key={x.product.id} style={s.cartItem}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.cartName} numberOfLines={1}>{x.product.name}</Text>
                <Text style={s.cartSub}>{x.product.duration || 30} min · {money(x.product.list_price, currency)}</Text>
              </View>
              <View style={[s.qty, locked && { opacity: 0.4 }]}>
                <TouchableOpacity disabled={locked} onPress={() => setQty(x.product.id, x.qty - 1)} style={s.qtyBtn}><Text style={s.qtyT}>−</Text></TouchableOpacity>
                <Text style={s.qtyN}>{x.qty}</Text>
                <TouchableOpacity disabled={locked} onPress={() => setQty(x.product.id, x.qty + 1)} style={s.qtyBtn}><Text style={s.qtyT}>+</Text></TouchableOpacity>
              </View>
              {!locked && (
                <TouchableOpacity onPress={() => removeService(x.product.id)} style={s.rm}><Icon name="close" size={15} color={C.text3} /></TouchableOpacity>
              )}
            </View>
          ))}
          {services.length > 0 && (
            <LinearGradient colors={["rgba(52,211,153,0.14)", "rgba(124,58,237,0.10)"]} style={s.cartTotal}>
              <Text style={s.cartTotalL}>{totalDuration} min · {services.length} service{services.length > 1 ? "s" : ""}</Text>
              <Text style={s.cartTotalV}>{money(totalPrice, currency)}</Text>
            </LinearGradient>
          )}
        </View>

        {/* employee */}
        <Text style={s.label}>Employee</Text>
        <TouchableOpacity style={[s.select, locked && s.selLocked]} disabled={locked} onPress={() => setPicker("employee")}>
          {employee ? <><Avatar name={employee.name} id={employee.id} size={34} /><Text style={s.selTxt}>{employee.name}</Text></>
            : <Text style={s.selPlaceholder}>Unassigned</Text>}
          {!locked && <Icon name="chevronDown" size={18} color={C.text3} />}
        </TouchableOpacity>

        {/* start time */}
        <Text style={s.label}>Starts</Text>
        <TouchableOpacity style={[s.select, locked && s.selLocked]} disabled={locked} onPress={() => setDtMode("date")}>
          <Icon name="clock" size={17} color={C.text3} />
          <Text style={s.selTxt}>{fmtDate(start)} · {fmtTime(start)}</Text>
        </TouchableOpacity>
        <Text style={s.hint}>Ends {fmtTime(end)} ({totalDuration || 30} min)</Text>

        {/* linked invoices */}
        {editing && invoiceList.length > 0 && (
          <>
            <Text style={s.label}>Invoices ({invoiceList.length})</Text>
            <View style={{ gap: 8 }}>
              {invoiceList.map((inv) => {
                const cancelled = inv.state === "cancel";
                const posted = inv.state === "posted";
                return (
                  <View key={inv.id} style={[s.invRow, cancelled && { opacity: 0.55 }, posted && s.invRowPosted]}>
                    <TouchableOpacity style={s.invMain} activeOpacity={0.7}
                      onPress={() => navigation.navigate("Detail", { type: "invoice", item: inv })}>
                      <Icon name="receipt" size={15} color={C.text2} />
                      <Text style={s.invName} numberOfLines={1}>{inv.name || "Draft"}</Text>
                      <StatePill state={cancelled ? "cancelled" : inv.state} paid={inv.payment_state === "paid"} />
                      <Text style={s.invAmt}>{money(inv.amount_total, currency)}</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
                      {inv.state === "draft" && (
                        <TouchableOpacity style={[s.invBtn, s.invConfirm]} disabled={busy}
                          onPress={() => invoiceOp(() => api.postInvoice(inv.id), "Invoice confirmed")}>
                          <Icon name="check" size={13} color="#fff" /><Text style={s.invConfirmT}>Confirm</Text>
                        </TouchableOpacity>
                      )}
                      {inv.state !== "cancel" && (
                        <TouchableOpacity style={[s.invBtn, s.invCancel]} disabled={busy}
                          onPress={() => invoiceOp(() => api.cancelInvoice(inv.id), "Invoice cancelled")}>
                          <Text style={s.invCancelT}>Cancel</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* note */}
        <Text style={s.label}>Notes</Text>
        <TextInput style={s.note} value={note} onChangeText={setNote} placeholder="Optional notes…"
          placeholderTextColor={C.text3} multiline />

        {/* actions */}
        <TouchableOpacity activeOpacity={0.85} onPress={save} disabled={busy} style={{ marginTop: 18 }}>
          <LinearGradient colors={["#34d399", "#059669"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.saveBtn}>
            {busy ? <ActivityIndicator color="#fff" /> : <><Icon name="check" size={18} color="#fff" /><Text style={s.saveT}>{editing ? "Save changes" : "Create booking"}</Text></>}
          </LinearGradient>
        </TouchableOpacity>

        {editing && (
          <View style={{ gap: 10, marginTop: 12 }}>
            <TouchableOpacity style={s.print} onPress={handlePrint}>
              <Icon name="receipt" size={16} color={C.violet} /><Text style={s.printT}>Print receipt</Text>
            </TouchableOpacity>
            {!hasActiveInvoice && (
              <TouchableOpacity style={s.gold} disabled={busy} onPress={() => invoiceOp(() => api.invoiceBooking(booking.id), "Draft invoice created")}>
                <Icon name="receipt" size={16} color="#7a4a05" /><Text style={s.goldT}>{invoiceList.length ? "Re-create invoice" : "Create draft invoice"}</Text>
              </TouchableOpacity>
            )}
            {!locked && (
              <View style={{ flexDirection: "row", gap: 10 }}>
                {booking.state !== "cancelled" && (
                  <TouchableOpacity style={[s.ghost, { flex: 1 }]} disabled={busy} onPress={() => doAction(() => api.cancelBooking(booking.id, "cancelled"), "Booking cancelled")}>
                    <Text style={[s.ghostT, { color: C.danger }]}>Cancel booking</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[s.danger, { flex: 1 }]} disabled={busy} onPress={() => doAction(() => api.deleteBooking(booking.id), "Booking deleted")}>
                  <Icon name="trash" size={15} color={C.danger} /><Text style={[s.ghostT, { color: C.danger }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {dtMode && (
        <DateTimePicker value={start} mode={dtMode} is24Hour={false} onChange={onDT}
          display={Platform.OS === "ios" ? "spinner" : "default"} />
      )}

      <PickerModal visible={picker === "customer"} title="Select customer" items={customers}
        searchKeys={["name", "email", "phone"]} onClose={() => setPicker(null)}
        onPick={(c) => { setCustomer(c); setPicker(null); }}
        renderRow={(c) => ({ left: <Avatar name={c.name} id={c.id} size={38} />, title: c.name, sub: c.email || c.phone || "—", selected: customer?.id === c.id })} />

      <PickerModal visible={picker === "service"} title="Add service" items={products}
        searchKeys={["name", "default_code", "category_name"]} onClose={() => setPicker(null)}
        onPick={(p) => addService(p)}
        renderRow={(p) => ({
          left: <IconAvatar icon="box" size={38} colors={["#a78bfa", "#7c3aed"]} />,
          title: p.name, sub: `${p.duration || 30} min · ${p.category_name || "Service"}`,
          right: <Text style={{ fontSize: 13, fontWeight: "800", color: C.accentDark }}>{money(p.list_price, currency)}</Text>,
          selected: !!services.find((x) => x.product.id === p.id),
        })} />

      <PickerModal visible={picker === "employee"} title="Assign employee" items={[{ id: 0, name: "— Unassigned —" }, ...employees]}
        searchKeys={["name", "job_title"]} onClose={() => setPicker(null)}
        onPick={(e) => { setEmployeeId(e.id || null); setPicker(null); }}
        renderRow={(e) => ({ left: e.id ? <Avatar name={e.name} id={e.id} size={38} /> : <View style={{ width: 38 }} />, title: e.name, sub: e.job_title || "", selected: (employeeId || 0) === e.id })} />
    </View>
  );
}

const useStyles = makeStyles((C) => ({
  header: { flexDirection: "row", alignItems: "center", padding: 16, paddingTop: 14, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  hTitle: { fontSize: 18, fontWeight: "800", color: C.text },
  hRef: { fontSize: 12.5, color: C.accentDark, fontWeight: "700", marginTop: 2 },
  hSub: { fontSize: 12.5, color: C.text2, marginTop: 2 },
  close: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: C.surface2 },
  label: { fontSize: 12, fontWeight: "700", color: C.text2, marginTop: 16, marginBottom: 7, letterSpacing: 0.2 },
  select: { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 11, minHeight: 54 },
  selTxt: { flex: 1, fontSize: 14.5, fontWeight: "600", color: C.text },
  selPlaceholder: { flex: 1, fontSize: 14.5, color: C.text3 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(16,185,129,0.12)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  addBtnT: { color: C.accentDark, fontWeight: "700", fontSize: 12.5 },
  cart: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, overflow: "hidden", marginTop: 8 },
  cartEmpty: { color: C.text3, fontSize: 13, textAlign: "center", padding: 16 },
  cartItem: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  cartName: { fontSize: 13.5, fontWeight: "700", color: C.text },
  cartSub: { fontSize: 11.5, color: C.text2, marginTop: 1 },
  qty: { flexDirection: "row", alignItems: "center", backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 2 },
  qtyBtn: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  qtyT: { fontSize: 18, fontWeight: "800", color: C.text },
  qtyN: { minWidth: 22, textAlign: "center", fontWeight: "800", color: C.text, fontSize: 14 },
  rm: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  cartTotal: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 13 },
  cartTotalL: { fontSize: 12.5, fontWeight: "700", color: "#06432f" },
  cartTotalV: { fontSize: 16, fontWeight: "800", color: C.accentDark },
  hint: { fontSize: 12, color: C.text2, fontWeight: "600", marginTop: 8 },
  note: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 12, fontSize: 14, color: C.text, minHeight: 70, textAlignVertical: "top" },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 14 },
  saveT: { color: "#fff", fontSize: 15.5, fontWeight: "700" },
  gold: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 13, backgroundColor: "#fde68a" },
  goldT: { color: "#7a4a05", fontWeight: "700", fontSize: 14 },
  ghost: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, height: 48, borderRadius: 13, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  danger: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, height: 48, borderRadius: 13, backgroundColor: "rgba(225,29,72,0.08)", borderWidth: 1, borderColor: "rgba(225,29,72,0.25)" },
  ghostT: { fontWeight: "700", fontSize: 14 },
  invRow: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 11 },
  invRowPosted: { borderColor: "rgba(16,185,129,0.45)", backgroundColor: "rgba(16,185,129,0.05)" },
  invMain: { flexDirection: "row", alignItems: "center", gap: 8 },
  invName: { fontSize: 13.5, fontWeight: "700", color: C.text, flexShrink: 1 },
  invAmt: { marginLeft: "auto", fontSize: 13.5, fontWeight: "800", color: C.text },
  invBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, height: 36, borderRadius: 10, paddingHorizontal: 14 },
  invConfirm: { backgroundColor: C.accentDark },
  invConfirmT: { color: "#fff", fontWeight: "700", fontSize: 13 },
  invCancel: { backgroundColor: "rgba(225,29,72,0.08)", borderWidth: 1, borderColor: "rgba(225,29,72,0.25)" },
  invCancelT: { color: C.danger, fontWeight: "700", fontSize: 13 },
  selLocked: { opacity: 0.6, backgroundColor: C.surface2 },
  lockBanner: { flexDirection: "row", alignItems: "center", gap: 9, padding: 11, borderRadius: 12, marginBottom: 4,
    backgroundColor: "rgba(234,179,8,0.12)", borderWidth: 1, borderColor: "rgba(234,179,8,0.32)" },
  lockTxt: { flex: 1, fontSize: 12.5, fontWeight: "600", color: "#9a6a00" },
  toggleRow: { flexDirection: "row", alignItems: "center", marginTop: 10, padding: 12, borderRadius: 12,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  toggleTitle: { fontSize: 13.5, fontWeight: "700", color: C.text },
  toggleSub: { fontSize: 11.5, color: C.text2, marginTop: 2, lineHeight: 15 },
  print: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 13,
    backgroundColor: "rgba(124,58,237,0.08)", borderWidth: 1, borderColor: "rgba(124,58,237,0.25)" },
  printT: { color: C.violet, fontWeight: "700", fontSize: 14 },
}));
