import { useState, useMemo } from "react";
import { Modal, View, Text, TouchableOpacity, FlatList } from "react-native";
import { useC, makeStyles } from "../lib/theme";
import { SearchBar, Empty } from "./ui";
import Icon from "./Icon";

export default function PickerModal({ visible, title, items, searchKeys = ["name"], onClose, onPick, renderRow }) {
  const C = useC();
  const s = useStyles();
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) => searchKeys.some((k) => String(it[k] || "").toLowerCase().includes(s)));
  }, [items, q, searchKeys]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.head}>
            <Text style={s.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={s.close}><Icon name="close" size={18} color={C.text2} /></TouchableOpacity>
          </View>
          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <SearchBar value={q} onChangeText={setQ} placeholder="Search…" />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(it) => String(it.id)}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            ListEmptyComponent={<Empty>Nothing found</Empty>}
            renderItem={({ item }) => {
              const row = renderRow(item);
              return (
                <TouchableOpacity style={[s.row, row.selected && s.rowSel]} activeOpacity={0.7} onPress={() => onPick(item)}>
                  {row.left}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.rowTitle} numberOfLines={1}>{row.title}</Text>
                    {row.sub ? <Text style={s.rowSub} numberOfLines={1}>{row.sub}</Text> : null}
                  </View>
                  {row.right}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((C) => ({
  overlay: { flex: 1, backgroundColor: "rgba(2,6,20,0.55)", justifyContent: "flex-end" },
  sheet: { backgroundColor: C.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "82%", paddingTop: 8 },
  head: { flexDirection: "row", alignItems: "center", padding: 16, paddingBottom: 10 },
  title: { flex: 1, fontSize: 17, fontWeight: "800", color: C.text },
  close: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: C.surface2 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, marginBottom: 7,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  rowSel: { borderColor: C.accent, backgroundColor: "rgba(16,185,129,0.08)" },
  rowTitle: { fontSize: 14, fontWeight: "700", color: C.text },
  rowSub: { fontSize: 12, color: C.text2, marginTop: 1 },
}));
