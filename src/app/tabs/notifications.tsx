import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getNotifications, markNotificationRead } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";

const LABELS = {
  TITLE: "Bildirimler & Duyurular",
  MARK_READ: "Okundu İşaretle",
  READ_STATUS: "Okundu",
  NO_NOTIFICATIONS: "Hiç bildiriminiz bulunmuyor.",
  TYPE_GRADE: "grade",
  TYPE_ASSIGNMENT: "assignment",
  TYPE_ADVISOR: "advisor",
} as const;

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await AsyncStorage.getItem("student");
      if (!data) return;
      const student = JSON.parse(data);

      const res = await getNotifications(student.id);
      if (res.data) setNotifications(res.data);
    } catch (e) {
      // Error handled silently per user rules
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
      );
    } catch (e) {
      // Error handled silently per user rules
    }
  };

  const getIconByType = (type: string) => {
    switch (type) {
      case LABELS.TYPE_GRADE:
        return "📊";
      case LABELS.TYPE_ASSIGNMENT:
        return "📝";
      case LABELS.TYPE_ADVISOR:
        return "👨‍🏫";
      default:
        return "📢";
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{LABELS.TITLE}</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.subText }]}>{LABELS.NO_NOTIFICATIONS}</Text>}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
              !item.is_read && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
            ]}
          >
            <View style={styles.iconBox}>
              <Text style={styles.iconText}>{getIconByType(item.type)}</Text>
            </View>
            <View style={styles.contentBox}>
              <Text style={[styles.notifTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.notifMsg, { color: colors.subText }]}>{item.message}</Text>
              <View style={styles.footerRow}>
                <Text style={[styles.dateText, { color: colors.subText }]}>
                  {new Date(item.created_at).toLocaleDateString("tr-TR")}
                </Text>
                {!item.is_read ? (
                  <TouchableOpacity
                    style={[styles.readBtn, { backgroundColor: colors.primary }]}
                    onPress={() => handleMarkAsRead(item.id)}
                  >
                    <Text style={styles.readBtnText}>{LABELS.MARK_READ}</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={[styles.readStatus, { color: colors.subText }]}>{LABELS.READ_STATUS}</Text>
                )}
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 16 },
  card: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  iconBox: {
    marginRight: 14,
    justifyContent: "center",
  },
  iconText: { fontSize: 26 },
  contentBox: { flex: 1 },
  notifTitle: { fontSize: 15, fontWeight: "800", marginBottom: 4 },
  notifMsg: { fontSize: 13, marginBottom: 10, lineHeight: 18 },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateText: { fontSize: 11 },
  readBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  readBtnText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  readStatus: { fontSize: 11, fontStyle: "italic" },
  emptyText: { textAlign: "center", marginTop: 24, fontStyle: "italic", fontSize: 14 },
});
