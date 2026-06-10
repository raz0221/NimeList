import { Neubrutalism } from "@/constants/theme";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

const DUMMY_SCHEDULE = [
  { id: "1", title: "One Piece", day: "Minggu", time: "09:00" },
  { id: "2", title: "Jujutsu Kaisen", day: "Kamis", time: "23:56" },
  { id: "3", title: "Demon Slayer", day: "Senin", time: "23:15" },
];

export default function ScheduleScreen() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push('/(tabs)/home');
            }
          }} 
          style={styles.backButton}
        >
          <ThemedText style={{ fontWeight: "900", color: "#000" }}>← Kembali</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Jadwal Rilis Anime</ThemedText>
        <ThemedText style={styles.subtitle}>Jadwal tayang minggu ini</ThemedText>
      </ThemedView>

      <View style={styles.scheduleList}>
        {DUMMY_SCHEDULE.map((item) => (
          <View key={item.id} style={styles.scheduleItem}>
            <View>
              <ThemedText style={styles.scheduleTitle}>{item.title}</ThemedText>
              <ThemedText style={styles.scheduleTime}>{item.time} WIB</ThemedText>
            </View>
            <View style={styles.dayBadge}>
              <ThemedText style={styles.dayText}>{item.day}</ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 20 },
  header: { marginBottom: 24, marginTop: 40, backgroundColor: "transparent" },
  backButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: "#FFD166", alignSelf: "flex-start", marginBottom: 16, ...Neubrutalism },
  subtitle: { color: "#6B7280", marginTop: 8 },
  scheduleList: { gap: 16 },
  scheduleItem: { 
    backgroundColor: "#FFFFFF", 
    padding: 16, 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    ...Neubrutalism 
  },
  scheduleTitle: { fontSize: 18, fontWeight: "bold", color: "#000000" },
  scheduleTime: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  dayBadge: { backgroundColor: "#EF476F", paddingHorizontal: 12, paddingVertical: 6, ...Neubrutalism },
  dayText: { color: "#FFFFFF", fontWeight: "900", fontSize: 14 },
});
