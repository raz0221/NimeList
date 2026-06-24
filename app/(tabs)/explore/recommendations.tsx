import { COLORS, STATUS_COLORS, Neubrutalism } from "@/constants/theme";
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useState, useEffect } from "react";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { fetchAniList } from "@/src/services/anilist";
import { NeoButton, NeoCard, NeoAnimeCard } from "@/components/NeoKit";

const RECOMMENDATIONS_QUERY = `
  query GetRecommendations {
    Page(page: 1, perPage: 15) {
      media(sort: [TRENDING_DESC, SCORE_DESC], type: ANIME, status: RELEASING) {
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

export default function RecommendationsScreen() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const response = await fetchAniList(RECOMMENDATIONS_QUERY);
        setRecommendations(response.Page.media || []);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadRecommendations();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <NeoButton
          title="← Kembali"
          color={COLORS.PRIMARY}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push('/(tabs)/explore');
            }
          }}
          style={{ marginBottom: 16, alignSelf: 'flex-start' }}
          textStyle={{ paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 }}
        />
        <ThemedText type="title">Rekomendasi Untukmu</ThemedText>
        <ThemedText style={styles.subtitle}>Pilihan spesial yang mungkin kamu suka</ThemedText>
      </ThemedView>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.PRIMARY} style={{ marginTop: 40 }} />
      ) : recommendations.length === 0 ? (
        <NeoCard color={STATUS_COLORS.DEFAULT} contentStyle={styles.emptyState}>
          <ThemedText style={styles.emptyStateText}>Belum ada rekomendasi saat ini.</ThemedText>
        </NeoCard>
      ) : (
        <View style={styles.list}>
          {recommendations.map((anime, idx) => {
            const colors = [COLORS.ACCENT, COLORS.PRIMARY, STATUS_COLORS.ON_AIR, STATUS_COLORS.FINISHED, STATUS_COLORS.UPCOMING, STATUS_COLORS.MOVIE];
            const color = colors[idx % colors.length];

            return (
              <NeoAnimeCard
                key={anime.id}
                anime={anime}
                color={color}
                onPress={() => router.push(`/explore/${anime.id}`)}
              />
            )
          })}
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND, padding: 20 },
  header: { marginBottom: 24, marginTop: 40, backgroundColor: "transparent" },
  subtitle: { color: COLORS.TEXT_SECONDARY, marginTop: 8, fontWeight: "bold" },
  
  list: { paddingBottom: 40 },
  
  emptyState: { padding: 30, alignItems: "center" },
  emptyStateText: { color: COLORS.TEXT_SECONDARY, fontWeight: "bold", fontSize: 16 },
});
