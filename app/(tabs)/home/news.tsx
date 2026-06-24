import { COLORS, STATUS_COLORS } from "@/constants/theme";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { fetchAniList } from "@/src/services/anilist";
import { NeoButton, NeoCard, NeoBadge } from "@/components/NeoKit";
import { useTheme } from "@/src/context/ThemeContext";

// AniList: ambil anime trending terbaru sebagai sumber "berita"
const LATEST_TRENDING_QUERY = `
  query GetLatestNews {
    Page(page: 1, perPage: 15) {
      media(sort: TRENDING_DESC, type: ANIME, status_in: [RELEASING, FINISHED]) {
        id
        title { romaji english }
        updatedAt
        status
        genres
      }
    }
  }
`;

const STATUS_LABEL: Record<string, string> = {
  RELEASING: "Sedang Tayang",
  FINISHED: "Selesai Tayang",
  NOT_YET_RELEASED: "Segera Tayang",
  CANCELLED: "Dibatalkan",
  HIATUS: "Hiatus",
};

const CATEGORY_COLORS = [COLORS.ACCENT, STATUS_COLORS.FINISHED, STATUS_COLORS.ON_AIR, STATUS_COLORS.UPCOMING, STATUS_COLORS.MOVIE, COLORS.PRIMARY];

export default function NewsScreen() {
  const [newsFeed, setNewsFeed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetchAniList(LATEST_TRENDING_QUERY);
        setNewsFeed(response.Page.media || []);
      } catch (error) {
        console.error("Error fetching news feed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
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
        <ThemedText type="title">Berita &amp; Update Anime</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}>Trending terbaru dari AniList</ThemedText>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.ACCENT} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.newsList}>
          {newsFeed.map((item, idx) => {
            const title = item.title.romaji || item.title.english;
            const category = STATUS_LABEL[item.status] || item.status;
            const genre = item.genres?.[0] || "Anime";
            const badgeColor = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

            // Format timestamp
            const date = item.updatedAt
              ? new Date(item.updatedAt * 1000).toLocaleDateString("id-ID", {
                day: "numeric", month: "long", year: "numeric",
              })
              : "Baru saja";

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(`/explore/${item.id}`)}
              >
                <NeoCard contentStyle={styles.newsCard}>
                  <View style={styles.cardTopRow}>
                    <NeoBadge label={category} color={badgeColor} textStyle={{ color: COLORS.BUTTON_TEXT_DARK }} />
                    <NeoBadge label={genre} color={STATUS_COLORS.DEFAULT} textStyle={{ color: COLORS.TEXT_SECONDARY }} />
                  </View>
                  <ThemedText style={styles.newsTitle}>{title}</ThemedText>
                  <View style={styles.footerRow}>
                    <ThemedText style={styles.newsDate}>🗓️ {date}</ThemedText>
                    <ThemedText style={styles.readMore}>Lihat Detail →</ThemedText>
                  </View>
                </NeoCard>
              </TouchableOpacity>
            );
          })}
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
  newsList: { gap: 20, paddingBottom: 40 },
  newsCard: { padding: 20 },
  cardTopRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  newsTitle: { fontSize: 17, fontWeight: "900", marginBottom: 12, lineHeight: 24 },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  newsDate: { fontSize: 13, fontWeight: "bold" },
  readMore: { fontSize: 13, color: STATUS_COLORS.FINISHED, fontWeight: "900" },
});
