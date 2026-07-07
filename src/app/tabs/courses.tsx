import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { getCourses } from "../../services/api";

const LABELS = {
  TITLE: "Dersler & Program",
  CREDITS: "Kredi:",
  INSTRUCTOR: "Öğretim Üyesi:",
  SCHEDULE: "🗓️ Gün & Saat:",
  ROOM: "📍 Derslik:",
  NOT_ASSIGNED: "Program henüz atanmadı",
  VIEW_LIST: "📋 Liste Görünümü",
  VIEW_CALENDAR: "🗓️ Haftalık Takvim",
} as const;

const DAYS_OF_WEEK = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"] as const;
type ViewMode = "list" | "calendar";

export default function CoursesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedDay, setSelectedDay] = useState<string>("Pazartesi");

  useEffect(() => {
    getCourses()
      .then((res) => setCourses(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Filter and sort courses for calendar view
  const coursesForDay = courses
    .filter((c) => c.day_of_week === selectedDay)
    .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{LABELS.TITLE}</Text>

      {/* Odak Modu Banner */}
      <TouchableOpacity
        style={[styles.focusBanner, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
        onPress={() => router.push("/tabs/focus" as any)}
        activeOpacity={0.85}
      >
        <Text style={[styles.focusBannerText, { color: colors.primary }]}>
          ⏱️ Odak Modu (Pomodoro) ile Dersi Çalış & Puan Kazan →
        </Text>
      </TouchableOpacity>

      {/* Görünüm Değiştirme Toggle */}
      <View style={[styles.toggleContainer, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder, borderWidth: 1 }]}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === "list" && { backgroundColor: colors.primaryLight }]}
          onPress={() => setViewMode("list")}
        >
          <Text style={[styles.toggleText, { color: colors.subText }, viewMode === "list" && { color: colors.primary, fontWeight: "800" }]}>
            {LABELS.VIEW_LIST}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === "calendar" && { backgroundColor: colors.primaryLight }]}
          onPress={() => setViewMode("calendar")}
        >
          <Text style={[styles.toggleText, { color: colors.subText }, viewMode === "calendar" && { color: colors.primary, fontWeight: "800" }]}>
            {LABELS.VIEW_CALENDAR}
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === "list" ? (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.headerRow}>
                <Text style={[styles.code, { color: colors.primary }]}>{item.code}</Text>
                {item.room ? (
                  <View style={[styles.roomBadge, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.roomText, { color: colors.primary }]}>{item.room}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.info, { color: colors.subText }]}>
                {LABELS.CREDITS} <Text style={{ color: colors.text }}>{item.credits}</Text>
              </Text>
              <Text style={[styles.info, { color: colors.subText }]}>
                {LABELS.INSTRUCTOR} <Text style={{ color: colors.text }}>{item.instructor || "-"}</Text>
              </Text>
              {item.day_of_week && item.start_time ? (
                <View style={[styles.scheduleBox, { borderTopColor: colors.cardBorder }]}>
                  <Text style={[styles.scheduleText, { color: colors.text }]}>
                    {LABELS.SCHEDULE} {item.day_of_week} | {item.start_time} - {item.end_time}
                  </Text>
                  {item.room ? (
                    <Text style={[styles.scheduleText, { color: colors.text }]}>
                      {LABELS.ROOM} {item.room}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <Text style={[styles.missingSchedule, { color: colors.subText }]}>{LABELS.NOT_ASSIGNED}</Text>
              )}
            </View>
          )}
        />
      ) : (
        <View style={styles.calendarContainer}>
          {/* Gün Seçici Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
            {DAYS_OF_WEEK.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayTab,
                  { backgroundColor: colors.cardBg, borderColor: colors.cardBorder, borderWidth: 1 },
                  selectedDay === day && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[styles.dayTabText, { color: colors.subText }, selectedDay === day && { color: "#FFFFFF", fontWeight: "800" }]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Günün Program Çizelgesi */}
          {coursesForDay.length === 0 ? (
            <View style={styles.emptyDayContainer}>
              <Text style={[styles.emptyDayText, { color: colors.subText }]}>🎉 {selectedDay} günü dersiniz bulunmuyor!</Text>
            </View>
          ) : (
            <FlatList
              data={coursesForDay}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.timelineList}
              renderItem={({ item }) => (
                <View style={styles.timelineItem}>
                  <View style={styles.timeColumn}>
                    <Text style={[styles.startTime, { color: colors.primary }]}>{item.start_time}</Text>
                    <Text style={[styles.endTime, { color: colors.subText }]}>{item.end_time}</Text>
                  </View>
                  <View style={[styles.timelineLine, { backgroundColor: colors.primary }]} />
                  <View style={[styles.timelineCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder, borderLeftColor: colors.primary }]}>
                    <View style={styles.headerRow}>
                      <Text style={[styles.code, { color: colors.primary }]}>{item.code}</Text>
                      {item.room ? (
                        <View style={[styles.roomBadge, { backgroundColor: colors.primaryLight }]}>
                          <Text style={[styles.roomText, { color: colors.primary }]}>{item.room}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.info, { color: colors.subText }]}>
                      {LABELS.INSTRUCTOR} <Text style={{ color: colors.text }}>{item.instructor || "-"}</Text>
                    </Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 14 },
  focusBanner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 14,
  },
  focusBannerText: {
    fontSize: 13,
    fontWeight: "800",
  },
  toggleContainer: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  toggleText: { fontSize: 14, fontWeight: "600" },
  listContainer: { paddingBottom: 20 },
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  code: { fontSize: 13, fontWeight: "800" },
  roomBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roomText: { fontSize: 11, fontWeight: "800" },
  name: { fontSize: 16, fontWeight: "800", marginBottom: 8 },
  info: { fontSize: 13, marginBottom: 4 },
  scheduleBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  scheduleText: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  missingSchedule: { fontSize: 12, fontStyle: "italic", marginTop: 6 },
  calendarContainer: { flex: 1 },
  daysScroll: { maxHeight: 50, marginBottom: 12 },
  dayTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  dayTabText: { fontSize: 14, fontWeight: "600" },
  emptyDayContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyDayText: { fontSize: 15, fontWeight: "600" },
  timelineList: { paddingBottom: 20 },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "stretch",
  },
  timeColumn: {
    width: 65,
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 8,
  },
  startTime: { fontSize: 14, fontWeight: "800" },
  endTime: { fontSize: 12, marginTop: 2 },
  timelineLine: {
    width: 3,
    borderRadius: 2,
    marginRight: 12,
  },
  timelineCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
});
