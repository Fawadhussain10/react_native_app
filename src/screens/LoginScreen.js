import { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch } from "react-redux";
import * as api from "../lib/api";
import { login as loginAction } from "../store/authSlice";
import { useC, makeStyles, radius, shadow } from "../lib/theme";
import Icon from "../components/Icon";

export default function LoginScreen() {
  const C = useC();
  const s = useStyles();
  const dispatch = useDispatch();
  const [server, setServer] = useState("");
  const [db, setDb] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getLastLogin().then((l) => { if (l) { setServer(l.server || ""); setDb(l.db || ""); } });
  }, []);

  const onServer = (v) => {
    setServer(v);
    // auto-fill db from a plain company code
    if (v && !/[:/.]/.test(v)) setDb(v);
    if (error) setError(null);
  };

  const submit = async () => {
    setError(null);
    if (!server.trim() || !db.trim() || !username.trim() || !password) {
      setError({ msg: "Please fill in all fields." });
      return;
    }
    setLoading(true);
    try {
      const sess = await api.login(server, db, username, password);
      dispatch(loginAction(sess));
    } catch (e) {
      const portal = e.status === 403 || /portal/i.test(e.message || "");
      setError({ msg: e.message || "Login failed.", portal });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0b3b57", "#0d9488", "#4338ca"]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={[s.card, shadow(20)]}>
            <LinearGradient colors={["#34d399", "#059669"]} style={s.logo}>
              <Icon name="lotus" size={34} color="#fff" />
            </LinearGradient>
            <Text style={s.title}>Welcome back</Text>
            <Text style={s.sub}>Sign in to your booking console</Text>

            <Field label="Company code / server" icon="calendar" value={server} onChangeText={onServer}
              placeholder="e.g. test  (or 192.168.1.9:8069)" autoCapitalize="none" />
            <Field label="Database" icon="box" value={db} onChangeText={setDb}
              placeholder="database name" autoCapitalize="none" />
            <Field label="Email or username" icon="user" value={username} onChangeText={setUsername}
              placeholder="admin" autoCapitalize="none" />
            <Field label="Password" icon="lock" value={password} onChangeText={setPassword}
              placeholder="••••••••" secureTextEntry />

            {error?.portal ? (
              <View style={s.portal}>
                <Icon name="lock" size={18} color="#7c3aed" />
                <View style={{ flex: 1 }}>
                  <Text style={s.portalT}>Staff access only</Text>
                  <Text style={s.portalS}>{error.msg}</Text>
                </View>
              </View>
            ) : error ? (
              <View style={s.err}><Icon name="alert" size={15} color="#e11d48" /><Text style={s.errT}>{error.msg}</Text></View>
            ) : null}

            <TouchableOpacity activeOpacity={0.85} onPress={submit} disabled={loading}>
              <LinearGradient colors={["#34d399", "#10b981", "#059669"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.btn}>
                {loading ? <ActivityIndicator color="#fff" />
                  : <><Text style={s.btnT}>Sign in</Text><Icon name="arrow" size={18} color="#fff" /></>}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => Linking.openURL("https://asrbpo.com/")} style={{ marginTop: 16 }}>
              <Text style={s.powered}>Powered by <Text style={s.poweredB}>ASRBPO</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function Field({ label, icon, ...props }) {
  const C = useC();
  const s = useStyles();
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={s.label}>{label}</Text>
      <View style={s.field}>
        <Icon name={icon} size={17} color={C.text3} />
        <TextInput style={s.input} placeholderTextColor={C.text3} {...props} />
      </View>
    </View>
  );
}

const useStyles = makeStyles((C) => ({
  scroll: { flexGrow: 1, justifyContent: "center", padding: 22 },
  card: { backgroundColor: C.surface, borderRadius: 26, padding: 26, alignItems: "stretch" },
  logo: { width: 62, height: 62, borderRadius: 20, alignSelf: "center", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  title: { fontSize: 24, fontWeight: "800", color: C.text, textAlign: "center", letterSpacing: -0.5 },
  sub: { fontSize: 13.5, color: C.text2, textAlign: "center", marginTop: 6, marginBottom: 8 },
  label: { fontSize: 11.5, fontWeight: "700", color: C.text2, marginBottom: 6, letterSpacing: 0.2 },
  field: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.surface2,
    borderWidth: 1.5, borderColor: C.border, borderRadius: 14, paddingHorizontal: 14, height: 52 },
  input: { flex: 1, fontSize: 15, color: C.text, padding: 0 },
  btn: { height: 52, borderRadius: 14, marginTop: 20, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  btnT: { color: "#fff", fontSize: 15.5, fontWeight: "700" },
  err: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14, backgroundColor: "rgba(244,63,94,0.1)",
    borderWidth: 1, borderColor: "rgba(244,63,94,0.28)", borderRadius: 12, padding: 11 },
  errT: { color: C.danger, fontSize: 13, fontWeight: "600", flex: 1 },
  portal: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 14, padding: 13, borderRadius: 14,
    backgroundColor: "rgba(124,58,237,0.12)", borderWidth: 1, borderColor: "rgba(124,58,237,0.28)" },
  portalT: { fontSize: 13, fontWeight: "800", color: C.violet },
  portalS: { fontSize: 12, color: C.violetLight, marginTop: 2 },
  powered: { textAlign: "center", fontSize: 12, color: C.text3, fontWeight: "600" },
  poweredB: { fontWeight: "800", color: C.accentDark },
}));
