import { COLORS, STATUS_COLORS } from "@/constants/theme";
import { StyleSheet, View, ScrollView } from "react-native";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { NeoButton } from "@/components/NeoKit";
import { useTheme } from "@/src/context/ThemeContext";

const GENRES = ["Action", "Adventure", "Comedy", "Drama", "Slice of Life", "Fantasy", "Magic", "Supernatural", "Horror", "Mystery", "Psychological", "Romance", "Sci-Fi", "Cyberpunk", "Mecha", "Space"];
const NEUBRUTALISM_COLORS = [COLORS.PRIMARY, COLORS.ACCENT, STATUS_COLORS.ON_AIR, STATUS_COLORS.FINISHED, STATUS_COLORS.UPCOMING, STATUS_COLORS.DEFAULT];

export default function GenresScreen() {
  const { colors, isDark } = useTheme();
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <NeoButton
          title="← Kembali"
          color={isDark ? colors.primary : COLORS.PRIMARY}
          onPress={() => router.back()}
          style={{ marginBottom: 16 }}
          textStyle={{ paddingVertical: 8, paddingHorizontal: 16, fontSize: 14}}
        />
        <ThemedText type="title">Semua Genre</ThemedText>
      </View>

      <View style={styles.grid}>
        {GENRES.map((genre, idx) => {
          const color = NEUBRUTALISM_COLORS[idx % NEUBRUTALISM_COLORS.length];
          return (
            <View key={idx} style={styles.genreWrapper}>
              <NeoButton
                title={genre}
                color={isDark ? colors.card : color}
                onPress={() => router.push(`/explore/genre/${genre}`)}
                style={{ width: "100%", borderColor: isDark ? color : '#000' }}
                textStyle={{ color: isDark ? color : '#000' }}
              />
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 24, marginTop: 40 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16, paddingBottom: 40 },
  genreWrapper: { flex: 1, minWidth: "45%" },
});
