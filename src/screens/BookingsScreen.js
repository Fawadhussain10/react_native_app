import { useState, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useData } from "../lib/AppData";
import * as api from "../lib/api";
import { C, radius } from "../lib/theme";
import { money, StatePill, SearchBar, Empty } from "../components/ui";
import { fromOdoo, fmtDateShort, fmtTime } from "../lib/datetime";

const FILTERS = [
  { key: "all", label: "All" }, { key: "draft", label: "Draft" },
  { key: "confirmed", label: "Confirmed" }, { key: "done", label: "Done" }, { key: "cancelled", label: "Cancelled" },
];

export default function BookingsScreen({ navigation }) {
  const { notify } = useData();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await api.getAllBookings(); setBookings(res.bookings || []); }
    catch (e) { notify(e.message || "Failed to load", "err"); }
    finally { setLoading(false); }
  }, [notify]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const counts = useMemo(() => {
    const c = { all: bookings.length, draft: 0, confirmed: 0, done: 0, cancelled: 0 };
    bookings.forEach((b) => { c[b.state] = (c[b.state] || 0) + 1; });
    return c;
  }, [bookings]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return bookings
      .filter((b) => filter === "all" || b.state === filter)
      .filter((b) => !s || (b.partner_name || "").toLowerCase().includes(s) ||
        (b.product_name || "").toLowerCase().includes(s) || (b.name || "").toLowerCase().includes(s))
      .sort((a, b) => String(b.start).localeCompare(String(a.start)));
  }, [bookings, q, filter]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ padding: 14, paddingBottom: 6 }}>
        <SearchBar value={q} onChangeText={setQ} placeholder="Search bookings…" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 46 }} contentContainerStyle={{ paddingHorizontal: 14, gap: 8, alignItems: "center" }}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)} style={[s.chip, filter === f.key && s.chipOn]}>
            <Text style={[s.chipT, filter === f.key && s.chipTOn]}>{f.label} · {counts[f.key] ?? 0}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? <View style={s.center}><ActivityIndicator color={C.accent} size="large" /></View> : (
        <FlatList data={list} keyExtractor={(b) => String(b.id)} contentContainerStyle={{ padding: 14, paddingTop: 8 }}
          ListEmptyComponent={<Empty>No bookings found</Empty>}
          renderItem={({ item: b }) => {
            const st = fromOdoo(b.start);
            return (
              <TouchableOpacity activeOpacity={0.85} style={[s.card, b.state === "cancelled" && { opacity: 0.6 }]}
                onPress={() => navigation.navigate("BookingForm", { mode: "edit", booking: b })}>
                <View style={[s.dot, { backgroundColor: b.color || "#6366f1" }]} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.name} numberOfLines={1}>{b.partner_name}</Text>
                  <Text style={s.sub} numberOfLines={1}>{b.name} · {b.product_name}</Text>
                  <Text style={s.when}>{st ? `${fmtDateShort(st)} · ${fmtTime(st)}` : "—"} · {b.employee_name || "Unassigned"}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 6 }}>
                  <Text style={s.amt}>{money(b.amount_total, b.currency_symbol || "$")}</Text>
                  <StatePill state={b.state} />
                </View>
              </TouchableOpacity>
            );
          }} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  chip: { paddingHorizontal: 13, height: 32, borderRadius: radius.pill, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, justifyContent: "center" },
  chipOn: { backgroundColor: C.accent, borderColor: C.accent },
  chipT: { fontSize: 12.5, fontWeight: "700", color: C.text2 },
  chipTOn: { color: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 13, marginBottom: 10 },
  dot: { width: 12, height: 12, borderRadius: 4 },
  name: { fontSize: 14, fontWeight: "700", color: C.text },
  sub: { fontSize: 12, color: C.text2, marginTop: 2 },
  when: { fontSize: 11, color: C.text3, marginTop: 3 },
  amt: { fontSize: 14, fontWeight: "800", color: C.text },
});
