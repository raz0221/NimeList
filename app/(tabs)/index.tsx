import { Neubrutalism } from "@/constants/theme";
import { Image } from "expo-image";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function HomeScreen() {
  const [judulAnime, setJudulAnime] = useState("");
  const [episode, setEpisode] = useState("");
  const [daftarAnime, setDaftarAnime] = useState<
    { id: string; judul: string; episode: string }[]
  >([]);

  const handleTambahAnime = () => {
    if (!judulAnime.trim() || !episode.trim()) {
      Alert.alert("Error", "Judul Anime dan Total Episode tidak boleh kosong!");
      return;
    }
    Alert.alert("Sukses", "Anime berhasil ditambahkan!");
    setJudulAnime("");
    setEpisode("");
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#111827", dark: "#0F172A" }}
      headerImage={
        <Image
          source={{
            uri: "https://4kwallpapers.com/images/walls/thumbs_3t/26035.jpg",
          }}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">AniTrack</ThemedText>
      </ThemedView>

      <ThemedText style={styles.slogan}>
        Pantau Progress Nontonmu, Jangan Sampai Ketinggalan!
      </ThemedText>

      <ThemedView style={styles.categoriesContainer}>
        <View style={[styles.card, { backgroundColor: "#FFD166" }]}>
          <ThemedText style={styles.cardText}>Sedang Ditonton</ThemedText>
        </View>
        <View style={[styles.card, { backgroundColor: "#EF476F" }]}>
          <ThemedText style={styles.cardText}>Selesai</ThemedText>
        </View>
        <View style={[styles.card, { backgroundColor: "#118AB2" }]}>
          <ThemedText style={styles.cardText}>Rencana Tonton</ThemedText>
        </View>
      </ThemedView>

      <View style={styles.formContainer}>
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
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  slogan: {
    color: "#9CA3AF",
    fontSize: 16,
    marginBottom: 20,
  },
  headerImage: {
    height: "100%",
    width: "100%",
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  categoriesContainer: {
    gap: 16,
  },
  card: {
    padding: 20,
    ...Neubrutalism,
  },
  cardText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "900",
  },
  formContainer: {
    marginTop: 24,
    gap: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    fontSize: 16,
    color: "#000000",
    ...Neubrutalism,
  },
  button: {
    backgroundColor: "#06D6A0",
    padding: 16,
    alignItems: "center",
    marginTop: 4,
    ...Neubrutalism,
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "900",
  },
  listContainer: {
    marginTop: 24,
    gap: 16,
  },
  animeCard: {
    backgroundColor: "#FFD166",
    padding: 16,
    ...Neubrutalism,
  },
  animeTitle: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 4,
  },
  animeEpisode: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
