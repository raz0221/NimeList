import { Neubrutalism } from "@/constants/theme";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={{fontWeight: '900', color: '#000'}}>← Kembali</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Tentang Aplikasi</ThemedText>
      </View>

      <View style={styles.card}>
        <ThemedText style={styles.title}>AniTrack v1.0.0</ThemedText>
        <ThemedText style={styles.desc}>
          AniTrack adalah aplikasi pelacakan anime dengan desain Neubrutalism. Dibangun menggunakan React Native dan Expo Router.
        </ThemedText>
        <ThemedText style={styles.desc}>
          © 2026 AniTrack Project. Semua hak cipta dilindungi.
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 20 },
  header: { marginBottom: 24, marginTop: 40 },
  backButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#FFD166', alignSelf: 'flex-start', marginBottom: 16, ...Neubrutalism },
  card: { backgroundColor: "#FFF", padding: 24, ...Neubrutalism },
  title: { fontSize: 20, fontWeight: "900", color: "#000", marginBottom: 12 },
  desc: { fontSize: 16, color: "#374151", marginBottom: 16, lineHeight: 24 }
});
