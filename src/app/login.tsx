import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { checkEmail, login, register } from "../services/api";

type Step = "email" | "set-password" | "login";

const STORAGE_KEYS = {
  TOKEN: "token",
  STUDENT: "student",
  SAVED_EMAIL: "saved_email",
} as const;

const LABELS = {
  APP_TITLE: "Akademik Portal",
  APP_SUBTITLE: "Geleceğin Dijital Kampüs Platformu",
  BIOMETRIC_BTN: "👆 Biyometrik / Yüz Tanıma ile Giriş",
  EMAIL_PLACEHOLDER: "Kurumsal E-posta Adresiniz",
  PASS_PLACEHOLDER: "Şifreniz",
  NEW_PASS_PLACEHOLDER: "Yeni Şifre Belirleyin",
  BTN_CONTINUE: "Devam Et",
  BTN_LOGIN: "Giriş Yap",
  BTN_SET_PASS: "Şifre Belirle & Giriş Yap",
  BTN_BACK: "← Geri Dön",
  ERR_EMAIL_NOT_FOUND: "Bu e-posta adresi sistemde kayıtlı değil.",
  ERR_BIOMETRIC_FAIL: "Biyometrik doğrulama başarısız oldu.",
  ERR_BIOMETRIC_NO_PASS: "Önce şifrenizle giriş yapıp cihazı kaydetmelisiniz.",
  ERR_GENERIC: "Bir hata oluştu, lütfen tekrar deneyin.",
  HINT_SET_PASS: "İlk girişiniz: Lütfen hesabınız için güvenli bir şifre belirleyin.",
  HINT_LOGIN: "Lütfen kurumsal hesabınızın şifresini girin.",
} as const;

export default function LoginScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      const savedEmail = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_EMAIL);

      if (compatible && enrolled) {
        setIsBiometricAvailable(true);
      }
      if (storedToken && savedEmail) {
        setHasStoredCredentials(true);
        setEmail(savedEmail);
      }
    } catch (e) {
      // Biometric check failed silently
    }
  };

  const handleBiometricAuth = async () => {
    setError("");
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Akademik Portala Güvenli Giriş",
        fallbackLabel: "Şifre Kullan",
      });

      if (result.success) {
        const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        if (storedToken) {
          router.replace("/tabs");
        } else {
          setError(LABELS.ERR_BIOMETRIC_NO_PASS);
        }
      } else {
        setError(LABELS.ERR_BIOMETRIC_FAIL);
      }
    } catch (err) {
      setError(LABELS.ERR_BIOMETRIC_FAIL);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await checkEmail(email.trim());
      if (!res.data.exists) {
        setError(LABELS.ERR_EMAIL_NOT_FOUND);
        return;
      }
      setStep(res.data.hasPassword ? "login" : "set-password");
    } catch (err) {
      setError(LABELS.ERR_GENERIC);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async () => {
    if (!password.trim()) return;
    setError("");
    setLoading(true);
    try {
      await register(email.trim(), password);
      setPassword("");
      setStep("login");
    } catch (err: any) {
      setError(err.response?.data?.error || LABELS.ERR_GENERIC);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!password.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, res.data.token);
      await AsyncStorage.setItem(STORAGE_KEYS.STUDENT, JSON.stringify(res.data.student));
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_EMAIL, email.trim());
      router.replace("/tabs");
    } catch (err: any) {
      setError(err.response?.data?.error || "Şifreniz hatalı, tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep("email");
    setPassword("");
    setError("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.backgroundCircleTop} />
      <View style={styles.backgroundCircleBottom} />

      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🎓</Text>
          </View>
          <Text style={styles.title}>{LABELS.APP_TITLE}</Text>
          <Text style={styles.subtitle}>{LABELS.APP_SUBTITLE}</Text>
        </View>

        {(isBiometricAvailable || hasStoredCredentials) && step === "email" && (
          <TouchableOpacity
            style={styles.biometricButton}
            onPress={handleBiometricAuth}
            activeOpacity={0.8}
          >
            <Text style={styles.biometricButtonText}>{LABELS.BIOMETRIC_BTN}</Text>
          </TouchableOpacity>
        )}

        {step === "email" && (
          <View style={styles.formSection}>
            <Text style={styles.label}>E-Posta Adresi</Text>
            <TextInput
              style={styles.input}
              placeholder={LABELS.EMAIL_PLACEHOLDER}
              placeholderTextColor="#64748B"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}
            <TouchableOpacity
              style={[styles.primaryButton, !email.trim() && styles.buttonDisabled]}
              onPress={handleEmailSubmit}
              disabled={loading || !email.trim()}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>{LABELS.BTN_CONTINUE}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === "set-password" && (
          <View style={styles.formSection}>
            <View style={styles.userBadge}>
              <Text style={styles.userBadgeText}>👤 {email}</Text>
            </View>
            <Text style={styles.hintText}>{LABELS.HINT_SET_PASS}</Text>
            <Text style={styles.label}>Yeni Şifre</Text>
            <TextInput
              style={styles.input}
              placeholder={LABELS.NEW_PASS_PLACEHOLDER}
              placeholderTextColor="#64748B"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}
            <TouchableOpacity
              style={[styles.primaryButton, !password.trim() && styles.buttonDisabled]}
              onPress={handleSetPassword}
              disabled={loading || !password.trim()}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>{LABELS.BTN_SET_PASS}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>{LABELS.BTN_BACK}</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === "login" && (
          <View style={styles.formSection}>
            <View style={styles.userBadge}>
              <Text style={styles.userBadgeText}>👤 {email}</Text>
            </View>
            <Text style={styles.hintText}>{LABELS.HINT_LOGIN}</Text>
            <Text style={styles.label}>Şifre</Text>
            <TextInput
              style={styles.input}
              placeholder={LABELS.PASS_PLACEHOLDER}
              placeholderTextColor="#64748B"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}
            <TouchableOpacity
              style={[styles.primaryButton, !password.trim() && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading || !password.trim()}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>{LABELS.BTN_LOGIN}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>{LABELS.BTN_BACK}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backgroundCircleTop: {
    position: "absolute",
    top: -100,
    left: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
  },
  backgroundCircleBottom: {
    position: "absolute",
    bottom: -100,
    right: -50,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "rgba(30, 41, 59, 0.85)",
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)",
  },
  logoIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
  biometricButton: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  biometricButtonText: {
    color: "#60A5FA",
    fontSize: 15,
    fontWeight: "600",
  },
  formSection: {
    width: "100%",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#CBD5E1",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  userBadge: {
    backgroundColor: "rgba(51, 65, 85, 0.5)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 14,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  userBadgeText: {
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "600",
  },
  hintText: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 16,
    lineHeight: 20,
  },
  errorText: {
    color: "#F87171",
    fontSize: 14,
    marginBottom: 14,
    fontWeight: "500",
  },
  primaryButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: "#475569",
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  backButtonText: {
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "600",
  },
});
