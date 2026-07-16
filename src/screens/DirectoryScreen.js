import { useState, useMemo, useLayoutEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useData } from "../lib/AppData";
import { useC, makeStyles, radius } from "../lib/theme";
import { money, Avatar, IconAvatar, SearchBar, Empty } from "../components/ui";
import Icon from "../components/Icon";

const CONF = {
  contacts: { title: "Contacts", keys: ["name", "email", "phone", "company_name"], pick: (d) => d.customers },
  products: { title: "Products", keys: ["name", "default_code", "category_name"], pick: (d) => d.products },
  employees: { title: "Employees", keys: ["name", "job_title", "department_name", "work_email"], pick: (d) => d.employees },
};

export default function DirectoryScreen({ route, navigation }) {
  const C = useC();
  const s = useStyles();
  const type = route.params?.type || "contacts";
  const conf = CONF[type];
  const data = useData();
  const items = conf.pick(data) || [];
  const [q, setQ] = useState("");

  useLayoutEffect(() => { navigation.setOptions({ title: conf.title }); }, [navigation, conf.title]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) => conf.keys.some((k) => String(it[k] || "").toLowerCase().includes(s)));
  }, [items, q, conf.keys]);

  const renderItem = ({ item: it }) => {
    let left, title, sub, right;
    if (type === "products") {
      left = <IconAvatar icon="box" size={44} colors={["#fb923c", "#ea580c"]} />;
      title = it.name; sub = `${it.duration || 30} min · ${it.category_name || "Service"}`;
      right = <Text style={[s.right, { color: C.accentDark }]}>{money(it.list_price, data.currency)}</Text>;
    } else {
      left = <Avatar name={it.name} id={it.id} size={44} />;
      title = it.name;
      sub = type === "employees" ? (it.job_title || it.department_name || "Staff") : (it.email || it.phone || it.address || "—");
    }
    return (
      <TouchableOpacity activeOpacity={0.85} style={s.card} onPress={() => navigation.navigate("Detail", { type: type.slice(0, -1), item: it })}>
        {left}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.title} numberOfLines={1}>{title}</Text>
          <Text style={s.sub} numberOfLines={1}>{sub}</Text>
        </View>
        {right || <Icon name="chevronRight" size={18} color={C.text3} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ padding: 14, paddingBottom: 6 }}>
        <SearchBar value={q} onChangeText={setQ} placeholder={`Search ${conf.title.toLowerCase()}…`} />
        <Text style={s.count}>{items.length} total</Text>
      </View>
      <FlatList data={list} keyExtractor={(it) => String(it.id)} contentContainerStyle={{ padding: 14, paddingTop: 4 }}
        ListEmptyComponent={<Empty>Nothing found</Empty>} renderItem={renderItem} />
    </View>
  );
}

const useStyles = makeStyles((C) => ({
  count: { fontSize: 12, color: C.text3, marginTop: 8, marginLeft: 2 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 12, marginBottom: 9 },
  title: { fontSize: 14.5, fontWeight: "700", color: C.text },
  sub: { fontSize: 12, color: C.text2, marginTop: 2 },
  right: { fontSize: 14, fontWeight: "800" },
}));
