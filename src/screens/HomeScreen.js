import { ScrollView, View, Text, StyleSheet, RefreshControl, TouchableOpacity } from "react-native";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useData } from "../lib/AppData";
import { C, radius, shadow } from "../lib/theme";
import { money, Avatar, IconAvatar, CountBadge } from "../components/ui";
import Icon from "../components/Icon";

function Kpi({ icon, label, value, badge, colors, onPress }) {
  return (
    <TouchableOpacity style={[s.kpi, shadow(4)]} activeOpacity={0.85} onPress={onPress}>
      <IconAvatar icon={icon} size={42} colors={colors} />
      <View style={{ flex: 1 }}>
        <Text style={s.kpiVal} numberOfLines={1}>{value}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 }}>
          <Text style={s.kpiLbl}>{label}</Text>
          {badge != null && <CountBadge>{badge}</CountBadge>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function Section({ title, icon, children }) {
  return (
    <View style={[s.section, shadow(3)]}>
      <View style={s.sectionHead}>
        <Icon name={icon} size={15} color={C.text2} />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      <View style={{ padding: 6 }}>{children}</View>
    </View>
  );
}

function Row({ avatar, title, sub, right }) {
  return (
    <View style={s.row}>
      {avatar}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.rowTitle} numberOfLines={1}>{title}</Text>
        {sub ? <Text style={s.rowSub} numberOfLines={1}>{sub}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { company, customers, products, employees, today, summary, currency, refreshAll, session } = useData();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => { setRefreshing(true); await refreshAll(); setRefreshing(false); };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const first = (session?.name || "there").split(" ")[0];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}>

      <LinearGradient colors={["#ecfdf5", "#eef2ff"]} style={[s.hero, shadow(6)]}>
        <Text style={s.hello}>{greeting}, {first} 👋</Text>
        <Text style={s.heroSub}>Here's what's happening at <Text style={{ fontWeight: "800" }}>{company?.name || "your spa"}</Text> today.</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Calendar")} style={{ marginTop: 12 }}>
          <LinearGradient colors={["#34d399", "#059669"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.heroBtn}>
            <Icon name="calendar" size={16} color="#fff" /><Text style={s.heroBtnT}>Open calendar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <View style={s.kpis}>
        <Kpi icon="clock" label="Invoices today" value={String(summary?.today_count ?? 0)} colors={["#34d399", "#059669"]} onPress={() => navigation.navigate("Invoices")} />
        <Kpi icon="receipt" label="Draft" badge={summary?.draft_count ?? 0} value={money(summary?.draft_total, currency)} colors={["#94a3b8", "#475569"]} onPress={() => navigation.navigate("Invoices")} />
        <Kpi icon="dollar" label="Posted" badge={summary?.posted_count ?? 0} value={money(summary?.posted_total, currency)} colors={["#a78bfa", "#7c3aed"]} onPress={() => navigation.navigate("Invoices")} />
        <Kpi icon="dollar" label="Total invoiced" value={money(summary?.total_invoiced, currency)} colors={["#fbbf24", "#d97706"]} onPress={() => navigation.navigate("Invoices")} />
        <Kpi icon="user" label="Contacts" value={String(customers.length)} colors={["#f472b6", "#db2777"]} onPress={() => navigation.navigate("More", { screen: "Contacts" })} />
        <Kpi icon="users" label="Employees" value={String(employees.length)} colors={["#38bdf8", "#0284c7"]} onPress={() => navigation.navigate("More", { screen: "Employees" })} />
      </View>

      <Section title="Today's invoices" icon="receipt">
        {(today?.invoices || []).length === 0 && <Text style={s.empty}>No invoices billed today yet</Text>}
        {(today?.invoices || []).slice(0, 6).map((inv) => (
          <Row key={inv.id} avatar={<IconAvatar icon="receipt" size={32} />}
            title={inv.partner_name} sub={inv.booking_ref || inv.name || "Draft"}
            right={<Text style={s.rowMeta}>{money(inv.amount_total, currency)}</Text>} />
        ))}
      </Section>

      <Section title="Recent contacts" icon="user">
        {customers.slice(0, 6).map((c) => (
          <Row key={c.id} avatar={<Avatar name={c.name} id={c.id} size={32} />} title={c.name} sub={c.email || c.phone || "—"} />
        ))}
      </Section>

      <Section title="Popular services" icon="box">
        {products.slice(0, 6).map((p) => (
          <Row key={p.id} avatar={<IconAvatar icon="box" size={32} colors={["#fb923c", "#ea580c"]} />}
            title={p.name} sub={`${p.duration || 30} min`}
            right={<Text style={[s.rowMeta, { color: C.accentDark }]}>{money(p.list_price, currency)}</Text>} />
        ))}
      </Section>

      <Section title="Team" icon="users">
        {employees.slice(0, 6).map((e) => (
          <Row key={e.id} avatar={<Avatar name={e.name} id={e.id} size={32} />} title={e.name} sub={e.job_title || e.department_name || "Staff"} />
        ))}
      </Section>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  hero: { borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border, marginBottom: 16 },
  hello: { fontSize: 22, fontWeight: "800", color: C.text, letterSpacing: -0.5 },
  heroSub: { fontSize: 13.5, color: C.text2, marginTop: 5 },
  heroBtn: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  heroBtnT: { color: "#fff", fontWeight: "700", fontSize: 13.5 },
  kpis: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 6 },
  kpi: { width: "48%", flexGrow: 1, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14 },
  kpiVal: { fontSize: 19, fontWeight: "800", color: C.text, letterSpacing: -0.4 },
  kpiLbl: { fontSize: 12, color: C.text2, fontWeight: "600" },
  section: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 18, marginTop: 14, overflow: "hidden" },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: C.text },
  row: { flexDirection: "row", alignItems: "center", gap: 11, padding: 9, borderRadius: 12 },
  rowTitle: { fontSize: 13, fontWeight: "600", color: C.text },
  rowSub: { fontSize: 11.5, color: C.text2, marginTop: 1 },
  rowMeta: { fontSize: 13, fontWeight: "800", color: C.text },
  empty: { color: C.text3, fontSize: 12.5, textAlign: "center", padding: 18 },
});
