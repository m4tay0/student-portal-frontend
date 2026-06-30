import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { checkEmail, login, register } from "../services/api";

type Step = "email" | "set-password" | "login";

export default function LoginScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Adım 1: Email kontrolü
  const handleEmailSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await checkEmail(email);
      if (!res.data.exists) {
        setError("Bu email sistemde kayıtlı değil.");
        return;
      }
      // Şifresi varsa → login adımı, yoksa → şifre belirleme adımı
      setStep(res.data.hasPassword ? "login" : "set-password");
    } catch (err) {
      setError("Bir hata oluştu, tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // Adım 2a: Şifre belirleme (ilk kez)
  const handleSetPassword = async () => {
    setError("");
    setLoading(true);
    try {
      await register(email, password);
      // Şifre belirlendi → login adımına yönlendir
      setPassword("");
      setStep("login");
    } catch (err: any) {
      setError(err.response?.data?.error || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Adım 2b: Giriş yap
  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      await AsyncStorage.setItem("token", res.data.token);
      await AsyncStorage.setItem("student", JSON.stringify(res.data.student));
      router.replace("/tabs");
    } catch (err: any) {
      setError(err.response?.data?.error || "Şifre hatalı.");
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
    <View style={styles.container}>
      <Text style={styles.title}>Student Portal</Text>

      {/* ADIM 1: Email */}
      {step === "email" && (
        <>
          <TextInput
            style={styles.input}
            placeholder="E-posta adresinizi girin"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity
            style={styles.button}
            onPress={handleEmailSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Devam Et</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {/* ADIM 2a: Şifre Belirleme */}
      {step === "set-password" && (
        <>
          <Text style={styles.emailDisplay}>{email}</Text>
          <Text style={styles.subtitle}>
            Hesabınız için bir şifre belirleyin
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Yeni şifre"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Şifre Belirle</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={goBack}>
            <Text style={styles.back}>← Geri</Text>
          </TouchableOpacity>
        </>
      )}

      {/* ADIM 2b: Giriş Yap */}
      {step === "login" && (
        <>
          <Text style={styles.emailDisplay}>{email}</Text>
          <Text style={styles.subtitle}>Şifrenizi girin</Text>
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={goBack}>
            <Text style={styles.back}>← Geri</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    textAlign: "center",
  },
  emailDisplay: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2196F3",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  error: { color: "#f44336", marginBottom: 12, textAlign: "center" },
  back: { color: "#2196F3", textAlign: "center", marginTop: 16 },
});
