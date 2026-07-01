import { COLORS, STATUS_COLORS, Neubrutalism } from "@/constants/theme";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchAniList } from "@/src/services/anilist";
import { NeoCard } from "@/components/NeoKit";
import { Skeleton } from "@/components/Skeleton";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from '@/src/context/ThemeContext';

const UNREAD_KEY = '@anitrack_info_unread';

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
  { icon: "trophy", label: "Top Rated",       color: "#FDE047", route: "/home/leaderboard" },
  { icon: "radio", label: "Sedang Tayang",   color: "#86EFAC", route: "/home/top-airing" },
  { icon: "flower", label: "Musiman",         color: "#F9A8D4", route: "/home/seasonal" },
  { icon: "time", label: "Segera Tayang",   color: "#93C5FD", route: "/home/upcoming" },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const [trending, setTrending] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    fetchAniList(TRENDING_QUERY)
      .then(r => setTrending(r.Page.media || []))
      .catch(e => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

  // Cek status unread dari AsyncStorage setiap kali layar fokus
  useEffect(() => {
    const checkUnread = async () => {
      try {
        const stored = await AsyncStorage.getItem(UNREAD_KEY);
        setHasUnread(stored !== null && parseInt(stored, 10) > 0);
      } catch { /* abaikan error */ }
    };
    checkUnread();
    // Re-check setiap 30 detik (polled sync sederhana)
    const interval = setInterval(checkUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* ── App Bar ── */}
      <View style={styles.appBar}>
        <View>
          <ThemedText style={styles.appBarTitle}>AniTrack</ThemedText>
          <ThemedText style={[styles.appBarSub, { color: colors.textMuted }]}>Selamat datang!</ThemedText>
        </View>
        {/* Bell icon dengan unread badge */}
        <TouchableOpacity
          id="home-bell-btn"
          onPress={() => router.push('/info' as any)}
          style={styles.notifBtn}
        >
          <View style={[styles.notifBtnShadow, { backgroundColor: colors.shadow }]} />
          <View style={[styles.notifBtnMain, { backgroundColor: STATUS_COLORS.FINISHED, borderColor: colors.border }]}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </View>
          {/* Titik merah badge unread */}
          {hasUnread && (
            <View style={styles.notifBadgeDot} />
          )}
        </TouchableOpacity>
      </View>



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
              <Ionicons name={btn.icon as any} size={20} color={isDark ? colors.text : '#000'} style={{ marginBottom: 4 }} />
              <ThemedText style={[styles.navLabel, { color: isDark ? '#fff' : '#000' }]}>{btn.label}</ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Trending Now ── */}
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="flame" size={18} color={isDark ? colors.text : '#000'} />
          <ThemedText style={styles.sectionLabel}>Trending Sekarang</ThemedText>
        </View>
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
                  onPress={() => router.push(`/anime/${anime.id}`)}
                >
                  <NeoCard contentStyle={{ padding: 0 }}>
                    <Image
                      source={{ uri: anime.coverImage?.large }}
                      style={styles.trendImg}
                      contentFit="cover"
                    />
                    <View style={styles.trendInfo}>
                      <ThemedText style={styles.trendTitle} numberOfLines={1}>{title}</ThemedText>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <ThemedText style={[styles.trendMeta, { color: colors.textMuted }]}>{anime.format || "TV"} · </ThemedText>
                        {anime.averageScore ? (
                          <>
                            <Ionicons name="star" size={10} color={colors.textMuted} />
                            <ThemedText style={[styles.trendMeta, { color: colors.textMuted }]}>{(anime.averageScore/10).toFixed(1)}</ThemedText>
                          </>
                        ) : (
                          <ThemedText style={[styles.trendMeta, { color: colors.textMuted }]}>—</ThemedText>
                        )}
                      </View>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="calendar" size={18} color={isDark ? '#fff' : '#000'} />
            <ThemedText style={[styles.scheduleBtnText, { color: isDark ? '#fff' : '#000' }]}>Lihat Jadwal Lengkap →</ThemedText>
          </View>
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
  notifBtn: { position: "relative", width: 46, height: 46 },
  notifBtnShadow: { position: "absolute", top: 3, left: 3, right: -3, bottom: -3, borderRadius: 99 },
  notifBtnMain: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 99, borderWidth: Neubrutalism.borderWidth, justifyContent: "center", alignItems: "center" },
  notifBadgeDot: { position: "absolute", top: 2, right: 2, width: 11, height: 11, borderRadius: 6, backgroundColor: "#EF4444", borderWidth: 2, borderColor: "#fff", zIndex: 10 },

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
