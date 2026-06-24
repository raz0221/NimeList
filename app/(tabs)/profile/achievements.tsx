import { COLORS, STATUS_COLORS, Neubrutalism } from "@/constants/theme";
import { StyleSheet, View, ScrollView, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import { auth, db } from "@/src/lib/firebase";
import { ThemedText } from "@/components/themed-text";
import { Skeleton } from "@/components/Skeleton";
import { NeoButton, NeoCard } from "@/components/NeoKit";
import { useTranslation } from "react-i18next";

export default function AchievementsScreen() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    completedCount: 0,
    watchlistTotal: 0,
    reviewTotal: 0,
  });
  const [equippedTitle, setEquippedTitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchStatsAndProfile = async () => {
      try {
        // Fetch User Profile for equipped title
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setEquippedTitle(userSnap.data().equippedTitle || null);
        } else {
          // Initialize user doc if not exist
          await setDoc(userRef, { displayName: user.displayName, email: user.email }, { merge: true });
        }

        // Stats
        const completedQ = query(
          collection(db, "user_collections"),
          where("userId", "==", user.uid),
          where("status", "==", "Completed")
        );
        const completedSnap = await getDocs(completedQ);
        
        const watchlistQ = query(
          collection(db, "user_collections"),
          where("userId", "==", user.uid)
        );
        const watchlistSnap = await getDocs(watchlistQ);

        const reviewQ = query(
          collection(db, "reviews"),
          where("userId", "==", user.uid)
        );
        const reviewSnap = await getDocs(reviewQ);

        setStats({
          completedCount: completedSnap.size,
          watchlistTotal: watchlistSnap.size,
          reviewTotal: reviewSnap.size,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatsAndProfile();
  }, [user]);

  const handleEquip = async (title: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { equippedTitle: title });
      setEquippedTitle(title);
      Alert.alert("Sukses", `Gelar "${title}" berhasil dipasang!`);
    } catch (e: any) {
      Alert.alert("Error", "Gagal memasang gelar: " + e.message);
    }
  };

  const handleUnequip = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { equippedTitle: null });
      setEquippedTitle(null);
    } catch (e: any) {
      console.error(e);
    }
  };

  const BADGES = [
    { 
      id: "1", 
      title: "Newbie Otaku", 
      desc: "Selesaikan 1 anime", 
      color: COLORS.PRIMARY,
      icon: "🎖️",
      isUnlocked: stats.completedCount >= 1
    },
    { 
      id: "2", 
      title: "Binge Watcher", 
      desc: "Selesaikan 5 anime", 
      color: COLORS.ACCENT,
      icon: "🍿",
      isUnlocked: stats.completedCount >= 5
    },
    { 
      id: "3", 
      title: "Kolektor Handal", 
      desc: "Tambahkan 10 anime ke koleksi", 
      color: "#FDE047",
      icon: "📚",
      isUnlocked: stats.watchlistTotal >= 10
    },
    { 
      id: "4", 
      title: "Kritikus Anime", 
      desc: "Tulis 5 ulasan", 
      color: STATUS_COLORS.ON_AIR,
      icon: "✍️",
      isUnlocked: stats.reviewTotal >= 5
    },
    { 
      id: "5", 
      title: "Sang Pengamat", 
      desc: "Tambahkan 30 anime ke koleksi", 
      color: STATUS_COLORS.MOVIE,
      icon: "👁️",
      isUnlocked: stats.watchlistTotal >= 30
    },
  ];

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText style={{ fontSize: 18, marginBottom: 20, fontWeight: 'bold' }}>
          Silakan login untuk melihat Pencapaian Anda.
        </ThemedText>
        <NeoButton title="Login Sekarang" onPress={() => router.push("/(tabs)/profile/login")} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <NeoButton
          title={`← ${t("Kembali")}`}
          color={COLORS.PRIMARY}
          onPress={() => router.back()}
          style={{ marginBottom: 16, alignSelf: 'flex-start' }}
          textStyle={{ paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 }}
        />
        <ThemedText type="title">{t("Pencapaian & Gelar")}</ThemedText>
        <ThemedText style={styles.subtitle}>{t("Buka pencapaian dan pasang gelar untuk profilmu")}</ThemedText>
      </View>

      {isLoading ? (
        <View style={styles.grid}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} width="100%" height={120} />
          ))}
        </View>
      ) : (
        <View style={styles.grid}>
          {BADGES.map((badge) => {
            const isEquipped = equippedTitle === badge.title;
            return (
              <NeoCard key={badge.id} color={COLORS.CARD_BACKGROUND} contentStyle={styles.badgeCard}>
                <View style={styles.badgeHeader}>
                  <View style={[styles.iconBox, { backgroundColor: badge.isUnlocked ? badge.color : STATUS_COLORS.DEFAULT }]}>
                    <ThemedText style={styles.iconText}>{badge.isUnlocked ? badge.icon : "🔒"}</ThemedText>
                  </View>
                  <View style={styles.badgeInfo}>
                    <ThemedText style={styles.badgeTitle}>{badge.title}</ThemedText>
                    <ThemedText style={styles.badgeDesc}>{badge.desc}</ThemedText>
                    <View style={styles.statusRow}>
                      <ThemedText style={[styles.statusDot, { color: badge.isUnlocked ? STATUS_COLORS.ON_AIR : COLORS.ACCENT }]}>●</ThemedText>
                      <ThemedText style={styles.statusText}>{badge.isUnlocked ? "Terbuka" : "Terkunci"}</ThemedText>
                    </View>
                  </View>
                </View>

                {badge.isUnlocked && (
                  <View style={styles.actionRow}>
                    {isEquipped ? (
                      <NeoButton 
                        title="Lepas Gelar" 
                        color={COLORS.BACKGROUND} 
                        onPress={handleUnequip}
                        style={{ width: '100%' }}
                        textStyle={{ fontSize: 13, paddingVertical: 10, color: COLORS.TEXT_SECONDARY }}
                      />
                    ) : (
                      <NeoButton 
                        title="Pasang Gelar" 
                        color={badge.color} 
                        onPress={() => handleEquip(badge.title)}
                        style={{ width: '100%' }}
                        textStyle={{ fontSize: 13, paddingVertical: 10 }}
                      />
                    )}
                  </View>
                )}
              </NeoCard>
            )
          })}
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND, padding: 20 },
  header: { marginBottom: 24, marginTop: 40 },
  subtitle: { color: COLORS.TEXT_SECONDARY, marginTop: 8, fontWeight: "bold" },
  grid: { gap: 16, paddingBottom: 40 },
  badgeCard: { padding: 16 },
  badgeHeader: { flexDirection: "row", alignItems: "center", gap: 16 },
  iconBox: { 
    width: 60, height: 60, 
    justifyContent: "center", alignItems: "center",
    borderRadius: Neubrutalism.borderRadius,
    borderWidth: Neubrutalism.borderWidth, borderColor: '#000'
  },
  iconText: { fontSize: 28 },
  badgeInfo: { flex: 1 },
  badgeTitle: { fontSize: 18, fontWeight: "900", color: COLORS.TEXT_MAIN, marginBottom: 4 },
  badgeDesc: { fontSize: 13, color: COLORS.TEXT_SECONDARY, marginBottom: 6 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusDot: { fontSize: 12 },
  statusText: { fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  actionRow: { marginTop: 16, borderTopWidth: 1, borderColor: 'rgba(0,0,0,0.1)', paddingTop: 16 },
});
