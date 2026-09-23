import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { COLORS, Neubrutalism, STATUS_COLORS } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/src/context/ThemeContext';
import { NeoButton, NeoInput, NeoModal } from '@/components/NeoKit';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, Timestamp } from 'firebase/firestore';

const DURATIONS = [
  { label: '1 Hari', value: 1 },
  { label: '3 Hari', value: 3 },
  { label: '7 Hari', value: 7 },
  { label: 'Selamanya', value: null },
];

export default function AdminAnnouncementScreen() {
  const { colors, isDark } = useTheme();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState<number | null>(null);
  const [modalConfig, setModalConfig] = useState({ visible: false, title: '', message: '' });

  const showModal = (title: string, message: string) => {
    setModalConfig({ visible: true, title, message });
  };

  const handleBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      showModal('Gagal', 'Judul dan isi pengumuman tidak boleh kosong.');
      return;
    }

    try {
      // 1. Hitung durasi dan simpan pengumuman ke koleksi announcements
      let expiresAt: Date | null = null;
      if (duration !== null) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + duration);
      }

      await addDoc(collection(db, 'announcements'), {
        title: title.trim(),
        message: message.trim(),
        type: 'info',
        createdAt: serverTimestamp(),
        expiresAt: expiresAt ? Timestamp.fromDate(expiresAt) : null,
      });

      // 2. Ambil semua token push yang valid dari koleksi users
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('expoPushToken', '!=', null));
      const querySnapshot = await getDocs(q);
      
      const tokens: string[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const token = data.expoPushToken;
        // Validasi: Pastikan token ada, bertipe string, dan berformat Expo Push Token
        if (token && typeof token === 'string' && token.startsWith('ExponentPushToken[')) {
          tokens.push(token);
        }
      });

      // 3. Kirim push notification ke API Expo dengan sistem Batch (Maks 100 per request)
      const BATCH_SIZE = 100;
      let successCount = 0;
      let failCount = 0;

      if (tokens.length > 0) {
        const allMessages = tokens.map(token => ({
          to: token,
          sound: 'default',
          title: `📢 ${title.trim()}`,
          body: message.trim(),
          data: { type: 'broadcast' },
          channelId: 'anime-channel',
        }));

        for (let i = 0; i < allMessages.length; i += BATCH_SIZE) {
          const batch = allMessages.slice(i, i + BATCH_SIZE);
          try {
            const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(batch),
            });

            if (expoResponse.ok) {
              successCount += batch.length;
            } else {
              const errorText = await expoResponse.text();
              console.warn(`[Broadcast] Batch gagal:`, errorText);
              failCount += batch.length;
            }
          } catch (batchError) {
            console.error(`[Broadcast] Error koneksi:`, batchError);
            failCount += batch.length;
          }
        }
      }

      const resultMsg = tokens.length === 0
        ? 'Pengumuman tersimpan ke Database, namun belum ada pengguna dengan push token aktif.'
        : `Pengumuman dikirim ke ${successCount} perangkat.${failCount > 0 ? ` (${failCount} gagal)` : ''}`;

      showModal('Sukses ✅', resultMsg);
      setTitle('');
      setMessage('');
    } catch (error: any) {
      console.error('Gagal mengirim broadcast:', error);
      showModal('Error', 'Gagal memproses broadcast: ' + error.message);
    }
  };

  // Proteksi UI jika bukan admin (Sebagai lapis tambahan walau tombol di-hide)
  // Logic sebenarnya divalidasi dari userData.role, ini hanya visual sederhana
  if (!auth.currentUser) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText>Akses Ditolak</ThemedText>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
        <NeoModal
          visible={modalConfig.visible}
          title={modalConfig.title}
          message={modalConfig.message}
          onClose={() => setModalConfig({ ...modalConfig, visible: false })}
        />

        <View style={styles.header}>
          <NeoButton
            title="← Kembali"
            color={COLORS.PRIMARY}
            onPress={() => router.back()}
            style={{ marginBottom: 16, alignSelf: 'flex-start' }}
            textStyle={{ paddingVertical: 8, paddingHorizontal: 16, fontSize: 14, color: '#000' }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="shield-checkmark" size={28} color={isDark ? colors.text : '#000'} />
            <ThemedText type="title">Admin Panel</ThemedText>
          </View>
          <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}>
            Buat pengumuman global dan broadcast push notification ke semua pengguna.
          </ThemedText>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Judul Pengumuman</ThemedText>
            <NeoInput
              placeholder="Contoh: Maintenance Server V2.0"
              value={title}
              onChangeText={setTitle}
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card, borderColor: colors.border, color: colors.text }}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Isi Pesan / Pengumuman</ThemedText>
            <NeoInput
              placeholder="Detail lengkap mengenai pengumuman..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              style={{ minHeight: 120, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.card, borderColor: colors.border, color: colors.text }}
            />
          </View>

          <View style={[styles.inputGroup, { marginTop: 16 }]}>
            <ThemedText style={styles.label}>Durasi Pengumuman</ThemedText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {DURATIONS.map((d) => {
                const isSelected = duration === d.value;
                return (
                  <TouchableOpacity
                    key={d.label}
                    onPress={() => setDuration(d.value)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: isSelected ? STATUS_COLORS.ON_AIR : colors.border,
                      backgroundColor: isSelected ? STATUS_COLORS.ON_AIR : colors.card,
                    }}
                  >
                    <Text style={{ fontWeight: 'bold', color: isSelected ? '#000' : colors.text }}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View style={{ marginTop: 24, marginBottom: 40 }}>
          <NeoButton
            title=""
            color={STATUS_COLORS.ON_AIR} // Warna hijau terang
            onPress={handleBroadcast}
            style={{ width: '100%' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14 }}>
              <Ionicons name="paper-plane" size={20} color="#000" />
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#000' }}>
                Kirim & Broadcast
              </Text>
            </View>
          </NeoButton>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginTop: 40, marginBottom: 30 },
  subtitle: { marginTop: 8, fontSize: 14, fontWeight: '600' },
  formContainer: { gap: 20 },
  inputGroup: {},
  label: { fontSize: 14, fontWeight: '900', marginBottom: 8 },
});
