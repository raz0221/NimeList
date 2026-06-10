import { Neubrutalism } from "@/constants/theme";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";

export default function FavoriteScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={{fontWeight: '900', color: '#000'}}>← Kembali</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Koleksi Favorit (Hall of Fame)</ThemedText>
      </View>

      <View style={styles.grid}>
        <View style={styles.card}>
          <ThemedText style={styles.title}>Attack on Titan</ThemedText>
          <ThemedText style={styles.subtitle}>Mahakarya Sejarah</ThemedText>
        </View>
        <View style={[styles.card, {backgroundColor: '#FFD166'}]}>
          <ThemedText style={styles.title}>Fullmetal Alchemist</ThemedText>
          <ThemedText style={styles.subtitle}>Sempurna</ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 20 },
  header: { marginBottom: 24, marginTop: 40 },
  backButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#FFD166', alignSelf: 'flex-start', marginBottom: 16, ...Neubrutalism },
  grid: { gap: 16, paddingBottom: 40 },
  card: { backgroundColor: "#06D6A0", padding: 24, alignItems: "center", ...Neubrutalism },
  title: { fontSize: 20, fontWeight: "900", color: "#000", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#000", fontWeight: "bold" },
});
