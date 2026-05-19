import { Neubrutalism } from "@/constants/theme";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#111827", dark: "#0F172A" }}
      headerImage={
        <Image
          source={{
            uri: "https://4kwallpapers.com/images/walls/thumbs_3t/26035.jpg",
          }}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">AniTrack</ThemedText>
      </ThemedView>

      <ThemedText style={styles.slogan}>
        Pantau Progress Nontonmu, Jangan Sampai Ketinggalan!
      </ThemedText>

      <ThemedView style={styles.categoriesContainer}>
        <View style={[styles.card, { backgroundColor: "#FFD166" }]}>
          <ThemedText style={styles.cardText}>Sedang Ditonton</ThemedText>
        </View>
        <View style={[styles.card, { backgroundColor: "#EF476F" }]}>
          <ThemedText style={styles.cardText}>Selesai</ThemedText>
        </View>
        <View style={[styles.card, { backgroundColor: "#118AB2" }]}>
          <ThemedText style={styles.cardText}>Rencana Tonton</ThemedText>
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  slogan: {
    color: "#9CA3AF",
    fontSize: 16,
    marginBottom: 20,
  },
  headerImage: {
    height: "100%",
    width: "100%",
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  categoriesContainer: {
    gap: 16,
  },
  card: {
    padding: 20,
    ...Neubrutalism,
  },
  cardText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "900",
  },
});
