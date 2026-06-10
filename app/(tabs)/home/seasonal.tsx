import { Neubrutalism } from "@/constants/theme";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { Image } from "expo-image";
import { ThemedText } from "@/components/themed-text";

const SEASONS = ["Spring 2026", "Summer 2026", "Fall 2025", "Winter 2025"];
const SEASONAL_ANIME = [
  { id: "1", title: "Kaiju No. 8", img: "https://myanimelist.net/images/anime/1106/138402.jpg", season: "Spring 2026" },
  { id: "2", title: "Mushoku Tensei S3", img: "https://myanimelist.net/images/anime/1764/126627.jpg", season: "Summer 2026" },
  { id: "3", title: "Solo Leveling S2", img: "https://myanimelist.net/images/anime/1070/140292.jpg", season: "Spring 2026" },
  { id: "4", title: "Oshi no Ko S2", img: "https://myanimelist.net/images/anime/1812/140774.jpg", season: "Summer 2026" },
];

export default function SeasonalScreen() {
  const [activeSeason, setActiveSeason] = useState(SEASONS[0]);
  const filteredAnime = SEASONAL_ANIME.filter((a) => a.season === activeSeason);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={{ fontWeight: "900", color: "#000" }}>← Kembali</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Anime Musiman</ThemedText>
      </View>
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {SEASONS.map((season) => (
            <TouchableOpacity key={season} style={[styles.filterBtn, activeSeason === season && styles.filterBtnActive]} onPress={() => setActiveSeason(season)}>
              <ThemedText style={[styles.filterText, activeSeason === season && styles.filterTextActive]}>{season}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.grid}>
        {filteredAnime.length > 0 ? filteredAnime.map((anime) => (
          <TouchableOpacity key={anime.id} style={styles.cardContainer} onPress={() => router.push(`/explore/${anime.id}`)}>
            <View style={styles.cardShadow} />
            <View style={styles.card}>
              <Image source={{ uri: anime.img }} style={styles.image} contentFit="cover" />
              <ThemedText style={styles.title} numberOfLines={2}>{anime.title}</ThemedText>
            </View>
          </TouchableOpacity>
        )) : (
          <ThemedText style={{ fontStyle: "italic", color: "#6B7280" }}>Tidak ada data.</ThemedText>
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 20 },
  header: { marginBottom: 20, marginTop: 40 },
  backButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: "#FFD166", alignSelf: "flex-start", marginBottom: 16, ...Neubrutalism },
  filterContainer: { marginBottom: 24 },
  filterScroll: { gap: 12 },
  filterBtn: { backgroundColor: "#FFFFFF", paddingVertical: 10, paddingHorizontal: 16, ...Neubrutalism },
  filterBtnActive: { backgroundColor: "#118AB2" },
  filterText: { color: "#000000", fontWeight: "bold" },
  filterTextActive: { color: "#FFFFFF", fontWeight: "900" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16, justifyContent: "space-between" },
  cardContainer: { width: "47%", marginBottom: 16 },
  cardShadow: { position: "absolute", top: 4, left: 4, width: "100%", height: "100%", backgroundColor: "#000000" },
  card: { width: "100%", backgroundColor: "#FFFFFF", ...Neubrutalism },
  image: { width: "100%", height: 160, borderBottomWidth: 3, borderColor: "#000000" },
  title: { padding: 12, fontSize: 14, fontWeight: "900", color: "#000000", textAlign: "center" },
});
