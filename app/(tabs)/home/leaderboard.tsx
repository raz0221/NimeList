import { Neubrutalism } from "@/constants/theme";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";

const LEADERBOARD = [
  { rank: 1, title: "Fullmetal Alchemist: Brotherhood", score: "9.10" },
  { rank: 2, title: "Steins;Gate",                      score: "9.07" },
  { rank: 3, title: "Bleach: Sennen Kessen-hen",        score: "9.03" },
  { rank: 4, title: "Gintama°",                         score: "9.03" },
  { rank: 5, title: "Kaguya-sama wa Kokurasetai",       score: "9.02" },
];

export default function LeaderboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={{ fontWeight: "900", color: "#000" }}>← Kembali</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Top Rated Anime</ThemedText>
      </View>

      <View style={styles.list}>
        {LEADERBOARD.map((anime) => (
          <TouchableOpacity
            key={anime.rank}
            style={styles.card}
            onPress={() => router.push(`/explore/${anime.rank}`)}
          >
            <View style={styles.rankBadge}>
              <ThemedText style={styles.rankText}>#{anime.rank}</ThemedText>
            </View>
            <View style={styles.info}>
              <ThemedText style={styles.title}>{anime.title}</ThemedText>
              <ThemedText style={styles.score}>⭐ {anime.score}</ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: "#F3F4F6", padding: 20 },
  header:     { marginBottom: 24, marginTop: 40 },
  backButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: "#FFD166", alignSelf: "flex-start", marginBottom: 16, ...Neubrutalism },
  list:       { gap: 16, paddingBottom: 40 },
  card:       { backgroundColor: "#FFFFFF", padding: 16, flexDirection: "row", alignItems: "center", gap: 16, ...Neubrutalism },
  rankBadge:  { backgroundColor: "#06D6A0", width: 40, height: 40, justifyContent: "center", alignItems: "center", ...Neubrutalism },
  rankText:   { color: "#000", fontWeight: "900", fontSize: 16 },
  info:       { flex: 1 },
  title:      { fontSize: 16, fontWeight: "900", color: "#000" },
  score:      { fontSize: 14, color: "#6B7280", marginTop: 4, fontWeight: "bold" },
});
