import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { COLORS, STATUS_COLORS, Neubrutalism } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { fetchAniList } from "@/src/services/anilist";
import { NeoButton, NeoAnimeCard } from "@/components/NeoKit";
import { useTheme } from "@/src/context/ThemeContext";

const MOVIES_QUERY = `
  query GetAnimeMovies {
    Page(page: 1, perPage: 20) {
      media(format: MOVIE, sort: TRENDING_DESC, type: ANIME) {
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

export default function MoviesScreen() {
  const { colors, isDark } = useTheme();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchAniList(MOVIES_QUERY);
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
      <ThemedView style={styles.header}>
        <NeoButton
          title="← Kembali"
          color={isDark ? colors.card : COLORS.PRIMARY}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push('/(tabs)/explore');
            }
          }}
          style={{ marginBottom: 16, alignSelf: 'flex-start', borderColor: isDark ? colors.border : '#000' }}
          textStyle={{ paddingVertical: 8, paddingHorizontal: 16, fontSize: 14}}
        />
        <ThemedText type="title">Anime Movie</ThemedText>
        <ThemedText style={styles.subtitle}>Jelajahi film anime layar lebar terbaik</ThemedText>
      </ThemedView>

      {isLoading ? (
        <ActivityIndicator size="large" color={STATUS_COLORS.FINISHED} style={{ marginTop: 40 }} />
      ) : error ? (
        <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
      ) : (
        <View style={styles.list}>
          {data.map((movie, idx) => {
            const colors = [STATUS_COLORS.FINISHED, COLORS.ACCENT, COLORS.PRIMARY, STATUS_COLORS.ON_AIR, STATUS_COLORS.MOVIE];
            const color = colors[idx % colors.length];

            return (
              <NeoAnimeCard
                key={movie.id}
                anime={movie}
                color={color}
                onPress={() => router.push(`/anime/${movie.id}`)}
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
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 24, marginTop: 40, backgroundColor: "transparent" },
  subtitle: { color: COLORS.TEXT_SECONDARY, marginTop: 8, fontWeight: "bold" },
  errorText: { color: COLORS.ACCENT, fontWeight: "bold", textAlign: "center", marginTop: 20 },
  
  list: { paddingBottom: 40 },
});
