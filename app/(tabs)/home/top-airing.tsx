import { Neubrutalism } from "@/constants/theme";
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";

const TOP_AIRING = [
  { id: "1", title: "One Piece",           studio: "Toei Animation",  rating: "8.7", episode: "Ep. 1117", color: "#FFD166" },
  { id: "2", title: "Detective Conan",     studio: "TMS Entertainment", rating: "8.1", episode: "Ep. 1125", color: "#06D6A0" },
  { id: "3", title: "Boruto: Two Blue Vortex", studio: "Studio Pierrot", rating: "6.8", episode: "Ep. 15",  color: "#EF476F" },
  { id: "4", title: "My Hero Academia S7", studio: "Bones",           rating: "8.0", episode: "Ep. 25",  color: "#118AB2" },
  { id: "5", title: "Demon Slayer: Infinity Castle", studio: "ufotable", rating: "9.0", episode: "Ep. 8",  color: "#FFD166" },
];

export default function TopAiringScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={{ fontWeight: "900", color: "#000" }}>← Kembali</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Top Sedang Tayang</ThemedText>
        <ThemedText style={styles.subtitle}>Anime terpopuler yang kini sedang on-air</ThemedText>
      </View>

      <View style={styles.list}>
        {TOP_AIRING.map((anime, idx) => (
          <TouchableOpacity
            key={anime.id}
            style={styles.card}
            onPress={() => Alert.alert(anime.title, `Studio: ${anime.studio}\nRating: ⭐ ${anime.rating}\n${anime.episode}`)}
          >
            {/* Rank badge */}
            <View style={[styles.rankBadge, { backgroundColor: anime.color }]}>
              <ThemedText style={styles.rankText}>#{idx + 1}</ThemedText>
            </View>

            {/* Info */}
            <View style={styles.info}>
              <ThemedText style={styles.animeTitle} numberOfLines={1}>{anime.title}</ThemedText>
              <ThemedText style={styles.studio}>{anime.studio}</ThemedText>
              <View style={styles.metaRow}>
                <View style={styles.ratingPill}>
                  <ThemedText style={styles.ratingText}>⭐ {anime.rating}</ThemedText>
                </View>
                <View style={styles.episodePill}>
                  <ThemedText style={styles.episodeText}>{anime.episode}</ThemedText>
                </View>
              </View>
            </View>

            {/* Live dot */}
            <View style={styles.liveDot}>
              <ThemedText style={styles.liveText}>ON{"\n"}AIR</ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: "#F3F4F6", padding: 20 },
  header:      { marginBottom: 24, marginTop: 40 },
  backButton:  { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: "#FFD166", alignSelf: "flex-start", marginBottom: 16, ...Neubrutalism },
  subtitle:    { color: "#6B7280", marginTop: 8, fontWeight: "bold" },

  list: { gap: 16 },
  card: { backgroundColor: "#FFFFFF", padding: 16, flexDirection: "row", alignItems: "center", gap: 14, ...Neubrutalism },

  rankBadge: { width: 46, height: 46, justifyContent: "center", alignItems: "center", flexShrink: 0, ...Neubrutalism },
  rankText:  { color: "#000", fontWeight: "900", fontSize: 16 },

  info:       { flex: 1 },
  animeTitle: { fontSize: 16, fontWeight: "900", color: "#000", marginBottom: 4 },
  studio:     { fontSize: 13, color: "#6B7280", marginBottom: 8 },

  metaRow:     { flexDirection: "row", gap: 8 },
  ratingPill:  { backgroundColor: "#FFD166", paddingHorizontal: 8, paddingVertical: 3, ...Neubrutalism },
  ratingText:  { color: "#000", fontSize: 12, fontWeight: "900" },
  episodePill: { backgroundColor: "#F3F4F6", paddingHorizontal: 8, paddingVertical: 3, ...Neubrutalism },
  episodeText: { color: "#000", fontSize: 12, fontWeight: "bold" },

  liveDot: { backgroundColor: "#EF476F", paddingHorizontal: 8, paddingVertical: 6, alignItems: "center", flexShrink: 0, ...Neubrutalism },
  liveText: { color: "#FFF", fontWeight: "900", fontSize: 10, textAlign: "center", lineHeight: 14 },
});
