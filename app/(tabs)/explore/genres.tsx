import { Neubrutalism } from "@/constants/theme";
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";

const GENRES = ["Action", "Adventure", "Comedy", "Drama", "Slice of Life", "Fantasy", "Magic", "Supernatural", "Horror", "Mystery", "Psychological", "Romance", "Sci-Fi", "Cyberpunk", "Mecha", "Space"];
const NEUBRUTALISM_COLORS = ["#FFD166", "#EF476F", "#06D6A0", "#118AB2", "#F78C6B", "#83D475"];

export default function GenresScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={{fontWeight: '900', color: '#000'}}>← Kembali</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Semua Genre</ThemedText>
      </View>

      <View style={styles.grid}>
        {GENRES.map((genre, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => Alert.alert("Filter Genre", `Menerapkan filter untuk ${genre}...`)}
            style={[styles.genreCard, { backgroundColor: NEUBRUTALISM_COLORS[idx % NEUBRUTALISM_COLORS.length] }]}
          >
            <ThemedText style={styles.genreText}>{genre}</ThemedText>
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
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16, paddingBottom: 40 },
  genreCard: { flex: 1, minWidth: "45%", paddingVertical: 20, paddingHorizontal: 12, alignItems: "center", ...Neubrutalism },
  genreText: { color: "#000000", fontWeight: "900", fontSize: 16 },
});
