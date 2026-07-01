import { NeoButton, NeoInput } from "@/components/NeoKit";
import { COLORS, STATUS_COLORS } from "@/constants/theme";
import { auth, db } from "@/src/lib/firebase";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { router } from "expo-router";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import { registerForPushNotificationsAsync, saveTokenToFirestore } from "@/src/services/notificationService";
import { useTheme } from "@/src/context/ThemeContext";
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

export default function RegisterScreen() {
  const { colors, isDark } = useTheme();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert("Error", "Harap isi semua field!");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Simpan data profil awal ke Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username: username,
        email: email,
        createdAt: new Date().toISOString(),
      });

      // Minta izin dan simpan push token
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await saveTokenToFirestore(user.uid, token);
      }

      // Langsung arahkan ke profile karena Firebase Auth otomatis login setelah register
      router.replace("/(tabs)/profile");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Gagal Daftar", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {

    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Sign-out sesi Google sebelumnya agar Account Picker selalu muncul
      await GoogleSignin.signOut();

      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error("Tidak ada token ID yang diterima dari Google.");
      }

      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      const user = userCredential.user;

      // Simpan/update data profil awal ke Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          displayName: user.displayName || "Pengguna Google",
          email: user.email,
          createdAt: new Date().toISOString(),
        },
        { merge: true },
      );

      // Minta izin dan simpan push token
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        await saveTokenToFirestore(user.uid, pushToken);
      }

      router.replace("/(tabs)/profile");
    } catch (error: any) {
      console.error(error);
      if (error.code !== "SIGN_IN_CANCELLED") {
        Alert.alert("Gagal Daftar via Google", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Buat Akun</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>Mulai perjalanan anime kamu!</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Username</Text>
            <NeoInput
              placeholder="Username"
              placeholderTextColor={colors.textMuted}
              value={username}
              onChangeText={setUsername}
            />
          </View>

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
              placeholder="Minimal 6 karakter"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <NeoButton
            title={isLoading ? "Memproses..." : "Daftar"}
            color={isLoading ? STATUS_COLORS.DEFAULT : STATUS_COLORS.ON_AIR}
            onPress={isLoading ? undefined : handleRegister}
            style={{ width: "100%", marginTop: 12 }}
          />

          <NeoButton
            title={isLoading ? "Memproses..." : "Daftar dengan Google (G)"}
            color={isLoading ? STATUS_COLORS.DEFAULT : "#fff"}
            onPress={isLoading ? undefined : handleGoogleRegister}
            style={{ width: "100%" }}
            textStyle={{ color: "#000", fontWeight: "bold" }}
          />

          <View style={{ alignItems: "center", marginTop: 16 }}>
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)/profile/login")}
            >
              <Text style={[styles.linkText, { color: colors.text }]}>
                Sudah punya akun? Masuk di sini
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
    backgroundColor: COLORS.PRIMARY,
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
