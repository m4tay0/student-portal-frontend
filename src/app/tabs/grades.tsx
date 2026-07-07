import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { getGrades } from "../../services/api";

const GRADE_POINTS: Record<string, number> = {
  AA: 4.0,
  BA: 3.5,
  BB: 3.0,
  CB: 2.5,
  CC: 2.0,
  DC: 1.5,
  DD: 1.0,
  FF: 0.0,
};

const POSSIBLE_GRADES = ["AA", "BA", "BB", "CB", "CC", "DC", "DD", "FF"] as const;
const DEFAULT_CREDITS = 3;

const STORAGE_KEYS = {
  STUDENT: "student",
} as const;

export default function GradesScreen() {
  const { colors } = useTheme();
  const [grades, setGrades] = useState<any[]>([]);
  const [simulatedGrades, setSimulatedGrades] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [isSimulationMode, setIsSimulationMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.STUDENT).then((data) => {
      if (!data) {
        setLoading(false);
        return;
      }
      const student = JSON.parse(data);
      getGrades(student.id)
        .then((res) => {
          setGrades(res.data);
          const initialSim: Record<number, string> = {};
          res.data.forEach((item: any) => {
            initialSim[item.id] = item.letter_grade || "CC";
          });
          setSimulatedGrades(initialSim);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, []);

  const calculateGPA = (useSimulation = false) => {
    if (grades.length === 0) return "0.00";

    let totalPoints = 0;
    let totalCredits = 0;

    grades.forEach((item) => {
      const credits = item.courses?.credits || DEFAULT_CREDITS;
      const letter = useSimulation ? (simulatedGrades[item.id] || item.letter_grade || "FF") : (item.letter_grade || "FF");
      const points = GRADE_POINTS[letter] ?? 0;
      totalPoints += points * credits;
      totalCredits += credits;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  const handleSimulatedGradeChange = (gradeId: number, newLetter: string) => {
    setSimulatedGrades((prev) => ({
      ...prev,
      [gradeId]: newLetter,
    }));
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const currentGPA = calculateGPA(false);
  const simGPA = calculateGPA(true);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* GPA Özet Kartı */}
      <View style={[styles.gpaCard, { backgroundColor: colors.cardBg, borderColor: colors.primary, borderWidth: 1 }]}>
        <View style={styles.gpaItem}>
          <Text style={[styles.gpaLabel, { color: colors.subText }]}>Mevcut GANO</Text>
          <Text style={[styles.gpaValue, { color: colors.primary }]}>{currentGPA}</Text>
        </View>
        {isSimulationMode && (
          <View style={[styles.gpaItem, styles.simGpaItem, { borderLeftColor: colors.cardBorder }]}>
            <Text style={[styles.simGpaLabel, { color: colors.accent }]}>Simüle Edilen GANO</Text>
            <Text style={[styles.simGpaValue, { color: colors.accent }]}>{simGPA}</Text>
          </View>
        )}
      </View>

      {/* Simülasyon Modu Butonu */}
      <TouchableOpacity
        style={[
          styles.simButton,
          { backgroundColor: colors.primaryLight, borderColor: colors.primary },
          isSimulationMode && { backgroundColor: colors.accentLight, borderColor: colors.accent },
        ]}
        onPress={() => setIsSimulationMode(!isSimulationMode)}
      >
        <Text
          style={[
            styles.simButtonText,
            { color: colors.primary },
            isSimulationMode && { color: colors.accent },
          ]}
        >
          {isSimulationMode ? "⚡ Simülasyon Modunu Kapat" : "🚀 GANO Simülasyonunu Aç (What-If)"}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {isSimulationMode ? "Hedef Notları Seçin" : "Dönem Notları"}
      </Text>

      <FlatList
        data={grades}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const currentLetter = isSimulationMode
            ? simulatedGrades[item.id] || item.letter_grade || "CC"
            : item.letter_grade || "-";

          return (
            <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.cardHeader}>
                <View style={styles.courseInfo}>
                  <Text style={[styles.courseCode, { color: colors.primary }]}>{item.courses?.code || "DERS"}</Text>
                  <Text style={[styles.courseName, { color: colors.text }]}>{item.courses?.name || "Ders Adı"}</Text>
                </View>
                <View style={[styles.gradeBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.gradeText, { color: colors.primary }]}>{currentLetter}</Text>
                </View>
              </View>

              {!isSimulationMode ? (
                <View style={[styles.examRow, { borderTopColor: colors.cardBorder }]}>
                  <Text style={[styles.examText, { color: colors.subText }]}>Vize: <Text style={[styles.examVal, { color: colors.text }]}>{item.midterm ?? "-"}</Text></Text>
                  <Text style={[styles.examText, { color: colors.subText }]}>Final: <Text style={[styles.examVal, { color: colors.text }]}>{item.final ?? "-"}</Text></Text>
                  <Text style={[styles.examText, { color: colors.subText }]}>Kredi: <Text style={[styles.examVal, { color: colors.text }]}>{item.courses?.credits || DEFAULT_CREDITS}</Text></Text>
                </View>
              ) : (
                <View style={[styles.simRow, { borderTopColor: colors.cardBorder }]}>
                  <Text style={[styles.simLabel, { color: colors.subText }]}>Hedef Harf Notu:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gradePicker}>
                    {POSSIBLE_GRADES.map((letter) => (
                      <TouchableOpacity
                        key={letter}
                        style={[
                          styles.gradeOption,
                          { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                          currentLetter === letter && { backgroundColor: colors.accent, borderColor: colors.accent },
                        ]}
                        onPress={() => handleSimulatedGradeChange(item.id, letter)}
                      >
                        <Text
                          style={[
                            styles.gradeOptionText,
                            { color: colors.subText },
                            currentLetter === letter && { color: "#FFFFFF", fontWeight: "800" },
                          ]}
                        >
                          {letter}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  gpaCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 16,
  },
  gpaItem: { alignItems: "center" },
  simGpaItem: {
    borderLeftWidth: 1,
    paddingLeft: 20,
  },
  gpaLabel: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  gpaValue: { fontSize: 32, fontWeight: "800" },
  simGpaLabel: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  simGpaValue: { fontSize: 32, fontWeight: "800" },
  simButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  simButtonText: { fontWeight: "800", fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12 },
  listContainer: { paddingBottom: 20 },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  courseInfo: { flex: 1 },
  courseCode: { fontSize: 12, fontWeight: "800", marginBottom: 2 },
  courseName: { fontSize: 16, fontWeight: "800" },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  gradeText: { fontSize: 16, fontWeight: "800" },
  examRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 12,
  },
  examText: { fontSize: 13 },
  examVal: { fontWeight: "800" },
  simRow: {
    borderTopWidth: 1,
    paddingTop: 12,
  },
  simLabel: { fontSize: 12, fontWeight: "600", marginBottom: 8 },
  gradePicker: { flexDirection: "row" },
  gradeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  gradeOptionText: { fontSize: 13, fontWeight: "600" },
});
