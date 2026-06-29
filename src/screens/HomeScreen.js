import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { getStudents } from "../services/api";

export default function HomeScreen() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudents()
      .then((res) => setStudent(res.data[0]))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {student?.first_name}!</Text>
      <Text style={styles.subtitle}>{student?.department}</Text>
      <Text style={styles.info}>Student No: {student?.student_no}</Text>
      <Text style={styles.info}>Email: {student?.email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 16 },
  info: { fontSize: 14, marginBottom: 8, color: "#333" },
});
