import { COLORS, STATUS_COLORS, Neubrutalism } from "@/constants/theme";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { fetchAniList } from "@/src/services/anilist";
import { NeoCard } from "@/components/NeoKit";
import { Skeleton } from "@/components/Skeleton";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from '@/src/context/ThemeContext';

const TRENDING_QUERY = `
  query GetTrending {
    Page(page: 1, perPage: 10) {
      media(sort: TRENDING_DESC, type: ANIME, status: RELEASING) {
        id
        title { romaji english }
        coverImage { large }
        averageScore
        format
      }
    }
  }
`;

const NAV_BUTTONS = [
  { icon: "🏆", label: "Top Rated",       color: "#FDE047", route: "/home/leaderboard" },
  { icon: "📡", label: "Sedang Tayang",   color: "#86EFAC", route: "/home/top-airing" },
  { icon: "🌸", label: "Musiman",         color: "#F9A8D4", route: "/home/seasonal" },
  { icon: "⏳", label: "Segera Tayang",   color: "#93C5FD", route: "/home/upcoming" },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const [trending, setTrending] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    fetchAniList(TRENDING_QUERY)
      .then(r => setTrending(r.Page.media || []))
      .catch(e => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* ── App Bar ── */}
      <View style={styles.appBar}>
        <View>
          <ThemedText style={styles.appBarTitle}>AniTrack</ThemedText>
          <ThemedText style={[styles.appBarSub, { color: colors.textMuted }]}>Selamat datang! 👋</ThemedText>
        </View>
        <TouchableOpacity onPress={() => router.push("/modal")} style={styles.notifBtn}>
          <View style={styles.notifBtnShadow} />
          <View style={styles.notifBtnMain}>
            <Text style={styles.notifIcon}>🔔</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ── News Banner ── */}
      <TouchableOpacity onPress={() => router.push("/home/news")} style={styles.mb20}>
        <View style={[styles.newsShadow, { backgroundColor: isDark ? COLORS.ACCENT : '#000' }]} />
        <View style={[styles.newsBanner, { backgroundColor: isDark ? colors.card : COLORS.ACCENT, borderColor: isDark ? COLORS.ACCENT : '#000' }]}>
          <View style={styles.newsBadge}>
            <Text style={styles.newsBadgeText}>BERITA</Text>
          </View>
          <ThemedText style={styles.newsTitle}>📰 Update Anime Terbaru</ThemedText>
          <ThemedText style={styles.newsSub}>Cek berita dan jadwal anime minggu ini!</ThemedText>
          <ThemedText style={styles.newsArrow}>→</ThemedText>
        </View>
      </TouchableOpacity>

      {/* ── Charts Grid ── */}
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionLabel}>Jelajahi Charts</ThemedText>
      </View>
      <View style={styles.navGrid}>
        {NAV_BUTTONS.map(btn => (
          <TouchableOpacity
            key={btn.route}
            style={styles.navItem}
            onPress={() => router.push(btn.route as any)}
          >
            <View style={[styles.navShadow, { backgroundColor: isDark ? btn.color : '#000' }]} />
            <View style={[styles.navCard, { backgroundColor: isDark ? colors.card : btn.color, borderColor: isDark ? btn.color : '#000' }]}>
              <Text style={styles.navIcon}>{btn.icon}</Text>
              <ThemedText style={[styles.navLabel, { color: isDark ? '#fff' : '#000' }]}>{btn.label}</ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Trending Now ── */}
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionLabel}>🔥 Trending Sekarang</ThemedText>
        <TouchableOpacity onPress={() => router.push("/home/top-airing" as any)}>
          <ThemedText style={[styles.seeAll, { color: isDark ? colors.primary : COLORS.ACCENT }]}>Lihat Semua →</ThemedText>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.trendingScroll}
      >
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} width={120} height={196} />)
          : trending.map(anime => {
              const title = anime.title.romaji || anime.title.english;
              return (
                <TouchableOpacity
                  key={anime.id}
                  style={styles.trendCard}
                  onPress={() => router.push(`/explore/${anime.id}`)}
                >
                  <NeoCard contentStyle={{ padding: 0 }}>
                    <Image
                      source={{ uri: anime.coverImage?.large }}
                      style={styles.trendImg}
                      contentFit="cover"
                    />
                    <View style={styles.trendInfo}>
                      <ThemedText style={styles.trendTitle} numberOfLines={1}>{title}</ThemedText>
                      <ThemedText style={[styles.trendMeta, { color: colors.textMuted }]}>{anime.format || "TV"} · {anime.averageScore ? `⭐${(anime.averageScore/10).toFixed(1)}` : "—"}</ThemedText>
                    </View>
                  </NeoCard>
                </TouchableOpacity>
              );
            })}
      </ScrollView>

      {/* ── Schedule CTA ── */}
      <TouchableOpacity onPress={() => router.push("/home/schedule")} style={styles.scheduleBtn}>
        <View style={[styles.scheduleShadow, { backgroundColor: isDark ? STATUS_COLORS.ON_AIR : '#000' }]} />
        <View style={[styles.scheduleBtnMain, { backgroundColor: isDark ? colors.card : STATUS_COLORS.ON_AIR, borderColor: isDark ? STATUS_COLORS.ON_AIR : '#000' }]}>
          <ThemedText style={[styles.scheduleBtnText, { color: isDark ? '#fff' : '#000' }]}>📅 Lihat Jadwal Lengkap →</ThemedText>
        </View>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 },

  // AppBar
  appBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  appBarTitle: { fontSize: 26, fontWeight: "900" },
  appBarSub: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  notifBtn: { position: "relative", width: 44, height: 44 },
  notifBtnShadow: { position: "absolute", top: 3, left: 3, right: -3, bottom: -3, backgroundColor: "#000", borderRadius: 99 },
  notifBtnMain: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: STATUS_COLORS.FINISHED, borderRadius: 99, borderWidth: Neubrutalism.borderWidth, borderColor: "#000", justifyContent: "center", alignItems: "center" },
  notifIcon: { fontSize: 20 },

  // News Banner
  mb20: { marginBottom: 24, position: "relative" },
  newsShadow: { position: "absolute", top: 4, left: 4, right: -4, bottom: -4, backgroundColor: "#000", borderRadius: Neubrutalism.borderRadius, zIndex: 0 },
  newsBanner: { backgroundColor: COLORS.ACCENT, borderRadius: Neubrutalism.borderRadius, borderWidth: Neubrutalism.borderWidth, borderColor: "#000", padding: 16, position: "relative", zIndex: 1 },
  newsBadge: { backgroundColor: "#000", borderRadius: 4, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  newsBadgeText: { color: "#fff", fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  newsTitle: { fontSize: 16, fontWeight: "900", marginBottom: 4 },
  newsSub: { fontSize: 13, fontWeight: "600" },
  newsArrow: { position: "absolute", right: 16, top: "50%", fontSize: 22, fontWeight: "900" },

  // Section header
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionLabel: { fontSize: 16, fontWeight: "900" },
  seeAll: { fontSize: 12, fontWeight: "700" },

  // Nav Grid
  navGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 },
  navItem: { width: "47%", position: "relative" },
  navShadow: { position: "absolute", top: 3, left: 3, right: -3, bottom: -3, backgroundColor: "#000", borderRadius: Neubrutalism.borderRadius, zIndex: 0 },
  navCard: { borderRadius: Neubrutalism.borderRadius, borderWidth: Neubrutalism.borderWidth, borderColor: "#000", padding: 16, position: "relative", zIndex: 1, height: 72, justifyContent: "center" },
  navIcon: { fontSize: 20, marginBottom: 4 },
  navLabel: { fontSize: 13, fontWeight: "900" },

  // Trending
  trendingScroll: { gap: 12, paddingBottom: 8, paddingRight: 8, marginBottom: 28 },
  trendCard: { width: 120 },
  trendImg: { width: "100%", height: 150, borderBottomWidth: Neubrutalism.borderWidth, borderColor: "#000" },
  trendInfo: { padding: 8 },
  trendTitle: { fontSize: 11, fontWeight: "900", marginBottom: 2 },
  trendMeta: { fontSize: 10, fontWeight: "600" },

  scheduleBtn: { position: "relative", marginBottom: 8 },
  scheduleShadow: { position: "absolute", top: 4, left: 4, right: -4, bottom: -4, borderRadius: Neubrutalism.borderRadius },
  scheduleBtnMain: { borderRadius: Neubrutalism.borderRadius, borderWidth: Neubrutalism.borderWidth, paddingVertical: 14, alignItems: "center" },
  scheduleBtnText: { fontSize: 15, fontWeight: "900" },
});
