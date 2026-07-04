import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
  TITLE: "Akademik Danışmanlık",
  TAB_CHAT: "💬 Mesajlaşma",
  TAB_APPOINTMENTS: "📅 Randevular",
  OFFICE: "📍 Ofis:",
  HOURS: "⏰ Ofis Saatleri:",
  EMAIL: "✉️ E-posta:",
  SEND_PLACEHOLDER: "Danışmanınıza mesaj yazın...",
  SEND_BTN: "Gönder",
  BOOK_TITLE: "Yeni Randevu Talep Et",
  BOOK_NOTE_PLACEHOLDER: "Görüşme konusu / notu ekleyin...",
  BOOK_BTN: "Randevu Al",
  EMPTY_CHAT: "Henüz bir mesaj bulunmuyor. Merhaba deyip danışmanınıza danışabilirsiniz!",
  EMPTY_APPOINTMENTS: "Talep edilmiş bir randevunuz bulunmuyor.",
} as const;

const STORAGE_KEYS = {
  STUDENT: "student",
} as const;

type ActiveTab = "chat" | "appointments";

export default function AdvisorsScreen() {
  const [advisor, setAdvisor] = useState<any>(null);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("chat");

  // Chat state
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Appointment state
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointNote, setAppointNote] = useState("");
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    try {
      setLoading(true);
      const data = await AsyncStorage.getItem(STORAGE_KEYS.STUDENT);
      if (!data) return;
      const student = JSON.parse(data);
      setStudentId(student.id);

      const advRes = await getMyAdvisor(student.id);
      if (advRes.data) {
        setAdvisor(advRes.data);
        await Promise.all([
          fetchMessages(student.id, advRes.data.id),
          fetchAppointments(student.id),
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (sId: number, advId?: number) => {
    try {
      const res = await getMessages(sId);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async (sId: number) => {
    try {
      const res = await getAppointments(sId);
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !studentId || !advisor) return;
    try {
      setSendingMsg(true);
      await sendMessage({
        student_id: studentId,
        advisor_id: advisor.id,
        content: newMessage.trim(),
        sender_type: "student",
      });
      setNewMessage("");
      await fetchMessages(studentId, advisor.id);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleBook = async () => {
    if (!studentId || !advisor) return;
    try {
      setBooking(true);
      await bookAppointment({
        student_id: studentId,
        advisor_id: advisor.id,
        appointment_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        notes: appointNote.trim() || "Genel Akademik Danışmanlık",
      });
      setAppointNote("");
      await fetchAppointments(studentId);
      setActiveTab("appointments");
    } catch (err) {
      console.error(err);
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <ActivityIndicator style={styles.center} size="large" color="#2196F3" />;
  if (!advisor) return <View style={styles.center}><Text>Danışman bilgisi bulunamadı.</Text></View>;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <Text style={styles.title}>{LABELS.TITLE}</Text>

      {/* Danışman Profil Kartı */}
      <View style={styles.advisorCard}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{advisor.first_name?.[0] || "A"}</Text>
        </View>
        <View style={styles.advisorInfo}>
          <Text style={styles.advisorName}>
            {advisor.title} {advisor.first_name} {advisor.last_name}
          </Text>
          <Text style={styles.detailText}>{LABELS.EMAIL} {advisor.email}</Text>
          <Text style={styles.detailText}>{LABELS.OFFICE} {advisor.office}</Text>
          <Text style={styles.detailText}>{LABELS.HOURS} {advisor.office_hours}</Text>
        </View>
      </View>

      {/* Sekme Değiştirici */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "chat" && styles.tabBtnActive]}
          onPress={() => setActiveTab("chat")}
        >
          <Text style={[styles.tabText, activeTab === "chat" && styles.tabTextActive]}>
            {LABELS.TAB_CHAT}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "appointments" && styles.tabBtnActive]}
          onPress={() => setActiveTab("appointments")}
        >
          <Text style={[styles.tabText, activeTab === "appointments" && styles.tabTextActive]}>
            {LABELS.TAB_APPOINTMENTS}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "chat" ? (
        <View style={styles.chatContainer}>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.msgList}
            ListEmptyComponent={<Text style={styles.emptyText}>{LABELS.EMPTY_CHAT}</Text>}
            renderItem={({ item }) => {
              const isStudent = item.sender_type === "student";
              return (
                <View
                  style={[
                    styles.msgBubble,
                    isStudent ? styles.myBubble : styles.advisorBubble,
                  ]}
                >
                  <Text style={[styles.msgSender, isStudent ? styles.mySender : styles.advSender]}>
                    {isStudent ? "Ben" : `${advisor.title} ${advisor.last_name}`}
                  </Text>
                  <Text style={[styles.msgContent, isStudent ? styles.myContent : styles.advContent]}>
                    {item.content}
                  </Text>
                  <Text style={[styles.msgTime, isStudent ? styles.myTime : styles.advTime]}>
                    {new Date(item.created_at || Date.now()).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
              );
            }}
          />

          <View style={styles.inputRow}>
            <TextInput
              style={styles.msgInput}
              placeholder={LABELS.SEND_PLACEHOLDER}
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={handleSend}
              disabled={sendingMsg}
            >
              <Text style={styles.sendBtnText}>{LABELS.SEND_BTN}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.appointContainer} contentContainerStyle={{ paddingBottom: 30 }}>
          {/* Randevu Al Kartı */}
          <View style={styles.bookCard}>
            <Text style={styles.bookTitle}>{LABELS.BOOK_TITLE}</Text>
            <Text style={styles.bookSub}>
              Danışmanınızın sıradaki müsait ofis saatine randevu talebi oluşturur.
            </Text>
            <TextInput
              style={styles.noteInput}
              placeholder={LABELS.BOOK_NOTE_PLACEHOLDER}
              value={appointNote}
              onChangeText={setAppointNote}
              multiline
            />
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={handleBook}
              disabled={booking}
            >
              {booking ? <ActivityIndicator color="#fff" /> : <Text style={styles.bookBtnText}>{LABELS.BOOK_BTN}</Text>}
            </TouchableOpacity>
          </View>

          {/* Randevularım Listesi */}
          <Text style={styles.listHeader}>Randevularım</Text>
          {appointments.length === 0 ? (
            <Text style={styles.emptyText}>{LABELS.EMPTY_APPOINTMENTS}</Text>
          ) : (
            appointments.map((item) => (
              <View key={item.id} style={styles.appointCard}>
                <View style={styles.appointHeader}>
                  <Text style={styles.appointDate}>
                    🗓️ {new Date(item.appointment_date || Date.now()).toLocaleDateString("tr-TR")} -{" "}
                    {new Date(item.appointment_date || Date.now()).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.appointNote}>Not: {item.notes || "Belirtilmedi"}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F8F9FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: "#1A237E", marginBottom: 12 },
  advisorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  avatarBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#1976D2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarText: { color: "#FFFFFF", fontSize: 22, fontWeight: "bold" },
  advisorInfo: { flex: 1 },
  advisorName: { fontSize: 17, fontWeight: "bold", color: "#263238", marginBottom: 4 },
  detailText: { fontSize: 13, color: "#546E7A", marginBottom: 2 },
  tabRow: { flexDirection: "row", backgroundColor: "#E9ECEF", borderRadius: 10, padding: 4, marginBottom: 12 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  tabBtnActive: { backgroundColor: "#FFFFFF", elevation: 2 },
  tabText: { fontSize: 14, fontWeight: "600", color: "#6C757D" },
  tabTextActive: { color: "#1976D2", fontWeight: "bold" },
  chatContainer: { flex: 1 },
  msgList: { paddingBottom: 16 },
  emptyText: { textAlign: "center", color: "#90A4AE", fontStyle: "italic", marginTop: 20 },
  msgBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#1976D2",
    borderBottomRightRadius: 2,
  },
  advisorBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  msgSender: { fontSize: 11, fontWeight: "bold", marginBottom: 4 },
  mySender: { color: "#BBDEFB" },
  advSender: { color: "#1976D2" },
  msgContent: { fontSize: 14, lineHeight: 20 },
  myContent: { color: "#FFFFFF" },
  advContent: { color: "#263238" },
  msgTime: { fontSize: 10, alignSelf: "flex-end", marginTop: 4 },
  myTime: { color: "#E3F2FD" },
  advTime: { color: "#90A4AE" },
  inputRow: { flexDirection: "row", alignItems: "center", paddingTop: 8 },
  msgInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CFD8DC",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: "#1976D2",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendBtnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 },
  appointContainer: { flex: 1 },
  bookCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 2,
  },
  bookTitle: { fontSize: 16, fontWeight: "bold", color: "#263238", marginBottom: 6 },
  bookSub: { fontSize: 13, color: "#60646C", marginBottom: 12 },
  noteInput: {
    borderWidth: 1,
    borderColor: "#CFD8DC",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    height: 70,
    textAlignVertical: "top",
    marginBottom: 12,
    backgroundColor: "#F5F5F5",
  },
  bookBtn: {
    backgroundColor: "#00897B",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  bookBtnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 15 },
  listHeader: { fontSize: 18, fontWeight: "bold", color: "#263238", marginBottom: 10 },
  appointCard: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    elevation: 1,
  },
  appointHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  appointDate: { fontSize: 13, fontWeight: "bold", color: "#1976D2" },
  statusBadge: { backgroundColor: "#E8F5E9", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: { color: "#2E7D32", fontSize: 11, fontWeight: "bold" },
  appointNote: { fontSize: 13, color: "#546E7A" },
});
