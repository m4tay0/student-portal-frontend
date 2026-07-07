import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

const LABELS = {
  TITLE: "⏱️ Odak & Pomodoro",
  SUBTITLE: "Derse Odaklan, Telefonunu Bırak, Kampüs Puanı Kazan!",
  MODE_POMODORO: "🍅 25 Dk Odak",
  MODE_SHORT: "☕ 5 Dk Kısa Mola",
  MODE_LONG: "🌴 15 Dk Uzun Mola",
  START: "▶️ Odaklanmayı Başlat",
  PAUSE: "⏸️ Duraklat",
  RESET: "⏹️ Sıfırla",
  SIMULATE: "⚡ Oturumu Tamamla (Test & +25 Dk)",
  STATS_PREFIX: "🔥 Bugünkü Odaklanma:",
  STATS_SUFFIX: "Dakika",
  SELECT_COURSE: "🎯 Odaklanılan Ders & Konu:",
  QUOTE_ACTIVE: "🧠 Odak Modu Aktif: Telefon bildirimleri sessizde. Sadece hedefine odaklan!",
  QUOTE_IDLE: "💡 İpucu: 25 dakika kesintisiz çalışma ve 5 dakika mola beynin odaklanma gücünü %40 artırır.",
  MODAL_TITLE: "🎉 Tebrikler! Odak Tamamlandı!",
  MODAL_DESC: "25 dakikalık odaklanma oturumunu başarıyla bitirdin ve +25 Kampüs Başarı Puanı kazandın!",
  MODAL_CLOSE: "Harika, Devam Et!",
} as const;

const MODES = {
  POMODORO: 1500, // 25 min
  SHORT: 300, // 5 min
  LONG: 900, // 15 min
} as const;

const COURSES_LIST = [
  "💻 Matematik & Algoritma",
  "⚡ Fizik Lab Raporu",
  "📚 Dönem Projesi & Kodlama",
  "📖 Genel Sınav Çalışması",
] as const;

const STORAGE_KEY_FOCUS = "focus_total_mins";

export default function FocusScreen() {
  const { colors } = useTheme();
  const [timeLeft, setTimeLeft] = useState<number>(MODES.POMODORO);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [mode, setMode] = useState<"pomodoro" | "short" | "long">("pomodoro");
  const [totalMins, setTotalMins] = useState<number>(0);
  const [selectedCourse, setSelectedCourse] = useState<string>(COURSES_LIST[0]);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const loadStats = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_FOCUS);
      if (data) setTotalMins(parseInt(data, 10) || 0);
    } catch (e) {
      // handled silently
    }
  };

  const saveStats = async (newTotal: number) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_FOCUS, newTotal.toString());
    } catch (e) {
      // handled silently
    }
  };

  const handleSessionComplete = () => {
    if (mode === "pomodoro") {
      const updated = totalMins + 25;
      setTotalMins(updated);
      saveStats(updated);
      setShowModal(true);
    }
  };

  const handleModeChange = (newMode: "pomodoro" | "short" | "long") => {
    setIsActive(false);
    setMode(newMode);
    if (newMode === "pomodoro") setTimeLeft(MODES.POMODORO);
    if (newMode === "short") setTimeLeft(MODES.SHORT);
    if (newMode === "long") setTimeLeft(MODES.LONG);
  };

  const handleReset = () => {
    setIsActive(false);
    if (mode === "pomodoro") setTimeLeft(MODES.POMODORO);
    if (mode === "short") setTimeLeft(MODES.SHORT);
    if (mode === "long") setTimeLeft(MODES.LONG);
  };

  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={[styles.headerCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.title, { color: colors.text }]}>{LABELS.TITLE}</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>{LABELS.SUBTITLE}</Text>
      </View>

      {/* İstatistik Rozeti */}
      <View style={[styles.statsBadge, { backgroundColor: colors.accentLight, borderColor: colors.accent }]}>
        <Text style={[styles.statsText, { color: colors.accent }]}>
          {LABELS.STATS_PREFIX} <Text style={{ fontWeight: "900", fontSize: 16 }}>{totalMins}</Text> {LABELS.STATS_SUFFIX}
        </Text>
      </View>

      {/* Odaklanılan Ders Seçimi */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{LABELS.SELECT_COURSE}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courseScroll}>
        {COURSES_LIST.map((c, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.courseChip,
              { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
              selectedCourse === c && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setSelectedCourse(c)}
            activeOpacity={0.8}
          >
            <Text style={[styles.courseChipText, { color: colors.text }, selectedCourse === c && { color: "#FFFFFF" }]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Mod Seçim Butonları */}
      <View style={[styles.modeRow, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === "pomodoro" && { backgroundColor: colors.primary }]}
          onPress={() => handleModeChange("pomodoro")}
        >
          <Text style={[styles.modeBtnText, { color: colors.subText }, mode === "pomodoro" && { color: "#FFFFFF" }]}>
            {LABELS.MODE_POMODORO}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === "short" && { backgroundColor: colors.primary }]}
          onPress={() => handleModeChange("short")}
        >
          <Text style={[styles.modeBtnText, { color: colors.subText }, mode === "short" && { color: "#FFFFFF" }]}>
            {LABELS.MODE_SHORT}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === "long" && { backgroundColor: colors.primary }]}
          onPress={() => handleModeChange("long")}
        >
          <Text style={[styles.modeBtnText, { color: colors.subText }, mode === "long" && { color: "#FFFFFF" }]}>
            {LABELS.MODE_LONG}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Büyük Zaman Sayacı (Timer Display) */}
      <View style={[styles.timerCard, { backgroundColor: colors.cardBg, borderColor: isActive ? colors.accent : colors.primary }]}>
        <Text style={[styles.timerText, { color: isActive ? colors.accent : colors.text }]}>
          {formatTime(timeLeft)}
        </Text>
        <Text style={[styles.timerSub, { color: colors.subText }]}>
          {mode === "pomodoro" ? "Odaklanma Süresi" : "Dinlenme & Mola Süresi"}
        </Text>
      </View>

      {/* İpucu / Durum Sözü */}
      <View style={[styles.quoteBox, { backgroundColor: isActive ? colors.primaryLight : colors.inputBg, borderColor: isActive ? colors.primary : colors.inputBorder }]}>
        <Text style={[styles.quoteText, { color: isActive ? colors.primary : colors.subText }]}>
          {isActive ? LABELS.QUOTE_ACTIVE : LABELS.QUOTE_IDLE}
        </Text>
      </View>

      {/* Kontrol Butonları */}
      <View style={styles.controlRow}>
        <TouchableOpacity
          style={[styles.mainBtn, { backgroundColor: isActive ? colors.warning : colors.primary }]}
          onPress={() => setIsActive(!isActive)}
          activeOpacity={0.85}
        >
          <Text style={styles.mainBtnText}>{isActive ? LABELS.PAUSE : LABELS.START}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.resetBtn, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
          onPress={handleReset}
          activeOpacity={0.85}
        >
          <Text style={[styles.resetBtnText, { color: colors.text }]}>{LABELS.RESET}</Text>
        </TouchableOpacity>
      </View>

      {/* Test / Simülasyon Butonu */}
      <TouchableOpacity
        style={[styles.simBtn, { backgroundColor: colors.accentLight, borderColor: colors.accent }]}
        onPress={() => {
          setIsActive(false);
          setTimeLeft(0);
          handleSessionComplete();
        }}
        activeOpacity={0.85}
      >
        <Text style={[styles.simBtnText, { color: colors.accent }]}>{LABELS.SIMULATE}</Text>
      </TouchableOpacity>

      {/* Başarı Kutlama Modalı */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.accent }]}>
            <Text style={styles.modalIcon}>🏆</Text>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{LABELS.MODAL_TITLE}</Text>
            <Text style={[styles.modalDesc, { color: colors.subText }]}>{LABELS.MODAL_DESC}</Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.accent }]}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalBtnText}>{LABELS.MODAL_CLOSE}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, paddingBottom: 60 },
  headerCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  statsBadge: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 18,
  },
  statsText: { fontSize: 14, fontWeight: "700" },
  sectionTitle: { fontSize: 14, fontWeight: "800", marginBottom: 10 },
  courseScroll: { flexDirection: "row", marginBottom: 18 },
  courseChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  courseChipText: { fontSize: 12, fontWeight: "700" },
  modeRow: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  modeBtnText: { fontSize: 12, fontWeight: "800" },
  timerCard: {
    paddingVertical: 48,
    borderRadius: 100,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    alignSelf: "center",
    width: 260,
    height: 260,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  timerText: { fontSize: 54, fontWeight: "900", letterSpacing: 2 },
  timerSub: { fontSize: 13, fontWeight: "700", marginTop: 4 },
  quoteBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  quoteText: { fontSize: 12, fontWeight: "600", textAlign: "center", lineHeight: 18 },
  controlRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  mainBtn: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  mainBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  resetBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  resetBtnText: { fontSize: 15, fontWeight: "800" },
  simBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  simBtnText: { fontSize: 13, fontWeight: "800" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
  },
  modalIcon: { fontSize: 48, marginBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: "900", marginBottom: 8, textAlign: "center" },
  modalDesc: { fontSize: 13, textAlign: "center", marginBottom: 20, lineHeight: 18 },
  modalBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalBtnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },
});
