import { COLORS, STATUS_COLORS } from "@/constants/theme";
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";

import { auth, db } from "@/src/lib/firebase";
import { ThemedText } from "@/components/themed-text";
import { NeoButton, NeoCard } from "@/components/NeoKit";

export default function StatsScreen() {
  const [stats, setStats] = useState({
    totalSelesai: 0,
    totalWatching: 0,
    totalRencana: 0,
    totalDropped: 0,
    totalUlasan: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const watchlistQ = query(
          collection(db, "watchlist"),
          where("userId", "==", user.uid)
        );
        const watchlistSnap = await getDocs(watchlistQ);
        const watchlistItems = watchlistSnap.docs.map(d => d.data());

        const totalSelesai  = watchlistItems.filter(a => a.status === "Selesai").length;
        const totalWatching = watchlistItems.filter(a => a.status === "Sedang Ditonton").length;
        const totalRencana  = watchlistItems.filter(a => a.status === "Rencana Tonton").length;
        const totalDropped  = watchlistItems.filter(a => a.status === "Dropped").length;

        const reviewQ = query(
          collection(db, "reviews"),
          where("userId", "==", user.uid)
        );
        const reviewSnap = await getDocs(reviewQ);
        const totalUlasan = reviewSnap.size;

        setStats({ totalSelesai, totalWatching, totalRencana, totalDropped, totalUlasan });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ThemedText style={{ fontWeight: "bold", fontSize: 16, marginBottom: 20 }}>
          Silakan login untuk melihat statistik.
        </ThemedText>
        <NeoButton
          title="Pergi ke Login"
          color={COLORS.PRIMARY}
          onPress={() => router.push("/(tabs)/profile/login")}
        />
      </View>
    );
  }

  const STAT_CARDS = [
    { value: stats.totalSelesai,  label: "Anime Selesai",      bg: STATUS_COLORS.FINISHED, textColor: COLORS.BUTTON_TEXT_LIGHT  },
    { value: stats.totalWatching, label: "Sedang Ditonton",    bg: STATUS_COLORS.ON_AIR, textColor: COLORS.BUTTON_TEXT_DARK  },
    { value: stats.totalRencana,  label: "Rencana Tonton",     bg: COLORS.PRIMARY, textColor: COLORS.TEXT_MAIN  },
    { value: stats.totalDropped,  label: "Dropped",            bg: COLORS.ACCENT, textColor: COLORS.BUTTON_TEXT_LIGHT  },
    { value: stats.totalUlasan,   label: "Ulasan Ditulis",     bg: STATUS_COLORS.MOVIE, textColor: COLORS.BUTTON_TEXT_LIGHT  },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <NeoButton
          title="← Kembali"
          color={COLORS.PRIMARY}
          onPress={() => router.back()}
          style={{ marginBottom: 16 }}
          textStyle={{ paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 }}
        />
        <ThemedText type="title">Statistik Tontonan</ThemedText>
        <ThemedText style={styles.subtitle}>Rekap koleksi anime kamu dari Firebase</ThemedText>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.ACCENT} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.grid}>
          {STAT_CARDS.map((card) => (
            <NeoCard key={card.label} color={card.bg} contentStyle={styles.statCard}>
              <ThemedText style={[styles.statValue, { color: card.textColor }]}>{card.value}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: card.textColor }]}>{card.label}</ThemedText>
            </NeoCard>
          ))}
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.BACKGROUND, padding: 20 },
  header:     { marginBottom: 24, marginTop: 40 },
  subtitle:   { color: COLORS.TEXT_SECONDARY, marginTop: 8, fontWeight: "bold" },
  grid:       { gap: 16, paddingBottom: 40 },
  statCard:   { padding: 28, alignItems: "center" },
  statValue:  { fontSize: 52, fontWeight: "900", marginBottom: 8 },
  statLabel:  { fontSize: 16, fontWeight: "bold" },
});
