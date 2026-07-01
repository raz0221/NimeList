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
 *     - subscribedAt: Timestamp
 */

import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

// ─── Tipe Data ─────────────────────────────────────────────────────────────────
export interface AnimeSubscription {
  animeId: string;
  animeTitle: string;
  animeStatus: string;
  subscribedAt: unknown; // Firestore Timestamp
}

// ─── Subscribe ─────────────────────────────────────────────────────────────────
/**
 * Menyimpan langganan anime ke Firestore.
 * @param userId     - UID Firebase Auth user
 * @param animeId    - ID anime dari AniList
 * @param animeTitle - Judul anime (untuk ditampilkan di notifikasi)
 * @param animeStatus - Status anime: 'RELEASING' | 'NOT_YET_RELEASED'
 */
export async function subscribeToAnime(
  userId: string,
  animeId: number | string,
  animeTitle: string,
  animeStatus: string
): Promise<void> {
  const ref = doc(db, 'users', userId, 'subscriptions', String(animeId));
  await setDoc(ref, {
    animeId: String(animeId),
    animeTitle,
    animeStatus,
    subscribedAt: serverTimestamp(),
  });
  console.log(`[NotifyService] Berlangganan: ${animeTitle} (${animeId})`);
}

// ─── Unsubscribe ───────────────────────────────────────────────────────────────
/**
 * Menghapus langganan anime dari Firestore.
 * @param userId  - UID Firebase Auth user
 * @param animeId - ID anime dari AniList
 */
export async function unsubscribeFromAnime(
  userId: string,
  animeId: number | string
): Promise<void> {
  const ref = doc(db, 'users', userId, 'subscriptions', String(animeId));
  await deleteDoc(ref);
  console.log(`[NotifyService] Berhenti berlangganan anime ID: ${animeId}`);
}

// ─── Cek Status Langganan ──────────────────────────────────────────────────────
/**
 * Mengecek apakah pengguna sudah berlangganan anime tertentu.
 * @param userId  - UID Firebase Auth user
 * @param animeId - ID anime dari AniList
 * @returns true jika sudah berlangganan, false jika belum.
 */
export async function checkSubscriptionStatus(
  userId: string,
  animeId: number | string
): Promise<boolean> {
  const ref = doc(db, 'users', userId, 'subscriptions', String(animeId));
  const snap = await getDoc(ref);
  return snap.exists();
}

// ─── Toggle Subscribe (helper gabungan) ───────────────────────────────────────
/**
 * Toggle status langganan — subscribe jika belum, unsubscribe jika sudah.
 * @returns true jika akhirnya terdaftar, false jika dibatalkan.
 */
export async function toggleSubscription(
  userId: string,
  animeId: number | string,
  animeTitle: string,
  animeStatus: string
): Promise<boolean> {
  const isSubscribed = await checkSubscriptionStatus(userId, animeId);
  if (isSubscribed) {
    await unsubscribeFromAnime(userId, animeId);
    return false;
  } else {
    await subscribeToAnime(userId, animeId, animeTitle, animeStatus);
    return true;
  }
}
