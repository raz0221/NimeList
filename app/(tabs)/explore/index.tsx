import { Neubrutalism } from "@/constants/theme";
import { Image } from "expo-image";
import { ScrollView, StyleSheet, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import { useState } from "react";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

const GENRES = [
  { name: "Action",       color: "#EF476F" },
  { name: "Romance",      color: "#FFD166" },
  { name: "Fantasy",      color: "#06D6A0" },
  { name: "Slice of Life",color: "#118AB2" },
  { name: "Horror",       color: "#9B5DE5" },
  { name: "Comedy",       color: "#F78C6B" },
  { name: "Sci-Fi",       color: "#00BBF9" },
  { name: "Adventure",    color: "#3A86FF" },
];

export default function ExploreScreen() {
  const [query, setQuery] = useState("");

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#111827", dark: "#0F172A" }}
      headerImage={
        <Image source={{ uri: "https://4kwallpapers.com/images/walls/thumbs_3t/20404.jpg" }} style={styles.headerImage} />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore Anime</ThemedText>
      </ThemedView>

      {/* ── Search Bar ── */}
      <ThemedView style={styles.section}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari judul anime..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={() => Alert.alert("Pencarian", `Mencari: "${query}"`)}>
            <ThemedText style={styles.searchBtnText}>🔍</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* ── Genre ── */}
      <ThemedView style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Kategori Genre</ThemedText>
          <TouchableOpacity onPress={() => router.push("/explore/genres")}>
            <ThemedText style={styles.linkText}>Lihat Semua</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={styles.genreGrid}>
          {GENRES.map((g) => (
            <TouchableOpacity
              key={g.name}
              style={[styles.genreCard, { backgroundColor: g.color }]}
              onPress={() => Alert.alert("Genre", `Filter anime bergenre ${g.name}`)}
            >
              <ThemedText style={styles.genreText}>{g.name}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>

      {/* ── Menu Banner ── */}
      <ThemedView style={styles.section}>
        <View style={styles.bannerRow}>
          <TouchableOpacity
            style={[styles.rekomendasiBanner, { flex: 1 }]}
            onPress={() => router.push('/explore/recommendations')}
          >
            <View style={styles.rekomendasiShadow} />
            <View style={[styles.rekomendasiInner, { backgroundColor: "#00BBF9" }]}>
              <ThemedText style={styles.rekomendasiTitle}>🌟 Rekomendasi</ThemedText>
              <ThemedText style={styles.rekomendasiSub}>Anime spesial</ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rekomendasiBanner, { flex: 1 }]}
            onPress={() => router.push('/explore/movies')}
          >
            <View style={styles.rekomendasiShadow} />
            <View style={[styles.rekomendasiInner, { backgroundColor: "#FFD166" }]}>
              <ThemedText style={styles.rekomendasiTitle}>🎬 Anime Movie</ThemedText>
              <ThemedText style={styles.rekomendasiSub}>Film layar lebar</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: { height: "100%", width: "100%", bottom: 0, left: 0, position: "absolute" },
  titleContainer: { marginBottom: 20 },
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { color: "#000000", fontWeight: "900" },
  linkText: { color: "#EF476F", fontWeight: "bold" },

  searchRow: { flexDirection: "row", gap: 12 },
  searchInput: { flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: "#000", ...Neubrutalism },
  searchBtn: { backgroundColor: "#FFD166", paddingHorizontal: 16, justifyContent: "center", alignItems: "center", ...Neubrutalism },
  searchBtnText: { fontSize: 20 },

  genreGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  genreCard: { paddingVertical: 12, paddingHorizontal: 14, ...Neubrutalism },
  genreText: { color: "#000000", fontWeight: "900", fontSize: 14 },

  bannerRow: { flexDirection: "row", gap: 12 },
  rekomendasiBanner: { height: 100, marginTop: 10 },
  rekomendasiShadow: { position: "absolute", top: 6, left: 6, width: "100%", height: "100%", backgroundColor: "#000" },
  rekomendasiInner: { flex: 1, padding: 14, justifyContent: "center", ...Neubrutalism },
  rekomendasiTitle: { fontSize: 18, fontWeight: "900", color: "#000", marginBottom: 4 },
  rekomendasiSub: { fontSize: 14, color: "#000", fontWeight: "bold" },
});
