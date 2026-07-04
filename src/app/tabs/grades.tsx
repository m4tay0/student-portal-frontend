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
        .catch((err) => console.error(err))
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

  if (loading) return <ActivityIndicator style={styles.center} size="large" color="#2196F3" />;

  const currentGPA = calculateGPA(false);
  const simGPA = calculateGPA(true);

  return (
    <View style={styles.container}>
      {/* GPA Özet Kartı */}
      <View style={styles.gpaCard}>
        <View style={styles.gpaItem}>
          <Text style={styles.gpaLabel}>Mevcut GANO</Text>
          <Text style={styles.gpaValue}>{currentGPA}</Text>
        </View>
        {isSimulationMode && (
          <View style={[styles.gpaItem, styles.simGpaItem]}>
            <Text style={styles.simGpaLabel}>Simüle Edilen GANO</Text>
            <Text style={styles.simGpaValue}>{simGPA}</Text>
          </View>
        )}
      </View>

      {/* Simülasyon Modu Butonu */}
      <TouchableOpacity
        style={[styles.simButton, isSimulationMode && styles.simButtonActive]}
        onPress={() => setIsSimulationMode(!isSimulationMode)}
      >
        <Text style={[styles.simButtonText, isSimulationMode && styles.simButtonTextActive]}>
          {isSimulationMode ? "⚡ Simülasyon Modunu Kapat" : "🚀 GANO Simülasyonunu Aç (What-If)"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>
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
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseCode}>{item.courses?.code || "DERS"}</Text>
                  <Text style={styles.courseName}>{item.courses?.name || "Ders Adı"}</Text>
                </View>
                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeText}>{currentLetter}</Text>
                </View>
              </View>

              {!isSimulationMode ? (
                <View style={styles.examRow}>
                  <Text style={styles.examText}>Vize: <Text style={styles.examVal}>{item.midterm ?? "-"}</Text></Text>
                  <Text style={styles.examText}>Final: <Text style={styles.examVal}>{item.final ?? "-"}</Text></Text>
                  <Text style={styles.examText}>Kredi: <Text style={styles.examVal}>{item.courses?.credits || DEFAULT_CREDITS}</Text></Text>
                </View>
              ) : (
                <View style={styles.simRow}>
                  <Text style={styles.simLabel}>Hedef Harf Notu:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gradePicker}>
                    {POSSIBLE_GRADES.map((letter) => (
                      <TouchableOpacity
                        key={letter}
                        style={[
                          styles.gradeOption,
                          currentLetter === letter && styles.gradeOptionSelected,
                        ]}
                        onPress={() => handleSimulatedGradeChange(item.id, letter)}
                      >
                        <Text
                          style={[
                            styles.gradeOptionText,
                            currentLetter === letter && styles.gradeOptionTextSelected,
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
  container: { flex: 1, padding: 16, backgroundColor: "#F8F9FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  gpaCard: {
    backgroundColor: "#1A237E",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  gpaItem: { alignItems: "center" },
  simGpaItem: {
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.2)",
    paddingLeft: 20,
  },
  gpaLabel: { fontSize: 13, color: "#C5CAE9", fontWeight: "600", marginBottom: 4 },
  gpaValue: { fontSize: 32, fontWeight: "bold", color: "#FFFFFF" },
  simGpaLabel: { fontSize: 13, color: "#80D8FF", fontWeight: "600", marginBottom: 4 },
  simGpaValue: { fontSize: 32, fontWeight: "bold", color: "#00E5FF" },
  simButton: {
    backgroundColor: "#E3F2FD",
    borderWidth: 1,
    borderColor: "#2196F3",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  simButtonActive: {
    backgroundColor: "#E0F2F1",
    borderColor: "#00897B",
  },
  simButtonText: { color: "#1976D2", fontWeight: "bold", fontSize: 14 },
  simButtonTextActive: { color: "#00897B" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#263238", marginBottom: 12 },
  listContainer: { paddingBottom: 20 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  courseInfo: { flex: 1 },
  courseCode: { fontSize: 12, fontWeight: "bold", color: "#1976D2", marginBottom: 2 },
  courseName: { fontSize: 16, fontWeight: "700", color: "#263238" },
  gradeBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  gradeText: { fontSize: 16, fontWeight: "bold", color: "#1565C0" },
  examRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 12,
  },
  examText: { fontSize: 13, color: "#546E7A" },
  examVal: { fontWeight: "bold", color: "#263238" },
  simRow: {
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 12,
  },
  simLabel: { fontSize: 12, fontWeight: "600", color: "#546E7A", marginBottom: 8 },
  gradePicker: { flexDirection: "row" },
  gradeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#F5F5F5",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  gradeOptionSelected: {
    backgroundColor: "#00897B",
    borderColor: "#00897B",
  },
  gradeOptionText: { fontSize: 13, fontWeight: "600", color: "#455A64" },
  gradeOptionTextSelected: { color: "#FFFFFF" },
});
