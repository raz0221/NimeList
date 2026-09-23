import { COLORS, STATUS_COLORS } from "@/constants/theme";
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Text } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";

import { auth, db } from "@/src/lib/firebase";
import { ThemedText } from "@/components/themed-text";
import { NeoButton, NeoCard, NeoAnimeCard } from "@/components/NeoKit";
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

export default function FavoriteScreen() {
  const { colors, isDark } = useTheme();
  const [favorites, setFavorites] = useState<FirestoreCollectionDoc[]>([]);
  const [richAnimeData, setRichAnimeData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Query user_collections yang memiliki status Favorit
    const q = query(
      collection(db, "user_collections"),
      where("userId", "==", user.uid),
      where("status", "==", "Favorite")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreCollectionDoc));
      setFavorites(data);

      const animeIds = data.map(c => parseInt(String(c.animeId ?? ''), 10)).filter(id => !isNaN(id));
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
    }, (error) => {
      console.error("Error fetching favorites:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleRemoveFavorite = async (docId: string, title: string) => {
    try {
      await updateDoc(doc(db, "user_collections", docId), { status: "Watching" });
      Alert.alert("Dihapus", `"${title}" dihapus dari Hall of Fame.`);
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const TILE_COLORS = [STATUS_COLORS.ON_AIR, COLORS.PRIMARY, COLORS.ACCENT, STATUS_COLORS.FINISHED, STATUS_COLORS.MOVIE, STATUS_COLORS.UPCOMING];

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center", backgroundColor: colors.background }]}>
        <ThemedText style={{ fontWeight: "bold", fontSize: 16, marginBottom: 20, color: colors.text }}>
          Silakan login untuk melihat Koleksi Favorit.
        </ThemedText>
        <NeoButton
          title="Pergi ke Login"
          color={COLORS.PRIMARY}
          onPress={() => router.push("/(tabs)/profile/login")}
        />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <NeoButton
          title="← Kembali"
          color={isDark ? colors.primary : COLORS.PRIMARY}
          onPress={() => router.back()}
          style={{ marginBottom: 16, alignSelf: 'flex-start' }}
          textStyle={{ paddingVertical: 8, paddingHorizontal: 16, fontSize: 14}}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <ThemedText type="title">Hall of Fame</ThemedText>
          <Ionicons name="star" size={26} color="#FDE047" />
        </View>
        <ThemedText style={styles.subtitle}>Anime favoritmu yang paling berkesan</ThemedText>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.PRIMARY} style={{ marginTop: 40 }} />
      ) : favorites.length === 0 ? (
        <NeoCard color={colors.card} contentStyle={styles.emptyState}>
          <Ionicons name="star" size={48} color={colors.text} style={{ marginBottom: 12 }} />
          <ThemedText style={[styles.emptyText, { color: colors.text }]}>Belum ada anime favorit.</ThemedText>
          <ThemedText style={[styles.emptyHint, { color: colors.textMuted }]}>
            Buka Manajemen Tontonan dan tandai anime favoritmu!
          </ThemedText>
          <NeoButton
            title="Buka Koleksiku →"
            color={STATUS_COLORS.ON_AIR}
            onPress={() => router.push("/(tabs)/manage")}
            style={{ marginTop: 12 }}
          />
        </NeoCard>
      ) : (
        <View style={styles.grid}>
          {favorites.map((anime, idx) => {
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
                  color={TILE_COLORS[idx % TILE_COLORS.length]}
                  style={{ marginBottom: 12 }}
                  onPress={() => router.push(`/anime/${anime.animeId || anime.id}`)}
                />
                <NeoButton
                  title=""
                  color={colors.card}
                  onPress={() => handleRemoveFavorite(anime.id, anime.title ?? '')}
                  style={{ marginBottom: 24, borderColor: colors.border }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 18, justifyContent: 'center' }}>
                    <Ionicons name="close" size={14} color={COLORS.ACCENT} />
                    <Text style={{ color: COLORS.ACCENT, fontSize: 13, fontWeight: '900' }}>Hapus dari Favorit</Text>
                  </View>
                </NeoButton>
              </View>
            )
          })}
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, padding: 20 },
  header:       { marginBottom: 24, marginTop: 40 },
  subtitle:     { color: COLORS.TEXT_SECONDARY, marginTop: 8, fontWeight: "bold" },
  emptyState:   { padding: 36, alignItems: "center" },
  emptyIcon:    { fontSize: 48, marginBottom: 12 },
  emptyText:    { fontSize: 18, fontWeight: "900", color: COLORS.TEXT_MAIN, marginBottom: 8 },
  emptyHint:    { fontSize: 14, color: COLORS.TEXT_SECONDARY, textAlign: "center", marginBottom: 20 },
  grid:         { paddingBottom: 40 },
});
