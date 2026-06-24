import { COLORS } from "@/constants/theme";
import { StyleSheet, View, ScrollView, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { ThemedText } from "@/components/themed-text";
import { fetchAniList } from "@/src/services/anilist";
import { NeoButton, NeoAnimeCard } from "@/components/NeoKit";
import { STATUS_COLORS, Neubrutalism } from "@/constants/theme";

const SORTS = [
  { label: "🔥 Trending", value: "TRENDING_DESC" },
  { label: "⭐ Top Score", value: "SCORE_DESC" },
  { label: "📅 Terbaru", value: "START_DATE_DESC" },
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
  
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sort, setSort] = useState("TRENDING_DESC");

  useEffect(() => {
    const fetchGenreData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchAniList(GENRE_QUERY, { genre: genreName, sort: [sort] });
        setAnimeList(response.Page.media || []);
      } catch (error) {
        console.error("Error fetching genre:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGenreData();
  }, [genreName, sort]);

  return (
    <ScrollView style={styles.container}>
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
              title={s.label}
              color={sort === s.value ? STATUS_COLORS.ON_AIR : COLORS.CARD_BACKGROUND}
              onPress={() => setSort(s.value)}
              textStyle={{ fontSize: 13, color: '#000', paddingVertical: 8, paddingHorizontal: 12 }}
            />
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.PRIMARY} style={{ marginTop: 40 }} />
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
                onPress={() => router.push(`/explore/${anime.id}`)}
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
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND, padding: 20 },
  header: { marginBottom: 16, marginTop: 40 },
  subtitle: { color: COLORS.TEXT_SECONDARY, marginTop: 8, fontWeight: "bold" },
  sortSection: { marginBottom: 24 },
  sortScroll: { flexDirection: 'row', gap: 10 },
  list: { paddingBottom: 40 },
});
