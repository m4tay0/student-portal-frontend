import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { getAnnouncements } from "../../services/api";

const LABELS = {
  TITLE: "📢 Kampüs & Ders Duyuruları",
  EMPTY: "Henüz yayınlanmış bir duyuru bulunmuyor.",
} as const;

export default function AnnouncementsScreen() {
  const { colors } = useTheme();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnnouncements()
      .then((res) => setAnnouncements(res.data))
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{LABELS.TITLE}</Text>
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.subText }]}>{LABELS.EMPTY}</Text>}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={styles.headerRow}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
              <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>{item.courses?.code || "GENEL"}</Text>
              </View>
            </View>
            {item.courses?.name ? (
              <Text style={[styles.course, { color: colors.primary }]}>{item.courses?.name}</Text>
            ) : null}
            <Text style={[styles.content, { color: colors.subText }]}>{item.content}</Text>
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
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: "800", flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "800" },
  course: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  content: { fontSize: 14, lineHeight: 20 },
  emptyText: { textAlign: "center", marginTop: 24, fontStyle: "italic", fontSize: 14 },
});
