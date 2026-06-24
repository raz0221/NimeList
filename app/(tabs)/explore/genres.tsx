import { COLORS, STATUS_COLORS } from "@/constants/theme";
import { StyleSheet, View, ScrollView } from "react-native";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { NeoButton } from "@/components/NeoKit";

const GENRES = ["Action", "Adventure", "Comedy", "Drama", "Slice of Life", "Fantasy", "Magic", "Supernatural", "Horror", "Mystery", "Psychological", "Romance", "Sci-Fi", "Cyberpunk", "Mecha", "Space"];
const NEUBRUTALISM_COLORS = [COLORS.PRIMARY, COLORS.ACCENT, STATUS_COLORS.ON_AIR, STATUS_COLORS.FINISHED, STATUS_COLORS.UPCOMING, STATUS_COLORS.DEFAULT];

export default function GenresScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <NeoButton
          title="← Kembali"
          color={COLORS.PRIMARY}
          onPress={() => router.back()}
          style={{ marginBottom: 16 }}
          textStyle={{ paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 }}
        />
        <ThemedText type="title">Semua Genre</ThemedText>
      </View>

      <View style={styles.grid}>
        {GENRES.map((genre, idx) => (
          <View key={idx} style={styles.genreWrapper}>
            <NeoButton
              title={genre}
              color={NEUBRUTALISM_COLORS[idx % NEUBRUTALISM_COLORS.length]}
              onPress={() => router.push(`/explore/genre/${genre}`)}
              style={{ width: "100%" }}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND, padding: 20 },
  header: { marginBottom: 24, marginTop: 40 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16, paddingBottom: 40 },
  genreWrapper: { flex: 1, minWidth: "45%" },
});
