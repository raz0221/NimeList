import { Neubrutalism } from "@/constants/theme";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

const DUMMY_TIMELINE = [
  {
    id: "1",
    action: "Menambahkan",
    item: "Jujutsu Kaisen Episode 12",
    time: "2 jam yang lalu",
    color: "#FFD166",
  },
  {
    id: "2",
    action: "Menyelesaikan",
    item: "Attack on Titan Final Season",
    time: "Kemarin",
    color: "#EF476F",
  },
  {
    id: "3",
    action: "Memberi Rating 10/10",
    item: "Demon Slayer",
    time: "3 hari yang lalu",
    color: "#06D6A0",
  },
];

export default function HistoryScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#111827", dark: "#0F172A" }}
      headerImage={
        <Image
          source={{
            uri: "https://4kwallpapers.com/images/walls/thumbs_3t/26517.png",
          }}
          style={styles.headerImage}
        />
      }
    >
      <View style={styles.headerRow}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Riwayat</ThemedText>
        </ThemedView>
        <TouchableOpacity
          style={styles.badgeButton}
          onPress={() => router.push("/history/achievements")}
        >
          <ThemedText style={styles.badgeText}>🏆 Pencapaian</ThemedText>
        </TouchableOpacity>
      </View>

      <ThemedText style={styles.slogan}>
        Catatan aktivitas dan perjalanan animemu.
      </ThemedText>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Timeline Log
        </ThemedText>
        <View style={styles.timelineContainer}>
          {DUMMY_TIMELINE.map((log) => (
            <View
              key={log.id}
              style={[styles.timelineItem, { borderLeftColor: log.color }]}
            >
              <ThemedText style={styles.timeText}>{log.time}</ThemedText>
              <ThemedText style={styles.actionText}>
                {log.action}{" "}
                <ThemedText style={{ fontWeight: "900", color: "#000000" }}>
                  {log.item}
                </ThemedText>
              </ThemedText>
            </View>
          ))}
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  titleContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  badgeButton: {
    backgroundColor: "#FFD166",
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...Neubrutalism,
  },
  badgeText: { color: "#000000", fontWeight: "bold" },
  slogan: { color: "#9CA3AF", fontSize: 16, marginBottom: 20 },
  headerImage: {
    height: "100%",
    width: "100%",
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  section: { marginBottom: 30 },
  sectionTitle: { marginBottom: 16, color: "#000000", fontWeight: "900" },
  timelineContainer: { gap: 16 },
  timelineItem: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderLeftWidth: 8,
    ...Neubrutalism,
  },
  timeText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "bold",
  },
  actionText: { fontSize: 16, color: "#000000" },
});
