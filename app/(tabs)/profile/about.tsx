import { COLORS } from "@/constants/theme";
import { StyleSheet, View, ScrollView } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { ThemedText } from "@/components/themed-text";
import { NeoButton, NeoCard } from "@/components/NeoKit";
import { useTheme } from "@/src/context/ThemeContext";

export default function AboutScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <NeoButton
          title={`← ${t("Kembali")}`}
          color={isDark ? colors.primary : COLORS.PRIMARY}
          onPress={() => router.back()}
          style={{ marginBottom: 16, alignSelf: 'flex-start' }}
          textStyle={{ paddingVertical: 8, paddingHorizontal: 16, fontSize: 14, color: isDark ? '#000' : COLORS.BUTTON_TEXT_LIGHT }}
        />
        <ThemedText type="title">{t("Tentang Aplikasi")}</ThemedText>
      </View>

      <NeoCard contentStyle={styles.card}>
        <ThemedText style={styles.title}>AniTrack v1.0.0</ThemedText>
        <ThemedText style={styles.desc}>
          AniTrack adalah aplikasi pelacakan anime dengan desain Neubrutalism. Dibangun menggunakan React Native dan Expo Router.
        </ThemedText>
        <ThemedText style={styles.desc}>
          © 2026 AniTrack Project. Semua hak cipta dilindungi.
        </ThemedText>
      </NeoCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 24, marginTop: 40 },
  card: { padding: 24 },
  title: { fontSize: 20, fontWeight: "900", marginBottom: 12 },
  desc: { fontSize: 16, marginBottom: 16, lineHeight: 24 }
});
