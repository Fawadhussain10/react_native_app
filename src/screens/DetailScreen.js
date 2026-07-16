import { useLayoutEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useData } from "../lib/AppData";
import { useC, makeStyles } from "../lib/theme";
import { money, Avatar, IconAvatar, StatePill } from "../components/ui";
import Icon from "../components/Icon";

function Row({ label, value, icon }) {
  const C = useC();
  const s = useStyles();
  if (!value) return null;
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{icon ? <Icon name={icon} size={12} color={C.text3} /> : null} {label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

export default function DetailScreen({ route, navigation }) {
  const C = useC();
  const s = useStyles();
  const { type, item } = route.params;
  const { currency } = useData();
  useLayoutEffect(() => {
    navigation.setOptions({ title: type === "invoice" ? "Invoice" : type[0].toUpperCase() + type.slice(1) });
  }, [navigation, type]);

  const header = () => {
    if (type === "product") return <IconAvatar icon="box" size={54} colors={["#fb923c", "#ea580c"]} />;
    if (type === "invoice") return <IconAvatar icon="receipt" size={54} />;
    return <Avatar name={item.name} id={item.id} size={54} />;
  };
  const title = type === "invoice" ? item.partner_name : item.name;
  const sub = type === "invoice" ? (item.name || "Draft") : type === "product" ? (item.category_name || "Service")
    : type === "employee" ? (item.job_title || "Staff") : (item.company_name || "Contact");

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      <View style={[s.hero]}>
        {header()}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.title} numberOfLines={2}>{title}</Text>
          <Text style={s.sub}>{sub}</Text>
        </View>
      </View>

      <View style={s.card}>
        {type === "contact" && (<>
          <Row label="Email" value={item.email} icon="mail" />
          <Row label="Phone" value={item.phone} icon="phone" />
          <Row label="Mobile" value={item.mobile} icon="phone" />
          <Row label="Company" value={item.company_name} />
          <Row label="Address" value={item.address} />
          <Row label="Type" value={item.is_company ? "Company" : "Individual"} />
        </>)}
        {type === "product" && (<>
          <Row label="Price" value={money(item.list_price, currency)} />
          <Row label="Duration" value={`${item.duration || 30} min`} icon="clock" />
          <Row label="Category" value={item.category_name} />
          <Row label="Reference" value={item.default_code} />
          <Row label="Barcode" value={item.barcode} />
          <Row label="Unit" value={item.uom} />
        </>)}
        {type === "employee" && (<>
          <Row label="Job title" value={item.job_title} />
          <Row label="Department" value={item.department_name} />
          <Row label="Work email" value={item.work_email} icon="mail" />
          <Row label="Work phone" value={item.work_phone} icon="phone" />
          <Row label="Mobile" value={item.mobile_phone} icon="phone" />
        </>)}
        {type === "invoice" && (<>
          <View style={s.invHead}>
            <StatePill state={item.state} paid={item.payment_state === "paid"} />
            <Text style={s.invTotal}>{money(item.amount_total, currency)}</Text>
          </View>
          <Row label="Reference" value={item.name} />
          <Row label="Booking" value={item.booking_ref} />
          <Row label="Invoice date" value={item.invoice_date} />
          <Row label="Due date" value={item.due_date} />
        </>)}
      </View>

      {type === "invoice" && item.lines?.length > 0 && (
        <View style={[s.card, { padding: 0, overflow: "hidden" }]}>
          <View style={[s.lineRow, s.lineHead]}>
            <Text style={[s.lineCell, { flex: 1 }]}>SERVICE</Text>
            <Text style={s.lineCellQty}>QTY</Text>
            <Text style={[s.lineCell, { width: 90, textAlign: "right" }]}>SUBTOTAL</Text>
          </View>
          {item.lines.map((l) => (
            <View key={l.id} style={s.lineRow}>
              <Text style={[s.lineName, { flex: 1 }]} numberOfLines={1}>{l.product_name || l.description}</Text>
              <Text style={s.lineCellQty}>{l.quantity}</Text>
              <Text style={[s.lineName, { width: 90, textAlign: "right", fontWeight: "700" }]}>{money(l.price_subtotal, currency)}</Text>
            </View>
          ))}
        </View>
      )}

      {type === "invoice" && (
        <View style={[s.card]}>
          <Row label="Untaxed" value={money(item.amount_untaxed, currency)} />
          <Row label="Tax" value={money(item.amount_tax, currency)} />
          <View style={[s.row, { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10 }]}>
            <Text style={[s.rowLabel, { fontSize: 14, color: C.text }]}>Total</Text>
            <Text style={[s.rowValue, { fontSize: 17, fontWeight: "800", color: C.accentDark }]}>{money(item.amount_total, currency)}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const useStyles = makeStyles((C) => ({
  hero: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14 },
  title: { fontSize: 20, fontWeight: "800", color: C.text, letterSpacing: -0.4 },
  sub: { fontSize: 13, color: C.accentDark, fontWeight: "600", marginTop: 3 },
  card: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14, marginBottom: 14 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border, gap: 16 },
  rowLabel: { fontSize: 12.5, color: C.text2, fontWeight: "600" },
  rowValue: { fontSize: 13.5, color: C.text, fontWeight: "600", flexShrink: 1, textAlign: "right" },
  invHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  invTotal: { fontSize: 22, fontWeight: "800", color: C.text, letterSpacing: -0.5 },
  lineRow: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderBottomColor: C.border, gap: 8 },
  lineHead: { backgroundColor: C.surface2 },
  lineCell: { fontSize: 10.5, fontWeight: "800", color: C.text3, letterSpacing: 0.4 },
  lineCellQty: { width: 40, fontSize: 12.5, color: C.text, textAlign: "center" },
  lineName: { fontSize: 12.5, color: C.text },
}));
