import { NeoButton, NeoInput } from "@/components/NeoKit";
import { COLORS, STATUS_COLORS } from "@/constants/theme";
import { auth } from "@/src/lib/firebase";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { router } from "expo-router";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
} from "firebase/auth";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const WEB_CLIENT_ID =
  "963055544710-fsc5frmrsj4v45tj81cl2bl52iq4ic48.apps.googleusercontent.com";

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
});

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Harap isi email dan password!");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Jika berhasil, arahkan ke profile
      router.replace("/(tabs)/profile");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Gagal Masuk", error.message);
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
      await signInWithCredential(auth, googleCredential);

      // Jika berhasil, arahkan ke profile
      router.replace("/(tabs)/profile");
    } catch (error: any) {
      console.error(error);
      if (error.code !== "SIGN_IN_CANCELLED") {
        Alert.alert("Gagal Masuk via Google", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Selamat Datang!</Text>
          <Text style={styles.subtitle}>
            Masuk untuk melihat watchlist anime-mu.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <NeoInput
              placeholder="contoh@email.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <NeoInput
              placeholder="Masukkan password"
              placeholderTextColor="#9CA3AF"
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
              <Text style={styles.linkText}>
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
