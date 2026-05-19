import { Neubrutalism } from "@/constants/theme";
import { Image } from "expo-image";
import { ScrollView, StyleSheet, View } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

const TRENDING_ANIME = [
  {
    id: 1,
    title: "Jujutsu Kaisen",
    img: "https://myanimelist.net/images/anime/1171/109222.jpg",
  },
  {
    id: 2,
    title: "Attack on Titan",
    img: "https://myanimelist.net/images/anime/10/47347.jpg",
  },
  {
    id: 3,
    title: "Demon Slayer",
    img: "https://myanimelist.net/images/anime/1286/99889.jpg",
  },
  {
    id: 4,
    title: "One Piece",
    img: "https://myanimelist.net/images/anime/1244/138851.jpg",
  },
];

const GENRES = ["Action", "Adventure", "Slice of Life", "Fantasy"];
const NEUBRUTALISM_COLORS = ["#FFD166", "#EF476F", "#06D6A0", "#118AB2"];

export default function ExploreScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#111827", dark: "#0F172A" }}
      headerImage={
        <Image
          source={{
            uri: "https://4kwallpapers.com/images/walls/thumbs_3t/20404.jpg",
          }}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore Anime</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Trending Musim Ini
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingScroll}
        >
          {TRENDING_ANIME.map((anime) => (
            <View key={anime.id} style={styles.trendingCardContainer}>
              <View style={styles.trendingCardShadow} />
              <View style={styles.trendingCard}>
                <Image
                  source={{ uri: anime.img }}
                  style={styles.trendingImage}
                  contentFit="cover"
                />
                <ThemedText style={styles.trendingTitle} numberOfLines={1}>
                  {anime.title}
                </ThemedText>
              </View>
            </View>
          ))}
        </ScrollView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Kategori Genre
        </ThemedText>
        <View style={styles.genreGrid}>
          {GENRES.map((genre, idx) => (
            <View
              key={idx}
              style={[
                styles.genreCard,
                {
                  backgroundColor:
                    NEUBRUTALISM_COLORS[idx % NEUBRUTALISM_COLORS.length],
                },
              ]}
            >
              <ThemedText style={styles.genreText}>{genre}</ThemedText>
            </View>
          ))}
        </View>
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
  titleContainer: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 16,
    color: "#000000",
    fontWeight: "900",
  },
  trendingScroll: {
    gap: 16,
    paddingBottom: 8,
    paddingRight: 8,
  },
  trendingCardContainer: {
    width: 140,
  },
  trendingCardShadow: {
    position: "absolute",
    top: 4,
    left: 4,
    width: "100%",
    height: "100%",
    backgroundColor: "#000000",
  },
  trendingCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    ...Neubrutalism,
  },
  trendingImage: {
    width: "100%",
    height: 200,
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
  genreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  genreCard: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    ...Neubrutalism,
  },
  genreText: {
    color: "#000000",
    fontWeight: "900",
    fontSize: 16,
  },
});
