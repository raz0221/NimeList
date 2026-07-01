import { COLORS, STATUS_COLORS, Neubrutalism } from "@/constants/theme";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "@/src/lib/firebase";
import { collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { NeoButton, NeoCard, NeoAnimeCard } from "@/components/NeoKit";
import { ThemedText } from "@/components/themed-text";
import { fetchAniList } from "@/src/services/anilist";
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

// Tipe eksplisit dokumen user_collections dari Firestore
interface FirestoreCollectionDoc {
  id: string;
  animeId?: string | number;
  userId?: string;
  status?: string;
  title?: string;
  englishTitle?: string;
  poster?: string;
  episodes?: number;
  duration?: number;
  rating?: string;
  type?: string;
  genres?: string[];
  genre?: string;
  description?: string;
  source?: string;
  studios?: string[];
  startDate?: { year?: number; month?: number; day?: number };
  isAdult?: boolean;
}

const CATEGORIES = [
  { id: "Watching",   label: "Watching",   icon: "play-circle", color: STATUS_COLORS.ON_AIR },
  { id: "Completed",  label: "Completed",  icon: "checkmark-circle", color: STATUS_COLORS.FINISHED },
  { id: "Planning",   label: "Planning",   icon: "list", color: "#93C5FD" },
  { id: "Dropped",    label: "Dropped",    icon: "trash", color: STATUS_COLORS.MOVIE },
];

export default function ManageScreen() {
  const { colors, isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState("Watching");
  const [daftarAnime, setDaftarAnime] = useState<FirestoreCollectionDoc[]>([]);
  const [richAnimeData, setRichAnimeData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }
    const q = query(collection(db, "user_collections"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, async (snap) => {
      const collections = snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreCollectionDoc));
      setDaftarAnime(collections);

      const animeIds = collections.map(c => parseInt(String(c.animeId ?? ''), 10)).filter(id => !isNaN(id));
      if (animeIds.length > 0) {
        try {
          const res = await fetchAniList(BATCH_QUERY, { ids: animeIds });
          const mediaList = res.Page.media || [];
          const dataMap: Record<string, any> = {};
          mediaList.forEach((m: any) => { dataMap[m.id.toString()] = m; });
          setRichAnimeData(dataMap);
        } catch (error) {
          console.error("Batch fetch error", error);
        }
      }
      setIsLoading(false);
    }, err => {
      Alert.alert("Error", "Gagal memuat watchlist.");
      setIsLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleHapus = async (docId: string, title: string) => {
    Alert.alert("Hapus?", `Hapus "${title}" dari koleksi?`, [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: async () => {
        try { await deleteDoc(doc(db, "user_collections", docId)); }
        catch { Alert.alert("Gagal", "Tidak bisa menghapus item."); }
      }},
    ]);
  };

  const handleUpdateStatus = async (docId: string, newStatus: string) => {
    try { await updateDoc(doc(db, "user_collections", docId), { status: newStatus }); }
    catch { Alert.alert("Gagal", "Tidak bisa memperbarui status."); }
  };

  const filteredAnime = daftarAnime.filter(a => a.status === activeCategory);
  const activeCat = CATEGORIES.find(c => c.id === activeCategory);

  if (!user) {
    return (
      <View style={[styles.authWall, { backgroundColor: colors.background }]}>
        <View style={styles.authCard}>
          <View style={styles.authShadow} />
          <View style={[styles.authCardInner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="flag" size={48} color={colors.text} style={{ marginBottom: 12 }} />
            <Text style={[styles.authTitle, { color: colors.text }]}>Koleksi Anime</Text>
            <Text style={[styles.authSub, { color: colors.textMuted }]}>Login untuk kelola daftar tontonanmu</Text>
            <NeoButton title="Masuk / Login" color={STATUS_COLORS.ON_AIR} onPress={() => router.push("/(tabs)/profile/login")} style={{ width: "100%", marginBottom: 10 }} />
            <NeoButton title="Daftar Akun" color={COLORS.PRIMARY} onPress={() => router.push("/(tabs)/profile/register")} style={{ width: "100%" }} />
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
          <Text style={[styles.appBarTitle, { color: colors.text }]}>Koleksiku</Text>
          <Text style={[styles.appBarSub, { color: colors.textMuted }]}>{daftarAnime.length} anime dalam koleksi</Text>
        </View>
        <View style={styles.appBarActions}>
          <TouchableOpacity onPress={() => router.push("/manage/stats")} style={styles.appBarBtn}>
            <View style={styles.appBarBtnShadow} />
            <View style={[styles.appBarBtnMain, { backgroundColor: COLORS.PRIMARY }]}>
              <Ionicons name="stats-chart" size={20} color="#000" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/manage/favorite")} style={styles.appBarBtn}>
            <View style={styles.appBarBtnShadow} />
            <View style={[styles.appBarBtnMain, { backgroundColor: "#FDE047" }]}>
              <Ionicons name="star" size={20} color="#000" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Stats Row ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
        {CATEGORIES.map(cat => {
          const count = daftarAnime.filter(a => a.status === cat.id).length;
          return (
            <View key={cat.id} style={styles.statItem}>
              <View style={styles.statShadow} />
              <View style={[styles.statCard, { backgroundColor: cat.color }]}>
                <Text style={styles.statCount}>{count}</Text>
                <Text style={styles.statLabel}>{cat.label}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* ── Category Tabs ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setActiveCategory(cat.id)}
            style={[styles.tab, activeCategory === cat.id && { backgroundColor: activeCat?.color || COLORS.PRIMARY }, { borderColor: colors.border, backgroundColor: activeCategory === cat.id ? (activeCat?.color || colors.primary) : colors.card }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name={cat.icon as any} size={14} color={activeCategory === cat.id ? '#000' : colors.text} />
              <Text style={[styles.tabText, { color: activeCategory === cat.id ? '#000' : colors.text }, activeCategory === cat.id && styles.tabTextActive]}>
                {cat.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── List ── */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Daftar {activeCat?.label}</Text>
        <Text style={[styles.sectionCount, { color: colors.textMuted }]}>{filteredAnime.length} anime</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.PRIMARY} style={{ marginTop: 40 }} />
      ) : filteredAnime.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyShadow, { backgroundColor: isDark ? colors.card : '#000' }]} />
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="folder-open" size={40} color={colors.text} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Daftar Kosong</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>Belum ada anime di kategori {activeCat?.label}</Text>
          </View>
        </View>
      ) : (
        <View style={{ gap: 0 }}>
          {filteredAnime.map((anime, idx) => {
            const richData = richAnimeData[String(anime.animeId ?? '')] || {};
            const fakeAnime = {
              id: anime.animeId || anime.id,
              title: richData.title || { romaji: anime.title, english: anime.englishTitle },
              coverImage: richData.coverImage || { large: anime.poster },
              status: anime.status,
              episodes: richData.episodes || anime.episodes,
              duration: richData.duration || anime.duration,
              averageScore: richData.averageScore || (anime.rating && anime.rating !== "-" ? parseFloat(anime.rating) * 10 : null),
              format: richData.format || anime.type,
              genres: richData.genres || anime.genres || (anime.genre ? [anime.genre] : []),
              description: richData.description || anime.description,
              source: richData.source || anime.source,
              studios: richData.studios || { nodes: anime.studios?.map((name: string) => ({ name })) || [] },
              startDate: richData.startDate || anime.startDate,
              isAdult: richData.isAdult || anime.isAdult,
            };
            return (
              <View key={anime.id}>
                <NeoAnimeCard
                  anime={fakeAnime}
                  color={idx % 2 === 0 ? COLORS.CARD_BACKGROUND : "#F8F8F8"}
                  onPress={() => router.push(`/(tabs)/anime/${anime.animeId}`)}
                  footerComponent={
                    <View style={styles.cardActions}>
                      <View style={{ flex: 1 }}>
                        <NeoButton
                          title=""
                          color="#FDE047"
                          onPress={() => handleUpdateStatus(anime.id, "Favorite")}
                          style={{ width: '100%' }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 4, justifyContent: 'center' }}>
                            <Ionicons name="heart" size={14} color="#000" />
                            <Text style={{ color: '#000', fontSize: 13, fontWeight: '900' }}>Favorit</Text>
                          </View>
                        </NeoButton>
                      </View>
                      <View style={{ flex: 1 }}>
                        <NeoButton
                          title=""
                          color={COLORS.ACCENT}
                          onPress={() => handleHapus(anime.id, anime.title ?? '')}
                          style={{ width: '100%' }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 4, justifyContent: 'center' }}>
                            <Ionicons name="close" size={14} color="#fff" />
                            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '900' }}>Hapus</Text>
                          </View>
                        </NeoButton>
                      </View>
                    </View>
                  }
                />
              </View>
            );
          })}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  content: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 },

  authWall: { flex: 1, backgroundColor: COLORS.BACKGROUND, justifyContent: "center", padding: 24 },
  authCard: { position: "relative" },
  authShadow: { position: "absolute", top: 6, left: 6, right: -6, bottom: -6, backgroundColor: "#000", borderRadius: Neubrutalism.borderRadius },
  authCardInner: { backgroundColor: COLORS.CARD_BACKGROUND, borderRadius: Neubrutalism.borderRadius, borderWidth: Neubrutalism.borderWidth, borderColor: "#000", padding: 28, alignItems: "center" },
  authIcon: { fontSize: 48, marginBottom: 12 },
  authTitle: { fontSize: 22, fontWeight: "900", color: COLORS.TEXT_MAIN, marginBottom: 6 },
  authSub: { fontSize: 14, color: COLORS.TEXT_SECONDARY, fontWeight: "600", marginBottom: 24, textAlign: "center" },

  appBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  appBarTitle: { fontSize: 26, fontWeight: "900", color: COLORS.TEXT_MAIN },
  appBarSub: { fontSize: 13, color: COLORS.TEXT_SECONDARY, fontWeight: "600", marginTop: 2 },
  appBarActions: { flexDirection: "row", gap: 10 },
  appBarBtn: { position: "relative", width: 44, height: 44 },
  appBarBtnShadow: { position: "absolute", top: 3, left: 3, right: -3, bottom: -3, backgroundColor: "#000", borderRadius: Neubrutalism.borderRadius },
  appBarBtnMain: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: Neubrutalism.borderRadius, borderWidth: Neubrutalism.borderWidth, borderColor: "#000", justifyContent: "center", alignItems: "center" },
  appBarBtnText: { fontSize: 20 },

  statsScroll: { gap: 10, marginBottom: 20, paddingRight: 8 },
  statItem: { position: "relative", width: 80 },
  statShadow: { position: "absolute", top: 3, left: 3, right: -3, bottom: -3, backgroundColor: "#000", borderRadius: Neubrutalism.borderRadius },
  statCard: { borderRadius: Neubrutalism.borderRadius, borderWidth: Neubrutalism.borderWidth, borderColor: "#000", padding: 12, alignItems: "center" },
  statCount: { fontSize: 22, fontWeight: "900", color: "#000" },
  statLabel: { fontSize: 10, fontWeight: "700", color: "#000", marginTop: 2 },

  tabsScroll: { gap: 8, marginBottom: 20, paddingRight: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 99, borderWidth: 1.5, borderColor: "#000", backgroundColor: COLORS.CARD_BACKGROUND },
  tabText: { fontSize: 13, fontWeight: "700", color: COLORS.TEXT_MAIN },
  tabTextActive: { fontWeight: "900" },

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionLabel: { fontSize: 16, fontWeight: "900", color: COLORS.TEXT_MAIN },
  sectionCount: { fontSize: 13, color: COLORS.TEXT_SECONDARY, fontWeight: "600" },

  empty: { position: "relative", marginTop: 8 },
  emptyShadow: { position: "absolute", top: 5, left: 5, right: -5, bottom: -5, backgroundColor: "#000", borderRadius: Neubrutalism.borderRadius },
  emptyCard: { backgroundColor: COLORS.CARD_BACKGROUND, borderRadius: Neubrutalism.borderRadius, borderWidth: Neubrutalism.borderWidth, borderColor: "#000", padding: 36, alignItems: "center" },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: COLORS.TEXT_MAIN, marginBottom: 6 },
  emptySub: { fontSize: 14, color: COLORS.TEXT_SECONDARY, fontWeight: "600", textAlign: "center" },

  cardActions: { flexDirection: "row", gap: 10, paddingHorizontal: 4 },
});
