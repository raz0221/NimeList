import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View, ScrollView, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from "firebase/firestore";

import { COLORS, STATUS_COLORS, Neubrutalism } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/src/context/ThemeContext";
import { fetchAniList } from "@/src/services/anilist";
import { auth, db } from "@/src/lib/firebase";
import { deleteDoc, doc, updateDoc, setDoc } from "firebase/firestore";
import { NeoCard, NeoBadge, NeoButton, NeoInput } from "@/components/NeoKit";

const ANIME_DETAIL_QUERY = `
  query GetAnimeDetail($id: Int!) {
    Media(id: $id, type: ANIME) {
      id
      title {
        romaji
      }
      description
      coverImage {
        extraLarge
      }
      bannerImage
      genres
      status
      episodes
      averageScore
      format
    }
  }
`;

export default function AnimeDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const [animeDetail, setAnimeDetail] = useState<any>(null);
  const [isLoadingAnime, setIsLoadingAnime] = useState(true);

  const [review, setReview] = useState("");
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [collectionStatus, setCollectionStatus] = useState<string | null>(null);
  const [collectionDocId, setCollectionDocId] = useState<string | null>(null);

  const stripHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, '');
  };

  useEffect(() => {
    if (!id) return;

    // Fetch Anime Detail from AniList
    const fetchDetail = async () => {
      try {
        const data = await fetchAniList(ANIME_DETAIL_QUERY, { id: parseInt(id as string, 10) });
        setAnimeDetail(data.Media);

        // Record history
        if (auth.currentUser && data.Media) {
          const historyRef = doc(db, "user_history", `${auth.currentUser.uid}_${id}`);
          await setDoc(historyRef, {
            userId: auth.currentUser.uid,
            animeId: id,
            title: data.Media.title.romaji,
            englishTitle: data.Media.title.english || null,
            poster: data.Media.coverImage?.extraLarge || data.Media.bannerImage,
            episodes: data.Media.episodes || 0,
            duration: data.Media.duration || 0,
            rating: data.Media.averageScore ? (data.Media.averageScore / 10).toFixed(1) : "-",
            genres: data.Media.genres || [],
            type: data.Media.format || "TV",
            description: data.Media.description || "",
            source: data.Media.source || "",
            studios: data.Media.studios?.nodes?.map((n: any) => n.name) || [],
            startDate: data.Media.startDate || null,
            isAdult: data.Media.isAdult || false,
            timestamp: serverTimestamp()
          }, { merge: true });
        }
      } catch (error) {
        console.error("Error fetching anime detail:", error);
      } finally {
        setIsLoadingAnime(false);
      }
    };

    fetchDetail();

    // Fetch Reviews from Firestore in real-time
    const q = query(
      collection(db, "reviews"),
      where("animeId", "==", id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort local to avoid index error
      fetchedReviews.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });

      setReviewsList(fetchedReviews);
      setIsLoadingReviews(false);
    }, (error) => {
      console.error("Error fetching reviews:", error);
      setIsLoadingReviews(false);
    });

    let unsubscribeCollection = () => {};
    if (auth.currentUser) {
      const collectionQ = query(
        collection(db, "user_collections"),
        where("userId", "==", auth.currentUser.uid),
        where("animeId", "==", id)
      );

      unsubscribeCollection = onSnapshot(collectionQ, (snapshot) => {
        if (!snapshot.empty) {
          const docData = snapshot.docs[0];
          setCollectionStatus(docData.data().status);
          setCollectionDocId(docData.id);
        } else {
          setCollectionStatus(null);
          setCollectionDocId(null);
        }
      });
    }

    return () => {
      unsubscribe();
      unsubscribeCollection();
    };
  }, [id]);

  const handleKirimUlasan = async () => {
    if (!review.trim()) {
      Alert.alert("Error", "Ulasan tidak boleh kosong!");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Akses Ditolak", "Anda harus login untuk mengirim ulasan.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "reviews"), {
        animeId: id,
        userId: currentUser.uid,
        text: review,
        createdAt: serverTimestamp()
      });
      
      Alert.alert("Sukses", "Ulasan berhasil dikirim!");
      setReview("");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", "Gagal mengirim ulasan: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetStatus = async (status: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Akses Ditolak", "Anda harus login untuk menyimpan koleksi.");
      return;
    }

    try {
      if (collectionDocId) {
        if (collectionStatus === status) {
          await deleteDoc(doc(db, "user_collections", collectionDocId));
        } else {
          await updateDoc(doc(db, "user_collections", collectionDocId), {
            status,
            updatedAt: serverTimestamp()
          });
        }
      } else {
        await addDoc(collection(db, "user_collections"), {
          userId: currentUser.uid,
          animeId: id,
          title: animeDetail.title.romaji,
          englishTitle: animeDetail.title.english || null,
          poster: animeDetail.coverImage?.extraLarge,
          episodes: animeDetail.episodes || 0,
          duration: animeDetail.duration || 0,
          rating: animeDetail.averageScore ? (animeDetail.averageScore / 10).toFixed(1) : "-",
          genre: animeDetail.genres?.[0] || "",
          genres: animeDetail.genres || [],
          type: animeDetail.format || "TV",
          description: animeDetail.description || "",
          source: animeDetail.source || "",
          studios: animeDetail.studios?.nodes?.map((n: any) => n.name) || [],
          startDate: animeDetail.startDate || null,
          isAdult: animeDetail.isAdult || false,
          status,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", "Gagal memperbarui status: " + error.message);
    }
  };

  const displayImage = animeDetail?.bannerImage || animeDetail?.coverImage?.extraLarge;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <NeoButton
        title="← Kembali"
        color={isDark ? colors.primary : COLORS.PRIMARY}
        onPress={() => router.back()}
        style={{ marginBottom: 20, marginTop: 40 }}
        textStyle={{ paddingVertical: 8, paddingHorizontal: 16, fontSize: 14, color: isDark ? '#000' : COLORS.BUTTON_TEXT_LIGHT }}
      />

      {isLoadingAnime ? (
        <ActivityIndicator size="large" color={COLORS.PRIMARY} style={{ marginTop: 40 }} />
      ) : animeDetail ? (
        <>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: displayImage }} 
              style={styles.image} 
              contentFit="cover" 
            />
          </View>

          <NeoCard contentStyle={styles.infoCard} style={{ marginBottom: 30 }}>
            <ThemedText type="title" style={styles.title}>
              {animeDetail.title.romaji}
            </ThemedText>
            
            <View style={styles.tagsContainer}>
              <NeoBadge label={animeDetail.status} color={isDark ? colors.accent : COLORS.ACCENT} />
              {animeDetail.genres?.slice(0, 3).map((genre: string) => (
                <NeoBadge key={genre} label={genre} color={isDark ? colors.primary : STATUS_COLORS.FINISHED} />
              ))}
            </View>

            <ThemedText style={styles.synopsis}>
              {stripHtml(animeDetail.description)}
            </ThemedText>

            <View style={styles.infoMetaRow}>
              <View>
                <ThemedText style={styles.metaLabel}>Rating</ThemedText>
                <ThemedText style={styles.metaValue}>⭐ {animeDetail.averageScore ? (animeDetail.averageScore / 10).toFixed(1) : "-"}</ThemedText>
              </View>
              <View>
                <ThemedText style={styles.metaLabel}>Episode</ThemedText>
                <ThemedText style={styles.metaValue}>📺 {animeDetail.episodes || "-"}</ThemedText>
              </View>
              <View>
                <ThemedText style={styles.metaLabel}>Format</ThemedText>
                <ThemedText style={styles.metaValue}>🎬 {animeDetail.format || "-"}</ThemedText>
              </View>
            </View>
          </NeoCard>

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Status Koleksi</ThemedText>
            <View style={styles.statusButtonsGrid}>
              {[
                { label: "Favorite", icon: "❤️", value: "Favorite", color: COLORS.ACCENT },
                { label: "Watching", icon: "📺", value: "Watching", color: STATUS_COLORS.ON_AIR },
                { label: "Completed", icon: "✅", value: "Completed", color: STATUS_COLORS.FINISHED },
                { label: "Planning", icon: "📝", value: "Planning", color: COLORS.PRIMARY },
                { label: "Dropped", icon: "🗑️", value: "Dropped", color: COLORS.TEXT_SECONDARY },
              ].map((btn) => {
                const isActive = collectionStatus === btn.value;
                return (
                  <View key={btn.value} style={{ flexGrow: 1, flexBasis: '45%' }}>
                    <NeoButton
                      title={`${btn.icon} ${btn.label}`}
                      color={isActive ? btn.color : colors.card}
                      onPress={() => handleSetStatus(btn.value)}
                      style={{ width: '100%' }}
                      textStyle={{ fontSize: 14, paddingVertical: 8, paddingHorizontal: 12 }}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        </>
      ) : (
        <ThemedText style={styles.errorText}>Anime tidak ditemukan.</ThemedText>
      )}

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Tulis Ulasan & Rating</ThemedText>
        <NeoInput
          placeholder="Tulis pendapatmu tentang anime ini..."
          placeholderTextColor={COLORS.TEXT_SECONDARY}
          value={review}
          onChangeText={setReview}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={{ minHeight: 100 }}
          containerStyle={{ marginBottom: 12 }}
        />
        {isSubmitting ? (
          <ActivityIndicator color={COLORS.PRIMARY} size="large" />
        ) : (
          <NeoButton
            title="Kirim Ulasan"
            color={STATUS_COLORS.ON_AIR}
            onPress={handleKirimUlasan}
            style={{ width: "100%" }}
          />
        )}
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Ulasan Terbaru</ThemedText>
        {isLoadingReviews ? (
          <ActivityIndicator color={STATUS_COLORS.FINISHED} />
        ) : reviewsList.length > 0 ? (
          <View style={styles.reviewsContainer}>
            {reviewsList.map((r, idx) => {
              const colors = [STATUS_COLORS.FINISHED, COLORS.ACCENT, COLORS.PRIMARY, STATUS_COLORS.ON_AIR];
              const bgColor = colors[idx % colors.length];
              return (
                <NeoCard key={r.id} contentStyle={styles.reviewCard}>
                  <ThemedText style={styles.reviewText}>&quot;{r.text}&quot;</ThemedText>
                </NeoCard>
              );
            })}
          </View>
        ) : (
          <ThemedText style={{ color: colors.textMuted, fontStyle: 'italic' }}>Belum ada ulasan untuk anime ini.</ThemedText>
        )}
      </View>
      
      <View style={{height: 40}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  imageContainer: { width: "100%", height: 200, marginBottom: 20 },
  image: { width: "100%", height: "100%", borderRadius: Neubrutalism.borderRadius, borderWidth: Neubrutalism.borderWidth, borderColor: '#000', backgroundColor: STATUS_COLORS.DEFAULT },
  infoCard: { padding: 16 },
  title: { marginBottom: 12, fontSize: 24, fontWeight: '900' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  synopsis: { fontSize: 15, lineHeight: 24 },
  infoMetaRow: { flexDirection: 'row', gap: 24, marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  metaLabel: { fontSize: 12, marginBottom: 4 },
  metaValue: { fontWeight: 'bold' },
  errorText: { fontWeight: "bold", textAlign: "center", marginTop: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { fontWeight: "900", marginBottom: 16 },
  statusButtonsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  reviewsContainer: { gap: 12 },
  reviewCard: { padding: 12 },
  reviewText: { fontSize: 16, fontStyle: "italic", fontWeight: "bold" },
});
