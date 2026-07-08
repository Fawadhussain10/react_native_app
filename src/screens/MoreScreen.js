import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useData } from "../lib/AppData";
import { C, radius, shadow } from "../lib/theme";
import { Avatar } from "../components/ui";
import Icon from "../components/Icon";
import { NAV_COLORS } from "../lib/theme";

const MENU = [
  { label: "Contacts", type: "contacts", icon: "user", c: NAV_COLORS.contacts },
  { label: "Products", type: "products", icon: "box", c: NAV_COLORS.products },
  { label: "Employees", type: "employees", icon: "users", c: NAV_COLORS.employees },
];

export default function MoreScreen({ navigation }) {
  const { session, company, doLogout } = useData();
  const confirmLogout = () => {
    Alert.alert("Log out", "Sign out of this account?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: doLogout },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      <View style={[s.user, shadow(4)]}>
        <Avatar name={session?.name} id={2} size={52} color={C.violet} />
        <View style={{ flex: 1 }}>
          <Text style={s.userName}>{session?.name}</Text>
          <Text style={s.userSub}>{session?.login} · {session?.db}</Text>
        </View>
      </View>

      <View style={{ gap: 10, marginTop: 6 }}>
        {MENU.map((m) => (
          <TouchableOpacity key={m.type} style={[s.item, shadow(3)]} activeOpacity={0.85}
            onPress={() => navigation.navigate("Directory", { type: m.type })}>
            <View style={[s.itemIcon, { backgroundColor: `${m.c}22` }]}><Icon name={m.icon} size={20} color={m.c} /></View>
            <Text style={s.itemLabel}>{m.label}</Text>
            <Icon name="chevronRight" size={18} color={C.text3} />
          </TouchableOpacity>
        ))}
      </View>

      {company && (
        <View style={[s.card, shadow(3)]}>
          <Text style={s.cardHead}>Company</Text>
          <Text style={s.compName}>{company.name}</Text>
          {company.address ? <Text style={s.compRow}><Icon name="calendar" size={12} color={C.text3} />  {company.address}</Text> : null}
          {company.phone ? <Text style={s.compRow}><Icon name="phone" size={12} color={C.text3} />  {company.phone}</Text> : null}
          {company.email ? <Text style={s.compRow}><Icon name="mail" size={12} color={C.text3} />  {company.email}</Text> : null}
        </View>
      )}

      <TouchableOpacity style={s.logout} onPress={confirmLogout}>
        <Icon name="logout" size={18} color={C.danger} /><Text style={s.logoutT}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  user: { flexDirection: "row", alignItems: "center", gap: 13, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 16, marginBottom: 12 },
  userName: { fontSize: 16, fontWeight: "800", color: C.text },
  userSub: { fontSize: 12.5, color: C.text2, marginTop: 2 },
  item: { flexDirection: "row", alignItems: "center", gap: 13, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14 },
  itemIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  itemLabel: { flex: 1, fontSize: 15, fontWeight: "700", color: C.text },
  card: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 16, marginTop: 16 },
  cardHead: { fontSize: 11, fontWeight: "800", color: C.text3, textTransform: "uppercase", letterSpacing: 0.5 },
  compName: { fontSize: 16, fontWeight: "800", color: C.text, marginTop: 6 },
  compRow: { fontSize: 12.5, color: C.text2, marginTop: 6 },
  logout: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20, height: 50, borderRadius: 14, backgroundColor: "rgba(225,29,72,0.08)", borderWidth: 1, borderColor: "rgba(225,29,72,0.25)" },
  logoutT: { color: C.danger, fontWeight: "800", fontSize: 15 },
});
