import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Her açılışta oturumu sıfırla — kullanıcı her zaman login ekranından başlar
    AsyncStorage.multiRemove(["token", "student"]).finally(() => {
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0F172A" }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="tabs" />
      </Stack>
    </ThemeProvider>
  );
}
