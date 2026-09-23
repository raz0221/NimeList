import { COLORS } from "@/constants/theme";
import { StyleSheet, View, ScrollView, ActivityIndicator, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { ThemedText } from "@/components/themed-text";
import { fetchAniList } from "@/src/services/anilist";
import { NeoButton, NeoAnimeCard } from "@/components/NeoKit";
import { STATUS_COLORS, Neubrutalism } from "@/constants/theme";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const SORTS = [
  { icon: 'flame' as const,  label: "Trending",   value: "TRENDING_DESC" },
  { icon: 'star' as const,   label: "Top Score",  value: "SCORE_DESC" },
  { icon: 'calendar' as const, label: "Terbaru",  value: "START_DATE_DESC" },
];

const GENRE_QUERY = `
  query GetAnimeByGenre($genre: String, $sort: [MediaSort]) {
    Page(page: 1, perPage: 20) {
      media(genre_in: [$genre], type: ANIME, sort: $sort) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        startDate {
          year
          month
          day
        }
        episodes
        duration
        genres
        description
        studios(isMain: true) {
          nodes {
            name
          }
        }
        source
        averageScore
        format
        isAdult
        status
      }
    }
  }
`;

export default function GenreDetailScreen() {
  const { name } = useLocalSearchParams();
  const genreName = typeof name === 'string' ? name : 'Anime';
  const { colors, isDark } = useTheme();
  
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [sort, setSort] = useState("TRENDING_DESC");

  const fetchGenreData = async () => {
    setIsLoading(true);
    setFetchError(false);
    try {
      const response = await fetchAniList(GENRE_QUERY, { genre: genreName, sort: [sort] });
      setAnimeList(response.Page.media || []);
    } catch (error) {
      console.error("Error fetching genre:", error);
      setFetchError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGenreData();
  }, [genreName, sort]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <NeoButton
          title="← Kembali"
          color={COLORS.PRIMARY}
          onPress={() => router.back()}
          style={{ marginBottom: 16, alignSelf: 'flex-start' }}
          textStyle={{ paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 }}
        />
        <ThemedText type="title">Genre: {genreName}</ThemedText>
        <ThemedText style={styles.subtitle}>Anime terpopuler dalam kategori ini</ThemedText>
      </View>

      <View style={styles.sortSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
          {SORTS.map(s => (
            <NeoButton
              key={s.value}
              title=""
              color={sort === s.value ? STATUS_COLORS.ON_AIR : (isDark ? colors.card : COLORS.CARD_BACKGROUND)}
              onPress={() => setSort(s.value)}
              style={{ borderColor: isDark ? colors.border : '#000' }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12 }}>
                <Ionicons name={s.icon} size={14} color={sort === s.value ? '#000' : colors.text} />
                <Text style={{ fontSize: 13, color: sort === s.value ? '#000' : colors.text, fontWeight: '700' }}>{s.label}</Text>
              </View>
            </NeoButton>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.PRIMARY} style={{ marginTop: 40 }} />
      ) : fetchError ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <ThemedText style={{ color: COLORS.TEXT_SECONDARY, marginBottom: 16 }}>Gagal memuat data. Periksa koneksi internet Anda.</ThemedText>
          <NeoButton title="Coba Lagi" color={COLORS.PRIMARY} onPress={fetchGenreData} />
        </View>
      ) : (
        <View style={styles.list}>
          {animeList.length > 0 ? animeList.map((anime, idx) => {
            const colors = [COLORS.ACCENT, COLORS.PRIMARY, COLORS.BACKGROUND, "#FDE047"];
            const color = colors[idx % colors.length];

            return (
              <NeoAnimeCard
                key={anime.id}
                anime={anime}
                color={color}
                onPress={() => router.push(`/anime/${anime.id}`)}
              />
            )
          }) : (
            <ThemedText style={{ fontStyle: "italic", color: "#6B7280" }}>Tidak ada anime untuk genre ini.</ThemedText>
          )}
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 16, marginTop: 40 },
  subtitle: { color: COLORS.TEXT_SECONDARY, marginTop: 8, fontWeight: "bold" },
  sortSection: { marginBottom: 24 },
  sortScroll: { flexDirection: 'row', gap: 10 },
  list: { paddingBottom: 40 },
});
