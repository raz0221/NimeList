import { NeoButton, NeoInput, NeoModal } from "@/components/NeoKit";
import { COLORS, STATUS_COLORS } from "@/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { auth } from "@/src/lib/firebase";
import {
  registerForPushNotificationsAsync,
  saveTokenToFirestore,
} from "@/src/services/notificationService";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { router } from "expo-router";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
} from "firebase/auth";
import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const WEB_CLIENT_ID =
  "963055544710-fsc5frmrsj4v45tj81cl2bl52iq4ic48.apps.googleusercontent.com";

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
});

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: "",
    message: "",
  });

  const handleLogin = async () => {
    if (!email || !password) {
      setModalConfig({
        visible: true,
        title: "Error",
        message: "Harap isi email dan password!",
      });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Minta izin dan simpan push token
      const token = await registerForPushNotificationsAsync();
      if (token && userCredential.user) {
        await saveTokenToFirestore(userCredential.user.uid, token);
      }

      // Jika berhasil, arahkan ke tab profile untuk me-reset stack login
      router.replace("/(tabs)/profile");
    } catch (error: any) {
      console.error(error);
      setModalConfig({
        visible: true,
        title: "Gagal Masuk",
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Pastikan ada dukungan Google Play Services
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Sign-out sesi Google sebelumnya agar Account Picker selalu muncul
      await GoogleSignin.signOut();

      // Mulai proses Sign-In Google
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error("Tidak ada token ID yang diterima dari Google.");
      }

      // Buat credential Firebase dan Sign-In
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);

      // Minta izin dan simpan push token
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken && userCredential.user) {
        await saveTokenToFirestore(userCredential.user.uid, pushToken);
      }

      // Jika berhasil, arahkan ke tab profile untuk me-reset stack login
      router.replace("/(tabs)/profile");
    } catch (error: any) {
      console.error(
        "[Google Sign-In Error]",
        JSON.stringify({
          code: error.code,
          message: error.message,
        }),
      );

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // Pengguna menutup dialog — abaikan
      } else if (error.code === statusCodes.IN_PROGRESS) {
        setModalConfig({
          visible: true,
          title: "Sedang Diproses",
          message: "Login Google sedang berlangsung, harap tunggu.",
        });
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setModalConfig({
          visible: true,
          title: "Google Play Tidak Tersedia",
          message: "Perbarui Google Play Services di perangkat Anda.",
        });
      } else {
        // DEVELOPER_ERROR (kode 10): SHA-1 release belum terdaftar di Firebase Console
        // atau google-services.json belum didownload ulang setelah SHA ditambahkan.
        setModalConfig({
          visible: true,
          title: "Gagal Masuk via Google",
          message: `[Kode: ${error.code ?? "UNKNOWN"}] ${error.message}`,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <NeoModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalConfig({ ...modalConfig, visible: false })}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Selamat Datang!
          </Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Masuk untuk melihat watchlist anime-mu.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <NeoInput
              placeholder="contoh@email.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <NeoInput
              placeholder="Masukkan password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <NeoButton
            title={isLoading ? "Memproses..." : "Masuk"}
            color={isLoading ? STATUS_COLORS.UPCOMING : COLORS.ACCENT}
            onPress={isLoading ? undefined : handleLogin}
            style={{ width: "100%", marginTop: 12 }}
          />

          <NeoButton
            title={isLoading ? "Memproses..." : "Masuk dengan Google (G)"}
            color={isLoading ? STATUS_COLORS.UPCOMING : "#fff"}
            onPress={isLoading ? undefined : handleGoogleLogin}
            style={{ width: "100%" }}
            textStyle={{ color: "#000", fontWeight: "bold" }}
          />

          <View style={{ alignItems: "center", marginTop: 16 }}>
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)/profile/register")}
            >
              <Text style={[styles.linkText, { color: colors.text }]}>
                Belum punya akun? Daftar di sini
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: STATUS_COLORS.ON_AIR,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: COLORS.TEXT_MAIN,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.TEXT_MAIN,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.TEXT_MAIN,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.TEXT_MAIN,
    textDecorationLine: "underline",
  },
});
