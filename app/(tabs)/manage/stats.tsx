import { COLORS, STATUS_COLORS } from "@/constants/theme";
import { router } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { NeoButton, NeoCard } from "@/components/NeoKit";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/src/context/ThemeContext";
import { auth, db } from "@/src/lib/firebase";
import { Ionicons } from "@expo/vector-icons";

export default function StatsScreen() {
  const [stats, setStats] = useState({
    totalSelesai: 0,
    totalWatching: 0,
    totalRencana: 0,
    totalDropped: 0,
    totalUlasan: 0,
  });
  const { colors, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const watchlistQ = query(
          collection(db, "user_collections"),
          where("userId", "==", user.uid),
        );
        const watchlistSnap = await getDocs(watchlistQ);
        const watchlistItems = watchlistSnap.docs.map((d) => d.data());

        const totalSelesai = watchlistItems.filter(
          (a) => a.status === "Completed",
        ).length;
        const totalWatching = watchlistItems.filter(
          (a) => a.status === "Watching",
        ).length;
        const totalRencana = watchlistItems.filter(
          (a) => a.status === "Planning",
        ).length;
        const totalDropped = watchlistItems.filter(
          (a) => a.status === "Dropped",
        ).length;

        const reviewQ = query(
          collection(db, "reviews"),
          where("userId", "==", user.uid),
        );
        const reviewSnap = await getDocs(reviewQ);
        const totalUlasan = reviewSnap.size;

        setStats({
          totalSelesai,
          totalWatching,
          totalRencana,
          totalDropped,
          totalUlasan,
        });
        setFetchError(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setFetchError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (!user) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.background,
          },
        ]}
      >
        <ThemedText
          style={{
            fontWeight: "bold",
            fontSize: 16,
            marginBottom: 20,
            color: colors.text,
          }}
        >
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
    {
      value: stats.totalSelesai,
      label: "Anime Selesai",
      bg: STATUS_COLORS.FINISHED,
      textColor: COLORS.BUTTON_TEXT_LIGHT,
    },
    {
      value: stats.totalWatching,
      label: "Sedang Ditonton",
      bg: STATUS_COLORS.ON_AIR,
      textColor: COLORS.BUTTON_TEXT_DARK,
    },
    {
      value: stats.totalRencana,
      label: "Rencana Tonton",
      bg: COLORS.PRIMARY,
      textColor: COLORS.TEXT_MAIN,
    },
    {
      value: stats.totalDropped,
      label: "Dropped",
      bg: COLORS.ACCENT,
      textColor: COLORS.BUTTON_TEXT_LIGHT,
    },
    {
      value: stats.totalUlasan,
      label: "Ulasan Ditulis",
      bg: STATUS_COLORS.MOVIE,
      textColor: COLORS.BUTTON_TEXT_LIGHT,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <NeoButton
          title="← Kembali"
          color={isDark ? colors.primary : COLORS.PRIMARY}
          onPress={() => router.back()}
          style={{ marginBottom: 16, alignSelf: "flex-start" }}
          textStyle={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            fontSize: 14,
          }}
        />
        <ThemedText type="title">Statistik Tontonan</ThemedText>
        <ThemedText style={styles.subtitle}>
          Rekap koleksi anime kamu!
        </ThemedText>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.ACCENT}
          style={{ marginTop: 40 }}
        />
      ) : fetchError ? (
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <ThemedText style={{ color: colors.textMuted, marginBottom: 16 }}>
            Gagal memuat statistik. Periksa koneksi internet Anda.
          </ThemedText>
        </View>
      ) : (
        <View style={styles.grid}>
          {STAT_CARDS.map((card) => {
            const isReview = card.label === "Ulasan Ditulis";
            const CardContent = (
              <NeoCard
                color={isDark ? colors.card : card.bg}
                style={{ borderColor: isDark ? card.bg : "#000" }}
                contentStyle={[
                  styles.statCard,
                  isReview && { position: "relative" },
                ]}
              >
                {isReview && (
                  <View style={{ position: "absolute", top: 16, right: 16 }}>
                    <Ionicons
                      name="chevron-forward"
                      size={24}
                      color={isDark ? card.bg : card.textColor}
                    />
                  </View>
                )}
                <ThemedText
                  style={[
                    styles.statValue,
                    { color: isDark ? card.bg : card.textColor },
                  ]}
                >
                  {card.value}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.statLabel,
                    { color: isDark ? card.bg : card.textColor },
                  ]}
                >
                  {card.label}
                </ThemedText>
              </NeoCard>
            );

            if (isReview) {
              return (
                <TouchableOpacity
                  key={card.label}
                  activeOpacity={0.8}
                  onPress={() => router.push("/my-reviews")}
                >
                  {CardContent}
                </TouchableOpacity>
              );
            }

            return <View key={card.label}>{CardContent}</View>;
          })}
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 24, marginTop: 40 },
  subtitle: { color: COLORS.TEXT_SECONDARY, marginTop: 8, fontWeight: "bold" },
  grid: { gap: 16, paddingBottom: 40 },
  statCard: { padding: 28, alignItems: "center" },
  statValue: {
    fontSize: 52,
    lineHeight: 60,
    fontWeight: "900",
    marginBottom: 8,
  },
  statLabel: { fontSize: 16, fontWeight: "bold" },
});
