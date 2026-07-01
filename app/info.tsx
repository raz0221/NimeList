/**
 * app/info.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Info Hub: Menggabungkan "Pengumuman Sistem" dan "Berita Anime" dalam satu
 * layar bertab dengan segmented control khas Neobrutalism.
 *
 * Fitur:
 * - Tab 1: Pengumuman Sistem — real-time via Firestore onSnapshot
 * - Tab 2: Berita Anime     — data live dari AniList API
 * - Animasi tab indicator sliding (Animated)
 * - Fully themed via useTheme()
 * - Unread badge tracking via AsyncStorage
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '@/src/context/ThemeContext';
import { db } from '@/src/lib/firebase';
import { fetchAniList } from '@/src/services/anilist';
import { ThemedText } from '@/components/themed-text';
import { NeoCard, NeoBadge } from '@/components/NeoKit';
import { Neubrutalism, COLORS, STATUS_COLORS } from '@/constants/theme';

// ─── Konstanta ────────────────────────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TABS = ['Pengumuman', 'Berita Anime'] as const;
type TabKey = typeof TABS[number];

const UNREAD_KEY = '@anitrack_info_unread';

// ─── AniList Query ─────────────────────────────────────────────────────────────
const LATEST_TRENDING_QUERY = `
  query GetLatestNews {
    Page(page: 1, perPage: 20) {
      media(sort: TRENDING_DESC, type: ANIME, status_in: [RELEASING, FINISHED, NOT_YET_RELEASED]) {
        id
        title { romaji english }
        updatedAt
        status
        genres
        coverImage { medium }
      }
    }
  }
`;

const STATUS_LABEL: Record<string, string> = {
  RELEASING: 'Sedang Tayang',
  FINISHED: 'Selesai Tayang',
  NOT_YET_RELEASED: 'Segera Tayang',
  CANCELLED: 'Dibatalkan',
  HIATUS: 'Hiatus',
};

const STATUS_COLOR: Record<string, string> = {
  RELEASING: STATUS_COLORS.ON_AIR,
  FINISHED: STATUS_COLORS.FINISHED,
  NOT_YET_RELEASED: STATUS_COLORS.UPCOMING,
  CANCELLED: '#FCA5A5',
  HIATUS: STATUS_COLORS.DEFAULT,
};

const CATEGORY_COLORS = [
  COLORS.ACCENT,
  STATUS_COLORS.FINISHED,
  STATUS_COLORS.ON_AIR,
  STATUS_COLORS.UPCOMING,
  STATUS_COLORS.MOVIE,
  COLORS.PRIMARY,
];

// ─── Tipe ──────────────────────────────────────────────────────────────────────
interface SystemAnnouncement {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'update' | 'maintenance';
  createdAt: { toDate: () => Date } | null;
  isRead?: boolean;
}

interface NewsItem {
  id: number;
  title: { romaji: string; english: string };
  updatedAt: number;
  status: string;
  genres: string[];
}

// ─── Helper ────────────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<SystemAnnouncement['type'], { icon: string; color: string; label: string }> = {
  info:        { icon: 'information-circle',  color: STATUS_COLORS.FINISHED, label: 'INFO' },
  warning:     { icon: 'warning',  color: STATUS_COLORS.UPCOMING, label: 'PERINGATAN' },
  update:      { icon: 'rocket', color: STATUS_COLORS.ON_AIR,   label: 'UPDATE' },
  maintenance: { icon: 'build', color: COLORS.ACCENT,          label: 'PEMELIHARAAN' },
};

// ─── Komponen Card Pengumuman ──────────────────────────────────────────────────
function AnnouncementCard({ item, colors }: { item: SystemAnnouncement; colors: any }) {
  const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.info;
  const dateStr = item.createdAt?.toDate
    ? item.createdAt.toDate().toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : 'Baru saja';

  return (
    <NeoCard contentStyle={styles.announcementCard}>
      <View style={styles.announcementTopRow}>
        <View style={[styles.typeBadge, { backgroundColor: cfg.color, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name={cfg.icon as any} size={12} color="#000" />
            <Text style={styles.typeBadgeText}>{cfg.label}</Text>
          </View>
        </View>
        <ThemedText style={[styles.announcementDate, { color: colors.textMuted }]}>
          <Ionicons name="calendar" size={11} color={colors.textMuted} /> {dateStr}
        </ThemedText>
      </View>
      <ThemedText style={styles.announcementTitle}>{item.title}</ThemedText>
      <ThemedText style={[styles.announcementBody, { color: colors.textMuted }]}>
        {item.body}
      </ThemedText>
    </NeoCard>
  );
}

// ─── Komponen Card Berita ──────────────────────────────────────────────────────
function NewsCard({ item, idx, colors, isDark }: { item: NewsItem; idx: number; colors: any; isDark: boolean }) {
  const title = item.title.romaji || item.title.english;
  const category = STATUS_LABEL[item.status] || item.status;
  const genre = item.genres?.[0] || 'Anime';
  const badgeColor = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
  const statusColor = STATUS_COLOR[item.status] ?? STATUS_COLORS.DEFAULT;

  const date = item.updatedAt
    ? new Date(item.updatedAt * 1000).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : 'Baru saja';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/anime/${item.id}` as any)}
    >
      <NeoCard contentStyle={styles.newsCard}>
        <View style={styles.cardTopRow}>
          <NeoBadge
            label={category}
            color={statusColor}
            textStyle={{ color: '#000', fontSize: 10 }}
          />
          <NeoBadge
            label={genre}
            color={badgeColor}
            textStyle={{ color: '#000', fontSize: 10 }}
          />
        </View>
        <ThemedText style={styles.newsTitle}>{title}</ThemedText>
        <View style={styles.newsFooter}>
          <ThemedText style={[styles.newsDate, { color: colors.textMuted }]}>
            <Ionicons name="calendar" size={11} color={colors.textMuted} /> {date}
          </ThemedText>
          <ThemedText style={[styles.readMore, { color: isDark ? colors.primary : COLORS.PRIMARY }]}>
            Lihat Detail →
          </ThemedText>
        </View>
      </NeoCard>
    </TouchableOpacity>
  );
}

// ─── Komponen Skeleton Loading ─────────────────────────────────────────────────
function CardSkeleton({ colors }: { colors: any }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <View style={[styles.skeleton, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <Animated.View style={{ opacity }}>
        <View style={[styles.skeletonBadge, { backgroundColor: colors.border }]} />
        <View style={[styles.skeletonTitle, { backgroundColor: colors.border }]} />
        <View style={[styles.skeletonTitleShort, { backgroundColor: colors.border }]} />
        <View style={[styles.skeletonLine, { backgroundColor: colors.border }]} />
      </Animated.View>
    </View>
  );
}

// ─── Screen Utama ──────────────────────────────────────────────────────────────
export default function InfoScreen() {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>('Pengumuman');
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [newsFeed, setNewsFeed] = useState<NewsItem[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [isRefreshingNews, setIsRefreshingNews] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Animasi tab indicator
  const tabIndicatorX = useRef(new Animated.Value(0)).current;
  const TAB_WIDTH = (SCREEN_WIDTH - 40) / TABS.length;

  // ── Animasi saat ganti tab ─────────────────────────────────────────────────
  const switchTab = (tab: TabKey) => {
    const idx = TABS.indexOf(tab);
    Animated.spring(tabIndicatorX, {
      toValue: idx * TAB_WIDTH,
      useNativeDriver: true,
      tension: 70,
      friction: 10,
    }).start();
    setActiveTab(tab);
  };

  // ── Fetch Berita Anime (AniList) ──────────────────────────────────────────
  const fetchNews = useCallback(async () => {
    try {
      const response = await fetchAniList(LATEST_TRENDING_QUERY);
      setNewsFeed(response.Page.media || []);
    } catch (error) {
      console.error('[InfoScreen] Error fetching news:', error);
    } finally {
      setIsLoadingNews(false);
      setIsRefreshingNews(false);
    }
  }, []);

  // ── Real-time Listener: Pengumuman Sistem (Firestore onSnapshot) ───────────
  useEffect(() => {
    const q = query(
      collection(db, 'systemAnnouncements'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: SystemAnnouncement[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<SystemAnnouncement, 'id'>),
        }));
        setAnnouncements(items);
        setIsLoadingAnnouncements(false);

        // Hitung unread
        const count = items.filter((a) => !a.isRead).length;
        setUnreadCount(count);
        AsyncStorage.setItem(UNREAD_KEY, String(count)).catch(() => {});
      },
      (error) => {
        console.warn('[InfoScreen] Firestore onSnapshot error:', error.message);
        // Fallback: tampilkan data dummy jika Firestore belum dikonfigurasi
        setAnnouncements(FALLBACK_ANNOUNCEMENTS);
        setIsLoadingAnnouncements(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ── Fetch Berita saat mount ────────────────────────────────────────────────
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // ── Mark semua pengumuman sebagai dibaca saat layar dibuka ────────────────
  useEffect(() => {
    AsyncStorage.setItem(UNREAD_KEY, '0').catch(() => {});
  }, []);

  const handleRefreshNews = () => {
    setIsRefreshingNews(true);
    fetchNews();
  };

  // ── Render Tab Content ─────────────────────────────────────────────────────
  const renderAnnouncements = () => {
    if (isLoadingAnnouncements) {
      return (
        <View style={styles.list}>
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} colors={colors} />)}
        </View>
      );
    }

    if (announcements.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="mail-open" size={56} color={colors.text} style={{ marginBottom: 16 }} />
          <ThemedText style={styles.emptyTitle}>Tidak ada pengumuman</ThemedText>
          <ThemedText style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Pengumuman sistem terbaru akan muncul di sini secara otomatis.
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.list}>
        {announcements.map((item) => (
          <AnnouncementCard key={item.id} item={item} colors={colors} />
        ))}
      </View>
    );
  };

  const renderNews = () => {
    if (isLoadingNews) {
      return (
        <View style={styles.list}>
          {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} colors={colors} />)}
        </View>
      );
    }

    if (newsFeed.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="newspaper" size={56} color={colors.text} style={{ marginBottom: 16 }} />
          <ThemedText style={styles.emptyTitle}>Belum ada berita</ThemedText>
          <ThemedText style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Tarik ke bawah untuk memuat ulang.
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.list}>
        {newsFeed.map((item, idx) => (
          <NewsCard key={item.id} item={item} idx={idx} colors={colors} isDark={isDark} />
        ))}
      </View>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity
          id="info-back-btn"
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleArea}>
          <ThemedText style={styles.headerTitle}>Info Hub</ThemedText>
          <ThemedText style={[styles.headerSub, { color: colors.textMuted }]}>
            Pengumuman & Berita Terkini
          </ThemedText>
        </View>

        {unreadCount > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: '#EF4444', borderColor: colors.border }]}>
            <Text style={styles.unreadBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
          </View>
        )}
      </View>

      {/* ── Segmented Control ── */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.tabTrack, { borderColor: colors.border, backgroundColor: colors.background }]}>
          {/* Sliding indicator */}
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                width: TAB_WIDTH - 4,
                backgroundColor: isDark ? colors.primary : COLORS.PRIMARY,
                borderColor: colors.border,
                transform: [{ translateX: tabIndicatorX }],
              },
            ]}
          />
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              id={`info-tab-${tab.toLowerCase().replace(' ', '-')}`}
              style={[styles.tabBtn, { width: TAB_WIDTH }]}
              onPress={() => switchTab(tab)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons 
                  name={tab === 'Pengumuman' ? 'megaphone' : 'newspaper'} 
                  size={14} 
                  color={activeTab === tab ? (isDark ? '#000' : '#000') : colors.textMuted} 
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: activeTab === tab
                        ? isDark ? '#000' : '#000'
                        : colors.textMuted,
                      fontWeight: activeTab === tab ? '900' : '600',
                    },
                  ]}
                >
                  {tab}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Content ── */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
        refreshControl={
          activeTab === 'Berita Anime' ? (
            <RefreshControl
              refreshing={isRefreshingNews}
              onRefresh={handleRefreshNews}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          ) : undefined
        }
      >
        {activeTab === 'Pengumuman' ? renderAnnouncements() : renderNews()}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── Fallback Data (saat Firestore belum dikonfigurasi) ───────────────────────
const FALLBACK_ANNOUNCEMENTS: SystemAnnouncement[] = [
  {
    id: 'fallback-1',
    title: 'Selamat Datang di AniTrack!',
    body: 'Aplikasi AniTrack sudah tersedia. Nikmati fitur pelacakan, koleksi, dan notifikasi anime terbaru.',
    type: 'info',
    createdAt: null,
  },
  {
    id: 'fallback-2',
    title: 'Fitur Notifikasi Anime Baru',
    body: 'Sekarang kamu bisa berlangganan notifikasi untuk anime favorit! Klik tombol "Ingatkan Saya" di halaman detail anime.',
    type: 'update',
    createdAt: null,
  },
  {
    id: 'fallback-3',
    title: 'Pemeliharaan Terjadwal',
    body: 'Sistem akan mengalami pemeliharaan singkat. Data kamu aman dan tersimpan.',
    type: 'maintenance',
    createdAt: null,
  },
];

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 20,
    borderBottomWidth: Neubrutalism.borderWidth,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Neubrutalism.borderRadius,
  },
  headerTitleArea: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '900' },
  headerSub: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: { color: '#fff', fontSize: 11, fontWeight: '900' },

  // Segmented Control
  tabContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: Neubrutalism.borderWidth,
  },
  tabTrack: {
    flexDirection: 'row',
    borderWidth: Neubrutalism.borderWidth,
    borderRadius: Neubrutalism.borderRadius,
    overflow: 'hidden',
    position: 'relative',
    height: 44,
  },
  tabIndicator: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: 2,
    borderRadius: Neubrutalism.borderRadius - 2,
    borderWidth: 2,
    zIndex: 0,
  },
  tabBtn: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabLabel: { fontSize: 13 },

  // Content
  scrollContent: { flex: 1 },
  scrollInner: { padding: 20 },
  list: { gap: 16 },

  // Announcement Card
  announcementCard: { padding: 16 },
  announcementTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 2,
  },
  typeBadgeText: { fontSize: 11, fontWeight: '900', color: '#000' },
  announcementDate: { fontSize: 11, fontWeight: '600' },
  announcementTitle: { fontSize: 16, fontWeight: '900', marginBottom: 8, lineHeight: 22 },
  announcementBody: { fontSize: 13, lineHeight: 20, fontWeight: '500' },

  // News Card
  newsCard: { padding: 16 },
  cardTopRow: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  newsTitle: { fontSize: 16, fontWeight: '900', marginBottom: 12, lineHeight: 23 },
  newsFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  newsDate: { fontSize: 12, fontWeight: '600' },
  readMore: { fontSize: 12, fontWeight: '900' },

  // Empty State
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },

  // Skeleton
  skeleton: {
    borderWidth: Neubrutalism.borderWidth,
    borderRadius: Neubrutalism.borderRadius,
    padding: 16,
    gap: 8,
  },
  skeletonBadge: { width: 80, height: 22, borderRadius: 4, marginBottom: 4 },
  skeletonTitle: { width: '90%', height: 18, borderRadius: 4 },
  skeletonTitleShort: { width: '60%', height: 18, borderRadius: 4 },
  skeletonLine: { width: '40%', height: 14, borderRadius: 4, marginTop: 8 },
});
