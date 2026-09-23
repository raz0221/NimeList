import { CARD_STYLE, COLORS, STATUS_COLORS, Neubrutalism } from "@/constants/theme";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/src/lib/firebase";
import { NeoAnimeCard, NeoButton } from "@/components/NeoKit";
import { Skeleton } from "@/components/Skeleton";
import { fetchAniList } from "@/src/services/anilist";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const BATCH_QUERY = `
  query GetAnimeBatch($ids: [Int]) {
    Page(page: 1, perPage: 50) {
      media(id_in: $ids, type: ANIME) {
        id
        title { romaji english }
        coverImage { large extraLarge }
        startDate { year month day }
        episodes
        duration
        genres
        description
        studios(isMain: true) { nodes { name } }
        source
        averageScore
        format
        isAdult
      }
    }
  }
`;

export default function HistoryScreen() {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [richAnimeData, setRichAnimeData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const user = auth.currentUser;
  const { colors, isDark } = useTheme();

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }
    const q = query(collection(db, "user_history"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, async (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      data.sort((a, b) => {
        const tA = a.timestamp?.toMillis?.() ?? 0;
        const tB = b.timestamp?.toMillis?.() ?? 0;
        return tB - tA;
      });
      setTimeline(data);
      
      const animeIds = data.map(c => parseInt(c.animeId, 10)).filter(id => !isNaN(id));
      if (animeIds.length > 0) {
        setFetchError(false);
        try {
          const res = await fetchAniList(BATCH_QUERY, { ids: animeIds });
          const mediaList = res.Page.media || [];
          const dataMap: Record<string, any> = {};
          mediaList.forEach((m: any) => { dataMap[m.id.toString()] = m; });
          setRichAnimeData(dataMap);
        } catch (error) {
          console.error("Batch fetch error", error);
          setFetchError(true);
        }
      }
      setIsLoading(false);
    }, () => {
      setIsLoading(false);
      setFetchError(true);
    });
    return () => unsub();
  }, [user]);

  if (!user) {
    return (
      <View style={[styles.authWall, { backgroundColor: colors.background }]}>
        <View style={styles.authCard}>
          <View style={[styles.authShadow, { backgroundColor: colors.shadow }]} />
          <View style={[styles.authCardInner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="book" size={48} color={colors.text} style={{ marginBottom: 12 }} />
            <ThemedText style={styles.authTitle}>Riwayat Aktivitas</ThemedText>
            <ThemedText style={[styles.authSub, { color: colors.textMuted }]}>Login untuk melihat riwayat anime yang pernah kamu buka</ThemedText>
            <NeoButton title="Masuk / Login" color={STATUS_COLORS.ON_AIR} onPress={() => router.push("/(tabs)/profile/login")} style={{ width: "100%" }} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* ── App Bar ── */}
      <View style={styles.appBar}>
        <View>
          <ThemedText style={styles.appBarTitle}>Riwayat</ThemedText>
          <ThemedText style={[styles.appBarSub, { color: colors.textMuted }]}>{timeline.length} aktivitas tercatat</ThemedText>
        </View>
      </View>

      {/* ── Summary Strip ── */}
      {timeline.length > 0 && (
        <View style={[styles.summaryStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryNum}>{timeline.length}</ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: colors.textMuted }]}>Total</ThemedText>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryNum}>
              {timeline[0]?.timestamp?.toDate
                ? timeline[0].timestamp.toDate().toLocaleDateString("id-ID", { day: "numeric", month: "short" })
                : "—"}
            </ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: colors.textMuted }]}>Terakhir</ThemedText>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryNum}>
              {new Set(timeline.map((t: any) => t.animeId)).size}
            </ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: colors.textMuted }]}>Unik</ThemedText>
          </View>
        </View>
      )}

      {/* ── Section Label ── */}
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="list" size={18} color={colors.text} />
          <ThemedText style={styles.sectionLabel}>Timeline Log</ThemedText>
        </View>
      </View>

      {/* ── Content ── */}
      {isLoading ? (
        <View style={{ gap: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} width="100%" height={140} />)}
        </View>
      ) : fetchError ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <ThemedText style={{ color: colors.textMuted, marginBottom: 16 }}>Gagal memuat histori. Periksa koneksi internet Anda.</ThemedText>
        </View>
      ) : timeline.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyShadow, { backgroundColor: colors.shadow }]} />
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="play-circle" size={40} color={colors.text} style={{ marginBottom: 12 }} />
            <ThemedText style={styles.emptyTitle}>Belum Ada Riwayat</ThemedText>
            <ThemedText style={[styles.emptySub, { color: colors.textMuted }]}>Mulai jelajahi anime untuk mencatat riwayat aktivitas</ThemedText>
          </View>
        </View>
      ) : (
        <View>
          {timeline.map((log, idx) => {
            const timeString = log.timestamp?.toDate
              ? log.timestamp.toDate().toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
              : "Baru saja";
              
            const richData = richAnimeData[log.animeId] || {};
            const fakeAnime = {
              id: log.animeId,
              title: richData.title || { romaji: log.title, english: log.englishTitle },
              coverImage: richData.coverImage || { large: log.poster },
              episodes: richData.episodes || log.episodes,
              duration: richData.duration || log.duration,
              averageScore: richData.averageScore || (log.rating && log.rating !== "-" ? parseFloat(log.rating) * 10 : null),
              format: richData.format || log.type,
              genres: richData.genres || log.genres || [],
              description: richData.description || log.description,
              source: richData.source || log.source,
              studios: richData.studios || { nodes: log.studios?.map((name: string) => ({ name })) || [] },
              startDate: richData.startDate || log.startDate,
              isAdult: richData.isAdult || log.isAdult,
            };
            return (
              <NeoAnimeCard
                key={log.id}
                anime={fakeAnime}
                topRightText={`Dilihat: ${timeString}`}
                onPress={() => router.push(`/anime/${log.animeId}`)}
              />
            );
          })}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 },

  authWall: { flex: 1, justifyContent: "center", padding: 24 },
  authCard: { position: "relative" },
  authShadow: { position: "absolute", top: 6, left: 6, right: -6, bottom: -6, borderRadius: Neubrutalism.borderRadius },
  authCardInner: { borderRadius: Neubrutalism.borderRadius, borderWidth: Neubrutalism.borderWidth, padding: 28, alignItems: "center" },
  authIcon: { fontSize: 48, marginBottom: 12 },
  authTitle: { fontSize: 22, fontWeight: "900", marginBottom: 6 },
  authSub: { fontSize: 14, fontWeight: "600", marginBottom: 24, textAlign: "center" },

  appBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  appBarTitle: { fontSize: 26, fontWeight: "900" },
  appBarSub: { fontSize: 13, fontWeight: "600", marginTop: 2 },

  summaryStrip: { flexDirection: "row", borderWidth: Neubrutalism.borderWidth, borderRadius: Neubrutalism.borderRadius, marginBottom: 20, overflow: "hidden" },
  summaryItem: { flex: 1, alignItems: "center", paddingVertical: 14 },
  summaryNum: { fontSize: 20, fontWeight: "900" },
  summaryLabel: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  summaryDivider: { width: Neubrutalism.borderWidth },

  sectionHeader: { marginBottom: 12 },
  sectionLabel: { fontSize: 16, fontWeight: "900" },

  empty: { position: "relative", marginTop: 8 },
  emptyShadow: { position: "absolute", top: 5, left: 5, right: -5, bottom: -5, borderRadius: Neubrutalism.borderRadius },
  emptyCard: { borderRadius: Neubrutalism.borderRadius, borderWidth: Neubrutalism.borderWidth, padding: 36, alignItems: "center" },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "900", marginBottom: 6 },
  emptySub: { fontSize: 14, fontWeight: "600", textAlign: "center" },
});
