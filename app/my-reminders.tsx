import { COLORS, STATUS_COLORS, Neubrutalism } from "@/constants/theme";
import { StyleSheet, View, ActivityIndicator, Image, FlatList } from "react-native";
import { Stack, router } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { auth } from "@/src/lib/firebase";
import { ThemedText } from "@/components/themed-text";
import { NeoButton, NeoCard } from "@/components/NeoKit";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { getUserSubscriptions, unsubscribeFromAnime, AnimeSubscription } from "@/src/services/notifyService";

export default function MyRemindersScreen() {
  const { colors, isDark } = useTheme();
  const [subs, setSubs] = useState<AnimeSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unsubbing, setUnsubbing] = useState<string | null>(null);
  const user = auth.currentUser;

  const loadSubs = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }
    setIsLoading(true);
    try {
      const data = await getUserSubscriptions(user.uid);
      // Sort: yang punya jadwal episode terdepan dulu
      data.sort((a, b) => {
        const ta = a.nextAiringAt ?? Infinity;
        const tb = b.nextAiringAt ?? Infinity;
        return ta - tb;
      });
      setSubs(data);
    } catch (e) {
      console.error("Error loading reminders:", e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { loadSubs(); }, [loadSubs]);

  const handleUnsubscribe = async (animeId: string, title: string) => {
    if (!user) return;
    setUnsubbing(animeId);
    try {
      await unsubscribeFromAnime(user.uid, animeId);
      setSubs(prev => prev.filter(s => s.animeId !== animeId));
    } catch (e) {
      console.error("Error unsubscribing:", e);
    } finally {
      setUnsubbing(null);
    }
  };

  /** Format Unix timestamp (detik) ke string tanggal lokal */
  const formatAiringDate = (airingAt: number | null | undefined): string => {
    if (!airingAt) return "Belum ada jadwal";
    const date = new Date(airingAt * 1000);
    return date.toLocaleDateString("id-ID", {
      weekday: "short", day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit"
    });
  };

  /** Hitung sisa waktu dari sekarang */
  const getCountdown = (airingAt: number | null | undefined): string | null => {
    if (!airingAt) return null;
    const now = Math.floor(Date.now() / 1000);
    const diff = airingAt - now;
    if (diff <= 0) return "Sudah tayang";
    const d = Math.floor(diff / 86400);
    const h = Math.floor((diff % 86400) / 3600);
    const m = Math.floor((diff % 3600) / 60);
    if (d > 0) return `${d}h ${h}j lagi`;
    if (h > 0) return `${h}j ${m}m lagi`;
    return `${m} menit lagi`;
  };

  if (!user) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, { justifyContent: "center", alignItems: "center", backgroundColor: colors.background }]}>
          <Ionicons name="notifications-off-outline" size={56} color={colors.textMuted} style={{ marginBottom: 16 }} />
          <ThemedText style={{ fontWeight: "bold", fontSize: 16, marginBottom: 20, textAlign: "center" }}>
            Silakan login untuk melihat pengingat.
          </ThemedText>
          <NeoButton
            title="Pergi ke Login"
            color={COLORS.PRIMARY}
            onPress={() => router.push("/(tabs)/profile/login")}
            textStyle={{ color: '#000' }}
          />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <NeoButton
            title="← Kembali"
            color={COLORS.PRIMARY}
            onPress={() => router.back()}
            style={{ marginBottom: 16, alignSelf: "flex-start" }}
            textStyle={{ paddingVertical: 8, paddingHorizontal: 16, fontSize: 14, color: '#000' }}
          />
          <ThemedText type="title">Pengingat Saya</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}>
            Anime yang kamu aktifkan notifikasinya
          </ThemedText>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.PRIMARY} style={{ marginTop: 40 }} />
        ) : subs.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Ionicons name="notifications-outline" size={56} color={colors.textMuted} style={{ marginBottom: 16 }} />
            <ThemedText style={{ color: colors.textMuted, fontSize: 16, fontWeight: "bold", textAlign: "center" }}>
              Belum ada pengingat aktif.{"\n"}Tekan "Ingatkan Saya" di halaman detail anime.
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={subs}
            keyExtractor={(sub) => sub.animeId}
            renderItem={({ item: sub }) => {
              const countdown = getCountdown(sub.nextAiringAt);
              const isActive = unsubbing === sub.animeId;
              const hasSchedule = !!sub.nextAiringAt;

              return (
                <NeoCard
                  color={isDark ? colors.card : "#FFFFFF"}
                  contentStyle={{ padding: 0 }}
                  style={{ marginBottom: 16 }}
                >
                  <View style={styles.cardRow}>
                    {/* Cover Image */}
                    <View style={styles.coverContainer}>
                      {sub.coverImage ? (
                        <Image
                          source={{ uri: sub.coverImage }}
                          style={StyleSheet.absoluteFill}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.input, justifyContent: "center", alignItems: "center" }]}>
                          <Ionicons name="image-outline" size={28} color={colors.textMuted} />
                        </View>
                      )}
                    </View>

                    {/* Info */}
                    <View style={styles.cardInfo}>
                      {/* Bagian atas: judul, badge, episode */}
                      <View>
                        <ThemedText style={styles.animeTitle} numberOfLines={2}>
                          {sub.animeTitle}
                        </ThemedText>

                        {/* Status Badge */}
                        <View style={[styles.statusBadge, { backgroundColor: hasSchedule ? STATUS_COLORS.ON_AIR : STATUS_COLORS.UPCOMING }]}>
                          <ThemedText style={styles.statusText}>
                            {sub.animeStatus === "RELEASING" ? "Sedang Tayang" : "Belum Tayang"}
                          </ThemedText>
                        </View>

                        {/* Episode Info */}
                        {sub.nextEpisode ? (
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 }}>
                            <Ionicons name="tv-outline" size={13} color={colors.textMuted} />
                            <ThemedText style={[styles.meta, { color: colors.textMuted }]}>
                              Episode {sub.nextEpisode}
                            </ThemedText>
                          </View>
                        ) : null}
                      </View>

                      {/* Baris bawah: Waktu tayang (kiri) & Countdown (kanan) */}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        {/* Airing Time */}
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
                          <ThemedText style={[styles.meta, { color: colors.textMuted }]}>
                            {formatAiringDate(sub.nextAiringAt)}
                          </ThemedText>
                        </View>

                        {/* Countdown */}
                        {countdown && (
                          <View style={[styles.countdownBadge, { backgroundColor: isDark ? colors.input : "#FEF3C7", marginTop: 0 }]}>
                            <Ionicons name="time-outline" size={12} color={isDark ? colors.text : "#92400E"} />
                            <ThemedText style={[styles.countdownText, { color: isDark ? colors.text : "#92400E" }]}>
                              {countdown}
                            </ThemedText>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Action Row */}
                  <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
                    <NeoButton
                      title=""
                      color={isDark ? colors.card : "#FEE2E2"}
                      onPress={() => handleUnsubscribe(sub.animeId, sub.animeTitle)}
                      style={{ flex: 1 }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, justifyContent: "center" }}>
                        {isActive ? (
                          <ActivityIndicator size="small" color={colors.text} />
                        ) : (
                          <>
                            <Ionicons name="notifications-off-outline" size={16} color={isDark ? colors.text : "#DC2626"} />
                            <ThemedText style={[styles.unsubText, { color: isDark ? colors.text : "#DC2626" }]}>
                              Matikan Pengingat
                            </ThemedText>
                          </>
                        )}
                      </View>
                    </NeoButton>
                    <NeoButton
                      title=""
                      color={COLORS.PRIMARY}
                      onPress={() => router.push(`/anime/${sub.animeId}` as any)}
                      style={{ flex: 1 }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 8, justifyContent: "center" }}>
                        <Ionicons name="arrow-forward-outline" size={16} color="#000" />
                        <ThemedText style={[styles.unsubText, { color: "#000" }]}>
                          Lihat Detail
                        </ThemedText>
                      </View>
                    </NeoButton>
                  </View>
                </NeoCard>
              );
            }}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 24, marginTop: 40 },
  subtitle: { marginTop: 6, fontWeight: "600" },
  list: { paddingBottom: 20 },

  cardRow: { flexDirection: "row", minHeight: 120 },
  coverContainer: { width: 95, borderTopLeftRadius: Neubrutalism.borderRadius, borderBottomLeftRadius: Neubrutalism.borderRadius, overflow: 'hidden' },
  cardInfo: { flex: 1, padding: 12, justifyContent: 'space-between' },
  animeTitle: { fontSize: 15, fontWeight: "900", marginBottom: 8, lineHeight: 20 },

  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginBottom: 4 },
  statusText: { fontSize: 11, fontWeight: "900", color: "#000" },

  meta: { fontSize: 12, fontWeight: "600" },
  countdownRow: { alignItems: 'flex-end', marginTop: 'auto' as any },
  countdownBadge: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-end", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  countdownText: { fontSize: 11, fontWeight: "900" },

  cardActions: { flexDirection: "row", gap: 8, padding: 10, borderTopWidth: Neubrutalism.borderWidth },
  unsubText: { fontSize: 12, fontWeight: "900" },
});
