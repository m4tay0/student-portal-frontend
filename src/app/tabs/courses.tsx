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
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedDay, setSelectedDay] = useState<string>("Pazartesi");

  useEffect(() => {
    getCourses()
      .then((res) => setCourses(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={styles.center} size="large" color="#2196F3" />;

  // Filter and sort courses for calendar view
  const coursesForDay = courses
    .filter((c) => c.day_of_week === selectedDay)
    .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{LABELS.TITLE}</Text>

      {/* Görünüm Değiştirme Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === "list" && styles.toggleButtonActive]}
          onPress={() => setViewMode("list")}
        >
          <Text style={[styles.toggleText, viewMode === "list" && styles.toggleTextActive]}>
            {LABELS.VIEW_LIST}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === "calendar" && styles.toggleButtonActive]}
          onPress={() => setViewMode("calendar")}
        >
          <Text style={[styles.toggleText, viewMode === "calendar" && styles.toggleTextActive]}>
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
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.code}>{item.code}</Text>
                {item.room ? (
                  <View style={styles.roomBadge}>
                    <Text style={styles.roomText}>{item.room}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.info}>
                {LABELS.CREDITS} {item.credits}
              </Text>
              <Text style={styles.info}>
                {LABELS.INSTRUCTOR} {item.instructor || "-"}
              </Text>
              {item.day_of_week && item.start_time ? (
                <View style={styles.scheduleBox}>
                  <Text style={styles.scheduleText}>
                    {LABELS.SCHEDULE} {item.day_of_week} | {item.start_time} - {item.end_time}
                  </Text>
                  {item.room ? (
                    <Text style={styles.scheduleText}>
                      {LABELS.ROOM} {item.room}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <Text style={styles.missingSchedule}>{LABELS.NOT_ASSIGNED}</Text>
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
                style={[styles.dayTab, selectedDay === day && styles.dayTabActive]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[styles.dayTabText, selectedDay === day && styles.dayTabTextActive]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Günün Program Çizelgesi */}
          {coursesForDay.length === 0 ? (
            <View style={styles.emptyDayContainer}>
              <Text style={styles.emptyDayText}>🎉 {selectedDay} günü dersiniz bulunmuyor!</Text>
            </View>
          ) : (
            <FlatList
              data={coursesForDay}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.timelineList}
              renderItem={({ item }) => (
                <View style={styles.timelineItem}>
                  <View style={styles.timeColumn}>
                    <Text style={styles.startTime}>{item.start_time}</Text>
                    <Text style={styles.endTime}>{item.end_time}</Text>
                  </View>
                  <View style={styles.timelineLine} />
                  <View style={styles.timelineCard}>
                    <View style={styles.headerRow}>
                      <Text style={styles.code}>{item.code}</Text>
                      {item.room ? (
                        <View style={styles.roomBadge}>
                          <Text style={styles.roomText}>{item.room}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.info}>
                      {LABELS.INSTRUCTOR} {item.instructor || "-"}
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
  container: { flex: 1, padding: 16, backgroundColor: "#F8F9FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: "#111" },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#E9ECEF",
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  toggleText: { fontSize: 14, fontWeight: "600", color: "#6C757D" },
  toggleTextActive: { color: "#1976D2", fontWeight: "bold" },
  listContainer: { paddingBottom: 20 },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  code: { fontSize: 13, color: "#2196F3", fontWeight: "bold" },
  roomBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roomText: { fontSize: 11, color: "#1976D2", fontWeight: "700" },
  name: { fontSize: 16, fontWeight: "bold", marginBottom: 8, color: "#212529" },
  info: { fontSize: 13, color: "#495057", marginBottom: 4 },
  scheduleBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  scheduleText: { fontSize: 13, color: "#2b3035", fontWeight: "500", marginTop: 2 },
  missingSchedule: { fontSize: 12, color: "#6c757d", fontStyle: "italic", marginTop: 6 },
  calendarContainer: { flex: 1 },
  daysScroll: { maxHeight: 50, marginBottom: 12 },
  dayTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#E9ECEF",
    marginRight: 8,
  },
  dayTabActive: {
    backgroundColor: "#1976D2",
  },
  dayTabText: { fontSize: 14, fontWeight: "600", color: "#495057" },
  dayTabTextActive: { color: "#FFFFFF", fontWeight: "bold" },
  emptyDayContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyDayText: { fontSize: 16, fontWeight: "600", color: "#6C757D" },
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
  startTime: { fontSize: 14, fontWeight: "bold", color: "#1976D2" },
  endTime: { fontSize: 12, color: "#6C757D", marginTop: 2 },
  timelineLine: {
    width: 3,
    backgroundColor: "#90CAF9",
    borderRadius: 2,
    marginRight: 12,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#1976D2",
  },
});
