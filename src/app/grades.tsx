import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { getGrades } from "../services/api";

export default function GradesScreen() {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGrades(1)
      .then((res) => setGrades(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grades</Text>
      <FlatList
        data={grades}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.courseName}>{item.courses?.name}</Text>
            <Text>Midterm: {item.midterm}</Text>
            <Text>Final: {item.final}</Text>
            <Text style={styles.grade}>Grade: {item.letter_grade}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  card: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  courseName: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  grade: { fontSize: 16, fontWeight: "bold", color: "#2196F3", marginTop: 4 },
});
