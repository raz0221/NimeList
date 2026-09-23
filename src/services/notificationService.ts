/**
 * notificationService.ts
 * Layanan lengkap untuk expo-notifications:
 * - Minta izin & dapatkan ExpoPushToken
 * - Simpan token ke Firestore (users/{userId}/expoPushToken)
 * - Kirim notifikasi lokal terjadwal
 * - Setup listener notifikasi global
 */

import type * as NotificationsType from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import Constants from 'expo-constants';

let Notifications: typeof NotificationsType | null = null;
try {
  Notifications = require('expo-notifications');
} catch (error) {
  console.warn('[Notifications] expo-notifications native module not found. Push notifications will be disabled.');
}

// ─── Konfigurasi handler notifikasi global ──────────────────────────────────
// Harus dipanggil di root komponen (misal _layout.tsx)
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// ─── Tipe Data ────────────────────────────────────────────────────────────────
export interface LocalNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  /** Detik dari sekarang sebelum notifikasi muncul. Default: 1 detik */
  delaySeconds?: number;
}

// ─── Minta Izin & Dapatkan Push Token ────────────────────────────────────────
/**
 * Meminta izin notifikasi dan mengembalikan Expo Push Token.
 * Harus dipanggil di perangkat fisik (bukan simulator) untuk mendapatkan token.
 * @returns ExpoPushToken string, atau null jika gagal.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Notifications) {
    console.warn('[Notifications] Modul tidak tersedia.');
    return null;
  }

  // Notifikasi Push hanya bekerja di perangkat fisik
  if (!Device.isDevice) {
    console.warn('[Notifications] Push token hanya tersedia di perangkat fisik.');
    return null;
  }

  // Buat Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('anime-channel', {
      name: 'Anime Reminders & Announcements',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1E3A8A',
      sound: 'nime-sound.wav',
    });
  }

  // Cek status izin saat ini
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Minta izin jika belum diberikan
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Notifications] Izin push notification ditolak pengguna.');
    return null;
  }

  // Dapatkan Expo Push Token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.warn('[Notifications] EAS projectId tidak ditemukan di app.json');
    }
    
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const token = tokenData.data;
    console.log('[Notifications] Expo Push Token:', token);
    return token;
  } catch (error) {
    console.log('[Notifications] Gagal mendapatkan push token:', error);
    return null;
  }
}

// ─── Simpan Token ke Firestore ────────────────────────────────────────────────
/**
 * Menyimpan ExpoPushToken ke dokumen user di Firestore.
 * Panggil ini segera setelah user berhasil login.
 * @param userId - UID Firebase Auth user
 * @param token  - Expo Push Token yang didapat dari registerForPushNotificationsAsync
 */
export async function saveTokenToFirestore(userId: string, token: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    // Gunakan setDoc + merge:true agar token selalu tersimpan,
    // termasuk untuk akun lama yang belum memiliki field expoPushToken.
    // updateDoc akan gagal jika field tidak ada, setDoc+merge tidak.
    await setDoc(userRef, {
      expoPushToken: token,
      tokenUpdatedAt: new Date(),
    }, { merge: true });
    console.log('[Notifications] Token berhasil disimpan ke Firestore.');
  } catch (error) {
    console.error('[Notifications] Gagal menyimpan token:', error);
  }
}

// ─── Kirim Notifikasi Lokal ───────────────────────────────────────────────────
/**
 * Menjadwalkan notifikasi lokal pada perangkat pengguna.
 * Tidak memerlukan server — cocok untuk pengingat lokal.
 * @param payload - Konten dan delay notifikasi
 */
export async function scheduleLocalNotification(
  payload: LocalNotificationPayload
): Promise<string | null> {
  if (!Notifications) return null;
  
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        data: payload.data ?? {},
        sound: 'nime-sound.wav',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: payload.delaySeconds ?? 1,
        channelId: 'anime-channel',
      },
    });
    console.log('[Notifications] Notifikasi dijadwalkan:', identifier);
    return identifier;
  } catch (error) {
    console.log('[Notifications] Gagal menjadwalkan notifikasi:', error);
    return null;
  }
}

// ─── Notifikasi Anime Spesifik ────────────────────────────────────────────────
/**
 * Kirim notifikasi lokal saat episode baru dari anime yang di-subscribe tersedia.
 * @param animeTitle - Judul anime
 * @param episodeNumber - Nomor episode baru (opsional)
 * @param animeId - ID anime untuk navigasi (opsional)
 */
export async function notifyNewEpisode(
  animeTitle: string,
  episodeNumber?: number,
  animeId?: number | string
): Promise<void> {
  const body = episodeNumber
    ? `Episode ${episodeNumber} sekarang tersedia! Jangan sampai ketinggalan.`
    : 'Episode terbaru sudah bisa ditonton!';

  await scheduleLocalNotification({
    title: `🎌 ${animeTitle}`,
    body,
    data: { type: 'new_episode', animeId },
    delaySeconds: 1,
  });
}

/**
 * Kirim notifikasi lokal saat movie baru dari anime yang di-subscribe dirilis.
 * @param animeTitle - Judul anime/movie
 * @param animeId - ID anime untuk navigasi (opsional)
 */
export async function notifyNewMovie(
  animeTitle: string,
  animeId?: number | string
): Promise<void> {
  await scheduleLocalNotification({
    title: `🎬 Movie Baru: ${animeTitle}`,
    body: 'Movie yang kamu tunggu-tunggu akhirnya rilis! Tonton sekarang.',
    data: { type: 'new_movie', animeId },
    delaySeconds: 1,
  });
}

// ─── Hapus Semua Notifikasi Terjadwal ────────────────────────────────────────
export async function cancelAllScheduledNotifications(): Promise<void> {
  if (!Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ─── Setup Listener (untuk dipakai di _layout.tsx) ───────────────────────────
/**
 * Mendaftarkan listener untuk notifikasi yang diterima saat app aktif
 * dan saat user mengetuk notifikasi.
 * @returns Fungsi cleanup untuk menghapus listener.
 */
export function setupNotificationListeners(
  onReceive?: (notification: NotificationsType.Notification) => void,
  onResponse?: (response: NotificationsType.NotificationResponse) => void
): () => void {
  if (!Notifications) return () => {};

  const receivedSub = Notifications.addNotificationReceivedListener((notification: any) => {
    console.log('[Notifications] Diterima saat app aktif:', notification);
    onReceive?.(notification);
  });

  const responseSub = Notifications.addNotificationResponseReceivedListener((response: any) => {
    console.log('[Notifications] Pengguna mengetuk notifikasi:', response);
    onResponse?.(response);
  });

  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}
