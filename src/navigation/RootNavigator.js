import { View, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DataProvider } from "../lib/AppData";
import { useC, NAV_COLORS } from "../lib/theme";
import Icon from "../components/Icon";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import CalendarScreen from "../screens/CalendarScreen";
import BookingsScreen from "../screens/BookingsScreen";
import InvoicesScreen from "../screens/InvoicesScreen";
import MoreScreen from "../screens/MoreScreen";
import DirectoryScreen from "../screens/DirectoryScreen";
import DetailScreen from "../screens/DetailScreen";
import BookingFormScreen from "../screens/BookingFormScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TABS = [
  { name: "Home", comp: HomeScreen, icon: "lotus", c: NAV_COLORS.home },
  { name: "Calendar", comp: CalendarScreen, icon: "calendar", c: NAV_COLORS.calendar },
  { name: "Bookings", comp: BookingsScreen, icon: "clock", c: NAV_COLORS.bookings },
  { name: "Invoices", comp: InvoicesScreen, icon: "receipt", c: NAV_COLORS.invoices },
  { name: "More", comp: MoreScreen, icon: "menu", c: "#64748b" },
];

function Tabs() {
  const C = useC();
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: C.surface },
        headerTitleStyle: { fontWeight: "800", color: C.text },
        headerShadowVisible: false,
        tabBarActiveTintColor: C.accentDark,
        tabBarInactiveTintColor: C.text3,
        tabBarStyle: { backgroundColor: C.surface, borderTopColor: C.border, height: 62, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: "700" },
      }}
    >
      {TABS.map((t) => (
        <Tab.Screen key={t.name} name={t.name} component={t.comp}
          options={{
            tabBarIcon: ({ focused, size }) => (
              <Icon name={t.icon === "menu" ? "users" : t.icon} size={size - 2} color={focused ? t.c : C.text3} />
            ),
          }} />
      ))}
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const C = useC();
  const { status, booting } = useSelector((st) => st.auth);

  if (booting) {
    return <View style={{ flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" }}><ActivityIndicator size="large" color={C.accent} /></View>;
  }

  if (!status) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <DataProvider>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: C.surface }, headerTitleStyle: { fontWeight: "800", color: C.text }, headerShadowVisible: false, headerTintColor: C.text }}>
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="Directory" component={DirectoryScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
        <Stack.Screen name="BookingForm" component={BookingFormScreen} options={{ headerShown: false, presentation: "modal" }} />
      </Stack.Navigator>
    </DataProvider>
  );
}
