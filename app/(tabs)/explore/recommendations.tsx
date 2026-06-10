import { Neubrutalism } from "@/constants/theme";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

const DUMMY_RECOMMENDATIONS = [
  { id: "1", title: "Jujutsu Kaisen", img: "https://myanimelist.net/images/anime/1171/109222.jpg", genre: "Action, Supernatural", color: "#EF476F" },
  { id: "2", title: "Demon Slayer", img: "https://myanimelist.net/images/anime/1286/99889.jpg", genre: "Action, Fantasy", color: "#FFD166" },
  { id: "3", title: "Attack on Titan", img: "https://myanimelist.net/images/anime/10/47347.jpg", genre: "Action, Drama", color: "#06D6A0" },
  { id: "4", title: "Spy x Family", img: "https://myanimelist.net/images/anime/1441/122795.jpg", genre: "Action, Comedy", color: "#118AB2" },
  { id: "5", title: "Chainsaw Man", img: "https://myanimelist.net/images/anime/1806/126216.jpg", genre: "Action, Fantasy", color: "#F78C6B" },
];

export default function RecommendationsScreen() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push('/(tabs)/explore');
            }
          }} 
          style={styles.backButton}
        >
          <ThemedText style={{ fontWeight: "900", color: "#000" }}>← Kembali</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Rekomendasi Untukmu</ThemedText>
        <ThemedText style={styles.subtitle}>Pilihan spesial yang mungkin kamu suka</ThemedText>
      </ThemedView>

      <View style={styles.list}>
        {DUMMY_RECOMMENDATIONS.map((anime) => (
          <TouchableOpacity
            key={anime.id}
            style={styles.card}
            onPress={() => router.push(`/explore/${anime.id}`)}
          >
            <View style={styles.cardShadow} />
            <View style={[styles.cardInner, { backgroundColor: anime.color }]}>
              <Image source={{ uri: anime.img }} style={styles.cardImage} contentFit="cover" />
              <View style={styles.cardInfo}>
                <ThemedText style={styles.cardTitle}>{anime.title}</ThemedText>
                <View style={styles.genreBadge}>
                  <ThemedText style={styles.genreText}>{anime.genre}</ThemedText>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 20 },
  header: { marginBottom: 24, marginTop: 40, backgroundColor: "transparent" },
  backButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: "#FFD166", alignSelf: "flex-start", marginBottom: 16, ...Neubrutalism },
  subtitle: { color: "#6B7280", marginTop: 8, fontWeight: "bold" },
  
  list: { gap: 20 },
  card: { height: 140 },
  cardShadow: { position: "absolute", top: 6, left: 6, width: "100%", height: "100%", backgroundColor: "#000" },
  cardInner: { flex: 1, flexDirection: "row", overflow: "hidden", ...Neubrutalism },
  cardImage: { width: 100, height: "100%", borderRightWidth: 3, borderColor: "#000" },
  cardInfo: { flex: 1, padding: 16, justifyContent: "center" },
  cardTitle: { fontSize: 20, fontWeight: "900", color: "#000", marginBottom: 12 },
  genreBadge: { alignSelf: "flex-start", backgroundColor: "#FFFFFF", paddingHorizontal: 8, paddingVertical: 4, ...Neubrutalism },
  genreText: { fontSize: 12, fontWeight: "900", color: "#000" },
});
