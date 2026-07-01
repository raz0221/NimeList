import { COLORS, STATUS_COLORS } from "@/constants/theme";
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { ThemedText } from "@/components/themed-text";
import { fetchAniList } from "@/src/services/anilist";
import { NeoButton, NeoAnimeCard } from "@/components/NeoKit";
import { useTheme } from "@/src/context/ThemeContext";

const UPCOMING_QUERY = `
  query GetUpcoming {
    Page(page: 1, perPage: 20) {
      media(status: NOT_YET_RELEASED, sort: POPULARITY_DESC, type: ANIME) {
        id
        title {
          romaji
          english
        }
        format
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

const TYPE_COLORS: Record<string, string> = { "TV": STATUS_COLORS.FINISHED, "MOVIE": COLORS.ACCENT, "OVA": STATUS_COLORS.ON_AIR, "ONA": STATUS_COLORS.UPCOMING, "SPECIAL": STATUS_COLORS.MOVIE };

export default function UpcomingScreen() {
  const [upcomingList, setUpcomingList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const response = await fetchAniList(UPCOMING_QUERY);
        setUpcomingList(response.Page.media || []);
      } catch (error) {
        console.error("Error fetching upcoming:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUpcoming();
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <NeoButton
          title="← Kembali"
          color={isDark ? colors.primary : COLORS.PRIMARY}
          onPress={() => router.back()}
          style={{ marginBottom: 16, alignSelf: 'flex-start' }}
          textStyle={{ paddingVertical: 8, paddingHorizontal: 16, fontSize: 14}}
        />
        <ThemedText type="title">Segera Tayang</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}>Anime yang ditunggu-tunggu!</ThemedText>
      </View>
      
      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.ACCENT} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.list}>
          {upcomingList.map((anime, idx) => (
            <NeoAnimeCard
              key={anime.id}
              anime={anime}
              rank={idx + 1}
              onPress={() => router.push(`/anime/${anime.id}`)}
            />
          ))}
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 24, marginTop: 40 },
  subtitle: { marginTop: 8, fontWeight: "bold" },
  list: { paddingBottom: 40 },
});
