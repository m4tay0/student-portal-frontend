import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "gray",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: () => <Text>🏠</Text> }}
      />
      <Tabs.Screen
        name="grades"
        options={{ title: "Grades", tabBarIcon: () => <Text>📊</Text> }}
      />
      <Tabs.Screen
        name="courses"
        options={{ title: "Courses", tabBarIcon: () => <Text>📚</Text> }}
      />
      <Tabs.Screen
        name="assignments"
        options={{ title: "Assignments", tabBarIcon: () => <Text>📝</Text> }}
      />
      <Tabs.Screen
        name="announcements"
        options={{ title: "Announcements", tabBarIcon: () => <Text>📢</Text> }}
      />
    </Tabs>
  );
}
