import { Neubrutalism } from "@/constants/theme";
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";

const UPCOMING_ANIME = [
  { id: "1", title: "Chainsaw Man Season 2", studio: "MAPPA", eta: "Q4 2026", type: "TV Series" },
  { id: "2", title: "One Punch Man Season 3", studio: "J.C. Staff", eta: "Q3 2026", type: "TV Series" },
  { id: "3", title: "Attack on Titan: The Musical Film", studio: "WIT Studio", eta: "2027", type: "Film" },
  { id: "4", title: "Berserk (Remake)", studio: "Studio Trigger", eta: "TBA", type: "TV Series" },
  { id: "5", title: "Re:Zero Season 4", studio: "White Fox", eta: "Q1 2027", type: "TV Series" },
];

const TYPE_COLORS: Record<string, string> = { "TV Series": "#118AB2", "Film": "#EF476F" };

export default function UpcomingScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={{ fontWeight: "900", color: "#000" }}>← Kembali</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Segera Tayang</ThemedText>
        <ThemedText style={styles.subtitle}>Anime yang ditunggu-tunggu!</ThemedText>
      </View>
      <View style={styles.list}>
        {UPCOMING_ANIME.map((anime, idx) => (
          <TouchableOpacity key={anime.id} style={styles.card} onPress={() => Alert.alert("Info", `${anime.title} diperkirakan rilis ${anime.eta}. Stay tuned!`)}>
            <View style={styles.rankBadge}>
              <ThemedText style={styles.rankText}>{idx + 1}</ThemedText>
            </View>
            <View style={styles.info}>
              <ThemedText style={styles.animeTitle}>{anime.title}</ThemedText>
              <ThemedText style={styles.studio}>{anime.studio}</ThemedText>
              <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[anime.type] ?? "#6B7280" }]}>
                <ThemedText style={styles.typeText}>{anime.type}</ThemedText>
              </View>
            </View>
            <View style={styles.etaContainer}>
              <ThemedText style={styles.etaLabel}>Estimasi</ThemedText>
              <ThemedText style={styles.etaValue}>{anime.eta}</ThemedText>
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
  header: { marginBottom: 24, marginTop: 40 },
  backButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: "#FFD166", alignSelf: "flex-start", marginBottom: 16, ...Neubrutalism },
  subtitle: { color: "#6B7280", marginTop: 8, fontWeight: "bold" },
  list: { gap: 16 },
  card: { backgroundColor: "#FFFFFF", padding: 16, flexDirection: "row", alignItems: "center", gap: 14, ...Neubrutalism },
  rankBadge: { width: 40, height: 40, backgroundColor: "#06D6A0", justifyContent: "center", alignItems: "center", flexShrink: 0, ...Neubrutalism },
  rankText: { color: "#000", fontWeight: "900", fontSize: 18 },
  info: { flex: 1 },
  animeTitle: { fontSize: 16, fontWeight: "900", color: "#000", marginBottom: 4 },
  studio: { fontSize: 13, color: "#6B7280", marginBottom: 8 },
  typeBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, ...Neubrutalism },
  typeText: { color: "#FFF", fontSize: 12, fontWeight: "bold" },
  etaContainer: { alignItems: "center", flexShrink: 0 },
  etaLabel: { fontSize: 11, color: "#6B7280", fontWeight: "bold", marginBottom: 4 },
  etaValue: { fontSize: 15, fontWeight: "900", color: "#EF476F" },
});
