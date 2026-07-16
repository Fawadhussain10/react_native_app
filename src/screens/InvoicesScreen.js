import { useState, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { useData } from "../lib/AppData";
import { useC, makeStyles, radius } from "../lib/theme";
import { money, IconAvatar, StatePill, SearchBar, Empty, CountBadge } from "../components/ui";

const FILTERS = [
  { key: "all", label: "All" }, { key: "draft", label: "Draft" },
  { key: "posted", label: "Posted" }, { key: "paid", label: "Paid" },
];

export default function InvoicesScreen({ navigation }) {
  const C = useC();
  const s = useStyles();
  const { invoices, summary, currency } = useData();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return invoices
      .filter((i) => filter === "all" ? true : filter === "paid" ? i.payment_state === "paid" : i.state === filter)
      .filter((i) => !s || (i.name || "").toLowerCase().includes(s) || (i.partner_name || "").toLowerCase().includes(s));
  }, [invoices, q, filter]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ padding: 14, paddingBottom: 6 }}>
        <View style={s.tiles}>
          <Tile label="Draft" value={money(summary?.draft_total, currency)} badge={summary?.draft_count} />
          <Tile label="Posted" value={money(summary?.posted_total, currency)} badge={summary?.posted_count} color={C.violet} />
          <Tile label="Total" value={money(summary?.total_invoiced, currency)} badge={summary?.total_count} color={C.accentDark} hero />
        </View>
        <SearchBar value={q} onChangeText={setQ} placeholder="Search invoices…" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 46 }} contentContainerStyle={{ paddingHorizontal: 14, gap: 8, alignItems: "center" }}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)} style={[s.chip, filter === f.key && s.chipOn]}>
            <Text style={[s.chipT, filter === f.key && s.chipTOn]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList data={list} keyExtractor={(i) => String(i.id)} contentContainerStyle={{ padding: 14, paddingTop: 8 }}
        ListEmptyComponent={<Empty>No invoices found</Empty>}
        renderItem={({ item: inv }) => (
          <TouchableOpacity activeOpacity={0.85} style={s.card} onPress={() => navigation.navigate("Detail", { type: "invoice", item: inv })}>
            <IconAvatar icon="dollar" size={40} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={s.name} numberOfLines={1}>{inv.partner_name}</Text>
              <Text style={s.sub} numberOfLines={1}>{inv.booking_ref || inv.name || "Draft"} · {inv.invoice_date || "—"}</Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 6 }}>
              <Text style={s.amt}>{money(inv.amount_total, currency)}</Text>
              <StatePill state={inv.state} paid={inv.payment_state === "paid"} />
            </View>
          </TouchableOpacity>
        )} />
    </View>
  );
}

function Tile({ label, value, badge, color, hero }) {
  const s = useStyles();
  return (
    <View style={[s.tile, hero && s.tileHero]}>
      <Text style={s.tileLabel}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 }}>
        <Text style={[s.tileVal, color && { color }]} numberOfLines={1}>{value}</Text>
      </View>
      {badge != null && <View style={{ position: "absolute", top: 8, right: 8 }}><CountBadge>{badge}</CountBadge></View>}
    </View>
  );
}

const useStyles = makeStyles((C) => ({
  tiles: { flexDirection: "row", gap: 8, marginBottom: 10 },
  tile: { flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 11, minHeight: 62 },
  tileHero: { backgroundColor: "rgba(16,185,129,0.10)", borderColor: "rgba(16,185,129,0.28)" },
  tileLabel: { fontSize: 10.5, color: C.text2, fontWeight: "700" },
  tileVal: { fontSize: 15, fontWeight: "800", color: C.text, letterSpacing: -0.3 },
  chip: { paddingHorizontal: 14, height: 32, borderRadius: radius.pill, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, justifyContent: "center" },
  chipOn: { backgroundColor: C.accent, borderColor: C.accent },
  chipT: { fontSize: 12.5, fontWeight: "700", color: C.text2 },
  chipTOn: { color: "#fff" },
  card: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 12, marginBottom: 9 },
  name: { fontSize: 14, fontWeight: "700", color: C.text },
  sub: { fontSize: 12, color: C.text2, marginTop: 2 },
  amt: { fontSize: 14, fontWeight: "800", color: C.text },
}));
