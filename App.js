import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { Provider, useDispatch } from "react-redux";
import store from "./src/store/store";
import { booted } from "./src/store/authSlice";
import { initSession } from "./src/lib/api";
import RootNavigator from "./src/navigation/RootNavigator";
import { ThemeProvider, useThemeMode } from "./src/lib/theme";

function Boot() {
  const dispatch = useDispatch();
  const { colors, mode } = useThemeMode();
  useEffect(() => { initSession().then((s) => dispatch(booted(s))); }, [dispatch]);

  const base = mode === "dark" ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: { ...base.colors, background: colors.bg, card: colors.surface, text: colors.text, primary: colors.accent, border: colors.border },
  };
  return (
    <>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <NavigationContainer theme={navTheme}>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <SafeAreaProvider>
          <Boot />
        </SafeAreaProvider>
      </ThemeProvider>
    </Provider>
  );
}
