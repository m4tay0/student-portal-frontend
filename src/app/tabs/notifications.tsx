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

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{LABELS.TITLE}</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>{LABELS.NO_NOTIFICATIONS}</Text>}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.is_read && styles.unreadCard]}>
            <View style={styles.iconBox}>
              <Text style={styles.iconText}>{getIconByType(item.type)}</Text>
            </View>
            <View style={styles.contentBox}>
              <Text style={styles.notifTitle}>{item.title}</Text>
              <Text style={styles.notifMsg}>{item.message}</Text>
              <View style={styles.footerRow}>
                <Text style={styles.dateText}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
                {!item.is_read ? (
                  <TouchableOpacity
                    style={styles.readBtn}
                    onPress={() => handleMarkAsRead(item.id)}
                  >
                    <Text style={styles.readBtnText}>{LABELS.MARK_READ}</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.readStatus}>{LABELS.READ_STATUS}</Text>
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
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: "#111" },
  card: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  unreadCard: {
    backgroundColor: "#E3F2FD",
    borderColor: "#90CAF9",
  },
  iconBox: {
    marginRight: 12,
    justifyContent: "center",
  },
  iconText: { fontSize: 24 },
  contentBox: { flex: 1 },
  notifTitle: { fontSize: 15, fontWeight: "bold", color: "#212529", marginBottom: 4 },
  notifMsg: { fontSize: 13, color: "#495057", marginBottom: 8 },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateText: { fontSize: 11, color: "#6c757d" },
  readBtn: {
    backgroundColor: "#1976D2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  readBtnText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  readStatus: { fontSize: 11, color: "#6c757d", fontStyle: "italic" },
  emptyText: { textAlign: "center", color: "#6c757d", marginTop: 24, fontStyle: "italic" },
});
