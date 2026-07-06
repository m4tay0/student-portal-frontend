import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getMyDocuments, requestDocument, verifyDocument } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";

const LABELS = {
  TITLE: "E-Belgeler & QR Doğrulama",
  SUBTITLE: "E-İmzalı resmi belgelerinizi anında oluşturun ve doğrulayın.",
  REQ_CERT: "📄 Öğrenci Belgesi Talep Et",
  REQ_TRANS: "📊 Transkript Talep Et",
  VERIFY_TITLE: "🔍 Belge Doğrulama Sorgusu",
  VERIFY_INPUT_PLACEHOLDER: "Örn: UNI-2026-ABC12345",
  VERIFY_BTN: "Doğrula",
  EMPTY_LIST: "Henüz oluşturulmuş bir belgeniz bulunmuyor.",
  CLOSE: "Kapat",
  QR_TITLE: "QR / E-İmza Doğrulama Kodu",
  STEP_1: "Talep Alındı",
  STEP_2: "E-İmza Onayı",
  STEP_3: "İndirime Hazır",
} as const;

const STORAGE_KEYS = {
  STUDENT: "student",
} as const;

export default function DocumentsScreen() {
  const { colors } = useTheme();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [reqLoading, setReqLoading] = useState(false);

  // Verification code check modal state
  const [verifyCodeInput, setVerifyCodeInput] = useState("");
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  // QR Modal state
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await AsyncStorage.getItem(STORAGE_KEYS.STUDENT);
      if (!data) return;
      const student = JSON.parse(data);
      setStudentId(student.id);
      const res = await getMyDocuments(student.id);
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDoc = async (type: "Öğrenci Belgesi" | "Transkript") => {
    if (!studentId) return;
    try {
      setReqLoading(true);
      await requestDocument({ student_id: studentId, document_type: type });
      await loadDocuments();
    } catch (err) {
      console.error(err);
    } finally {
      setReqLoading(false);
    }
  };

  const handleVerifySubmit = async () => {
    if (!verifyCodeInput.trim()) return;
    try {
      setVerifyLoading(true);
      setVerifyError("");
      setVerifyResult(null);
      const res = await verifyDocument(verifyCodeInput.trim());
      setVerifyResult(res.data);
    } catch (err: any) {
      setVerifyError(err.response?.data?.message || "Belge doğrulanamadı.");
    } finally {
      setVerifyLoading(false);
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
      <Text style={[styles.subtitle, { color: colors.subText }]}>{LABELS.SUBTITLE}</Text>

      {/* Belge Talep Butonları */}
      <View style={styles.reqRow}>
        <TouchableOpacity
          style={[styles.reqBtn, { backgroundColor: colors.primary }]}
          onPress={() => handleRequestDoc("Öğrenci Belgesi")}
          disabled={reqLoading}
        >
          <Text style={styles.reqBtnText}>{LABELS.REQ_CERT}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.reqBtn, { backgroundColor: colors.accentLight, borderColor: colors.accent, borderWidth: 1 }]}
          onPress={() => handleRequestDoc("Transkript")}
          disabled={reqLoading}
        >
          <Text style={[styles.reqBtnText, { color: colors.accent }]}>{LABELS.REQ_TRANS}</Text>
        </TouchableOpacity>
      </View>
      {reqLoading ? <ActivityIndicator style={{ marginBottom: 12 }} color={colors.primary} /> : null}

      {/* Belge Doğrulama Kutusu */}
      <View style={[styles.verifyBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.verifyTitle, { color: colors.text }]}>{LABELS.VERIFY_TITLE}</Text>
        <View style={styles.verifyRow}>
          <TextInput
            style={[styles.verifyInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder={LABELS.VERIFY_INPUT_PLACEHOLDER}
            placeholderTextColor={colors.subText}
            value={verifyCodeInput}
            onChangeText={setVerifyCodeInput}
            autoCapitalize="characters"
            onSubmitEditing={handleVerifySubmit}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={[styles.verifyBtn, { backgroundColor: colors.primary }]}
            onPress={handleVerifySubmit}
            disabled={verifyLoading}
          >
            {verifyLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.verifyBtnText}>{LABELS.VERIFY_BTN}</Text>
            )}
          </TouchableOpacity>
        </View>

        {verifyError ? <Text style={[styles.verifyError, { color: colors.error }]}>{verifyError}</Text> : null}

        {verifyResult && verifyResult.valid ? (
          <View style={[styles.verifySuccessBox, { backgroundColor: colors.accentLight, borderColor: colors.accent }]}>
            <Text style={[styles.verifySuccessTitle, { color: colors.accent }]}>✅ Orijinal Resmi Belge</Text>
            <Text style={[styles.verifyText, { color: colors.text }]}>Belge Türü: {verifyResult.document_type}</Text>
            <Text style={[styles.verifyText, { color: colors.text }]}>
              Öğrenci: {verifyResult.student_info?.first_name} {verifyResult.student_info?.last_name} ({verifyResult.student_info?.student_no})
            </Text>
            <Text style={[styles.verifyText, { color: colors.text }]}>Bölüm: {verifyResult.student_info?.department}</Text>
          </View>
        ) : null}
      </View>

      {/* Belge Listesi */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Talep Edilen Belgelerim & İlerleme</Text>
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={[styles.emptyCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.emptyText, { color: colors.subText }]}>{LABELS.EMPTY_LIST}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.docType, { color: colors.text }]}>{item.document_type}</Text>
              <View style={[styles.statusBadge, { backgroundColor: colors.accentLight, borderColor: colors.accent }]}>
                <Text style={[styles.statusText, { color: colors.accent }]}>{item.status}</Text>
              </View>
            </View>

            {/* Canlı Belge Talep Takip Barı (Progress Stepper) */}
            <View style={[styles.stepperContainer, { backgroundColor: colors.inputBg }]}>
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, { backgroundColor: colors.accent }]}>
                  <Text style={styles.stepCheck}>✓</Text>
                </View>
                <Text style={[styles.stepLabel, { color: colors.subText }]}>{LABELS.STEP_1}</Text>
              </View>
              <View style={[styles.stepLine, { backgroundColor: colors.accent }]} />

              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, { backgroundColor: colors.accent }]}>
                  <Text style={styles.stepCheck}>✓</Text>
                </View>
                <Text style={[styles.stepLabel, { color: colors.subText }]}>{LABELS.STEP_2}</Text>
              </View>
              <View style={[styles.stepLine, { backgroundColor: colors.accent }]} />

              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, item.status === "Hazır" ? { backgroundColor: colors.accent } : { backgroundColor: colors.warning }]}>
                  <Text style={styles.stepCheck}>{item.status === "Hazır" ? "✓" : "⌛"}</Text>
                </View>
                <Text style={[styles.stepLabel, { color: colors.subText }]}>{LABELS.STEP_3}</Text>
              </View>
            </View>

            <View style={styles.codeRow}>
              <Text style={[styles.codeLabel, { color: colors.subText }]}>Doğrulama Kodu: </Text>
              <Text style={[styles.codeText, { color: colors.primary }]}>{item.verification_code}</Text>
            </View>
            <Text style={[styles.dateText, { color: colors.subText }]}>
              Tarih: {new Date(item.created_at || Date.now()).toLocaleDateString("tr-TR")}
            </Text>

            <TouchableOpacity
              style={[styles.qrButton, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
              onPress={() => setSelectedDoc(item)}
              activeOpacity={0.8}
            >
              <Text style={[styles.qrButtonText, { color: colors.primary }]}>📲 QR Barkod ve Detayı Göster</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* QR Doğrulama Modalı */}
      <Modal visible={!!selectedDoc} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.primary }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{LABELS.QR_TITLE}</Text>
            <View style={styles.qrBox}>
              <Text style={styles.qrIcon}>📱 [ QR CODE ]</Text>
              <Text style={[styles.qrCodeText, { color: colors.primary }]}>{selectedDoc?.verification_code}</Text>
            </View>
            <Text style={[styles.modalDesc, { color: colors.subText }]}>
              Bu barkod / doğrulama kodu ile üçüncü kurumlar ve işverenler belgenin gerçekliğini evrak sorgulama sistemimiz üzerinden anında teyit edebilirler.
            </Text>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.cardBorder }]}
              onPress={() => setSelectedDoc(null)}
            >
              <Text style={[styles.closeBtnText, { color: colors.text }]}>{LABELS.CLOSE}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 6 },
  subtitle: { fontSize: 13, marginBottom: 18 },
  reqRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  reqBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    elevation: 4,
  },
  reqBtnText: { color: "#FFF", fontWeight: "700", fontSize: 13 },
  verifyBox: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  verifyTitle: { fontSize: 14, fontWeight: "700", marginBottom: 10 },
  verifyRow: { flexDirection: "row", gap: 8 },
  verifyInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  verifyBtn: {
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 10,
  },
  verifyBtnText: { color: "#FFF", fontWeight: "700", fontSize: 13 },
  verifyError: { fontSize: 13, marginTop: 8 },
  verifySuccessBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  verifySuccessTitle: { fontWeight: "700", marginBottom: 4 },
  verifyText: { fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12 },
  listContainer: { paddingBottom: 60 },
  emptyCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  emptyText: { fontSize: 14 },
  card: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  docType: { fontSize: 16, fontWeight: "800" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: { fontSize: 12, fontWeight: "700" },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  stepItem: { alignItems: "center", flex: 1 },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  stepCheck: { color: "#FFF", fontSize: 12, fontWeight: "bold" },
  stepLabel: { fontSize: 10, fontWeight: "600", textAlign: "center" },
  stepLine: { height: 2, flex: 0.5, marginBottom: 14 },
  codeRow: { flexDirection: "row", marginBottom: 4 },
  codeLabel: { fontSize: 13 },
  codeText: { fontSize: 13, fontWeight: "700" },
  dateText: { fontSize: 12, marginBottom: 14 },
  qrButton: {
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  qrButtonText: { fontWeight: "700", fontSize: 13 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 16 },
  qrBox: {
    width: 180,
    height: 180,
    backgroundColor: "#FFF",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    marginBottom: 16,
  },
  qrIcon: { color: "#0F172A", fontWeight: "800", fontSize: 18, marginBottom: 8 },
  qrCodeText: { fontWeight: "800", fontSize: 12, textAlign: "center" },
  modalDesc: { fontSize: 12, textAlign: "center", marginBottom: 20, lineHeight: 18 },
  closeBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  closeBtnText: { fontWeight: "700", fontSize: 15 },
});
