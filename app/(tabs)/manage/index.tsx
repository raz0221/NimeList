import { Neubrutalism } from "@/constants/theme";
import { Image } from "expo-image";
import { useState } from "react";
import { Alert, StyleSheet, TextInput, TouchableOpacity, View, ScrollView } from "react-native";
import { router } from "expo-router";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function ManageScreen() {
  const [activeCategory, setActiveCategory] = useState("Sedang Ditonton");
  const [judulAnime, setJudulAnime] = useState("");
  const [episode, setEpisode] = useState("");
  
  const [daftarAnime, setDaftarAnime] = useState([
    { id: "1", judul: "Jujutsu Kaisen", episode: "12", kategori: "Sedang Ditonton" },
    { id: "2", judul: "Naruto", episode: "500", kategori: "Selesai" },
    { id: "3", judul: "One Piece", episode: "1000", kategori: "Rencana Tonton" }
  ]);

  const handleTambahAnime = () => {
    if (!judulAnime.trim() || !episode.trim()) {
      Alert.alert("Error", "Judul Anime dan Total Episode tidak boleh kosong!");
      return;
    }
    Alert.alert("Sukses", `Data "${judulAnime}" ditambahkan ke kategori ${activeCategory}!`);
    setDaftarAnime([{ id: Date.now().toString(), judul: judulAnime, episode, kategori: activeCategory }, ...daftarAnime]);
    setJudulAnime("");
    setEpisode("");
  };

  const filteredAnime = daftarAnime.filter(a => a.kategori === activeCategory);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#111827", dark: "#0F172A" }}
      headerImage={
        <Image source={{ uri: "https://4kwallpapers.com/images/walls/thumbs_3t/26035.jpg" }} style={styles.headerImage} />
      }
    >
      <View style={styles.headerRow}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Manajemen Tontonan</ThemedText>
        </ThemedView>
      </View>

      <ThemedText style={styles.slogan}>Dashboard Koleksi Anime Anda</ThemedText>

      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push("/manage/favorite")}>
          <ThemedText style={styles.navText}>⭐ Koleksi Favorit</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push("/manage/stats")}>
          <ThemedText style={styles.navText}>📊 Lihat Statistik</ThemedText>
        </TouchableOpacity>
      </View>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Pilih Kategori</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {["Sedang Ditonton", "Selesai", "Rencana Tonton", "Dropped"].map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.catBadge, activeCategory === cat && styles.catBadgeActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <ThemedText style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>

      <View style={styles.formContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Tambah ke {activeCategory}</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Judul Anime"
          placeholderTextColor="#6B7280"
          value={judulAnime}
          onChangeText={setJudulAnime}
        />
        <TextInput
          style={styles.input}
          placeholder="Total Episode"
          placeholderTextColor="#6B7280"
          value={episode}
          onChangeText={setEpisode}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={handleTambahAnime}>
          <ThemedText style={styles.buttonText}>Simpan Anime</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Daftar {activeCategory}</ThemedText>
        {filteredAnime.length === 0 ? (
          <ThemedText style={{color: "#6B7280", fontStyle: "italic"}}>Tidak ada data di kategori ini.</ThemedText>
        ) : (
          filteredAnime.map((anime) => (
            <View key={anime.id} style={styles.animeCard}>
              <ThemedText style={styles.animeTitle}>{anime.judul}</ThemedText>
              <ThemedText style={styles.animeEpisode}>{anime.episode} Episode</ThemedText>
            </View>
          ))
        )}
      </View>
      <View style={{height: 40}} />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12 },
  titleContainer: { flexDirection: "row", alignItems: "center" },
  navButton: { flex: 1, backgroundColor: "#FFD166", paddingVertical: 12, alignItems: "center", ...Neubrutalism },
  navText: { color: "#000000", fontWeight: "900", fontSize: 14 },
  slogan: { color: "#9CA3AF", fontSize: 16, marginBottom: 20 },
  headerImage: { height: "100%", width: "100%", bottom: 0, left: 0, position: "absolute" },
  section: { marginBottom: 24 },
  sectionTitle: { color: "#000000", fontWeight: "900", marginBottom: 12 },
  categoryScroll: { gap: 12, paddingBottom: 8 },
  catBadge: { backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 8, ...Neubrutalism },
  catBadgeActive: { backgroundColor: "#06D6A0" },
  catText: { color: "#000000", fontWeight: "bold" },
  catTextActive: { fontWeight: "900" },
  formContainer: { gap: 12, marginBottom: 24 },
  input: { backgroundColor: "#FFFFFF", padding: 16, fontSize: 16, color: "#000000", ...Neubrutalism },
  button: { backgroundColor: "#118AB2", padding: 16, alignItems: "center", marginTop: 4, ...Neubrutalism },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  listContainer: { gap: 12 },
  animeCard: { backgroundColor: "#EF476F", padding: 16, ...Neubrutalism },
  animeTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", marginBottom: 4 },
  animeEpisode: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});
