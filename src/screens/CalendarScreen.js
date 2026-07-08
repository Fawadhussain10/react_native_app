import { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useData } from "../lib/AppData";
import * as api from "../lib/api";
import { C, radius, shadow } from "../lib/theme";
import { money, StatePill } from "../components/ui";
import Icon from "../components/Icon";
import {
  startOfDay, endOfDay, addDays, toOdoo, fromOdoo, fmtDate, fmtTime, sameDay,
} from "../lib/datetime";
import { assignColors, readableText } from "../lib/colors";

export default function CalendarScreen({ navigation }) {
  const { notify } = useData();
  const [anchor, setAnchor] = useState(startOfDay(new Date()));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (day) => {
    setLoading(true);
    try {
      const res = await api.getBookings({ start: toOdoo(startOfDay(day)), end: toOdoo(endOfDay(day)) });
      setBookings((res.bookings || []).sort((a, b) => String(a.start).localeCompare(String(b.start))));
    } catch (e) {
      notify(e.message || "Failed to load bookings", "err");
    } finally { setLoading(false); }
  }, [notify]);

  useFocusEffect(useCallback(() => { load(anchor); }, [anchor, load]));

  const colorMap = assignColors(bookings);
  const isToday = sameDay(anchor, new Date());

  const newBooking = () => {
    const now = new Date();
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate(),
      isToday ? now.getHours() : 10, isToday ? Math.round(now.getMinutes() / 15) * 15 : 0);
    navigation.navigate("BookingForm", { mode: "create", draft: { start: start.toISOString() } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[s.header, shadow(4)]}>
        <TouchableOpacity style={s.nav} onPress={() => setAnchor((a) => addDays(a, -1))}><Icon name="chevronLeft" size={20} color={C.text2} /></TouchableOpacity>
        <View style={{ alignItems: "center", flex: 1 }}>
          <Text style={s.date}>{fmtDate(anchor)}</Text>
          {!isToday && <TouchableOpacity onPress={() => setAnchor(startOfDay(new Date()))}><Text style={s.today}>Jump to today</Text></TouchableOpacity>}
        </View>
        <TouchableOpacity style={s.nav} onPress={() => setAnchor((a) => addDays(a, 1))}><Icon name="chevronRight" size={20} color={C.text2} /></TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={C.accent} size="large" /></View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(b) => String(b.id)}
          contentContainerStyle={{ padding: 14, paddingBottom: 90 }}
          ListEmptyComponent={<View style={s.center}><Text style={s.empty}>No bookings this day.{"\n"}Tap + to add one.</Text></View>}
          renderItem={({ item: b }) => {
            const col = (colorMap[b.id] || {}).bg || "#6366f1";
            const fg = readableText(col);
            const s1 = fromOdoo(b.start), s2 = fromOdoo(b.stop);
            return (
              <TouchableOpacity activeOpacity={0.85} style={{ flexDirection: "row", marginBottom: 10 }}
                onPress={() => navigation.navigate("BookingForm", { mode: "edit", booking: b })}>
                <View style={s.timeCol}>
                  <Text style={s.time}>{fmtTime(s1)}</Text>
                  <Text style={s.timeEnd}>{fmtTime(s2)}</Text>
                </View>
                <View style={[s.card, { backgroundColor: col }, shadow(5)]}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[s.cardName, { color: fg }]} numberOfLines={1}>{b.partner_name}</Text>
                    <Text style={[s.cardSub, { color: fg }]} numberOfLines={1}>{b.product_name}</Text>
                    <Text style={[s.cardRef, { color: fg }]}>{b.name} · {b.total_duration || Math.round((s2 - s1) / 60000)} min</Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 6 }}>
                    <Text style={[s.cardAmt, { color: fg }]}>{money(b.amount_total, b.currency_symbol || "$")}</Text>
                    <StatePill state={b.state} fg={fg} />
                    {b.invoice_id ? <Icon name="receipt" size={13} color={fg} /> : null}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <TouchableOpacity activeOpacity={0.9} style={s.fabWrap} onPress={newBooking}>
        <LinearGradient colors={["#34d399", "#059669"]} style={s.fab}><Icon name="plus" size={26} color="#fff" /></LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  nav: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border },
  date: { fontSize: 15, fontWeight: "700", color: C.text },
  today: { fontSize: 11.5, color: C.accentDark, fontWeight: "700", marginTop: 2 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  empty: { color: C.text3, fontSize: 14, textAlign: "center", lineHeight: 22 },
  timeCol: { width: 68, alignItems: "flex-end", paddingRight: 10, paddingTop: 6 },
  time: { fontSize: 12.5, fontWeight: "800", color: C.text },
  timeEnd: { fontSize: 11, color: C.text3, marginTop: 2 },
  card: { flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 13, gap: 10 },
  cardName: { fontSize: 14.5, fontWeight: "800" },
  cardSub: { fontSize: 12, fontWeight: "600", opacity: 0.9, marginTop: 2 },
  cardRef: { fontSize: 10.5, fontWeight: "700", opacity: 0.8, marginTop: 4 },
  cardAmt: { fontSize: 14, fontWeight: "800" },
  fabWrap: { position: "absolute", right: 20, bottom: 24 },
  fab: { width: 58, height: 58, borderRadius: 20, alignItems: "center", justifyContent: "center", ...shadow(10) },
});
