import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Neubrutalism } from '@/constants/theme';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={{ marginBottom: 20 }}>Notifikasi & Pengumuman</ThemedText>
      
      <View style={styles.notificationList}>
        <View style={styles.notificationCard}>
          <ThemedText style={styles.notifTitle}>Sistem Update v2.0</ThemedText>
          <ThemedText style={styles.notifDesc}>Aplikasi akan mengalami pemeliharaan pada pukul 00:00 WIB.</ThemedText>
        </View>

        <View style={styles.notificationCard}>
          <ThemedText style={styles.notifTitle}>Episode Baru Tersedia!</ThemedText>
          <ThemedText style={styles.notifDesc}>Jujutsu Kaisen Episode 13 sudah bisa ditonton.</ThemedText>
        </View>
      </View>

      <Link href="/" dismissTo style={styles.linkButton}>
        <ThemedText style={styles.linkText}>Tutup</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F3F4F6', // Light background for contrast
  },
  notificationList: {
    gap: 16,
    marginBottom: 24,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    ...Neubrutalism,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 4,
  },
  notifDesc: {
    fontSize: 14,
    color: '#374151',
  },
  linkButton: {
    marginTop: 15,
    paddingVertical: 15,
    backgroundColor: '#06D6A0',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    ...Neubrutalism,
  },
  linkText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 16,
  },
});
