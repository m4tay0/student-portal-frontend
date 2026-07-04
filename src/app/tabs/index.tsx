import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
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
  WELCOME_PREFIX: "Hoş Geldiniz,",
  STUDENT_NO: "Öğrenci No:",
  EMAIL: "E-posta:",
  QUICK_ACCESS: "⚡ Hızlı Erişim & İşlemler",
  BTN_ADVISOR: "👨‍🏫 Danışmanım & Randevu",
  BTN_DOCS: "📄 E-İmzalı Belge Talebi",
  BTN_NOTIFS: "🔔 Bildirimler & Duyurular",
  BTN_COURSES: "📚 Dersler & Program",
  BTN_GRADES: "📊 Not Kartı & AGNO Simülasyonu",
  BTN_PROFILE: "👤 Profil, Şifre & Dijital Kimlik",
  UNREAD_SUFFIX: "Yeni",
  NOTIF_CENTER_TITLE: "🔔 Bildirim Merkezi (Son Duyurular)",
  VIEW_ALL: "Tümünü Gör →",
  MARK_READ: "Okundu İşaretle",
  NO_RECENT_NOTIF: "Yeni bildirim bulunmuyor.",
  COUNTDOWN_TITLE: "YAKLAŞAN SINAV & TESLİM TAKVİMİ",
  COUNTDOWN_EXAM: "⚡ Fizik Lab Raporu & Vize Sınavları",
  TIMER_HRS: "Saat",
  TIMER_MIN: "Dakika",
  TIMER_SEC: "Saniye",
} as const;

const ROUTES = {
  ADVISORS: "/tabs/advisors",
  DOCUMENTS: "/tabs/documents",
  NOTIFICATIONS: "/tabs/notifications",
  COURSES: "/tabs/courses",
  GRADES: "/tabs/grades",
  PROFILE: "/tabs/profile",
} as const;

export default function HomeScreen() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await AsyncStorage.getItem("student");
      if (!data) {
        setLoading(false);
        return;
      }
      const parsedStudent = JSON.parse(data);
      setStudent(parsedStudent);

      const notifRes = await getNotifications(parsedStudent.id);
      if (notifRes.data && Array.isArray(notifRes.data)) {
        setNotifications(notifRes.data);
        const count = notifRes.data.filter((n: any) => !n.is_read).length;
        setUnreadCount(count);
      }
    } catch (e) {
      // Error handled silently per user rules
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      // Error handled silently per user rules
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const recentNotifications = notifications.slice(0, 3);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      data={[{ key: "dashboard" }]}
      renderItem={() => (
        <View>
          {/* Profil Kartı */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeaderRow}>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarText}>
                  {student?.first_name?.[0]}
                  {student?.last_name?.[0]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>
                  {LABELS.WELCOME_PREFIX} {student?.first_name} {student?.last_name}!
                </Text>
                <Text style={styles.subtitle}>{student?.department}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoBadge}>
                <Text style={styles.infoText}>
                  <Text style={styles.bold}>{LABELS.STUDENT_NO}</Text> {student?.student_no}
                </Text>
              </View>
              <View style={styles.infoBadge}>
                <Text style={styles.infoText}>
                  <Text style={styles.bold}>{LABELS.EMAIL}</Text> {student?.email}
                </Text>
              </View>
            </View>
          </View>

          {/* Sınav Geri Sayım Widget'ı */}
          <View style={styles.countdownCard}>
            <View style={styles.countdownHeader}>
              <Text style={styles.countdownIcon}>⏳</Text>
              <Text style={styles.countdownTitle}>{LABELS.COUNTDOWN_TITLE}</Text>
            </View>
            <View style={styles.countdownBody}>
              <Text style={styles.countdownExam}>{LABELS.COUNTDOWN_EXAM}</Text>
              <View style={styles.countdownTimerRow}>
                <View style={styles.timerBox}>
                  <Text style={styles.timerVal}>18</Text>
                  <Text style={styles.timerLbl}>{LABELS.TIMER_HRS}</Text>
                </View>
                <Text style={styles.timerColon}>:</Text>
                <View style={styles.timerBox}>
                  <Text style={styles.timerVal}>24</Text>
                  <Text style={styles.timerLbl}>{LABELS.TIMER_MIN}</Text>
                </View>
                <Text style={styles.timerColon}>:</Text>
                <View style={styles.timerBox}>
                  <Text style={styles.timerVal}>45</Text>
                  <Text style={styles.timerLbl}>{LABELS.TIMER_SEC}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Hızlı Erişim & İşlemler Grid */}
          <Text style={styles.sectionTitle}>{LABELS.QUICK_ACCESS}</Text>
          <View style={styles.gridContainer}>
            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => router.push(ROUTES.COURSES as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.gridText}>{LABELS.BTN_COURSES}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => router.push(ROUTES.GRADES as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.gridText}>{LABELS.BTN_GRADES}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => router.push(ROUTES.ADVISORS as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.gridText}>{LABELS.BTN_ADVISOR}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => router.push(ROUTES.DOCUMENTS as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.gridText}>{LABELS.BTN_DOCS}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => router.push(ROUTES.NOTIFICATIONS as any)}
              activeOpacity={0.8}
            >
              <View style={styles.gridHeader}>
                <Text style={styles.gridText}>{LABELS.BTN_NOTIFS}</Text>
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount} {LABELS.UNREAD_SUFFIX}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gridCard, styles.gridCardHighlight]}
              onPress={() => router.push(ROUTES.PROFILE as any)}
              activeOpacity={0.8}
            >
              <Text style={[styles.gridText, styles.gridTextHighlight]}>{LABELS.BTN_PROFILE}</Text>
            </TouchableOpacity>
          </View>

          {/* Bildirim Merkezi Widget */}
          <View style={styles.notifSection}>
            <View style={styles.notifHeader}>
              <Text style={styles.sectionTitle}>{LABELS.NOTIF_CENTER_TITLE}</Text>
              <TouchableOpacity onPress={() => router.push(ROUTES.NOTIFICATIONS as any)}>
                <Text style={styles.viewAllText}>{LABELS.VIEW_ALL}</Text>
              </TouchableOpacity>
            </View>

            {recentNotifications.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>{LABELS.NO_RECENT_NOTIF}</Text>
              </View>
            ) : (
              recentNotifications.map((notif: any) => (
                <View
                  key={notif.id}
                  style={[styles.notifCard, !notif.is_read && styles.unreadCard]}
                >
                  <View style={styles.notifContent}>
                    <Text style={styles.notifTitle}>{notif.title}</Text>
                    <Text style={styles.notifMessage} numberOfLines={2}>
                      {notif.message}
                    </Text>
                    <Text style={styles.notifDate}>
                      {new Date(notif.created_at).toLocaleDateString("tr-TR")}
                    </Text>
                  </View>
                  {!notif.is_read && (
                    <TouchableOpacity
                      style={styles.readButton}
                      onPress={() => handleMarkRead(notif.id)}
                    >
                      <Text style={styles.readButtonText}>{LABELS.MARK_READ}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0F172A" },
  profileCard: {
    backgroundColor: "rgba(30, 41, 59, 0.85)",
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  profileHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  avatarText: { fontSize: 22, fontWeight: "bold", color: "#FFF" },
  title: { fontSize: 20, fontWeight: "800", color: "#FFFFFF", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#94A3B8" },
  infoRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  infoBadge: {
    backgroundColor: "rgba(51, 65, 85, 0.6)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  infoText: { fontSize: 13, color: "#CBD5E1" },
  bold: { fontWeight: "700", color: "#60A5FA" },
  countdownCard: {
    backgroundColor: "rgba(30, 41, 59, 0.95)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.4)",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  countdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  countdownIcon: { fontSize: 20 },
  countdownTitle: { color: "#FBBF24", fontSize: 13, fontWeight: "800", letterSpacing: 0.5 },
  countdownBody: { alignItems: "center" },
  countdownExam: { color: "#FFF", fontSize: 16, fontWeight: "700", marginBottom: 14 },
  countdownTimerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  timerBox: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 70,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  timerVal: { color: "#38BDF8", fontSize: 22, fontWeight: "900" },
  timerLbl: { color: "#94A3B8", fontSize: 11, fontWeight: "600", marginTop: 2 },
  timerColon: { color: "#64748B", fontSize: 24, fontWeight: "bold" },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#FFFFFF", marginBottom: 14 },
  gridContainer: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 },
  gridCard: {
    width: "48%",
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
  },
  gridCardHighlight: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderColor: "#3B82F6",
  },
  gridHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  gridText: { fontSize: 14, fontWeight: "700", color: "#E2E8F0" },
  gridTextHighlight: { color: "#60A5FA" },
  badge: { backgroundColor: "#EF4444", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: "#FFF", fontSize: 11, fontWeight: "bold" },
  notifSection: { marginTop: 8 },
  notifHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  viewAllText: { color: "#3B82F6", fontSize: 14, fontWeight: "700" },
  notifCard: {
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  unreadCard: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  notifContent: { flex: 1, marginRight: 12 },
  notifTitle: { fontSize: 15, fontWeight: "700", color: "#FFF", marginBottom: 4 },
  notifMessage: { fontSize: 13, color: "#94A3B8", marginBottom: 6 },
  notifDate: { fontSize: 11, color: "#64748B" },
  readButton: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  readButtonText: { color: "#60A5FA", fontSize: 12, fontWeight: "700" },
  emptyCard: {
    backgroundColor: "rgba(30, 41, 59, 0.4)",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  emptyText: { color: "#64748B", fontSize: 14 },
});
