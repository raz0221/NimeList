import { COLORS, STATUS_COLORS } from "@/constants/theme";
import { router } from "expo-router";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  View,
  Text,
  Linking
} from "react-native";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync, saveTokenToFirestore } from "@/src/services/notificationService";

import { NeoButton, NeoCard } from "@/components/NeoKit";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/src/context/ThemeContext";
import { auth, db } from "@/src/lib/firebase";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, isDark, colors } = useTheme();
  const [notif, setNotif] = useState(false);
  const [spoilerFilter, setSpoilerFilter] = useState(false);
  const [showEpisodes, setShowEpisodes] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchSettings = async () => {
      try {
        const ref = doc(db, "user_settings", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setSpoilerFilter(data.spoilerFilter ?? false);
          setShowEpisodes(data.showEpisodes ?? true);
        }
      } catch (e) {
        console.error("Error fetching settings:", e);
      } finally {
        setIsLoading(false);
      }
    };

    const checkNotifStatus = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setNotif(status === 'granted');
    };

    fetchSettings();
    checkNotifStatus();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(
        doc(db, "user_settings", user.uid),
        {
          spoilerFilter,
          showEpisodes,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      Alert.alert(t("Tersimpan"), t("Pengaturan berhasil disimpan!"));
    } catch (e) {
      Alert.alert(t("Gagal"), t("Tidak bisa menyimpan pengaturan."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleNotif = async (value: boolean) => {
    if (!user) {
      Alert.alert("Akses Ditolak", "Login diperlukan untuk mengubah pengaturan ini.");
      return;
    }

    if (value) {
      // Mengaktifkan notifikasi
      let { status: finalStatus, canAskAgain } = await Notifications.getPermissionsAsync();

      if (finalStatus !== 'granted' && canAskAgain) {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        // Ditolak secara permanen oleh OS
        Alert.alert(
          t("Izin Diperlukan"),
          t("Akses notifikasi telah diblokir. Harap izinkan melalui Pengaturan HP Anda."),
          [
            { text: t("Batal"), style: "cancel" },
            { text: t("Buka Pengaturan"), onPress: () => Linking.openSettings() }
          ]
        );
        setNotif(false);
        return;
      }

      // Diizinkan -> Ambil token & Simpan
      setNotif(true);
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await saveTokenToFirestore(user.uid, token);
        }
      } catch (e) {
        console.error("Error setting up notifications:", e);
      }
    } else {
      // Mematikan notifikasi -> Hapus token
      setNotif(false);
      try {
        await updateDoc(doc(db, "users", user.uid), {
          expoPushToken: null
        });
      } catch (e) {
        console.error("Error removing push token:", e);
      }
    }
  };

  const SETTINGS = [
    {
      icon: "notifications" as const,
      label: t("Notifikasi Push"),
      desc: t("Terima notifikasi rilis episode baru"),
      value: notif,
      onToggle: handleToggleNotif,
    },
    {
      icon: "moon" as const,
      label: t("Dark Mode"),
      desc: t("Aktifkan tema gelap"),
      value: isDark,
      onToggle: toggleTheme,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <NeoButton
          title={`← ${t("Kembali")}`}
          color={isDark ? colors.primary : COLORS.PRIMARY}
          onPress={() => router.back()}
          style={{ marginBottom: 16, alignSelf: "flex-start" }}
          textStyle={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            fontSize: 14,
            color: isDark ? "#000" : COLORS.BUTTON_TEXT_LIGHT,
          }}
        />
        <ThemedText type="title">{t("Pengaturan")}</ThemedText>
        {user ? (
          <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}>
            {t("")}
          </ThemedText>
        ) : (
          <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}>
            {t("Kendalikan Referensi Anda")}
          </ThemedText>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.PRIMARY}
          style={{ marginTop: 20 }}
        />
      ) : (
        <>
          <View style={styles.settingsList}>
            {SETTINGS.map((item) => (
              <NeoCard
                key={item.label}
                contentStyle={styles.settingItem}
                style={{ marginBottom: 16 }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 4,
                    }}
                  >
                    <Ionicons name={item.icon} size={16} color={colors.text} />
                    <ThemedText style={styles.settingLabel}>
                      {item.label}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.settingDesc}>
                    {item.desc}
                  </ThemedText>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{
                    false: STATUS_COLORS.DEFAULT,
                    true: STATUS_COLORS.ON_AIR,
                  }}
                  thumbColor={
                    item.value ? COLORS.TEXT_MAIN : COLORS.TEXT_SECONDARY
                  }
                />
              </NeoCard>
            ))}
          </View>

          {isSaving ? (
            <ActivityIndicator
              color={COLORS.TEXT_MAIN}
              size="large"
              style={{ marginTop: 16 }}
            />
          ) : (
            <NeoButton
              title=""
              color={user ? STATUS_COLORS.FINISHED : STATUS_COLORS.DEFAULT}
              onPress={
                user ? handleSave : () => router.push("/(tabs)/profile/login")
              }
              style={{ width: "100%" }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name={user ? "save" : "lock-closed"}
                  size={18}
                  color="#000"
                />
                <Text
                  style={{ fontWeight: "900", fontSize: 15, color: "#000" }}
                >
                  {user ? t("Simpan Pengaturan") : t("Login untuk Menyimpan")}
                </Text>
              </View>
            </NeoButton>
          )}
        </>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 24, marginTop: 40 },
  subtitle: { marginTop: 8, fontWeight: "bold" },
  settingsList: { marginBottom: 24 },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingLabel: { fontSize: 16, fontWeight: "900", marginBottom: 4 },
  settingDesc: { fontSize: 13 },
});
