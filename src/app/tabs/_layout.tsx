import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useTheme } from "../../context/ThemeContext";

const TAB_CONFIG = {
  ACTIVE_COLOR: "#3B82F6",
  INACTIVE_COLOR: "#64748B",
  HOME: "Ana Sayfa",
  COURSES: "Akademik",
  ADVISORS: "Danışmanım",
  PROFILE: "Profil & Menü",
} as const;

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: TAB_CONFIG.ACTIVE_COLOR,
        tabBarInactiveTintColor: TAB_CONFIG.INACTIVE_COLOR,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      {/* 1. Ana Sayfa */}
      <Tabs.Screen
        name="index"
        options={{
          title: TAB_CONFIG.HOME,
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />

      {/* 2. Akademik Hub (Dersler & Notlar) */}
      <Tabs.Screen
        name="courses"
        options={{
          title: TAB_CONFIG.COURSES,
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>📚</Text>,
        }}
      />

      {/* 3. Danışmanım */}
      <Tabs.Screen
        name="advisors"
        options={{
          title: TAB_CONFIG.ADVISORS,
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>👨‍🏫</Text>,
        }}
      />

      {/* 4. Profil & Menü */}
      <Tabs.Screen
        name="profile"
        options={{
          title: TAB_CONFIG.PROFILE,
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />

      {/* Gizli Rotalar (Alt barda gözükmez ama sayfalar arası erişilir) */}
      <Tabs.Screen name="grades" options={{ href: null }} />
      <Tabs.Screen name="documents" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="assignments" options={{ href: null }} />
      <Tabs.Screen name="announcements" options={{ href: null }} />
      <Tabs.Screen name="advisor" options={{ href: null }} />
    </Tabs>
  );
}
