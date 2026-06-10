import { Neubrutalism } from "@/constants/theme";
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";

const NEWS_DATA = [
  { id: "1", title: "Adaptasi Anime Baru untuk Manga Populer 'Dandadan' Diumumkan", date: "10 Juni 2026", category: "Pengumuman" },
  { id: "2", title: "Jadwal Tayang Demon Slayer Season Berikutnya Mengalami Penundaan", date: "8 Juni 2026", category: "Update" },
  { id: "3", title: "Wawancara Eksklusif dengan Sutradara Makoto Shinkai", date: "5 Juni 2026", category: "Wawancara" },
];

export default function NewsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={{fontWeight: '900', color: '#000'}}>← Kembali</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Berita Anime Terbaru</ThemedText>
      </View>

      <View style={styles.newsList}>
        {NEWS_DATA.map((news) => (
          <TouchableOpacity 
            key={news.id} 
            style={styles.newsCard}
            onPress={() => Alert.alert("Baca Berita", `Membuka artikel: ${news.title}`)}
          >
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>{news.category}</ThemedText>
            </View>
            <ThemedText style={styles.newsTitle}>{news.title}</ThemedText>
            <ThemedText style={styles.newsDate}>{news.date}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 20 },
  header: { marginBottom: 24, marginTop: 40 },
  backButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#FFD166', alignSelf: 'flex-start', marginBottom: 16, ...Neubrutalism },
  newsList: { gap: 20, paddingBottom: 40 },
  newsCard: { backgroundColor: "#FFFFFF", padding: 20, ...Neubrutalism },
  badge: { alignSelf: 'flex-start', backgroundColor: "#EF476F", paddingHorizontal: 8, paddingVertical: 4, marginBottom: 8, ...Neubrutalism },
  badgeText: { color: "#FFF", fontSize: 12, fontWeight: "bold" },
  newsTitle: { fontSize: 18, fontWeight: "900", color: "#000", marginBottom: 12, lineHeight: 24 },
  newsDate: { fontSize: 14, color: "#6B7280", fontWeight: "bold" },
});
