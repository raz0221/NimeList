import { COLORS, STATUS_COLORS } from "@/constants/theme";
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { fetchAniList } from "@/src/services/anilist";
import { NeoButton, NeoAnimeCard } from "@/components/NeoKit";
import { useTheme } from "@/src/context/ThemeContext";

const SCHEDULE_QUERY = `
  query GetSchedule {
    Page(page: 1, perPage: 20) {
      media(status: RELEASING, type: ANIME, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
        }
        nextAiringEpisode {
          timeUntilAiring
          episode
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

export default function ScheduleScreen() {
  const [scheduleList, setScheduleList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetchAniList(SCHEDULE_QUERY);
        // Filter out anime that do not have a next airing episode
        const airing = response.Page.media.filter((m: any) => m.nextAiringEpisode);
        setScheduleList(airing);
      } catch (error) {
        console.error("Error fetching schedule:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  const formatTimeUntil = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    if (d > 0) return `Rilis dalam ${d} hari ${h} jam`;
    if (h > 0) return `Rilis dalam ${h} jam lagi`;
    return "Segera Tayang";
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.header}>
        <NeoButton
          title="← Kembali"
          color={isDark ? colors.primary : COLORS.PRIMARY}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push('/(tabs)/home');
            }
          }}
          style={{ marginBottom: 16, alignSelf: 'flex-start' }}
          textStyle={{ paddingVertical: 8, paddingHorizontal: 16, fontSize: 14, color: isDark ? '#000' : COLORS.BUTTON_TEXT_LIGHT }}
        />
        <ThemedText type="title">Jadwal Tayang</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}>Waktu rilis episode terbaru</ThemedText>
      </ThemedView>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.PRIMARY} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.scheduleList}>
          {scheduleList.length > 0 ? scheduleList.map((item, idx) => {
            const timeUntil = formatTimeUntil(item.nextAiringEpisode?.timeUntilAiring);
            return (
              <NeoAnimeCard
                key={item.id}
                anime={item}
                topRightText={timeUntil}
                onPress={() => router.push(`/explore/${item.id}`)}
              />
            )
          }) : (
            <ThemedText style={{ fontStyle: "italic", color: "#6B7280" }}>Tidak ada jadwal saat ini.</ThemedText>
          )}
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 24, marginTop: 40, backgroundColor: "transparent" },
  subtitle: { marginTop: 8 },
  scheduleList: { paddingBottom: 40 },
});
