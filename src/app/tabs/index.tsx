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
import { useTheme } from "../../context/ThemeContext";
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
  BTN_FOCUS: "⏱️ Odak Modu (Pomodoro) & Sayaç",
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

const CAMPUS_LIFE_DATA = {
  TITLE: "🍽️ Günlük Kampüs Yaşamı & Kütüphane",
  MENU_HEADER: "🍲 Günün Yemekhane Menüsü (4 Kap)",
  MENU_ITEMS: "Mercimek Çorbası • Fırın Tavuk • Şehriyeli Pirinç Pilavı • Meyve / Ayran (780 kcal)",
  LIB_HEADER: "💡 Merkez Kütüphane & Çalışma Salonları",
  LIB_STATUS: "%68 Dolu (2. Kat Sessiz Okuma Salonu Müsait 🟢)",
} as const;

const ROUTES = {
  ADVISORS: "/tabs/advisors",
  DOCUMENTS: "/tabs/documents",
  NOTIFICATIONS: "/tabs/notifications",
  COURSES: "/tabs/courses",
  GRADES: "/tabs/grades",
  PROFILE: "/tabs/profile",
  FOCUS: "/tabs/focus",
} as const;

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
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
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const recentNotifications = notifications.slice(0, 3);

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      data={[{ key: "dashboard" }]}
      renderItem={() => (
        <View>
          {/* Profil Kartı */}
          <View style={[styles.profileCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={styles.profileHeaderRow}>
              <View style={[styles.avatarBox, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>
                  {student?.first_name?.[0]}
                  {student?.last_name?.[0]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {LABELS.WELCOME_PREFIX} {student?.first_name} {student?.last_name}!
                </Text>
                <Text style={[styles.subtitle, { color: colors.subText }]}>{student?.department}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={[styles.infoBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.infoText, { color: colors.text }]}>
                  <Text style={[styles.bold, { color: colors.primary }]}>{LABELS.STUDENT_NO}</Text> {student?.student_no}
                </Text>
              </View>
              <View style={[styles.infoBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.infoText, { color: colors.text }]}>
                  <Text style={[styles.bold, { color: colors.primary }]}>{LABELS.EMAIL}</Text> {student?.email}
                </Text>
              </View>
            </View>
          </View>

          {/* Sınav Geri Sayım Widget'ı */}
          <View style={[styles.countdownCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={styles.countdownHeader}>
              <Text style={styles.countdownIcon}>⏳</Text>
              <Text style={[styles.countdownTitle, { color: colors.text }]}>{LABELS.COUNTDOWN_TITLE}</Text>
            </View>
            <View style={styles.countdownBody}>
              <Text style={[styles.countdownExam, { color: colors.warning }]}>{LABELS.COUNTDOWN_EXAM}</Text>
              <View style={styles.countdownTimerRow}>
                <View style={[styles.timerBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                  <Text style={[styles.timerVal, { color: colors.primary }]}>18</Text>
                  <Text style={[styles.timerLbl, { color: colors.subText }]}>{LABELS.TIMER_HRS}</Text>
                </View>
                <Text style={[styles.timerColon, { color: colors.subText }]}>:</Text>
                <View style={[styles.timerBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                  <Text style={[styles.timerVal, { color: colors.primary }]}>24</Text>
                  <Text style={[styles.timerLbl, { color: colors.subText }]}>{LABELS.TIMER_MIN}</Text>
                </View>
                <Text style={[styles.timerColon, { color: colors.subText }]}>:</Text>
                <View style={[styles.timerBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                  <Text style={[styles.timerVal, { color: colors.primary }]}>45</Text>
                  <Text style={[styles.timerLbl, { color: colors.subText }]}>{LABELS.TIMER_SEC}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Günlük Kampüs Yaşamı Kartı */}
          <View style={[styles.campusLifeCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={styles.campusLifeHeader}>
              <Text style={[styles.campusLifeTitle, { color: colors.text }]}>{CAMPUS_LIFE_DATA.TITLE}</Text>
            </View>
            <View style={styles.campusLifeSection}>
              <Text style={[styles.campusLifeSub, { color: colors.accent }]}>{CAMPUS_LIFE_DATA.MENU_HEADER}</Text>
              <Text style={[styles.campusLifeText, { color: colors.text }]}>{CAMPUS_LIFE_DATA.MENU_ITEMS}</Text>
            </View>
            <View style={[styles.campusLifeDivider, { backgroundColor: colors.cardBorder }]} />
            <View style={styles.campusLifeSection}>
              <Text style={[styles.campusLifeSub, { color: colors.primary }]}>{CAMPUS_LIFE_DATA.LIB_HEADER}</Text>
              <Text style={[styles.campusLifeText, { color: colors.text }]}>{CAMPUS_LIFE_DATA.LIB_STATUS}</Text>
            </View>
          </View>

          {/* Hızlı Erişim & İşlemler Grid */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{LABELS.QUICK_ACCESS}</Text>
          <View style={styles.gridContainer}>
            <TouchableOpacity
              style={[styles.gridCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
              onPress={() => router.push(ROUTES.FOCUS as any)}
              activeOpacity={0.8}
            >
              <Text style={[styles.gridText, { color: colors.text }]}>{LABELS.BTN_FOCUS}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gridCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
              onPress={() => router.push(ROUTES.COURSES as any)}
              activeOpacity={0.8}
            >
              <Text style={[styles.gridText, { color: colors.text }]}>{LABELS.BTN_COURSES}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gridCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
              onPress={() => router.push(ROUTES.GRADES as any)}
              activeOpacity={0.8}
            >
              <Text style={[styles.gridText, { color: colors.text }]}>{LABELS.BTN_GRADES}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gridCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
              onPress={() => router.push(ROUTES.ADVISORS as any)}
              activeOpacity={0.8}
            >
              <Text style={[styles.gridText, { color: colors.text }]}>{LABELS.BTN_ADVISOR}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gridCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
              onPress={() => router.push(ROUTES.DOCUMENTS as any)}
              activeOpacity={0.8}
            >
              <Text style={[styles.gridText, { color: colors.text }]}>{LABELS.BTN_DOCS}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gridCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
              onPress={() => router.push(ROUTES.NOTIFICATIONS as any)}
              activeOpacity={0.8}
            >
              <View style={styles.gridHeader}>
                <Text style={[styles.gridText, { color: colors.text }]}>{LABELS.BTN_NOTIFS}</Text>
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
              style={[styles.gridCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
              onPress={() => router.push(ROUTES.PROFILE as any)}
              activeOpacity={0.8}
            >
              <Text style={[styles.gridText, { color: colors.text }]}>{LABELS.BTN_PROFILE}</Text>
            </TouchableOpacity>
          </View>

          {/* Bildirim Merkezi Widget */}
          <View style={styles.notifSection}>
            <View style={styles.notifHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{LABELS.NOTIF_CENTER_TITLE}</Text>
              <TouchableOpacity onPress={() => router.push(ROUTES.NOTIFICATIONS as any)}>
                <Text style={[styles.viewAllText, { color: colors.primary }]}>{LABELS.VIEW_ALL}</Text>
              </TouchableOpacity>
            </View>

            {recentNotifications.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <Text style={[styles.emptyText, { color: colors.subText }]}>{LABELS.NO_RECENT_NOTIF}</Text>
              </View>
            ) : (
              recentNotifications.map((notif: any) => (
                <View
                  key={notif.id}
                  style={[
                    styles.notifCard,
                    { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                    !notif.is_read && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                  ]}
                >
                  <View style={styles.notifContent}>
                    <Text style={[styles.notifTitle, { color: colors.text }]}>{notif.title}</Text>
                    <Text style={[styles.notifMessage, { color: colors.subText }]} numberOfLines={2}>
                      {notif.message}
                    </Text>
                    <Text style={[styles.notifDate, { color: colors.subText }]}>
                      {new Date(notif.created_at || Date.now()).toLocaleDateString("tr-TR")}
                    </Text>
                  </View>

                  {!notif.is_read && (
                    <TouchableOpacity
                      style={[styles.readButton, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
                      onPress={() => handleMarkRead(notif.id)}
                    >
                      <Text style={[styles.readButtonText, { color: colors.primary }]}>{LABELS.MARK_READ}</Text>
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
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 6,
  },
  profileHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: { color: "#FFF", fontSize: 24, fontWeight: "bold" },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 13 },
  infoRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  infoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    flex: 1,
    minWidth: 140,
  },
  infoText: { fontSize: 12 },
  bold: { fontWeight: "700" },
  countdownCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  countdownHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  countdownIcon: { fontSize: 20 },
  countdownTitle: { fontSize: 15, fontWeight: "800" },
  countdownBody: { alignItems: "center" },
  countdownExam: { fontSize: 13, fontWeight: "700", marginBottom: 14, textAlign: "center" },
  countdownTimerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  timerBox: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 70,
    borderWidth: 1,
  },
  timerVal: { fontSize: 22, fontWeight: "900" },
  timerLbl: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  timerColon: { fontSize: 24, fontWeight: "bold" },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 14 },
  gridContainer: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 },
  gridCard: {
    width: "48%",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    justifyContent: "center",
  },
  gridHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  gridText: { fontSize: 14, fontWeight: "700" },
  badge: { backgroundColor: "#EF4444", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: "#FFF", fontSize: 11, fontWeight: "bold" },
  notifSection: { marginTop: 8 },
  notifHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  viewAllText: { fontSize: 14, fontWeight: "700" },
  notifCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
  },
  notifContent: { flex: 1, marginRight: 12 },
  notifTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  notifMessage: { fontSize: 13, marginBottom: 6 },
  notifDate: { fontSize: 11 },
  readButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  readButtonText: { fontSize: 12, fontWeight: "700" },
  emptyCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
  },
  emptyText: { fontSize: 14 },
  campusLifeCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
  },
  campusLifeHeader: { marginBottom: 12 },
  campusLifeTitle: { fontSize: 15, fontWeight: "800" },
  campusLifeSection: { paddingVertical: 4 },
  campusLifeSub: { fontSize: 13, fontWeight: "700", marginBottom: 4 },
  campusLifeText: { fontSize: 13, lineHeight: 18 },
  campusLifeDivider: { height: 1, marginVertical: 10 },
});
