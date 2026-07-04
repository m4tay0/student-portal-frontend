import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { changePassword } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";

const STORAGE_KEYS = {
  TOKEN: "token",
  STUDENT: "student",
} as const;

const LABELS = {
  TITLE: "Profil & Menü",
  SUBTITLE: "Hesap Yönetimi ve Kampüs Servisleri",
  DIGITAL_ID_BTN: "🪪 Dijital Kimlik (QR)",
  PASS_CHANGE_BTN: "🔑 Şifre Değiştir",
  LOGOUT_BTN: "🚪 Çıkış Yap",
  LOGOUT_CONFIRM_TITLE: "Çıkış Yap",
  LOGOUT_CONFIRM_MSG: "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
  LOGOUT_CONFIRM_YES: "Evet, Çıkış Yap",
  LOGOUT_CONFIRM_NO: "İptal",
  MENU_TITLE: "Kampüs Servisleri",
  BTN_DOCS: "📄 Belgelerim",
  BTN_NOTIFS: "🔔 Bildirimler",
  BTN_ANNOUNCEMENTS: "📢 Duyurular",
  BTN_ASSIGNMENTS: "📝 Ödevler",
  BTN_GRADES: "📊 Not Kartı",
  MODAL_ID_TITLE: "Dijital Öğrenci Kimliği",
  MODAL_ID_SUB: "Kampüs Geçiş ve Kütüphane Kartı",
  MODAL_CLOSE: "Kapat",
  PASS_OLD_PLACEHOLDER: "Mevcut Şifreniz",
  PASS_NEW_PLACEHOLDER: "Yeni Şifreniz",
  PASS_SUBMIT: "Şifreyi Güncelle",
  SUCCESS_PASS: "Şifreniz başarıyla güncellendi!",
} as const;

export default function ProfileScreen() {
  const router = useRouter();
  const { isDark, toggleTheme, colors } = useTheme();
  const [student, setStudent] = useState<any>(null);
  const [showIdModal, setShowIdModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    loadStudent();
  }, []);

  const loadStudent = async () => {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.STUDENT);
    if (data) {
      setStudent(JSON.parse(data));
    }
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (window.confirm(LABELS.LOGOUT_CONFIRM_MSG)) {
        performLogout();
      }
    } else {
      Alert.alert(LABELS.LOGOUT_CONFIRM_TITLE, LABELS.LOGOUT_CONFIRM_MSG, [
        { text: LABELS.LOGOUT_CONFIRM_NO, style: "cancel" },
        { text: LABELS.LOGOUT_CONFIRM_YES, style: "destructive", onPress: performLogout },
      ]);
    }
  };

  const performLogout = async () => {
    await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.STUDENT]);
    router.replace("/login");
  };

  const handlePassChange = async () => {
    if (!oldPassword.trim() || !newPassword.trim()) return;
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await changePassword(student?.id, oldPassword, newPassword);
      setMsg({ type: "success", text: res.data.message || LABELS.SUCCESS_PASS });
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => {
        setShowPassModal(false);
        setMsg({ type: "", text: "" });
      }, 1500);
    } catch (err: any) {
      setMsg({
        type: "error",
        text: err.response?.data?.error || "Şifre değiştirilemedi, tekrar deneyin.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!student) return null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {student.first_name?.[0]}
            {student.last_name?.[0]}
          </Text>
        </View>
        <Text style={[styles.nameText, { color: colors.text }]}>
          {student.first_name} {student.last_name}
        </Text>
        <Text style={[styles.deptText, { color: colors.subText }]}>{student.department}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: colors.badgeBg }]}>
            <Text style={[styles.badgeText, { color: colors.subText }]}>
              Öğrenci No: {student.student_no}
            </Text>
          </View>
          <View style={[styles.badge, styles.badgeActive]}>
            <Text style={[styles.badgeText, styles.badgeActiveText]}>Aktif Öğrenci</Text>
          </View>
        </View>
      </View>

      {/* Tema Değiştirme Butonu (Dark / Light Mode) */}
      <TouchableOpacity
        style={[styles.themeButton, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
        onPress={toggleTheme}
        activeOpacity={0.85}
      >
        <Text style={[styles.themeButtonText, { color: colors.text }]}>
          {isDark ? "☀️ Aydınlık Mod'a Geç (Light Mode)" : "🌙 Karanlık Mod'a Geç (Dark Mode)"}
        </Text>
      </TouchableOpacity>

      {/* Action Buttons: Digital ID & Password Change */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.idButton}
          onPress={() => setShowIdModal(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.idButtonText}>{LABELS.DIGITAL_ID_BTN}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.passButton}
          onPress={() => setShowPassModal(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.passButtonText}>{LABELS.PASS_CHANGE_BTN}</Text>
        </TouchableOpacity>
      </View>

      {/* Campus Services Menu Grid */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{LABELS.MENU_TITLE}</Text>
      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
          onPress={() => router.push("/tabs/documents" as any)}
          activeOpacity={0.8}
        >
          <Text style={[styles.gridItemText, { color: colors.text }]}>{LABELS.BTN_DOCS}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
          onPress={() => router.push("/tabs/notifications" as any)}
          activeOpacity={0.8}
        >
          <Text style={[styles.gridItemText, { color: colors.text }]}>{LABELS.BTN_NOTIFS}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
          onPress={() => router.push("/tabs/announcements" as any)}
          activeOpacity={0.8}
        >
          <Text style={[styles.gridItemText, { color: colors.text }]}>{LABELS.BTN_ANNOUNCEMENTS}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
          onPress={() => router.push("/tabs/assignments" as any)}
          activeOpacity={0.8}
        >
          <Text style={[styles.gridItemText, { color: colors.text }]}>{LABELS.BTN_ASSIGNMENTS}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
          onPress={() => router.push("/tabs/grades" as any)}
          activeOpacity={0.8}
        >
          <Text style={[styles.gridItemText, { color: colors.text }]}>{LABELS.BTN_GRADES}</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.85}
      >
        <Text style={styles.logoutButtonText}>{LABELS.LOGOUT_BTN}</Text>
      </TouchableOpacity>

      {/* MODAL 1: QR Kodlu Dijital Kimlik */}
      <Modal visible={showIdModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.idCardModal, { backgroundColor: colors.background, borderColor: colors.primary }]}>
            <View style={styles.idCardHeader}>
              <Text style={styles.idCardLogo}>🏛️</Text>
              <Text style={styles.idCardUni}>ÜNİVERSİTE KAMPÜS KARTI</Text>
            </View>
            <View style={styles.idCardBody}>
              <View style={styles.modalAvatar}>
                <Text style={styles.modalAvatarText}>
                  {student.first_name?.[0]}
                  {student.last_name?.[0]}
                </Text>
              </View>
              <Text style={[styles.modalName, { color: colors.text }]}>
                {student.first_name} {student.last_name}
              </Text>
              <Text style={[styles.modalDept, { color: colors.subText }]}>{student.department}</Text>
              <Text style={styles.modalNo}>NO: {student.student_no}</Text>

              {/* QR Code Graphic Representation */}
              <View style={styles.qrBox}>
                <View style={styles.qrInner}>
                  <Text style={styles.qrIcon}>📱</Text>
                  <Text style={styles.qrText}>UNI-QR-{student.student_no}</Text>
                </View>
              </View>
              <Text style={[styles.qrHint, { color: colors.subText }]}>
                Kampüs ve Kütüphane Turnike Geçişi İçin Okutun
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.modalCloseBtn, { backgroundColor: colors.cardBorder }]}
              onPress={() => setShowIdModal(false)}
            >
              <Text style={[styles.modalCloseText, { color: colors.text }]}>{LABELS.MODAL_CLOSE}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Şifre Değiştirme */}
      <Modal visible={showPassModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.passModalCard, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Şifre Güncelleme</Text>
            <Text style={[styles.modalSub, { color: colors.subText }]}>Güvenliğiniz için yeni şifrenizi girin.</Text>

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder={LABELS.PASS_OLD_PLACEHOLDER}
              placeholderTextColor={colors.subText}
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder={LABELS.PASS_NEW_PLACEHOLDER}
              placeholderTextColor={colors.subText}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            {msg.text ? (
              <Text
                style={
                  msg.type === "success" ? styles.msgSuccess : styles.msgError
                }
              >
                {msg.text}
              </Text>
            ) : null}

            <TouchableOpacity
              style={[
                styles.modalSubmitBtn,
                (!oldPassword.trim() || !newPassword.trim()) && styles.btnDisabled,
              ]}
              onPress={handlePassChange}
              disabled={loading || !oldPassword.trim() || !newPassword.trim()}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.modalSubmitText}>{LABELS.PASS_SUBMIT}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setShowPassModal(false)}
            >
              <Text style={[styles.modalCancelText, { color: colors.subText }]}>{LABELS.MODAL_CLOSE}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 6,
  },
  themeButton: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  themeButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  avatarText: { fontSize: 28, fontWeight: "bold", color: "#FFFFFF" },
  nameText: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  deptText: { fontSize: 15, marginBottom: 14, textAlign: "center" },
  badgeRow: { flexDirection: "row", gap: 8 },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  badgeText: { fontSize: 12, fontWeight: "600" },
  badgeActive: { backgroundColor: "rgba(16, 185, 129, 0.2)", borderColor: "#10B981" },
  badgeActiveText: { color: "#34D399" },
  actionRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  idButton: {
    flex: 1,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  idButtonText: { color: "#60A5FA", fontWeight: "700", fontSize: 14 },
  passButton: {
    flex: 1,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  passButtonText: { color: "#FBBF24", fontWeight: "700", fontSize: 14 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  gridItem: {
    width: "48%",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  gridItemText: { fontSize: 15, fontWeight: "600" },
  logoutButton: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  logoutButtonText: { color: "#F87171", fontSize: 16, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  idCardModal: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  idCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    paddingBottom: 12,
    width: "100%",
    justifyContent: "center",
  },
  idCardLogo: { fontSize: 20 },
  idCardUni: { color: "#60A5FA", fontWeight: "800", fontSize: 14, letterSpacing: 1 },
  idCardBody: { alignItems: "center", width: "100%", marginBottom: 20 },
  modalAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modalAvatarText: { color: "#FFF", fontSize: 24, fontWeight: "bold" },
  modalName: { fontSize: 20, fontWeight: "800", marginBottom: 4 },
  modalDept: { fontSize: 13, marginBottom: 8, textAlign: "center" },
  modalNo: { color: "#34D399", fontSize: 14, fontWeight: "700", marginBottom: 20 },
  qrBox: {
    width: 180,
    height: 180,
    backgroundColor: "#FFF",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    marginBottom: 14,
  },
  qrInner: {
    width: "100%",
    height: "100%",
    borderWidth: 2,
    borderColor: "#0F172A",
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  qrIcon: { fontSize: 48, marginBottom: 8 },
  qrText: { color: "#0F172A", fontWeight: "800", fontSize: 13 },
  qrHint: { fontSize: 11, textAlign: "center" },
  modalCloseBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCloseText: { fontWeight: "700", fontSize: 15 },
  passModalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
  },
  modalTitle: { fontSize: 20, fontWeight: "800", marginBottom: 6 },
  modalSub: { fontSize: 13, marginBottom: 20 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 14,
  },
  modalSubmitBtn: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  btnDisabled: { backgroundColor: "#475569" },
  modalSubmitText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  modalCancelBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelText: { fontWeight: "600", fontSize: 14 },
  msgSuccess: { color: "#34D399", fontSize: 13, marginBottom: 12, textAlign: "center", fontWeight: "600" },
  msgError: { color: "#F87171", fontSize: 13, marginBottom: 12, textAlign: "center", fontWeight: "600" },
});
