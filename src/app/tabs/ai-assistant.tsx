import { useState } from "react";
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
import { useTheme } from "../../context/ThemeContext";

const LABELS = {
  TITLE: "🤖 Kampüs AI",
  SUBTITLE: "7/24 Yapay Zeka Destekli Akademik Asistan",
  INPUT_PLACEHOLDER: "Kampüs AI'a bir soru sor...",
  SEND_BTN: "Gönder",
  QUICK_TITLE: "⚡ Hızlı Sorular",
  TYPING: "Kampüs AI düşünüyor...",
  AI_NAME: "Kampüs AI",
  USER_NAME: "Sen",
} as const;

const QUICK_QUESTIONS = [
  "📊 GANO ortalamamı nasıl 3.20 üzerine çıkarırım?",
  "📚 Bölümüm için hangi seçmeli dersleri önerirsin?",
  "🗓️ Vize ve final dönemi için çalışma takvimi yap",
  "💡 Kütüphane ve çalışma salonu doluluk durumu nedir?",
] as const;

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  time: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    sender: "ai",
    text: "Merhaba! Ben Kampüs AI, senin dijital akademik asistanınım. 🎓 Not ortalaman, ders seçimlerin, kampüs imkanları veya çalışma teknikleri hakkında bana dilediğini sorabilirsin. Nasıl yardımcı olabilirim?",
    time: "Şimdi",
  },
];

export default function AiAssistantScreen() {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const getAiResponse = (query: string): string => {
    const lower = query.toLowerCase();
    if (lower.includes("gano") || lower.includes("ortalam") || lower.includes("not") || lower.includes("3.20")) {
      return "📈 GANO Analizi & Hedef:\n\nMevcut not kartını ve hedeflerini inceledim! Ortalamannı 3.20 üzerine taşımak için:\n1. Kredisi yüksek olan alan derslerinden (3 kredi ve üzeri) en az BA veya AA hedeflemelisin.\n2. Vize ağırlığı %40 olan derslerde ilk sınavlardan 75+ alarak final yükünü hafifletebilirsin.\n3. 'Not Kartı' sekmemizdeki GANO Simülasyonunu açarak 'What-If' senaryolarını test edebilirsin!";
    }
    if (lower.includes("seçmeli") || lower.includes("ders") || lower.includes("öner")) {
      return "📚 Seçmeli Ders Tavsiyesi:\n\nBölüm müfredatına ve güncel sektör trendlerine göre şu 3 stratejik alanı öneririm:\n• Yapay Zeka & Veri Bilimi (Kariyer ivmesi sağlar)\n• Mobil Uygulama Geliştirme (Sektörel proje imkanı)\n• Teknoloji Girişimciliği & İnovasyon\n\nBu dersler hem analitik düşünmeni geliştirir hem de mezuniyet sonrası portföyünü güçlendirir!";
    }
    if (lower.includes("takvim") || lower.includes("çalışma") || lower.includes("vize") || lower.includes("final")) {
      return "🗓️ Akıllı Çalışma Stratejisi:\n\n1. Pomodoro Tekniği: 25 Dk Odak + 5 Dk Mola şeklinde bloklar oluştur.\n2. Günün İlk Saatleri: Analitik ve zor dersleri (Matematik, Algoritma vb.) zihnin tazeyken sabah saatlerinde çalış.\n3. Odak Modu: Portalımızdaki 'Odak & Pomodoro' sekmesinden sayacını başlatarak telefon bildirimlerinden uzaklaş ve kampüs puanı kazan!";
    }
    if (lower.includes("kütüphane") || lower.includes("doluluk") || lower.includes("salon") || lower.includes("ortam")) {
      return "💡 Canlı Kampüs & Kütüphane Verisi:\n\n• Merkez Kütüphane: %68 Dolu (Sakin ve ideal)\n• 2. Kat Sessiz Okuma Salonu: Boş masalar mevcut 🟢\n• Öğrenci Merkezi Çalışma Alanı: %85 Dolu 🔴\n\n👉 Tavsiye: 2. kat B blok şu an sessizce odaklanarak çalışmak için en mükemmel yer!";
    }
    return "🤖 Kampüs AI:\n\nSorunu aldım! Akademik yolculuğunda sana rehberlik etmek için buradayım. Ders programını, ödev son teslim tarihlerini ve danışman randevularını portal üzerinden takip etmeyi, odak modumuzu kullanarak verimliliğini artırmayı unutma!";
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: text.trim(),
      time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal("");
    setIsTyping(true);

    setTimeout(() => {
      const aiReplyText = getAiResponse(text);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: aiReplyText,
        time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={styles.headerIcon}>🤖</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>{LABELS.TITLE}</Text>
          <Text style={[styles.subtitle, { color: colors.subText }]}>{LABELS.SUBTITLE}</Text>
        </View>
      </View>

      {/* Hızlı Sorular (Suggestion Chips) */}
      <View style={styles.quickBox}>
        <Text style={[styles.quickTitle, { color: colors.subText }]}>{LABELS.QUICK_TITLE}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll}>
          {QUICK_QUESTIONS.map((q, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.quickChip, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
              onPress={() => handleSendMessage(q)}
              activeOpacity={0.8}
            >
              <Text style={[styles.quickChipText, { color: colors.primary }]}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Mesaj Listesi */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        renderItem={({ item }) => {
          const isAi = item.sender === "ai";
          return (
            <View
              style={[
                styles.msgBubble,
                isAi
                  ? [styles.aiBubble, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]
                  : [styles.userBubble, { backgroundColor: colors.primary }],
              ]}
            >
              <View style={styles.msgHeader}>
                <Text style={[styles.senderName, isAi ? { color: colors.accent } : { color: "#E0F2FE" }]}>
                  {isAi ? LABELS.AI_NAME : LABELS.USER_NAME}
                </Text>
                <Text style={[styles.msgTime, isAi ? { color: colors.subText } : { color: "#BAE6FD" }]}>
                  {item.time}
                </Text>
              </View>
              <Text style={[styles.msgText, isAi ? { color: colors.text } : { color: "#FFFFFF" }]}>
                {item.text}
              </Text>
            </View>
          );
        }}
      />

      {/* Typing Indicator */}
      {isTyping ? (
        <View style={[styles.typingBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.typingText, { color: colors.subText }]}>{LABELS.TYPING}</Text>
        </View>
      ) : null}

      {/* Giriş Alanı */}
      <View style={[styles.inputRow, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text },
          ]}
          placeholder={LABELS.INPUT_PLACEHOLDER}
          placeholderTextColor={colors.subText}
          value={inputVal}
          onChangeText={setInputVal}
          onSubmitEditing={() => handleSendMessage()}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: colors.primary }]}
          onPress={() => handleSendMessage()}
          activeOpacity={0.85}
        >
          <Text style={styles.sendBtnText}>{LABELS.SEND_BTN}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerIcon: { fontSize: 28, marginRight: 12 },
  title: { fontSize: 18, fontWeight: "800" },
  subtitle: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  quickBox: { paddingVertical: 10, paddingHorizontal: 16 },
  quickTitle: { fontSize: 12, fontWeight: "700", marginBottom: 8 },
  quickScroll: { flexDirection: "row" },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  quickChipText: { fontSize: 12, fontWeight: "700" },
  chatList: { padding: 16, paddingBottom: 24 },
  msgBubble: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: "85%",
  },
  aiBubble: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  msgHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  senderName: { fontSize: 12, fontWeight: "800" },
  msgTime: { fontSize: 10, fontWeight: "600" },
  msgText: { fontSize: 14, lineHeight: 20 },
  typingBox: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginLeft: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  typingText: { fontSize: 12, fontWeight: "600", fontStyle: "italic" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginRight: 10,
  },
  sendBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
});
