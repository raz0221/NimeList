import { COLORS, STATUS_COLORS } from "@/constants/theme";
import { router } from "expo-router";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";

import { NeoButton, NeoCard } from "@/components/NeoKit";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/src/context/ThemeContext";
import { auth, db } from "@/src/lib/firebase";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, isDark, colors } = useTheme();
  const [notif, setNotif] = useState(true);
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
          setNotif(data.notif ?? true);
          setSpoilerFilter(data.spoilerFilter ?? false);
          setShowEpisodes(data.showEpisodes ?? true);
        }
      } catch (e) {
        console.error("Error fetching settings:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(
        doc(db, "user_settings", user.uid),
        {
          notif,
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

  const SETTINGS = [
    {
      icon: 'notifications' as const,
      label: t("Notifikasi Push"),
      desc: t("Terima notifikasi rilis episode baru"),
      value: notif,
      onToggle: setNotif,
    },
    {
      icon: 'moon' as const,
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
            {t("Preferensi disimpan ke cloud")}
          </ThemedText>
        ) : (
          <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}>
            {t("Login untuk menyimpan pengaturan ke cloud")}
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Ionicons name={item.icon} size={16} color={colors.text} />
                    <ThemedText style={styles.settingLabel}>{item.label}</ThemedText>
                  </View>
                  <ThemedText style={styles.settingDesc}>{item.desc}</ThemedText>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 16, justifyContent: 'center' }}>
                <Ionicons name={user ? 'save' : 'lock-closed'} size={18} color="#000" />
                <Text style={{ fontWeight: '900', fontSize: 15, color: '#000' }}>
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
