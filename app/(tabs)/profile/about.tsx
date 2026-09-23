import { COLORS } from "@/constants/theme";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import { NeoButton, NeoCard } from "@/components/NeoKit";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/src/context/ThemeContext";

export default function AboutScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
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
        <ThemedText type="title">{t("Tentang Aplikasi")}</ThemedText>
      </View>
      <NeoCard contentStyle={styles.card}>
        <ThemedText style={styles.title}>NimeList v1.0.0</ThemedText>
        <ThemedText style={styles.desc}>
          NimeList – Your Ultimate Anime Hub adalah aplikasi pelacakan anime
          yang membantu pengguna menemukan, menyimpan, dan memantau anime
          favorit. Aplikasi ini dikembangkan menggunakan React Native dan Expo
          Router dengan antarmuka bergaya Neubrutalism yang sederhana, modern,
          dan responsif.
        </ThemedText>
        <ThemedText style={styles.title}>Kredit & Sumber Data</ThemedText>
        <ThemedText style={styles.desc}>
          Data anime pada aplikasi ini disediakan melalui AniList GraphQL API.
          Seluruh hak cipta atas informasi dan aset anime tetap menjadi milik
          AniList dan/atau pemegang hak cipta masing-masing. NimeList tidak
          menyediakan layanan streaming maupun menghosting konten anime dan
          tidak berafiliasi secara resmi dengan AniList.
        </ThemedText>
        <ThemedText style={styles.desc}>
          © 2026 NimeList Project. Seluruh hak cipta aplikasi dilindungi.
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
  desc: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
    textAlign: "justify",
  },
});
