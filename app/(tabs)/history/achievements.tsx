import { Neubrutalism } from "@/constants/theme";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";

const BADGES = [
  { id: "1", title: "Newbie Otaku", desc: "Selesaikan 1 anime", color: "#FFD166" },
  { id: "2", title: "Binge Watcher", desc: "Tonton 10 episode dalam sehari", color: "#EF476F" },
  { id: "3", title: "Reviewer Handal", desc: "Tulis 5 ulasan", color: "#06D6A0" },
];

export default function AchievementsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={{fontWeight: '900', color: '#000'}}>← Kembali</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Pencapaian</ThemedText>
      </View>

      <View style={styles.grid}>
        {BADGES.map((badge) => (
          <View key={badge.id} style={styles.badgeCard}>
            <View style={[styles.iconContainer, { backgroundColor: badge.color }]}>
              <ThemedText style={styles.iconText}>🏅</ThemedText>
            </View>
            <View style={{flex: 1}}>
              <ThemedText style={styles.badgeTitle}>{badge.title}</ThemedText>
              <ThemedText style={styles.badgeDesc}>{badge.desc}</ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 20 },
  header: { marginBottom: 24, marginTop: 40 },
  backButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#FFD166', alignSelf: 'flex-start', marginBottom: 16, ...Neubrutalism },
  grid: { gap: 16, paddingBottom: 40 },
  badgeCard: { backgroundColor: "#FFFFFF", padding: 16, flexDirection: "row", alignItems: "center", gap: 16, ...Neubrutalism },
  iconContainer: { width: 50, height: 50, justifyContent: "center", alignItems: "center", ...Neubrutalism },
  iconText: { fontSize: 24 },
  badgeTitle: { fontSize: 18, fontWeight: "900", color: "#000", marginBottom: 4 },
  badgeDesc: { fontSize: 14, color: "#6B7280" },
});
