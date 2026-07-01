import { Skeleton } from "@/components/Skeleton";
import { ThemedText } from "@/components/themed-text";
import { CARD_STYLE, COLORS, STATUS_COLORS, THEME_COLORS } from "@/constants/theme";
import { fetchAniList } from "@/src/services/anilist";
import { NeoButton, NeoAnimeCard } from "@/components/NeoKit";
import { useTheme } from "@/src/context/ThemeContext";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

const TOP_AIRING_QUERY = `
  query GetTopAiring {
    Page(page: 1, perPage: 20) {
      media(status: RELEASING, sort: TRENDING_DESC, type: ANIME) {
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

export default function TopAiringScreen() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchAniList(TOP_AIRING_QUERY);
        setData(response.Page.media);
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <NeoButton
          title="← Kembali"
          color={isDark ? colors.primary : COLORS.PRIMARY}
          onPress={() => router.back()}
          style={{ marginBottom: 16, alignSelf: "flex-start" }}
          textStyle={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            fontSize: 14,
            color: isDark ? "#000" : COLORS.BUTTON_TEXT_LIGHT,
          }}
        />
        <ThemedText type="title">Top Sedang Tayang</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}>Anime terpopuler yang kini sedang on-air</ThemedText>
      </View>

      {isLoading ? (
        <View style={styles.list}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} width="100%" height={100} style={{ marginBottom: 16 }} />
          ))}
        </View>
      ) : error ? (
        <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
      ) : (
        <View style={styles.list}>
          {data.map((anime, idx) => (
            <NeoAnimeCard
              key={anime.id}
              anime={anime}
              rank={idx + 1}
              topRightText="Sedang Tayang"
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
  errorText: { fontWeight: "bold", textAlign: "center", marginTop: 20 },

  list: { paddingBottom: 40 },
});
