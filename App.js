import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { Provider, useDispatch } from "react-redux";
import store from "./src/store/store";
import { booted } from "./src/store/authSlice";
import { initSession } from "./src/lib/api";
import RootNavigator from "./src/navigation/RootNavigator";
import { C } from "./src/lib/theme";

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: C.bg, card: C.surface, text: C.text, primary: C.accent, border: C.border },
};

function Boot() {
  const dispatch = useDispatch();
  useEffect(() => { initSession().then((s) => dispatch(booted(s))); }, [dispatch]);
  return (
    <NavigationContainer theme={navTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Boot />
      </SafeAreaProvider>
    </Provider>
  );
}
