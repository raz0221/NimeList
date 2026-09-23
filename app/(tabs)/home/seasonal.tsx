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

function getCurrentSeason(): { season: string; year: number } {
  const date = new Date();
  const month = date.getMonth() + 1; // 1-12
  const year = date.getFullYear();

  // Kuartal anime standar: Winter 1-3, Spring 4-6, Summer 7-9, Fall 10-12
  let season = "WINTER";
  if (month >= 4 && month <= 6) season = "SPRING";
  else if (month >= 7 && month <= 9) season = "SUMMER";
  else if (month >= 10 && month <= 12) season = "FALL";

  return { season, year };
}

function getNextSeason(season: string, year: number): { season: string; year: number } {
  const ORDER = ["WINTER", "SPRING", "SUMMER", "FALL"];
  const idx = ORDER.indexOf(season);
  const nextIdx = (idx + 1) % 4;
  const nextYear = nextIdx === 0 ? year + 1 : year;
  return { season: ORDER[nextIdx], year: nextYear };
}

function seasonLabel(season: string, year: number): string {
  const MAP: Record<string, string> = {
    WINTER: "Winter", SPRING: "Spring", SUMMER: "Summer", FALL: "Fall"
  };
  return `${MAP[season]} ${year}`;
}

function generateSeasons() {
  const current = getCurrentSeason();
  // Bangun 4 musim dimulai dari musim saat ini
  const seasons = [];
  let s = current;
  for (let i = 0; i < 4; i++) {
    seasons.push({ label: seasonLabel(s.season, s.year), season: s.season, year: s.year });
    s = getNextSeason(s.season, s.year);
  }
  // Index 0 selalu = musim saat ini (paling kiri)
  return { seasons, activeIndex: 0 };
}

const { seasons: DYNAMIC_SEASONS, activeIndex: INITIAL_SEASON_INDEX } = generateSeasons();

export default function SeasonalScreen() {
  const [activeSeasonIndex, setActiveSeasonIndex] = useState(INITIAL_SEASON_INDEX);
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    const fetchSeasonal = async () => {
      setIsLoading(true);
      try {
        const selectedSeason = DYNAMIC_SEASONS[activeSeasonIndex];
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
          {DYNAMIC_SEASONS.map((s, idx) => (
            <NeoButton
              key={s.label}
              title={s.label}
              color={
                activeSeasonIndex === idx
                  ? STATUS_COLORS.FINISHED  // Selalu warna cerah saat aktif
                  : colors.card
              }
              onPress={() => setActiveSeasonIndex(idx)}
              textStyle={{
                color:
                  activeSeasonIndex === idx
                    ? '#000' // Teks hitam di atas warna cerah = selalu terbaca
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
