/**
 * notifyService.ts
 * Layanan Firestore untuk fitur "Notify Me" / "Ingatkan Saya".
 * Menyimpan, menghapus, dan mengecek langganan anime milik user.
 *
 * Struktur Firestore:
 *   users/{userId}/subscriptions/{animeId}
 *     - animeId: string
 *     - animeTitle: string
 *     - animeStatus: 'RELEASING' | 'NOT_YET_RELEASED'
 *     - nextEpisode: number | null
 *     - nextAiringAt: number | null   (Unix timestamp detik)
 *     - coverImage: string | null
 *     - subscribedAt: Timestamp
 */

import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

// ─── Tipe Data ─────────────────────────────────────────────────────────────────
export interface AnimeSubscription {
  animeId: string;
  animeTitle: string;
  animeStatus: string;
  nextEpisode?: number | null;
  nextAiringAt?: number | null;
  coverImage?: string | null;
  subscribedAt: unknown; // Firestore Timestamp
}

export interface SubscribePayload {
  userId: string;
  animeId: number | string;
  animeTitle: string;
  animeStatus: string;
  nextEpisode?: number | null;
  /** Unix timestamp (detik) dari AniList nextAiringEpisode.airingAt */
  nextAiringAt?: number | null;
  coverImage?: string | null;
}

// ─── Subscribe ─────────────────────────────────────────────────────────────────
/**
 * Menyimpan langganan anime ke Firestore.
 * Sekarang menyertakan jadwal episode berikutnya untuk keperluan My Reminders.
 */
export async function subscribeToAnime(payload: SubscribePayload): Promise<void> {
  const ref = doc(db, 'users', payload.userId, 'subscriptions', String(payload.animeId));
  await setDoc(ref, {
    animeId: String(payload.animeId),
    animeTitle: payload.animeTitle,
    animeStatus: payload.animeStatus,
    nextEpisode: payload.nextEpisode ?? null,
    nextAiringAt: payload.nextAiringAt ?? null,
    coverImage: payload.coverImage ?? null,
    subscribedAt: serverTimestamp(),
  });
  console.log(`[NotifyService] Berlangganan: ${payload.animeTitle} (${payload.animeId})`);
}

// ─── Unsubscribe ───────────────────────────────────────────────────────────────
export async function unsubscribeFromAnime(
  userId: string,
  animeId: number | string
): Promise<void> {
  const ref = doc(db, 'users', userId, 'subscriptions', String(animeId));
  await deleteDoc(ref);
  console.log(`[NotifyService] Berhenti berlangganan anime ID: ${animeId}`);
}

// ─── Cek Status Langganan ──────────────────────────────────────────────────────
export async function checkSubscriptionStatus(
  userId: string,
  animeId: number | string
): Promise<boolean> {
  const ref = doc(db, 'users', userId, 'subscriptions', String(animeId));
  const snap = await getDoc(ref);
  return snap.exists();
}

// ─── Ambil Semua Langganan User ────────────────────────────────────────────────
/**
 * Mengambil semua langganan anime milik user (untuk halaman My Reminders).
 */
export async function getUserSubscriptions(userId: string): Promise<AnimeSubscription[]> {
  const colRef = collection(db, 'users', userId, 'subscriptions');
  const snap = await getDocs(colRef);
  return snap.docs.map(d => d.data() as AnimeSubscription);
}

// ─── Toggle Subscribe (helper gabungan) ───────────────────────────────────────
/**
 * Toggle status langganan — subscribe jika belum, unsubscribe jika sudah.
 * @returns true jika akhirnya terdaftar, false jika dibatalkan.
 */
export async function toggleSubscription(
  payload: SubscribePayload
): Promise<boolean> {
  const isSubscribed = await checkSubscriptionStatus(payload.userId, payload.animeId);
  if (isSubscribed) {
    await unsubscribeFromAnime(payload.userId, payload.animeId);
    return false;
  } else {
    await subscribeToAnime(payload);
    return true;
  }
}
