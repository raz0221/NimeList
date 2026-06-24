import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { COLORS, STATUS_COLORS } from '@/constants/theme';
import { NeoButton, NeoCard } from '@/components/NeoKit';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={{ marginBottom: 20 }}>Notifikasi & Pengumuman</ThemedText>
      
      <View style={styles.notificationList}>
        <NeoCard contentStyle={styles.notificationCard}>
          <ThemedText style={styles.notifTitle}>Sistem Update v2.0</ThemedText>
          <ThemedText style={styles.notifDesc}>Aplikasi akan mengalami pemeliharaan pada pukul 00:00 WIB.</ThemedText>
        </NeoCard>

        <NeoCard contentStyle={styles.notificationCard}>
          <ThemedText style={styles.notifTitle}>Episode Baru Tersedia!</ThemedText>
          <ThemedText style={styles.notifDesc}>Jujutsu Kaisen Episode 13 sudah bisa ditonton.</ThemedText>
        </NeoCard>
      </View>

      <NeoButton
        title="Tutup"
        color={STATUS_COLORS.ON_AIR}
        onPress={() => router.back()}
        style={{ width: '100%', marginTop: 16 }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.BACKGROUND,
  },
  notificationList: {
    gap: 16,
    marginBottom: 24,
  },
  notificationCard: {
    padding: 16,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.TEXT_MAIN,
    marginBottom: 4,
  },
  notifDesc: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
});
