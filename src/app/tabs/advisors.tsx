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
import { useTheme } from "../../context/ThemeContext";

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
  const { colors } = useTheme();
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
    if (!appointNote.trim() || !studentId || !advisor) return;
    try {
      setBooking(true);
      await bookAppointment({
        student_id: studentId,
        advisor_id: advisor.id,
        appointment_date: new Date(Date.now() + 86400000).toISOString(),
        notes: appointNote.trim(),
      });
      setAppointNote("");
      await fetchAppointments(studentId);
    } catch (err) {
      console.error(err);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!advisor) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.subText, fontSize: 16 }}>Henüz atanmış bir danışman bulunmamaktadır.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <Text style={[styles.title, { color: colors.text }]}>{LABELS.TITLE}</Text>

      {/* Danışman Profil Kartı */}
      <View style={[styles.advisorCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <View style={[styles.avatarBox, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{advisor.first_name?.[0] || "A"}</Text>
        </View>
        <View style={styles.advisorInfo}>
          <Text style={[styles.advisorName, { color: colors.text }]}>
            {advisor.title} {advisor.first_name} {advisor.last_name}
          </Text>
          <Text style={[styles.detailText, { color: colors.subText }]}>{LABELS.EMAIL} <Text style={{ color: colors.text }}>{advisor.email}</Text></Text>
          <Text style={[styles.detailText, { color: colors.subText }]}>{LABELS.OFFICE} <Text style={{ color: colors.text }}>{advisor.office}</Text></Text>
          <Text style={[styles.detailText, { color: colors.subText }]}>{LABELS.HOURS} <Text style={{ color: colors.text }}>{advisor.office_hours}</Text></Text>
        </View>
      </View>

      {/* Sekme Değiştirici */}
      <View style={[styles.tabRow, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "chat" && { backgroundColor: colors.primaryLight }]}
          onPress={() => setActiveTab("chat")}
        >
          <Text style={[styles.tabText, { color: colors.subText }, activeTab === "chat" && { color: colors.primary, fontWeight: "800" }]}>
            {LABELS.TAB_CHAT}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "appointments" && { backgroundColor: colors.primaryLight }]}
          onPress={() => setActiveTab("appointments")}
        >
          <Text style={[styles.tabText, { color: colors.subText }, activeTab === "appointments" && { color: colors.primary, fontWeight: "800" }]}>
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
            ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.subText }]}>{LABELS.EMPTY_CHAT}</Text>}
            renderItem={({ item }) => {
              const isStudent = item.sender_type === "student";
              return (
                <View
                  style={[
                    styles.msgBubble,
                    isStudent
                      ? [styles.myBubble, { backgroundColor: colors.primary }]
                      : [styles.advisorBubble, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }],
                  ]}
                >
                  <Text style={[styles.msgSender, isStudent ? styles.mySender : { color: colors.primary }]}>
                    {isStudent ? "Ben" : `${advisor.title} ${advisor.last_name}`}
                  </Text>
                  <Text style={[styles.msgContent, isStudent ? styles.myContent : { color: colors.text }]}>
                    {item.content}
                  </Text>
                  <Text style={[styles.msgTime, isStudent ? styles.myTime : { color: colors.subText }]}>
                    {new Date(item.created_at || Date.now()).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
              );
            }}
          />

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.msgInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder={LABELS.SEND_PLACEHOLDER}
              placeholderTextColor={colors.subText}
              value={newMessage}
              onChangeText={setNewMessage}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: colors.primary }]}
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
          <View style={[styles.bookCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.bookTitle, { color: colors.text }]}>{LABELS.BOOK_TITLE}</Text>
            <Text style={[styles.bookSub, { color: colors.subText }]}>
              Danışmanınızın sıradaki müsait ofis saatine randevu talebi oluşturur.
            </Text>
            <TextInput
              style={[styles.noteInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder={LABELS.BOOK_NOTE_PLACEHOLDER}
              placeholderTextColor={colors.subText}
              value={appointNote}
              onChangeText={setAppointNote}
              multiline
              onSubmitEditing={handleBook}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.bookBtn, { backgroundColor: colors.accent }]}
              onPress={handleBook}
              disabled={booking}
            >
              <Text style={styles.bookBtnText}>{LABELS.BOOK_BTN}</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.listHeader, { color: colors.text }]}>Talep Edilen Randevular</Text>
          {appointments.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.subText }]}>{LABELS.EMPTY_APPOINTMENTS}</Text>
          ) : (
            appointments.map((app) => (
              <View key={app.id} style={[styles.appointCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <View style={styles.appointHeader}>
                  <Text style={[styles.appointDate, { color: colors.primary }]}>
                    {new Date(app.appointment_date).toLocaleDateString("tr-TR")}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: colors.accentLight }]}>
                    <Text style={[styles.statusText, { color: colors.accent }]}>{app.status || "Onaylandı"}</Text>
                  </View>
                </View>
                <Text style={[styles.appointNote, { color: colors.subText }]}>{app.notes}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 14 },
  advisorCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold" },
  advisorInfo: { flex: 1 },
  advisorName: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  detailText: { fontSize: 13, marginBottom: 2 },
  tabRow: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
  },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabText: { fontSize: 14, fontWeight: "600" },
  chatContainer: { flex: 1 },
  msgList: { paddingBottom: 16 },
  emptyText: { textAlign: "center", fontStyle: "italic", marginTop: 20, fontSize: 14 },
  msgBubble: {
    maxWidth: "80%",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  myBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  advisorBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  msgSender: { fontSize: 11, fontWeight: "bold", marginBottom: 4 },
  mySender: { color: "#BBDEFB" },
  msgContent: { fontSize: 14, lineHeight: 20 },
  myContent: { color: "#FFFFFF" },
  msgTime: { fontSize: 10, alignSelf: "flex-end", marginTop: 4 },
  myTime: { color: "#E3F2FD" },
  inputRow: { flexDirection: "row", alignItems: "center", paddingTop: 8 },
  msgInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 14,
    marginRight: 8,
  },
  sendBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    justifyContent: "center",
  },
  sendBtnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  appointContainer: { flex: 1 },
  bookCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
  },
  bookTitle: { fontSize: 16, fontWeight: "800", marginBottom: 6 },
  bookSub: { fontSize: 13, marginBottom: 12 },
  noteInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    height: 70,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  bookBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  bookBtnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },
  listHeader: { fontSize: 18, fontWeight: "800", marginBottom: 10 },
  appointCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  appointHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  appointDate: { fontSize: 14, fontWeight: "800" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "800" },
  appointNote: { fontSize: 14, lineHeight: 20 },
});
