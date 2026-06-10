import { Neubrutalism } from "@/constants/theme";
import { StyleSheet, View, ScrollView, TouchableOpacity, Switch } from "react-native";
import { router } from "expo-router";
import { useState } from "react";

import { ThemedText } from "@/components/themed-text";

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(true);
  const [notif, setNotif] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={{fontWeight: '900', color: '#000'}}>← Kembali</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Pengaturan</ThemedText>
      </View>

      <View style={styles.settingItem}>
        <ThemedText style={styles.settingText}>Dark Mode (Simulasi)</ThemedText>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>
      <View style={styles.settingItem}>
        <ThemedText style={styles.settingText}>Notifikasi Push</ThemedText>
        <Switch value={notif} onValueChange={setNotif} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 20 },
  header: { marginBottom: 24, marginTop: 40 },
  backButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#FFD166', alignSelf: 'flex-start', marginBottom: 16, ...Neubrutalism },
  settingItem: { backgroundColor: "#FFF", padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, ...Neubrutalism },
  settingText: { fontSize: 16, fontWeight: 'bold' }
});
