import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  bookAppointment,
  getAppointments,
  getMessages,
  getMyAdvisor,
  sendMessage,
} from "../../services/api";
import { useTheme } from "../../context/ThemeContext";

const LABELS = {
  TITLE: "Danışmanlık Modülü",
  TAB_INFO: "👨‍🏫 Danışmanım",
  TAB_APPOINTMENTS: "📅 Randevular",
  TAB_MESSAGES: "💬 Mesajlaşma",
  OFFICE: "Ofis:",
  HOURS: "Ofis Saatleri:",
  EMAIL: "E-posta:",
  NEW_APPOINTMENT: "Yeni Randevu Talep Et",
  APPOINTMENT_NOTE_PLACEHOLDER: "Görüşme konusu / notunuz...",
  BOOK_BTN: "Randevu Al",
  SEND_BTN: "Gönder",
  MESSAGE_PLACEHOLDER: "Danışmanınıza mesaj yazın...",
  NO_ADVISOR: "Henüz atanmış danışman bulunamadı.",
  NO_APPOINTMENTS: "Kayıtlı randevunuz bulunmuyor.",
  NO_MESSAGES: "Henüz bir mesajlaşma bulunmuyor.",
  STATUS_APPROVED: "Onaylandı",
  SENDER_STUDENT: "student",
} as const;

type ActiveTab = "info" | "appointments" | "messages";

export default function AdvisorScreen() {
  const { colors } = useTheme();
  const [student, setStudent] = useState<any>(null);
  const [advisor, setAdvisor] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("info");
  const [loading, setLoading] = useState(true);
  const [noteInput, setNoteInput] = useState("");
  const [msgInput, setMsgInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await AsyncStorage.getItem("student");
      if (!data) return;
      const parsedStudent = JSON.parse(data);
      setStudent(parsedStudent);

      const advRes = await getMyAdvisor(parsedStudent.id);
      if (advRes.data) {
        setAdvisor(advRes.data);
      }

      const appRes = await getAppointments(parsedStudent.id);
      if (appRes.data) setAppointments(appRes.data);

      const msgRes = await getMessages(parsedStudent.id);
      if (msgRes.data) setMessages(msgRes.data);
    } catch (e) {
      // Error handled silently per user rules
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!noteInput.trim() || !student || !advisor) return;
    setSubmitting(true);
    try {
      await bookAppointment({
        student_id: student.id,
        advisor_id: advisor.id,
        appointment_date: new Date(Date.now() + 86400000).toISOString(),
        notes: noteInput,
      });
      setNoteInput("");
      const appRes = await getAppointments(student.id);
      if (appRes.data) setAppointments(appRes.data);
    } catch (e) {
      // Error handled silently per user rules
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!msgInput.trim() || !student || !advisor) return;
    setSubmitting(true);
    try {
      await sendMessage({
        student_id: student.id,
        advisor_id: advisor.id,
        content: msgInput,
        sender_type: LABELS.SENDER_STUDENT,
      });
      setMsgInput("");
      const msgRes = await getMessages(student.id);
      if (msgRes.data) setMessages(msgRes.data);
    } catch (e) {
      // Error handled silently per user rules
    } finally {
      setSubmitting(false);
    }
  };

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

      <View style={[styles.tabBar, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "info" && { backgroundColor: colors.primaryLight }]}
          onPress={() => setActiveTab("info")}
        >
          <Text style={[styles.tabText, { color: colors.subText }, activeTab === "info" && { color: colors.primary, fontWeight: "700" }]}>
            {LABELS.TAB_INFO}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "appointments" && { backgroundColor: colors.primaryLight }]}
          onPress={() => setActiveTab("appointments")}
        >
          <Text style={[styles.tabText, { color: colors.subText }, activeTab === "appointments" && { color: colors.primary, fontWeight: "700" }]}>
            {LABELS.TAB_APPOINTMENTS}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "messages" && { backgroundColor: colors.primaryLight }]}
          onPress={() => setActiveTab("messages")}
        >
          <Text style={[styles.tabText, { color: colors.subText }, activeTab === "messages" && { color: colors.primary, fontWeight: "700" }]}>
            {LABELS.TAB_MESSAGES}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "info" && (
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          {advisor ? (
            <>
              <Text style={[styles.advName, { color: colors.text }]}>
                {advisor.title} {advisor.first_name} {advisor.last_name}
              </Text>
              <Text style={[styles.advInfo, { color: colors.subText }]}>
                {LABELS.EMAIL} <Text style={{ color: colors.text }}>{advisor.email}</Text>
              </Text>
              <Text style={[styles.advInfo, { color: colors.subText }]}>
                {LABELS.OFFICE} <Text style={{ color: colors.text }}>{advisor.office}</Text>
              </Text>
              <View style={[styles.hoursBox, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.hoursTitle, { color: colors.primary }]}>{LABELS.HOURS}</Text>
                <Text style={[styles.hoursText, { color: colors.text }]}>{advisor.office_hours}</Text>
              </View>
            </>
          ) : (
            <Text style={[styles.emptyText, { color: colors.subText }]}>{LABELS.NO_ADVISOR}</Text>
          )}
        </View>
      )}

      {activeTab === "appointments" && (
        <View style={styles.tabContent}>
          <View style={[styles.formCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>{LABELS.NEW_APPOINTMENT}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder={LABELS.APPOINTMENT_NOTE_PLACEHOLDER}
              placeholderTextColor={colors.subText}
              value={noteInput}
              onChangeText={setNoteInput}
              onSubmitEditing={handleBookAppointment}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              onPress={handleBookAppointment}
              disabled={submitting}
            >
              <Text style={styles.actionBtnText}>{LABELS.BOOK_BTN}</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={appointments}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.subText }]}>{LABELS.NO_APPOINTMENTS}</Text>}
            renderItem={({ item }) => (
              <View style={[styles.listCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <View style={styles.row}>
                  <Text style={[styles.dateText, { color: colors.text }]}>
                    {new Date(item.appointment_date).toLocaleDateString("tr-TR")}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: colors.accentLight }]}>
                    <Text style={[styles.statusText, { color: colors.accent }]}>{LABELS.STATUS_APPROVED}</Text>
                  </View>
                </View>
                <Text style={[styles.noteText, { color: colors.subText }]}>{item.notes}</Text>
              </View>
            )}
          />
        </View>
      )}

      {activeTab === "messages" && (
        <View style={styles.tabContent}>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.subText }]}>{LABELS.NO_MESSAGES}</Text>}
            renderItem={({ item }) => {
              const isStudent = item.sender_type === LABELS.SENDER_STUDENT;
              return (
                <View
                  style={[
                    styles.msgBubble,
                    isStudent
                      ? [styles.studentBubble, { backgroundColor: colors.primary }]
                      : [styles.advisorBubble, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder, borderWidth: 1 }],
                  ]}
                >
                  <Text
                    style={[
                      styles.msgText,
                      isStudent ? styles.studentMsgText : { color: colors.text },
                    ]}
                  >
                    {item.content}
                  </Text>
                </View>
              );
            }}
          />

          <View style={styles.sendRow}>
            <TextInput
              style={[styles.msgInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder={LABELS.MESSAGE_PLACEHOLDER}
              placeholderTextColor={colors.subText}
              value={msgInput}
              onChangeText={setMsgInput}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: colors.primary }]}
              onPress={handleSendMessage}
              disabled={submitting}
            >
              <Text style={styles.sendBtnText}>{LABELS.SEND_BTN}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 14 },
  tabBar: { flexDirection: "row", marginBottom: 16, borderRadius: 12, padding: 4, borderWidth: 1 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  tabText: { fontSize: 13, fontWeight: "600" },
  card: { padding: 20, borderRadius: 16, borderWidth: 1 },
  advName: { fontSize: 18, fontWeight: "800", marginBottom: 12 },
  advInfo: { fontSize: 14, marginBottom: 6 },
  hoursBox: { marginTop: 14, padding: 14, borderRadius: 12 },
  hoursTitle: { fontSize: 13, fontWeight: "800", marginBottom: 4 },
  hoursText: { fontSize: 13, fontWeight: "600" },
  tabContent: { flex: 1 },
  formCard: { padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1 },
  formTitle: { fontSize: 15, fontWeight: "800", marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 14 },
  actionBtn: { paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  listCard: { padding: 16, borderRadius: 14, marginBottom: 12, borderWidth: 1 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  dateText: { fontSize: 14, fontWeight: "700" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: "800" },
  noteText: { fontSize: 14, lineHeight: 20 },
  emptyText: { textAlign: "center", marginTop: 24, fontStyle: "italic", fontSize: 14 },
  msgBubble: { padding: 14, borderRadius: 16, marginBottom: 10, maxWidth: "80%" },
  studentBubble: { alignSelf: "flex-end", borderBottomRightRadius: 4 },
  advisorBubble: { alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  msgText: { fontSize: 14, lineHeight: 20 },
  studentMsgText: { color: "#fff", fontWeight: "500" },
  sendRow: { flexDirection: "row", marginTop: 10, alignItems: "center" },
  msgInput: { flex: 1, borderWidth: 1, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 10, fontSize: 14 },
  sendBtn: { justifyContent: "center", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, marginLeft: 8 },
  sendBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
});
