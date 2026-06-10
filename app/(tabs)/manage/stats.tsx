import { Neubrutalism } from "@/constants/theme";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";

export default function StatsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={{fontWeight: '900', color: '#000'}}>← Kembali</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Statistik Tontonan</ThemedText>
      </View>

      <View style={styles.statCard}>
        <ThemedText style={styles.statValue}>150</ThemedText>
        <ThemedText style={styles.statLabel}>Total Anime Selesai</ThemedText>
      </View>
      
      <View style={[styles.statCard, {backgroundColor: '#118AB2'}]}>
        <ThemedText style={[styles.statValue, {color: '#FFF'}]}>45</ThemedText>
        <ThemedText style={[styles.statLabel, {color: '#FFF'}]}>Hari Waktu Menonton</ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 20 },
  header: { marginBottom: 24, marginTop: 40 },
  backButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#FFD166', alignSelf: 'flex-start', marginBottom: 16, ...Neubrutalism },
  statCard: { backgroundColor: "#EF476F", padding: 24, alignItems: "center", marginBottom: 16, ...Neubrutalism },
  statValue: { fontSize: 48, fontWeight: "900", color: "#000", marginBottom: 8 },
  statLabel: { fontSize: 16, color: "#000", fontWeight: "bold" },
});
