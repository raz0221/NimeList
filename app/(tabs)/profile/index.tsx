import { Neubrutalism } from "@/constants/theme";
import { Image } from "expo-image";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function ProfileScreen() {
  // Mock login state for index overview. Real login is in /login
  const isLoggedIn = false; 

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#111827", dark: "#0F172A" }}
      headerImage={
        <Image
          source={{ uri: "https://4kwallpapers.com/images/walls/thumbs_3t/16712.jpg" }}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Pusat Akun</ThemedText>
      </ThemedView>

      {!isLoggedIn ? (
        <View style={styles.authContainer}>
          <ThemedText style={styles.slogan}>Anda belum masuk. Silakan login untuk fitur lengkap.</ThemedText>
          <TouchableOpacity style={styles.button} onPress={() => router.push("/profile/login")}>
            <ThemedText style={styles.buttonText}>Masuk / Login</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, {backgroundColor: '#FFD166'}]} onPress={() => router.push("/profile/register")}>
            <ThemedText style={styles.buttonText}>Daftar Akun Baru</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <ThemedText style={styles.slogan}>Selamat datang kembali!</ThemedText>
      )}

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/profile/edit")}>
          <ThemedText style={styles.menuText}>✏️ Edit Profil</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/profile/settings")}>
          <ThemedText style={styles.menuText}>⚙️ Pengaturan Aplikasi</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/profile/contact")}>
          <ThemedText style={styles.menuText}>📞 Hubungi Kami</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/profile/about")}>
          <ThemedText style={styles.menuText}>ℹ️ Tentang Aplikasi</ThemedText>
        </TouchableOpacity>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  slogan: { color: "#6B7280", fontSize: 16, marginBottom: 20, fontWeight: "bold" },
  authContainer: { marginBottom: 30, gap: 12 },
  button: { height: 50, backgroundColor: "#06D6A0", ...Neubrutalism, justifyContent: "center", alignItems: "center" },
  buttonText: { color: "#000000", fontSize: 16, fontWeight: "900" },
  headerImage: { height: "100%", width: "100%", bottom: 0, left: 0, position: "absolute" },
  menuContainer: { gap: 12 },
  menuItem: { backgroundColor: "#FFFFFF", padding: 16, ...Neubrutalism },
  menuText: { fontSize: 16, fontWeight: "900", color: "#000000" },
});
