import { View, Text, TextInput, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "./Icon";
import { C, radius } from "../lib/theme";
import { avatarHue, initials } from "../lib/colors";

// Hermes-safe currency formatter (no Intl dependency).
export function money(n, c = "$") {
  const v = (Number(n) || 0).toFixed(2);
  const [int, dec] = v.split(".");
  return `${c}${int.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${dec}`;
}

export function Avatar({ name, id = 0, size = 40, color }) {
  const bg = color || avatarHue(id);
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: bg,
      alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: size * 0.34 }}>{initials(name)}</Text>
    </View>
  );
}

export function IconAvatar({ icon, size = 40, colors = ["#34d399", "#059669"] }) {
  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size * 0.3, alignItems: "center", justifyContent: "center" }}>
      <Icon name={icon} size={size * 0.45} color="#fff" />
    </LinearGradient>
  );
}

export function CountBadge({ children }) {
  return (
    <View style={s.countBadge}><Text style={s.countBadgeTxt}>{children}</Text></View>
  );
}

const STATE = {
  paid: { bg: "rgba(16,185,129,0.16)", fg: "#059669", label: "Paid" },
  posted: { bg: "rgba(16,185,129,0.16)", fg: "#059669", label: "Posted" },
  draft: { bg: "rgba(15,23,42,0.07)", fg: C.text2, label: "Draft" },
  confirmed: { bg: "rgba(59,130,246,0.15)", fg: "#2563eb", label: "Confirmed" },
  done: { bg: "rgba(16,185,129,0.16)", fg: "#059669", label: "Done" },
  cancelled: { bg: "rgba(225,29,72,0.12)", fg: C.danger, label: "Cancelled" },
  cancel: { bg: "rgba(225,29,72,0.12)", fg: C.danger, label: "Cancelled" },
};
export function StatePill({ state, paid, label, fg }) {
  const key = (paid && state !== "cancel") ? "paid" : state || "draft";
  const conf = STATE[key] || STATE.draft;
  if (fg) {
    return (
      <View style={[s.pill, { backgroundColor: `${fg}33`, borderColor: `${fg}55`, borderWidth: 1 }]}>
        <Text style={[s.pillTxt, { color: fg }]}>{label || conf.label}</Text>
      </View>
    );
  }
  return (
    <View style={[s.pill, { backgroundColor: conf.bg }]}>
      <Text style={[s.pillTxt, { color: conf.fg }]}>{label || conf.label}</Text>
    </View>
  );
}

export function SearchBar({ value, onChangeText, placeholder }) {
  return (
    <View style={s.search}>
      <Icon name="search" size={17} color={C.text3} />
      <TextInput style={s.searchInput} value={value} onChangeText={onChangeText}
        placeholder={placeholder} placeholderTextColor={C.text3} autoCapitalize="none" />
    </View>
  );
}

export function Empty({ children }) {
  return <Text style={s.empty}>{children}</Text>;
}

const s = StyleSheet.create({
  countBadge: { minWidth: 22, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill,
    backgroundColor: "rgba(15,23,42,0.06)", alignItems: "center", justifyContent: "center" },
  countBadgeTxt: { fontSize: 11, fontWeight: "800", color: C.text2 },
  pill: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.pill, alignSelf: "flex-start" },
  pillTxt: { fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.4 },
  search: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border, borderRadius: radius.md, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, fontSize: 14, color: C.text, padding: 0 },
  empty: { color: C.text3, fontSize: 13, textAlign: "center", paddingVertical: 30 },
});
