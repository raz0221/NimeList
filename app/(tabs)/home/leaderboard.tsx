import { COLORS, STATUS_COLORS } from "@/constants/theme";
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";

import { ThemedText } from "@/components/themed-text";
import { fetchAniList } from "@/src/services/anilist";
import { NeoButton, NeoAnimeCard } from "@/components/NeoKit";
import { useTheme } from "@/src/context/ThemeContext";

const LEADERBOARD_QUERY = `
  query GetLeaderboard {
    Page(page: 1, perPage: 20) {
      media(sort: SCORE_DESC, type: ANIME) {
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

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetchAniList(LEADERBOARD_QUERY);
        setLeaderboard(response.Page.media || []);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <NeoButton
          title="← Kembali"
          color={isDark ? colors.primary : COLORS.PRIMARY}
          onPress={() => router.back()}
          style={{ marginBottom: 16 }}
          textStyle={{ paddingVertical: 8, paddingHorizontal: 16, fontSize: 14, color: isDark ? '#000' : COLORS.BUTTON_TEXT_LIGHT }}
        />
        <ThemedText type="title">Top Rated Anime</ThemedText>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.ACCENT} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.list}>
          {leaderboard.map((anime, idx) => (
            <NeoAnimeCard
              key={anime.id}
              anime={anime}
              rank={idx + 1}
              onPress={() => router.push(`/explore/${anime.id}`)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, padding: 20 },
  header:     { marginBottom: 24, marginTop: 40 },
  list:       { paddingBottom: 40 },
});
