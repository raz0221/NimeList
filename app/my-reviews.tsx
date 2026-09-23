import { COLORS } from "@/constants/theme";
import { StyleSheet, View, ScrollView, ActivityIndicator } from "react-native";
import { Stack, router } from "expo-router";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/src/lib/firebase";
import { ThemedText } from "@/components/themed-text";
import { NeoButton, NeoCard } from "@/components/NeoKit";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { fetchAniList } from "@/src/services/anilist";

const ANILIST_QUERY = `
  query GetAnimeTitles($ids: [Int]) {
    Page(page: 1, perPage: 50) {
      media(id_in: $ids, type: ANIME) {
        id
        title {
          romaji
          english
        }
      }
    }
  }
`;

interface Review {
  id: string;
  animeId?: string;
  animeTitle?: string;
  comment?: string;
  rating?: number | null;
  createdAt?: any;
}

export default function MyReviewsScreen() {
  const { colors, isDark } = useTheme();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchReviews = async () => {
      try {
        const reviewQ = query(
          collection(db, "reviews"),
          where("userId", "==", user.uid)
        );
        const reviewSnap = await getDocs(reviewQ);
        const data: Review[] = reviewSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));

        // 1. Kumpulkan ID Anime yang tidak punya animeTitle
        const missingTitleIds = data
          .filter((r) => !r.animeTitle && r.animeId)
          .map((r) => parseInt(r.animeId!, 10))
          .filter((id) => !isNaN(id));

        // 2. Fetch judul dari AniList jika ada yang kosong
        if (missingTitleIds.length > 0) {
          try {
            const res = await fetchAniList(ANILIST_QUERY, { ids: missingTitleIds });
            const mediaList: any[] = res?.Page?.media || [];
            const titleMap = new Map<string, string>();
            mediaList.forEach((m: any) => {
              titleMap.set(String(m.id), m.title?.romaji || m.title?.english || "Unknown Title");
            });
            data.forEach((r) => {
              if (!r.animeTitle && r.animeId) {
                r.animeTitle = titleMap.get(String(r.animeId)) || `Anime #${r.animeId}`;
              }
            });
          } catch (e) {
            console.log("Failed fetching anime titles", e);
          }
        }

        // 3. Sort manual — konversi Firestore Timestamp ke ms
        data.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
          return timeB - timeA;
        });

        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [user]);

  if (!user) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, { justifyContent: "center", alignItems: "center", backgroundColor: colors.background }]}>
          <ThemedText style={{ fontWeight: "bold" as const, fontSize: 16, marginBottom: 20, color: colors.text }}>
            Silakan login untuk melihat ulasan.
          </ThemedText>
          <NeoButton
            title="Pergi ke Login"
            color={COLORS.PRIMARY}
            onPress={() => router.push("/(tabs)/profile/login")}
          />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <NeoButton
            title="← Kembali"
            color={isDark ? colors.primary : COLORS.PRIMARY}
            onPress={() => router.back()}
            style={{ marginBottom: 16, alignSelf: "flex-start" }}
            textStyle={{ paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 }}
          />
          <ThemedText type="title">Ulasan Saya</ThemedText>
          <ThemedText style={styles.subtitle}>Semua ulasan anime yang pernah kamu tulis</ThemedText>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.ACCENT} style={{ marginTop: 40 }} />
        ) : reviews.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.textMuted} style={{ marginBottom: 16 }} />
            <ThemedText style={{ color: colors.textMuted, fontSize: 16, fontWeight: "bold" as const }}>
              Belum ada ulasan yang ditulis.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.list}>
            {reviews.map((rev) => {
              // Konversi Firebase Timestamp ke Date string
              let dateStr = "-";
              if (rev.createdAt) {
                const dateObj = rev.createdAt.toDate
                  ? rev.createdAt.toDate()
                  : new Date(rev.createdAt);
                if (dateObj instanceof Date && !isNaN(dateObj.valueOf())) {
                  dateStr = dateObj.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                }
              }

              return (
                <NeoCard
                  key={rev.id}
                  color={isDark ? colors.card : COLORS.CARD_BACKGROUND}
                  style={{ marginBottom: 16, borderColor: colors.border }}
                  contentStyle={{ padding: 16 }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <ThemedText style={{ fontWeight: "900" as const, fontSize: 16 }} numberOfLines={2}>
                        {rev.animeTitle || `Anime ID: #${rev.animeId}`}
                      </ThemedText>
                    </View>
                    {rev.rating != null && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Ionicons name="star" size={16} color="#FDE047" />
                        <ThemedText style={{ fontWeight: "bold" as const }}>{rev.rating}/10</ThemedText>
                      </View>
                    )}
                  </View>

                  <ThemedText style={{ color: isDark ? colors.textMuted : COLORS.TEXT_SECONDARY, marginBottom: 12, lineHeight: 22 }}>
                    &quot;{rev.comment}&quot;
                  </ThemedText>

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                    <ThemedText style={{ color: colors.textMuted, fontSize: 12, fontWeight: "bold" as const }}>
                      {dateStr}
                    </ThemedText>
                  </View>
                </NeoCard>
              );
            })}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 24, marginTop: 40 },
  subtitle: { color: COLORS.TEXT_SECONDARY, marginTop: 8, fontWeight: "bold" },
  list: { paddingBottom: 40 },
});
