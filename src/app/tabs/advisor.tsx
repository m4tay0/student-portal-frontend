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

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{LABELS.TITLE}</Text>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "info" && styles.activeTabBtn]}
          onPress={() => setActiveTab("info")}
        >
          <Text style={[styles.tabText, activeTab === "info" && styles.activeTabText]}>
            {LABELS.TAB_INFO}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "appointments" && styles.activeTabBtn]}
          onPress={() => setActiveTab("appointments")}
        >
          <Text style={[styles.tabText, activeTab === "appointments" && styles.activeTabText]}>
            {LABELS.TAB_APPOINTMENTS}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "messages" && styles.activeTabBtn]}
          onPress={() => setActiveTab("messages")}
        >
          <Text style={[styles.tabText, activeTab === "messages" && styles.activeTabText]}>
            {LABELS.TAB_MESSAGES}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "info" && (
        <View style={styles.card}>
          {advisor ? (
            <>
              <Text style={styles.advName}>
                {advisor.title} {advisor.first_name} {advisor.last_name}
              </Text>
              <Text style={styles.advInfo}>
                {LABELS.EMAIL} {advisor.email}
              </Text>
              <Text style={styles.advInfo}>
                {LABELS.OFFICE} {advisor.office}
              </Text>
              <View style={styles.hoursBox}>
                <Text style={styles.hoursTitle}>{LABELS.HOURS}</Text>
                <Text style={styles.hoursText}>{advisor.office_hours}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>{LABELS.NO_ADVISOR}</Text>
          )}
        </View>
      )}

      {activeTab === "appointments" && (
        <View style={styles.tabContent}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>{LABELS.NEW_APPOINTMENT}</Text>
            <TextInput
              style={styles.input}
              placeholder={LABELS.APPOINTMENT_NOTE_PLACEHOLDER}
              value={noteInput}
              onChangeText={setNoteInput}
            />
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleBookAppointment}
              disabled={submitting}
            >
              <Text style={styles.actionBtnText}>{LABELS.BOOK_BTN}</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={appointments}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<Text style={styles.emptyText}>{LABELS.NO_APPOINTMENTS}</Text>}
            renderItem={({ item }) => (
              <View style={styles.listCard}>
                <View style={styles.row}>
                  <Text style={styles.dateText}>
                    {new Date(item.appointment_date).toLocaleDateString()}
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{LABELS.STATUS_APPROVED}</Text>
                  </View>
                </View>
                <Text style={styles.noteText}>{item.notes}</Text>
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
            ListEmptyComponent={<Text style={styles.emptyText}>{LABELS.NO_MESSAGES}</Text>}
            renderItem={({ item }) => {
              const isStudent = item.sender_type === LABELS.SENDER_STUDENT;
              return (
                <View
                  style={[
                    styles.msgBubble,
                    isStudent ? styles.studentBubble : styles.advisorBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.msgText,
                      isStudent ? styles.studentMsgText : styles.advisorMsgText,
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
              style={styles.msgInput}
              placeholder={LABELS.MESSAGE_PLACEHOLDER}
              value={msgInput}
              onChangeText={setMsgInput}
            />
            <TouchableOpacity
              style={styles.sendBtn}
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
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 12, color: "#111" },
  tabBar: { flexDirection: "row", marginBottom: 16, backgroundColor: "#f1f3f5", borderRadius: 8, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 6 },
  activeTabBtn: { backgroundColor: "#fff", elevation: 2 },
  tabText: { fontSize: 13, color: "#495057", fontWeight: "600" },
  activeTabText: { color: "#2196F3" },
  card: { backgroundColor: "#f8f9fa", padding: 20, borderRadius: 12, borderWidth: 1, borderColor: "#e9ecef" },
  advName: { fontSize: 18, fontWeight: "bold", color: "#212529", marginBottom: 12 },
  advInfo: { fontSize: 14, color: "#495057", marginBottom: 6 },
  hoursBox: { marginTop: 12, padding: 12, backgroundColor: "#e3f2fd", borderRadius: 8 },
  hoursTitle: { fontSize: 13, fontWeight: "bold", color: "#1565c0", marginBottom: 4 },
  hoursText: { fontSize: 13, color: "#0d47a1" },
  tabContent: { flex: 1 },
  formCard: { backgroundColor: "#f8f9fa", padding: 14, borderRadius: 10, marginBottom: 16, borderWidth: 1, borderColor: "#e9ecef" },
  formTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 8, color: "#212529" },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ced4da", borderRadius: 6, padding: 10, marginBottom: 10, fontSize: 14 },
  actionBtn: { backgroundColor: "#2196F3", paddingVertical: 10, borderRadius: 6, alignItems: "center" },
  actionBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  listCard: { backgroundColor: "#fff", padding: 14, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: "#dee2e6" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  dateText: { fontSize: 13, fontWeight: "bold", color: "#495057" },
  statusBadge: { backgroundColor: "#d4edda", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusText: { color: "#155724", fontSize: 11, fontWeight: "bold" },
  noteText: { fontSize: 14, color: "#212529" },
  emptyText: { textAlign: "center", color: "#6c757d", marginTop: 20, fontStyle: "italic" },
  msgBubble: { padding: 12, borderRadius: 12, marginBottom: 8, maxWidth: "80%" },
  studentBubble: { alignSelf: "flex-end", backgroundColor: "#2196F3", borderBottomRightRadius: 2 },
  advisorBubble: { alignSelf: "flex-start", backgroundColor: "#e9ecef", borderBottomLeftRadius: 2 },
  msgText: { fontSize: 14 },
  studentMsgText: { color: "#fff" },
  advisorMsgText: { color: "#212529" },
  sendRow: { flexDirection: "row", marginTop: 8 },
  msgInput: { flex: 1, backgroundColor: "#f8f9fa", borderWidth: 1, borderColor: "#ced4da", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, fontSize: 14 },
  sendBtn: { backgroundColor: "#2196F3", justifyContent: "center", paddingHorizontal: 16, borderRadius: 20, marginLeft: 8 },
  sendBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
