import { NeoAnimeCard, NeoButton } from "@/components/NeoKit";
import { ThemedText } from "@/components/themed-text";
import { COLORS, STATUS_COLORS } from "@/constants/theme";
import { useTheme } from '@/src/context/ThemeContext';
import { fetchAniList } from "@/src/services/anilist";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View
} from "react-native";

const SEASONAL_QUERY = `
  query GetSeasonal($season: MediaSeason, $seasonYear: Int) {
    Page(page: 1, perPage: 20) {
      media(season: $season, seasonYear: $seasonYear, type: ANIME, sort: POPULARITY_DESC) {
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

const SEASONS = [
  { label: "Spring 2026", season: "SPRING", year: 2026 },
  { label: "Summer 2026", season: "SUMMER", year: 2026 },
  { label: "Fall 2026", season: "FALL", year: 2026 },
  { label: "Winter 2026", season: "WINTER", year: 2026 },
];

export default function SeasonalScreen() {
  const [activeSeasonIndex, setActiveSeasonIndex] = useState(0);
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    const fetchSeasonal = async () => {
      setIsLoading(true);
      try {
        const selectedSeason = SEASONS[activeSeasonIndex];
        const response = await fetchAniList(SEASONAL_QUERY, {
          season: selectedSeason.season,
          seasonYear: selectedSeason.year,
        });
        setAnimeList(response.Page.media || []);
      } catch (error) {
        console.error("Error fetching seasonal anime:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSeasonal();
  }, [activeSeasonIndex]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <NeoButton
          title="← Kembali"
          color={COLORS.PRIMARY}
          onPress={() => router.back()}
          style={{ marginBottom: 16, alignSelf: "flex-start" }}
          textStyle={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            fontSize: 14,
          }}
        />
        <ThemedText type="title">Anime Musiman</ThemedText>
      </View>
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {SEASONS.map((s, idx) => (
            <NeoButton
              key={s.label}
              title={s.label}
              color={
                activeSeasonIndex === idx
                  ? (isDark ? colors.primary : STATUS_COLORS.FINISHED)
                  : colors.card
              }
              onPress={() => setActiveSeasonIndex(idx)}
              textStyle={{
                color:
                  activeSeasonIndex === idx
                    ? (isDark ? '#000' : COLORS.BUTTON_TEXT_LIGHT)
                    : colors.text,
                fontWeight: activeSeasonIndex === idx ? "900" : "bold",
              }}
            />
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.PRIMARY}
          style={{ marginTop: 40 }}
        />
      ) : (
        <View style={styles.grid}>
          {animeList.length > 0 ? (
            animeList.map((anime) => {
              return (
                <NeoAnimeCard
                  key={anime.id}
                  anime={anime}
                  onPress={() => router.push(`/anime/${anime.id}`)}
                />
              );
            })
          ) : (
            <ThemedText style={{ fontStyle: "italic", color: "#6B7280" }}>
              Tidak ada data.
            </ThemedText>
          )}
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 20, marginTop: 40 },
  filterContainer: { marginBottom: 24 },
  filterScroll: { gap: 12, paddingBottom: 12 },
  grid: { gap: 16, paddingBottom: 40 },
});
