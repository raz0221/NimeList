import { COLORS, STATUS_COLORS } from "@/constants/theme";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Linking, ScrollView, StyleSheet, View } from "react-native";

import { NeoButton, NeoCard, NeoInput } from "@/components/NeoKit";
import { ThemedText } from "@/components/themed-text";

export default function ContactScreen() {
  const { t } = useTranslation();
  const [keluhan, setKeluhan] = useState("");
  const [history, setHistory] = useState<{ id: string; text: string }[]>([]);

  const handleKirim = () => {
    if (!keluhan) {
      Alert.alert("Error", "Keluhan tidak boleh kosong!");
      return;
    }
    Alert.alert("Terkirim", "Pesan terkirim ke sistem!");
    setHistory([{ id: Date.now().toString(), text: keluhan }, ...history]);
    setKeluhan("");
  };

  const openEmail = () => {
    Linking.openURL("mailto:23050024@gmail.com");
  };

  const openInstagram = () => {
    Linking.openURL("https://instagram.com/apphrodite01");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <NeoButton
          title={`← ${t("Kembali")}`}
          color={COLORS.PRIMARY}
          onPress={() => router.back()}
          style={{ marginBottom: 16, alignSelf: "flex-start" }}
          textStyle={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            fontSize: 14,
          }}
        />
        <ThemedText type="title">{t("Hubungi Kami")}</ThemedText>
      </View>

      <View style={styles.formContainer}>
        <NeoInput
          placeholder="Tulis keluhan atau masukan Anda..."
          placeholderTextColor={COLORS.TEXT_SECONDARY}
          value={keluhan}
          onChangeText={setKeluhan}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          containerStyle={{ marginBottom: 16 }}
          style={{ minHeight: 120 }}
        />

        <NeoButton
          title="Kirim Pesan"
          color={COLORS.PRIMARY}
          onPress={handleKirim}
          style={{ width: "100%", marginBottom: 24 }}
        />

        <View style={styles.socialButtons}>
          <NeoButton
            title="📧 Kirim via Email"
            color="#fff"
            onPress={openEmail}
            style={{ flex: 1 }}
            textStyle={{ color: "#000", fontSize: 14 }}
          />
          <NeoButton
            title="📸 Instagram"
            color="#FDE047"
            onPress={openInstagram}
            style={{ flex: 1 }}
            textStyle={{ color: "#000", fontSize: 14 }}
          />
        </View>
      </View>

      {history.length > 0 && (
        <View style={styles.historySection}>
          <ThemedText style={styles.historyTitle}>Riwayat Tiket:</ThemedText>
          {history.map((item) => (
            <NeoCard
              key={item.id}
              color={STATUS_COLORS.FINISHED}
              contentStyle={styles.ticket}
            >
              <ThemedText style={{ color: COLORS.BUTTON_TEXT_LIGHT }}>
                {item.text}
              </ThemedText>
            </NeoCard>
          ))}
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND, padding: 20 },
  header: { marginBottom: 24, marginTop: 40 },
  formContainer: { marginBottom: 32 },
  socialButtons: { flexDirection: "row", gap: 12 },
  historySection: { gap: 12 },
  historyTitle: {
    fontWeight: "900",
    fontSize: 16,
    color: COLORS.TEXT_MAIN,
    marginBottom: 8,
  },
  ticket: { padding: 16 },
});
