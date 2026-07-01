import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View, ScrollView, ActivityIndicator, Text } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, deleteDoc, doc, updateDoc, setDoc } from "firebase/firestore";

import { COLORS, STATUS_COLORS, Neubrutalism } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/src/context/ThemeContext";
import { fetchAniList } from "@/src/services/anilist";
import { auth, db } from "@/src/lib/firebase";
import { NeoCard, NeoBadge, NeoButton, NeoInput } from "@/components/NeoKit";
import { toggleSubscription, checkSubscriptionStatus } from "@/src/services/notifyService";
import { scheduleLocalNotification } from "@/src/services/notificationService";
import { addReview, getReviews, reportReview, Review } from "@/src/services/reviewService";
import { Ionicons } from "@expo/vector-icons";

const ANIME_DETAIL_QUERY = `
  query GetAnimeDetail($id: Int!) {
    Media(id: $id, type: ANIME) {
      id
      title {
        romaji
        english
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
      nextAiringEpisode {
        airingAt
        episode
        timeUntilAiring
      }
    }
  }
`;

export default function AnimeDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const [animeDetail, setAnimeDetail] = useState<any>(null);
  const [isLoadingAnime, setIsLoadingAnime] = useState(true);

  const [review, setReview] = useState("");
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [reviewLimit, setReviewLimit] = useState(10);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);

  const [collectionStatus, setCollectionStatus] = useState<string | null>(null);
  const [collectionDocId, setCollectionDocId] = useState<string | null>(null);
  const [isNotified, setIsNotified] = useState(false);
  const [isTogglingNotify, setIsTogglingNotify] = useState(false);

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
      unsubscribeCollection();
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;

    // Fetch Reviews from Firestore in real-time with pagination
    const unsubscribeReviews = getReviews(
      id as string,
      reviewLimit,
      (newReviews, hasMore) => {
        setReviewsList(newReviews);
        setHasMoreReviews(hasMore);
        setIsLoadingReviews(false);
      },
      (error) => {
        console.error("Error fetching reviews:", error);
        setIsLoadingReviews(false);
      }
    );

    return () => {
      unsubscribeReviews();
    };
  }, [id, reviewLimit]);

  // Cek status subscribe saat anime detail & user siap
  useEffect(() => {
    const checkNotify = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser || !id) return;
      const subscribed = await checkSubscriptionStatus(currentUser.uid, id as string);
      setIsNotified(subscribed);
    };
    checkNotify();
  }, [id]);

  const getUsername = () => {
    if (!auth.currentUser) return "Anonim";
    if (auth.currentUser.displayName) return auth.currentUser.displayName;
    if (auth.currentUser.email) return auth.currentUser.email.split('@')[0];
    return "Anonim";
  };

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
      const username = getUsername();
      await addReview(id as string, currentUser.uid, username, review);
      
      Alert.alert("Sukses", "Ulasan berhasil dikirim!");
      setReview("");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", "Gagal mengirim ulasan: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = (reviewId: string) => {
    Alert.alert(
      "Laporkan Ulasan",
      "Apakah Anda yakin ingin melaporkan ulasan ini sebagai tidak pantas?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Laporkan", 
          style: "destructive",
          onPress: async () => {
            try {
              await reportReview(reviewId);
              Alert.alert("Dilaporkan", "Ulasan telah dilaporkan dan akan ditinjau.");
            } catch (err: any) {
              Alert.alert("Error", "Gagal melaporkan ulasan: " + err.message);
            }
          }
        }
      ]
    );
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

  // ── Handler Notify Me ──────────────────────────────────────────────────────
  const handleNotify = async () => {
    const currentUser = auth.currentUser;

    // Guard: user belum login
    if (!currentUser) {
      Alert.alert(
        'Login Diperlukan',
        'Kamu perlu login untuk mengaktifkan notifikasi anime ini. Login sekarang?',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Login',
            onPress: () => router.push('/(tabs)/profile/login'),
          },
        ]
      );
      return;
    }

    if (!animeDetail || isTogglingNotify) return;
    setIsTogglingNotify(true);

    try {
      const animeTitle = animeDetail.title.romaji || 'Anime';
      const animeStatus = animeDetail.status || 'RELEASING';
      const newState = await toggleSubscription(
        currentUser.uid,
        id as string,
        animeTitle,
        animeStatus
      );
      setIsNotified(newState);

      if (newState) {
        const nextEpisode = animeDetail.nextAiringEpisode;
        
        if (nextEpisode && nextEpisode.timeUntilAiring > 0) {
          // Jadwalkan notifikasi tepat saat episode baru tayang
          await scheduleLocalNotification({
            title: `Episode ${nextEpisode.episode} Segera Tayang!`,
            body: `"${animeTitle}" Episode ${nextEpisode.episode} akan tayang sebentar lagi. Jangan sampai ketinggalan!`,
            delaySeconds: nextEpisode.timeUntilAiring,
          });
          Alert.alert(
            'Notifikasi Dijadwalkan',
            `Notifikasi dijadwalkan untuk Episode ${nextEpisode.episode} "${animeTitle}"! Kamu akan diingatkan saat episode tersebut tayang.`,
            [{ text: 'Oke' }]
          );
        } else {
          // Tidak ada episode terjadwal (mungkin sudah tamat atau belum ada jadwal)
          await scheduleLocalNotification({
            title: 'Notifikasi Diaktifkan!',
            body: `Kamu akan mendapat pemberitahuan untuk konten baru dari "${animeTitle}".`,
            delaySeconds: 1,
          });
          Alert.alert(
            'Berhasil',
            `Notifikasi diaktifkan untuk "${animeTitle}"! Belum ada jadwal episode terbaru saat ini.`,
            [{ text: 'Oke' }]
          );
        }
      } else {
        Alert.alert('Dinonaktifkan', `Notifikasi untuk "${animeTitle}" telah dimatikan.`);
      }
    } catch (error: any) {
      console.error('[NotifyMe] Error:', error);
      Alert.alert('Error', 'Gagal mengubah status notifikasi. Coba lagi.');
    } finally {
      setIsTogglingNotify(false);
    }
  };

  const displayImage = animeDetail?.bannerImage || animeDetail?.coverImage?.extraLarge;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <NeoButton
        title="← Kembali"
        onPress={() => router.back()}
        style={{ marginBottom: 20, marginTop: 56 }}
        textStyle={{ paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 }}
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="star" size={14} color={isDark ? colors.text : '#000'} />
                  <ThemedText style={styles.metaValue}>{animeDetail.averageScore ? (animeDetail.averageScore / 10).toFixed(1) : "-"}</ThemedText>
                </View>
              </View>
              <View>
                <ThemedText style={styles.metaLabel}>Episode</ThemedText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="tv" size={14} color={isDark ? colors.text : '#000'} />
                  <ThemedText style={styles.metaValue}>{animeDetail.episodes || "-"}</ThemedText>
                </View>
              </View>
              <View>
                <ThemedText style={styles.metaLabel}>Format</ThemedText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="film" size={14} color={isDark ? colors.text : '#000'} />
                  <ThemedText style={styles.metaValue}>{animeDetail.format || "-"}</ThemedText>
                </View>
              </View>
            </View>
          </NeoCard>

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Status Koleksi</ThemedText>
            <View style={styles.statusButtonsGrid}>
              {[
                { label: "Favorite", icon: "heart", value: "Favorite", color: COLORS.ACCENT },
                { label: "Watching", icon: "tv", value: "Watching", color: STATUS_COLORS.ON_AIR },
                { label: "Completed", icon: "checkmark-circle", value: "Completed", color: STATUS_COLORS.FINISHED },
                { label: "Planning", icon: "clipboard", value: "Planning", color: COLORS.PRIMARY },
                { label: "Dropped", icon: "trash", value: "Dropped", color: COLORS.TEXT_SECONDARY },
              ].map((btn) => {
                const isActive = collectionStatus === btn.value;
                return (
                  <View key={btn.value} style={{ flexGrow: 1, flexBasis: '45%' }}>
                    <NeoButton
                      title=""
                      color={isActive ? btn.color : colors.card}
                      onPress={() => handleSetStatus(btn.value)}
                      style={{ width: '100%' }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, justifyContent: 'center' }}>
                        <Ionicons name={btn.icon as any} size={16} color={isActive ? '#000' : colors.text} />
                        <Text style={{ fontSize: 14, color: isActive ? '#000' : colors.text, fontWeight: '900' }}>{btn.label}</Text>
                      </View>
                    </NeoButton>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ── Notify Me Section ── tampil hanya untuk anime RELEASING / NOT_YET_RELEASED */}
          {(animeDetail.status === 'RELEASING' || animeDetail.status === 'NOT_YET_RELEASED') && (
            <View style={styles.section}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Ionicons name="notifications" size={22} color={colors.text} />
                <ThemedText type="subtitle" style={styles.sectionTitle}>Notifikasi Anime</ThemedText>
              </View>
              <NeoCard contentStyle={{ padding: 0 }}>
                <TouchableOpacity
                  id={`detail-notify-btn-${id}`}
                  onPress={handleNotify}
                  activeOpacity={0.8}
                  disabled={isTogglingNotify}
                  style={[
                    styles.notifyBtn,
                    {
                      backgroundColor: isNotified
                        ? 'rgba(167,243,208,0.2)'
                        : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                    },
                  ]}
                >
                  {isTogglingNotify ? (
                    <ActivityIndicator size="small" color={COLORS.PRIMARY} />
                  ) : (
                    <Ionicons name={isNotified ? 'checkmark-circle' : 'notifications'} size={28} color={isNotified ? '#059669' : colors.text} />
                  )}
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[styles.notifyBtnText, { color: isNotified ? '#059669' : colors.text }]}>
                      {isNotified ? 'Kamu sudah berlangganan' : 'Ingatkan Saya'}
                    </ThemedText>
                    <ThemedText style={[styles.notifyBtnSub, { color: colors.textMuted }]}>
                      {isNotified
                        ? 'Notifikasi aktif untuk episode/movie baru'
                        : 'Dapatkan pemberitahuan saat episode baru rilis'}
                    </ThemedText>
                  </View>
                  {!isNotified && !isTogglingNotify && (
                    <Text style={[styles.notifyChevron, { color: colors.textMuted }]}>›</Text>
                  )}
                </TouchableOpacity>
              </NeoCard>
            </View>
          )}
        </>
      ) : (
        <ThemedText style={styles.errorText}>Anime tidak ditemukan.</ThemedText>
      )}

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Tulis Ulasan & Rating</ThemedText>
        <NeoInput
          placeholder="Tulis pendapatmu tentang anime ini..."
          placeholderTextColor={colors.textMuted}
          value={review}
          onChangeText={setReview}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={{ minHeight: 100, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card, borderColor: isDark ? '#fff' : '#000', color: colors.text }}
          containerStyle={{ marginBottom: 12 }}
        />
        {isSubmitting ? (
          <ActivityIndicator color={COLORS.PRIMARY} size="large" />
        ) : (
          <NeoButton
            title="Kirim Ulasan"
            color={isDark ? 'rgba(255,255,255,0.05)' : STATUS_COLORS.ON_AIR}
            onPress={handleKirimUlasan}
            style={{ width: "100%", borderColor: isDark ? '#fff' : '#000' }}
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
              const reviewColors = [STATUS_COLORS.FINISHED, COLORS.ACCENT, COLORS.PRIMARY, STATUS_COLORS.ON_AIR];
              const bgColor = isDark ? colors.card : reviewColors[idx % reviewColors.length];
              const borderColor = isDark ? reviewColors[idx % reviewColors.length] : '#000';
              
              const dateObj = r.createdAt?.toDate ? r.createdAt.toDate() : new Date();
              const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
              
              return (
                <NeoCard key={r.id} contentStyle={styles.reviewCard} style={{ backgroundColor: bgColor, borderColor: borderColor }}>
                  <View style={styles.reviewHeader}>
                    <ThemedText style={[styles.reviewUsername, { color: isDark ? '#fff' : '#000' }]}>{r.username || 'Anonim'}</ThemedText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Text style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontWeight: '600' }}>{dateStr}</Text>
                      <TouchableOpacity onPress={() => handleReport(r.id)} style={[styles.reportBtn, { borderColor: isDark ? '#fff' : '#000' }]}>
                        <Ionicons name="flag" size={14} color={isDark ? '#fff' : '#000'} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <ThemedText style={[styles.reviewText, { color: isDark ? '#fff' : '#000' }]}>"{r.comment || (r as any).text}"</ThemedText>
                </NeoCard>
              );
            })}
            
            {hasMoreReviews && (
              <NeoButton
                title="Muat Lebih Banyak →"
                color={colors.card}
                onPress={() => setReviewLimit(prev => prev + 10)}
                style={{ marginTop: 12, width: '100%' }}
                textStyle={{ fontSize: 14 }}
              />
            )}
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
  reviewCard: { padding: 16 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reviewUsername: { fontSize: 14, fontWeight: '900' },
  reportBtn: { padding: 4, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 4, borderWidth: 1 },
  reportBtnText: { fontSize: 10 },
  reviewText: { fontSize: 15, fontStyle: "italic", fontWeight: "600", lineHeight: 22 },
  // Notify Me
  notifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
    borderRadius: Neubrutalism.borderRadius,
  },
  notifyBtnIcon: { fontSize: 28 },
  notifyBtnText: { fontSize: 15, fontWeight: '900', marginBottom: 3 },
  notifyBtnSub: { fontSize: 12, fontWeight: '500' },
  notifyChevron: { fontSize: 26, fontWeight: '900' },
});
