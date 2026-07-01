import { COLORS, STATUS_COLORS, Neubrutalism } from "@/constants/theme";
import { Image } from "expo-image";
import { router } from "expo-router";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { auth, db } from "@/src/lib/firebase";
import { doc, onSnapshot, collection, query, where, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";
import { NeoCard } from "@/components/NeoKit";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const MENU_ITEMS = [
  { icon: "create", label: "Edit Profil",          route: "/(tabs)/profile/edit",         color: COLORS.PRIMARY },
  { icon: "trophy", label: "Pencapaian & Gelar",   route: "/(tabs)/profile/achievements", color: "#FDE047" },
  { icon: "settings", label: "Pengaturan Aplikasi",  route: "/(tabs)/profile/settings",     color: COLORS.ACCENT },
  { icon: "information-circle", label: "Tentang Aplikasi",     route: "/(tabs)/profile/about",        color: STATUS_COLORS.ON_AIR },
  { icon: "call", label: "Hubungi Kami",         route: "/(tabs)/profile/contact",      color: "#93C5FD" },
];

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubAuth();
  }, []);

  const [isValidTitle, setIsValidTitle] = useState(false);

  useEffect(() => {
    if (!user) {
      setUserData(null);
      setIsValidTitle(false);
      return;
    }
    const unsub = onSnapshot(doc(db, "users", user.uid), async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);

        // Validasi Badge
        if (data.equippedTitle) {
          try {
            const completedQ = query(collection(db, "user_collections"), where("userId", "==", user.uid), where("status", "==", "Completed"));
            const completedSnap = await getDocs(completedQ);
            const completedCount = completedSnap.size;

            const watchlistQ = query(collection(db, "user_collections"), where("userId", "==", user.uid));
            const watchlistSnap = await getDocs(watchlistQ);
            const watchlistTotal = watchlistSnap.size;

            const reviewQ = query(collection(db, "reviews"), where("userId", "==", user.uid));
            const reviewSnap = await getDocs(reviewQ);
            const reviewTotal = reviewSnap.size;

            let unlocked = false;
            const title = data.equippedTitle;
            if (title === "Newbie Otaku" && completedCount >= 1) unlocked = true;
            if (title === "Binge Watcher" && completedCount >= 5) unlocked = true;
            if (title === "Kolektor Handal" && watchlistTotal >= 10) unlocked = true;
            if (title === "Kritikus Anime" && reviewTotal >= 5) unlocked = true;
            if (title === "Sang Pengamat" && watchlistTotal >= 30) unlocked = true;

            setIsValidTitle(unlocked);
          } catch (e) {
            setIsValidTitle(false);
          }
        } else {
          setIsValidTitle(false);
        }
      }
    });
    return () => unsub();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/(tabs)/profile/login");
    } catch {
      Alert.alert(t("Gagal"), t("Terjadi kesalahan saat proses logout."));
    }
  };

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* ── App Bar ── */}
      <View style={styles.appBar}>
        <ThemedText style={styles.appBarTitle}>Profil</ThemedText>
      </View>

      {/* ── Profile Hero Card ── */}
      {!user ? (
        <View style={styles.heroCard}>
          <View style={[styles.heroShadow, { backgroundColor: colors.shadow }]} />
          <View style={[styles.heroInner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ alignItems: "center", paddingVertical: 32 }}>
              <Ionicons name="person-circle" size={72} color={colors.text} style={{ marginBottom: 12 }} />
              <ThemedText style={styles.heroName}>Belum Masuk</ThemedText>
              <ThemedText style={[styles.heroEmail, { color: colors.textMuted }]}>Login untuk akses fitur lengkap</ThemedText>
              <View style={{ gap: 10, width: "100%", marginTop: 20 }}>
                <TouchableOpacity onPress={() => router.push("/(tabs)/profile/login")} style={styles.loginBtn}>
                  <View style={[styles.loginBtnShadow, { backgroundColor: colors.shadow }]} />
                  <View style={[styles.loginBtnMain, { backgroundColor: STATUS_COLORS.ON_AIR, borderColor: colors.border }]}>
                    <Text style={styles.loginBtnText}>Masuk / Login</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/(tabs)/profile/register")} style={styles.loginBtn}>
                  <View style={[styles.loginBtnShadow, { backgroundColor: colors.shadow }]} />
                  <View style={[styles.loginBtnMain, { backgroundColor: isDark ? colors.primary : COLORS.PRIMARY, borderColor: colors.border }]}>
                    <Text style={styles.loginBtnText}>Daftar Akun Baru</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.heroCard}>
          <View style={[styles.heroShadow, { backgroundColor: colors.shadow }]} />
          <View style={[styles.heroInner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.heroRow}>
              <View style={[styles.avatarWrap, { borderColor: colors.border }]}>
                <Image
                  source={{ uri: userData?.avatarSeed ? `https://api.dicebear.com/7.x/avataaars/png?seed=${userData.avatarSeed}` : (user.photoURL || `https://api.dicebear.com/7.x/avataaars/png?seed=${user.uid}`) }}
                  style={styles.avatar}
                />
              </View>
              <View style={{ flex: 1, justifyContent: "center" }}>
                <ThemedText style={styles.heroName}>{userData?.displayName || user.displayName || "Pengguna"}</ThemedText>
                {userData?.equippedTitle && isValidTitle ? (
                  <View style={styles.titleBadge}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="medal" size={14} color="#000" />
                      <Text style={styles.titleBadgeText}>{userData.equippedTitle}</Text>
                    </View>
                  </View>
                ) : (
                  <ThemedText style={[styles.heroEmail, { color: colors.textMuted }]}>{user.email}</ThemedText>
                )}
              </View>
            </View>
            <View style={[styles.heroDivider, { backgroundColor: colors.border }]} />
            <View style={styles.heroBio}>
              <ThemedText style={[styles.heroBioText, { color: colors.textMuted }]}>
                {userData?.bio || "Belum ada bio. Tambahkan sesuatu tentang dirimu di Edit Profil!"}
              </ThemedText>
            </View>
          </View>
        </View>
      )}

      {/* ── Menu Items ── */}
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionLabel}>Pengaturan Akun</ThemedText>
      </View>
      <View style={[styles.menuList, { borderColor: colors.border, backgroundColor: colors.card }]}>
        {MENU_ITEMS.map((item, idx) => (
          <TouchableOpacity key={item.route} onPress={() => router.push(item.route as any)} style={[styles.menuItem, { borderBottomColor: isDark ? '#333' : '#E5E7EB' }]}>
            <View style={[styles.menuIconBox, { backgroundColor: isDark ? colors.card : item.color, borderColor: isDark ? item.color : '#000' }]}>
              <Ionicons name={item.icon as any} size={18} color={isDark ? colors.text : '#000'} />
            </View>
            <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
            <ThemedText style={[styles.menuChevron, { color: colors.textMuted }]}>›</ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Logout ── */}
      {user && (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <View style={styles.logoutShadow} />
          <View style={styles.logoutMain}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="log-out" size={20} color="#fff" />
              <Text style={styles.logoutText}>Keluar dari Akun</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 },

  appBar: { marginBottom: 20 },
  appBarTitle: { fontSize: 26, fontWeight: "900" },

  // Hero Card
  heroCard: { position: "relative", marginBottom: 28 },
  heroShadow: { position: "absolute", top: 5, left: 5, right: -5, bottom: -5, borderRadius: Neubrutalism.borderRadius },
  heroInner: { borderRadius: Neubrutalism.borderRadius, borderWidth: Neubrutalism.borderWidth, padding: 20 },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatarWrap: { width: 70, height: 70, borderRadius: 35, borderWidth: Neubrutalism.borderWidth, overflow: "hidden" },
  avatar: { width: "100%", height: "100%" },
  heroName: { fontSize: 18, fontWeight: "900" },
  heroEmail: { fontSize: 13, fontWeight: "600", marginTop: 3, marginBottom: 8 },
  heroDivider: { width: "100%", height: Neubrutalism.borderWidth, marginVertical: 16 },
  heroBio: { paddingHorizontal: 4 },
  heroBioText: { fontSize: 13, lineHeight: 20, fontStyle: "italic" },
  titleBadge: { alignSelf: 'flex-start', backgroundColor: '#FDE047', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 2, borderColor: '#000', marginTop: 6 },
  titleBadgeText: { fontSize: 11, fontWeight: "900", color: "#000", textTransform: 'uppercase' },
  heroMeta: {},
  heroMetaText: { fontSize: 11, fontWeight: "600" },

  loginBtn: { position: "relative" },
  loginBtnShadow: { position: "absolute", top: 3, left: 3, right: -3, bottom: -3, borderRadius: Neubrutalism.borderRadius },
  loginBtnMain: { borderRadius: Neubrutalism.borderRadius, borderWidth: Neubrutalism.borderWidth, paddingVertical: 12, alignItems: "center" },
  loginBtnText: { fontWeight: "900", fontSize: 15, color: "#000" },

  // Menu
  sectionHeader: { marginBottom: 12 },
  sectionLabel: { fontSize: 16, fontWeight: "900" },
  menuList: { borderWidth: Neubrutalism.borderWidth, borderRadius: Neubrutalism.borderRadius, overflow: "hidden", marginBottom: 20 },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, gap: 14 },
  menuIconBox: { width: 36, height: 36, borderRadius: Neubrutalism.borderRadius, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  menuIcon: { fontSize: 18 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "700" },
  menuChevron: { fontSize: 20, fontWeight: "900" },

  // Logout
  logoutBtn: { position: "relative" },
  logoutShadow: { position: "absolute", top: 4, left: 4, right: -4, bottom: -4, backgroundColor: "#000", borderRadius: Neubrutalism.borderRadius },
  logoutMain: { backgroundColor: COLORS.ACCENT, borderRadius: Neubrutalism.borderRadius, borderWidth: Neubrutalism.borderWidth, borderColor: "#000", paddingVertical: 14, alignItems: "center" },
  logoutText: { fontWeight: "900", fontSize: 15, color: "#fff" },
});
