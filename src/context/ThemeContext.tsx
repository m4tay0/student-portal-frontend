import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

export const DARK_COLORS = {
  background: "#0F172A",
  cardBg: "rgba(30, 41, 59, 0.85)",
  cardBorder: "rgba(255, 255, 255, 0.1)",
  text: "#FFFFFF",
  subText: "#94A3B8",
  primary: "#3B82F6",
  primaryLight: "rgba(59, 130, 246, 0.15)",
  accent: "#10B981",
  accentLight: "rgba(16, 185, 129, 0.2)",
  warning: "#F59E0B",
  warningLight: "rgba(245, 158, 11, 0.15)",
  error: "#EF4444",
  errorLight: "rgba(239, 68, 68, 0.15)",
  inputBg: "rgba(15, 23, 42, 0.6)",
  inputBorder: "#334155",
  badgeBg: "rgba(51, 65, 85, 0.8)",
  headerBg: "#0F172A",
  tabBarBg: "#0F172A",
  tabBarBorder: "rgba(255, 255, 255, 0.1)",
};

export const LIGHT_COLORS = {
  background: "#F8FAFC",
  cardBg: "#FFFFFF",
  cardBorder: "#CBD5E1",
  text: "#0F172A",
  subText: "#475569",
  primary: "#2563EB",
  primaryLight: "#EFF6FF",
  accent: "#059669",
  accentLight: "#ECFDF5",
  warning: "#D97706",
  warningLight: "#FFFBEB",
  error: "#DC2626",
  errorLight: "#FEF2F2",
  inputBg: "#FFFFFF",
  inputBorder: "#94A3B8",
  badgeBg: "#E2E8F0",
  headerBg: "#FFFFFF",
  tabBarBg: "#FFFFFF",
  tabBarBorder: "#E2E8F0",
};

type ThemeContextType = {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof DARK_COLORS;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  isDark: true,
  toggleTheme: () => {},
  colors: DARK_COLORS,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    AsyncStorage.getItem("app_theme").then((saved) => {
      if (saved === "light" || saved === "dark") {
        setTheme(saved);
      }
    });
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    AsyncStorage.setItem("app_theme", next);
  };

  const isDark = theme === "dark";
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
