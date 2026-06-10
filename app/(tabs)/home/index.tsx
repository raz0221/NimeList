import { Neubrutalism } from "@/constants/theme";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

const DUMMY_TRENDING = [
  {
    id: "1",
    title: "Jujutsu Kaisen",
    img: "https://myanimelist.net/images/anime/1171/109222.jpg",
  },
  {
    id: "2",
    title: "Attack on Titan",
    img: "https://myanimelist.net/images/anime/10/47347.jpg",
  },
];

const NAV_BUTTONS = [
  { label: "🏆", sub: "Top Rated", bg: "#FFD166", route: "/home/leaderboard" },
  {
    label: "📡",
    sub: "Sedang Tayang",
    bg: "#EF476F",
    route: "/home/top-airing",
  },
  { label: "🌸", sub: "Musiman", bg: "#06D6A0", route: "/home/seasonal" },
  { label: "⏳", sub: "Segera Tayang", bg: "#118AB2", route: "/home/upcoming" },
];

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#111827", dark: "#0F172A" }}
      headerImage={
        <Image
          source={{
            uri: "https://wallpapers-clan.com/wp-content/uploads/2024/04/konosuba-megumin-dark-desktop-wallpaper-preview.jpg",
          }}
          style={styles.headerImage}
        />
      }
    >
      {/* ── Header row ── */}
      <View style={styles.headerRow}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Beranda</ThemedText>
        </ThemedView>
        <TouchableOpacity
          style={styles.notifButton}
          onPress={() => router.push("/modal")}
        >
          <ThemedText style={styles.notifText}>🔔 Notifikasi</ThemedText>
        </TouchableOpacity>
      </View>

      <ThemedText style={styles.slogan}>Selamat datang di AniTrack!</ThemedText>

      {/* ── Berita Banner ── */}
      <TouchableOpacity
        style={styles.newsBanner}
        onPress={() => router.push("/home/news")}
      >
        <View>
          <ThemedText style={styles.newsBadge}>📰 BERITA TERBARU</ThemedText>
          <ThemedText style={styles.newsTeaser}>
            Chainsaw Man S2 & One Punch Man S3 diumumkan!
          </ThemedText>
        </View>
        <ThemedText style={styles.newsArrow}>→</ThemedText>
      </TouchableOpacity>

      {/* ── 4 Nav Buttons ── */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Jelajahi Charts
        </ThemedText>
        <View style={styles.navList}>
          {NAV_BUTTONS.map((btn) => (
            <TouchableOpacity
              key={btn.route}
              style={[styles.navButton, { backgroundColor: btn.bg }]}
              onPress={() => router.push(btn.route as any)}
            >
              <ThemedText style={styles.navButtonText}>
                {btn.label} {btn.sub}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>

      {/* ── Jadwal Lengkap ── */}
      <ThemedView style={styles.section}>
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={() => router.push("/home/schedule")}
        >
          <ThemedText style={styles.scheduleButtonText}>
            📅 Lihat Jadwal Lengkap
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    height: "100%",
    width: "100%",
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  titleContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  notifButton: {
    backgroundColor: "#118AB2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...Neubrutalism,
  },
  notifText: { color: "#FFFFFF", fontWeight: "bold" },
  slogan: { color: "#9CA3AF", fontSize: 16, marginBottom: 16 },

  newsBanner: {
    backgroundColor: "#EF476F",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    ...Neubrutalism,
  },
  newsBadge: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 11,
    marginBottom: 6,
  },
  newsTeaser: { color: "#FFFFFF", fontWeight: "bold", fontSize: 15 },
  newsArrow: { color: "#FFFFFF", fontWeight: "900", fontSize: 22 },

  section: { marginBottom: 30 },
  sectionTitle: { marginBottom: 16, color: "#000000", fontWeight: "900" },

  // 4-button nav list
  navList: { gap: 12 },
  navButton: { padding: 16, alignItems: "center", ...Neubrutalism },
  navButtonText: { color: "#000000", fontSize: 16, fontWeight: "900" },

  // Trending
  trendingScroll: { gap: 16, paddingBottom: 8, paddingRight: 8 },
  trendingCardContainer: { width: 140 },
  trendingCardShadow: {
    position: "absolute",
    top: 4,
    left: 4,
    width: "100%",
    height: "100%",
    backgroundColor: "#000000",
  },
  trendingCard: { width: "100%", backgroundColor: "#FFFFFF", ...Neubrutalism },
  trendingImage: {
    width: "100%",
    height: 180,
    borderBottomWidth: 3,
    borderColor: "#000000",
  },
  trendingTitle: {
    padding: 12,
    fontSize: 14,
    fontWeight: "900",
    color: "#000000",
    textAlign: "center",
  },

  scheduleButton: {
    backgroundColor: "#06D6A0",
    padding: 16,
    alignItems: "center",
    ...Neubrutalism,
  },
  scheduleButtonText: { color: "#000000", fontSize: 16, fontWeight: "900" },
});
