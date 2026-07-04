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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{LABELS.TITLE}</Text>
      <Text style={styles.subtitle}>{LABELS.SUBTITLE}</Text>

      {/* Belge Talep Butonları */}
      <View style={styles.reqRow}>
        <TouchableOpacity
          style={styles.reqBtn}
          onPress={() => handleRequestDoc("Öğrenci Belgesi")}
          disabled={reqLoading}
        >
          <Text style={styles.reqBtnText}>{LABELS.REQ_CERT}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.reqBtn, styles.reqBtnAlt]}
          onPress={() => handleRequestDoc("Transkript")}
          disabled={reqLoading}
        >
          <Text style={[styles.reqBtnText, styles.reqBtnAltText]}>{LABELS.REQ_TRANS}</Text>
        </TouchableOpacity>
      </View>
      {reqLoading ? <ActivityIndicator style={{ marginBottom: 12 }} color="#3B82F6" /> : null}

      {/* Belge Doğrulama Kutusu */}
      <View style={styles.verifyBox}>
        <Text style={styles.verifyTitle}>{LABELS.VERIFY_TITLE}</Text>
        <View style={styles.verifyRow}>
          <TextInput
            style={styles.verifyInput}
            placeholder={LABELS.VERIFY_INPUT_PLACEHOLDER}
            placeholderTextColor="#64748B"
            value={verifyCodeInput}
            onChangeText={setVerifyCodeInput}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={styles.verifyBtn}
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

        {verifyError ? <Text style={styles.verifyError}>{verifyError}</Text> : null}

        {verifyResult && verifyResult.valid ? (
          <View style={styles.verifySuccessBox}>
            <Text style={styles.verifySuccessTitle}>✅ Orijinal Resmi Belge</Text>
            <Text style={styles.verifyText}>Belge Türü: {verifyResult.document_type}</Text>
            <Text style={styles.verifyText}>
              Öğrenci: {verifyResult.student_info?.first_name} {verifyResult.student_info?.last_name} ({verifyResult.student_info?.student_no})
            </Text>
            <Text style={styles.verifyText}>Bölüm: {verifyResult.student_info?.department}</Text>
          </View>
        ) : null}
      </View>

      {/* Belge Listesi */}
      <Text style={styles.sectionTitle}>Talep Edilen Belgelerim & İlerleme</Text>
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>{LABELS.EMPTY_LIST}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.docType}>{item.document_type}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            {/* Canlı Belge Talep Takip Barı (Progress Stepper) */}
            <View style={styles.stepperContainer}>
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, styles.stepActive]}>
                  <Text style={styles.stepCheck}>✓</Text>
                </View>
                <Text style={styles.stepLabel}>{LABELS.STEP_1}</Text>
              </View>
              <View style={[styles.stepLine, styles.stepLineActive]} />

              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, styles.stepActive]}>
                  <Text style={styles.stepCheck}>✓</Text>
                </View>
                <Text style={styles.stepLabel}>{LABELS.STEP_2}</Text>
              </View>
              <View style={[styles.stepLine, styles.stepLineActive]} />

              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, item.status === "Hazır" ? styles.stepActive : styles.stepPending]}>
                  <Text style={styles.stepCheck}>{item.status === "Hazır" ? "✓" : "⌛"}</Text>
                </View>
                <Text style={styles.stepLabel}>{LABELS.STEP_3}</Text>
              </View>
            </View>

            <View style={styles.codeRow}>
              <Text style={styles.codeLabel}>Doğrulama Kodu: </Text>
              <Text style={styles.codeText}>{item.verification_code}</Text>
            </View>
            <Text style={styles.dateText}>
              Tarih: {new Date(item.created_at || Date.now()).toLocaleDateString("tr-TR")}
            </Text>

            <TouchableOpacity
              style={styles.qrButton}
              onPress={() => setSelectedDoc(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.qrButtonText}>📲 QR Barkod ve Detayı Göster</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* QR Doğrulama Modalı */}
      <Modal visible={!!selectedDoc} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{LABELS.QR_TITLE}</Text>
            <View style={styles.qrBox}>
              <Text style={styles.qrIcon}>📱 [ QR CODE ]</Text>
              <Text style={styles.qrCodeText}>{selectedDoc?.verification_code}</Text>
            </View>
            <Text style={styles.modalDesc}>
              Bu barkod / doğrulama kodu ile üçüncü kurumlar ve işverenler belgenin gerçekliğini evrak sorgulama sistemimiz üzerinden anında teyit edebilirler.
            </Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelectedDoc(null)}
            >
              <Text style={styles.closeBtnText}>{LABELS.CLOSE}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#0F172A" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0F172A" },
  title: { fontSize: 22, fontWeight: "800", color: "#FFFFFF", marginBottom: 6 },
  subtitle: { fontSize: 13, color: "#94A3B8", marginBottom: 18 },
  reqRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  reqBtn: {
    flex: 1,
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  reqBtnText: { color: "#FFF", fontWeight: "700", fontSize: 13 },
  reqBtnAlt: { backgroundColor: "rgba(16, 185, 129, 0.2)", borderWidth: 1, borderColor: "#10B981" },
  reqBtnAltText: { color: "#34D399" },
  verifyBox: {
    backgroundColor: "rgba(30, 41, 59, 0.85)",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 20,
  },
  verifyTitle: { color: "#E2E8F0", fontSize: 14, fontWeight: "700", marginBottom: 10 },
  verifyRow: { flexDirection: "row", gap: 8 },
  verifyInput: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#FFF",
    fontSize: 14,
  },
  verifyBtn: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 10,
  },
  verifyBtnText: { color: "#FFF", fontWeight: "700", fontSize: 13 },
  verifyError: { color: "#F87171", fontSize: 13, marginTop: 8 },
  verifySuccessBox: {
    marginTop: 12,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  verifySuccessTitle: { color: "#34D399", fontWeight: "700", marginBottom: 4 },
  verifyText: { color: "#E2E8F0", fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#FFF", marginBottom: 12 },
  listContainer: { paddingBottom: 60 },
  emptyCard: {
    backgroundColor: "rgba(30, 41, 59, 0.4)",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  emptyText: { color: "#64748B", fontSize: 14 },
  card: {
    backgroundColor: "rgba(30, 41, 59, 0.85)",
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  docType: { fontSize: 16, fontWeight: "800", color: "#FFF" },
  statusBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  statusText: { color: "#34D399", fontSize: 12, fontWeight: "700" },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(15, 23, 42, 0.5)",
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
  stepActive: { backgroundColor: "#10B981" },
  stepPending: { backgroundColor: "#F59E0B" },
  stepCheck: { color: "#FFF", fontSize: 12, fontWeight: "bold" },
  stepLabel: { color: "#CBD5E1", fontSize: 10, fontWeight: "600", textAlign: "center" },
  stepLine: { height: 2, flex: 0.5, backgroundColor: "#334155", marginBottom: 14 },
  stepLineActive: { backgroundColor: "#10B981" },
  codeRow: { flexDirection: "row", marginBottom: 4 },
  codeLabel: { color: "#94A3B8", fontSize: 13 },
  codeText: { color: "#60A5FA", fontSize: 13, fontWeight: "700" },
  dateText: { color: "#64748B", fontSize: 12, marginBottom: 14 },
  qrButton: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderWidth: 1,
    borderColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  qrButtonText: { color: "#60A5FA", fontWeight: "700", fontSize: 13 },
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
    backgroundColor: "#1E293B",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.5)",
    alignItems: "center",
  },
  modalTitle: { color: "#FFF", fontSize: 18, fontWeight: "800", marginBottom: 16 },
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
  qrCodeText: { color: "#3B82F6", fontWeight: "800", fontSize: 12, textAlign: "center" },
  modalDesc: { color: "#94A3B8", fontSize: 12, textAlign: "center", marginBottom: 20, lineHeight: 18 },
  closeBtn: {
    backgroundColor: "#334155",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  closeBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});
