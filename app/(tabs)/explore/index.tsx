import { THEME_COLORS, COLORS, STATUS_COLORS, Neubrutalism } from "@/constants/theme";
import { Modal, ScrollView, StyleSheet, Text, View, TouchableOpacity, Alert, Pressable } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { fetchAniList } from "@/src/services/anilist";
import { Skeleton } from "@/components/Skeleton";
import { NeoButton, NeoCard, NeoInput, NeoAnimeCard } from "@/components/NeoKit";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const SEARCH_QUERY = `
  query SearchAnime($search: String, $genre: [String], $format: [MediaFormat], $sort: [MediaSort]) { 
    Page(page: 1, perPage: 20) { 
      media(search: $search, genre_in: $genre, format_in: $format, type: ANIME, sort: $sort) { 
        id 
        title { romaji english } 
        coverImage { large } 
        startDate { year month day }
        episodes
        duration
        genres
        description
        studios(isMain: true) { nodes { name } }
        source
        averageScore
        format
        isAdult
        status
      } 
    } 
  }
`;

const ALL_GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Ecchi", "Fantasy",
  "Horror", "Mahou Shoujo", "Mecha", "Music", "Mystery", "Psychological",
  "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller",
];

const GENRE_COLORS = [
  THEME_COLORS.accent, THEME_COLORS.primary, THEME_COLORS.secondary, THEME_COLORS.info,
  THEME_COLORS.purple, THEME_COLORS.orange, THEME_COLORS.cyan, THEME_COLORS.blue,
  "#F43F5E", "#10B981", "#6366F1", "#F59E0B",
  THEME_COLORS.accent, THEME_COLORS.primary, THEME_COLORS.secondary, THEME_COLORS.info,
  THEME_COLORS.purple, THEME_COLORS.orange,
];

const FORMATS = ["TV", "MOVIE", "OVA", "ONA", "SPECIAL"];
const SORTS = [
  { icon: 'flame' as const,    label: "Trending",  value: "TRENDING_DESC" },
  { icon: 'star' as const,     label: "Top Score", value: "SCORE_DESC" },
  { icon: 'calendar' as const, label: "Terbaru",   value: "START_DATE_DESC" },
];

const NAV_ITEMS = [
  { icon: "color-palette", label: "Genre", sub: "Semua Kategori", color: THEME_COLORS.secondary, action: "genre" },
  { icon: "star", label: "Rekomendasi", sub: "Anime spesial", color: THEME_COLORS.cyan, route: "/explore/recommendations" },
  { icon: "film", label: "Anime Movie", sub: "Film layar lebar", color: THEME_COLORS.primary, route: "/explore/movies" },
];

export default function ExploreScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [showGenreModal, setShowGenreModal] = useState(false);

  const [filterGenre, setFilterGenre] = useState<string | null>(null);
  const [filterFormat, setFilterFormat] = useState<string | null>(null);
  const [filterSort, setFilterSort] = useState<string>("TRENDING_DESC");

  const activeFilterCount = [filterGenre, filterFormat].filter(Boolean).length;

  const handleSearch = async () => {
    if (!searchQuery.trim() && !filterGenre && !filterFormat) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    setIsSearching(true);
    setHasSearched(true);
    try {
      const variables: any = { sort: [filterSort] };
      if (searchQuery.trim()) variables.search = searchQuery;
      if (filterGenre) variables.genre = [filterGenre];
      if (filterFormat) variables.format = [filterFormat];
      const response = await fetchAniList(SEARCH_QUERY, variables);
      setSearchResults(response.Page.media || []);
    } catch (error) {
      console.error("Search Error:", error);
      Alert.alert(t("Gagal"), t("Terjadi kesalahan saat mencari anime."));
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* ── App Bar ── */}
      <View style={styles.appBar}>
        <View>
          <ThemedText style={styles.appBarTitle}>Explore</ThemedText>
          <ThemedText style={[styles.appBarSub, { color: colors.textMuted }]}>Temukan anime favoritmu</ThemedText>
        </View>
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.section}>
        <View style={styles.searchRow}>
          {/* Input */}
          <NeoInput
            placeholder={t("Cari judul anime...")}
            placeholderTextColor={COLORS.TEXT_SECONDARY}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            containerStyle={{ flex: 1 }}
            onClear={handleClear}
          />
          {/* Search Button */}
          <TouchableOpacity onPress={handleSearch} style={styles.iconBtn}>
            <View style={[styles.iconBtnShadow, { backgroundColor: isDark ? COLORS.PRIMARY : '#000' }]} />
            <View style={[styles.iconBtnMain, { backgroundColor: isDark ? colors.card : COLORS.PRIMARY, borderColor: isDark ? COLORS.PRIMARY : '#000' }]}>
              <Ionicons name="search" size={20} color={isDark ? colors.text : '#000'} />
            </View>
          </TouchableOpacity>
          {/* Filter Button */}
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={styles.iconBtn}>
            <View style={[styles.iconBtnShadow, { backgroundColor: isDark ? (showFilters ? COLORS.ACCENT : colors.border) : '#000' }]} />
            <View style={[styles.iconBtnMain, { backgroundColor: isDark ? colors.card : (showFilters ? COLORS.ACCENT : COLORS.CARD_BACKGROUND), borderColor: isDark ? (showFilters ? COLORS.ACCENT : colors.border) : '#000' }]}>
              <Ionicons name="options" size={20} color={isDark ? (showFilters ? '#000' : colors.text) : '#000'} />
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Filter Panel ── */}
        {showFilters && (
          <View style={[styles.filterPanel, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
            {/* Genre */}
            <View style={styles.filterSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
                <Ionicons name="color-palette" size={16} color={colors.text} />
                <ThemedText style={[styles.filterLabel, { marginBottom: 0, color: colors.text }]}>{t("Genre")}</ThemedText>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                <TouchableOpacity
                  onPress={() => setFilterGenre(null)}
                  style={[styles.filterChip, { backgroundColor: !filterGenre ? (isDark ? colors.primary : COLORS.PRIMARY) : colors.card, borderColor: !filterGenre ? (isDark ? colors.primary : '#000') : colors.border }]}
                >
                  <ThemedText style={[styles.filterChipText, { color: !filterGenre ? (isDark ? '#000' : '#fff') : colors.text }]}>Semua</ThemedText>
                </TouchableOpacity>
                {ALL_GENRES.map((g, i) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setFilterGenre(g)}
                    style={[styles.filterChip, { backgroundColor: filterGenre === g ? (isDark ? colors.primary : GENRE_COLORS[i % GENRE_COLORS.length]) : colors.card, borderColor: filterGenre === g ? (isDark ? colors.primary : '#000') : colors.border }]}
                  >
                    <ThemedText style={[styles.filterChipText, { color: filterGenre === g ? '#000' : colors.text }]}>{g}</ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Format */}
            <View style={styles.filterSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
                <Ionicons name="tv" size={16} color={colors.text} />
                <ThemedText style={[styles.filterLabel, { marginBottom: 0, color: colors.text }]}>{t("Format")}</ThemedText>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                <TouchableOpacity
                  onPress={() => setFilterFormat(null)}
                  style={[styles.filterChip, { backgroundColor: !filterFormat ? (isDark ? colors.accent : COLORS.ACCENT) : colors.card, borderColor: !filterFormat ? (isDark ? colors.accent : '#000') : colors.border }]}
                >
                  <ThemedText style={[styles.filterChipText, { color: !filterFormat ? '#000' : colors.text }]}>Semua</ThemedText>
                </TouchableOpacity>
                {FORMATS.map(f => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setFilterFormat(f)}
                    style={[styles.filterChip, { backgroundColor: filterFormat === f ? (isDark ? colors.accent : COLORS.ACCENT) : colors.card, borderColor: filterFormat === f ? (isDark ? colors.accent : '#000') : colors.border }]}
                  >
                    <ThemedText style={[styles.filterChipText, { color: filterFormat === f ? '#000' : colors.text }]}>{f}</ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Sort */}
            <View style={styles.filterSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
                <Ionicons name="bar-chart" size={16} color={colors.text} />
                <ThemedText style={[styles.filterLabel, { marginBottom: 0, color: colors.text }]}>{t("Urutkan")}</ThemedText>
              </View>
              <View style={styles.filterScroll}>
                {SORTS.map(s => (
                  <TouchableOpacity
                    key={s.value}
                    onPress={() => setFilterSort(s.value)}
                    style={[styles.filterChip, { backgroundColor: filterSort === s.value ? (isDark ? colors.primary : STATUS_COLORS.ON_AIR) : colors.card, borderColor: filterSort === s.value ? (isDark ? colors.primary : '#000') : colors.border }]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name={s.icon} size={12} color={filterSort === s.value ? '#000' : colors.text} />
                      <ThemedText style={[styles.filterChipText, { color: filterSort === s.value ? '#000' : colors.text }]}>{s.label}</ThemedText>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSearch}
              style={[styles.applyBtn, { backgroundColor: isDark ? colors.primary : COLORS.PRIMARY, borderColor: isDark ? colors.primary : '#000' }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="checkmark" size={18} color="#000" />
                <Text style={styles.applyBtnText}>{t("Terapkan Filter")}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Search Results ── */}
      {hasSearched ? (
        <View style={styles.section}>
          <View style={styles.resultsHeader}>
            <ThemedText style={styles.sectionTitle}>{t("Hasil Pencarian")}</ThemedText>
            <TouchableOpacity onPress={handleClear} style={[styles.clearBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="close" size={14} color={colors.text} />
                <ThemedText style={[styles.clearBtnText, { color: colors.text }]}>Reset</ThemedText>
              </View>
            </TouchableOpacity>
          </View>

          {isSearching ? (
            <View style={{ gap: 16 }}>
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} width="100%" height={140} />
              ))}
            </View>
          ) : searchResults.length === 0 ? (
            <NeoCard color={STATUS_COLORS.DEFAULT} contentStyle={styles.emptyState}>
              <ThemedText style={[styles.emptyStateText, { color: colors.textMuted }]}>{t("Anime tidak ditemukan.")}</ThemedText>
            </NeoCard>
          ) : (
            <View style={{ paddingBottom: 40 }}>
              {searchResults.map((anime, idx) => {
                const palette = [THEME_COLORS.accent, THEME_COLORS.primary, THEME_COLORS.secondary, THEME_COLORS.info, THEME_COLORS.purple, THEME_COLORS.orange, THEME_COLORS.cyan, THEME_COLORS.blue];
                const color = palette[idx % palette.length];
                return (
                  <NeoAnimeCard
                    key={anime.id}
                    anime={anime}
                    color={color}
                    onPress={() => router.push(`/anime/${anime.id}`)}
                  />
                );
              })}
            </View>
          )}
        </View>
      ) : (
        <>
          {/* ── 3 Nav Banners ── */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { marginBottom: 16 }]}>{t("Jelajahi")}</ThemedText>
            <View style={styles.navGrid}>
              {/* Genre Button – Full width */}
              <TouchableOpacity style={{ width: "100%" }} onPress={() => setShowGenreModal(true)}>
                <View style={[styles.navCardShadow, { backgroundColor: isDark ? THEME_COLORS.secondary : '#000' }]} />
                <View style={[styles.navCard, { backgroundColor: isDark ? colors.card : THEME_COLORS.secondary, borderColor: isDark ? THEME_COLORS.secondary : '#000', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 }]}>
                  <View>
                    <Ionicons name="color-palette" size={24} color={isDark ? colors.text : '#000'} style={{ marginBottom: 4 }} />
                    <ThemedText style={[styles.navCardLabel, { color: isDark ? '#fff' : '#000' }]}>Genre</ThemedText>
                    <ThemedText style={[styles.navCardSub, { color: isDark ? '#fff' : COLORS.TEXT_SECONDARY }]}>Semua Kategori</ThemedText>
                  </View>
                  <View style={styles.genreChipsPreview}>
                    {["Action","Romance","Fantasy","Comedy"].map((g, i) => (
                      <View key={g} style={[styles.genrePreviewChip, { backgroundColor: isDark ? colors.card : GENRE_COLORS[i], borderColor: isDark ? GENRE_COLORS[i] : '#000' }]}>
                        <ThemedText style={[styles.genrePreviewText, { color: isDark ? '#fff' : '#000' }]}>{g}</ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>

              {/* Bottom row: Rekomendasi + Movie */}
              <View style={styles.navRow}>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push('/explore/recommendations')}>
                  <View style={[styles.navCardShadow, { backgroundColor: isDark ? THEME_COLORS.cyan : '#000' }]} />
                  <View style={[styles.navCard, { backgroundColor: isDark ? colors.card : THEME_COLORS.cyan, borderColor: isDark ? THEME_COLORS.cyan : '#000' }]}>
                    <Ionicons name="star" size={24} color={isDark ? colors.text : '#000'} style={{ marginBottom: 4 }} />
                    <ThemedText style={[styles.navCardLabel, { color: isDark ? '#fff' : '#000' }]}>Rekomendasi</ThemedText>
                    <ThemedText style={[styles.navCardSub, { color: isDark ? '#fff' : COLORS.TEXT_SECONDARY }]}>Anime spesial</ThemedText>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push('/explore/movies')}>
                  <View style={[styles.navCardShadow, { backgroundColor: isDark ? THEME_COLORS.primary : '#000' }]} />
                  <View style={[styles.navCard, { backgroundColor: isDark ? colors.card : THEME_COLORS.primary, borderColor: isDark ? THEME_COLORS.primary : '#000' }]}>
                    <Ionicons name="film" size={24} color={isDark ? colors.text : '#000'} style={{ marginBottom: 4 }} />
                    <ThemedText style={[styles.navCardLabel, { color: isDark ? '#fff' : '#000' }]}>Anime Movie</ThemedText>
                    <ThemedText style={[styles.navCardSub, { color: isDark ? '#fff' : COLORS.TEXT_SECONDARY }]}>Film layar lebar</ThemedText>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </>
      )}

      <View style={{ height: 40 }} />

      {/* ── Genre Modal ── */}
      <Modal visible={showGenreModal} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setShowGenreModal(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => {}}>
            <View style={[styles.modalHandle, { backgroundColor: isDark ? '#4B5563' : '#ccc' }]} />
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="color-palette" size={24} color={colors.text} />
                <ThemedText style={styles.modalTitle}>Semua Genre</ThemedText>
              </View>
              <TouchableOpacity onPress={() => setShowGenreModal(false)} style={[styles.modalCloseBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalGrid}>
              {ALL_GENRES.map((genre, idx) => (
                <View key={genre} style={{ width: '48%' }}>
                  <NeoButton
                    title={genre}
                    color={isDark ? colors.card : GENRE_COLORS[idx % GENRE_COLORS.length]}
                    onPress={() => {
                      setShowGenreModal(false);
                      router.push(`/explore/genre/${genre}`);
                    }}
                    style={{ width: '100%', borderColor: isDark ? GENRE_COLORS[idx % GENRE_COLORS.length] : '#000' }}
                    textStyle={{ fontSize: 13, paddingVertical: 12, paddingHorizontal: 12, color: isDark ? GENRE_COLORS[idx % GENRE_COLORS.length] : '#000' }}
                  />
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 },

  appBar: { marginBottom: 20 },
  appBarTitle: { fontSize: 26, fontWeight: "900" },
  appBarSub: { fontSize: 13, fontWeight: "600", marginTop: 2 },

  titleContainer: { marginBottom: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: "900" },

  // ── Search Bar ──
  searchRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  iconBtn: { position: 'relative', width: 52, height: 52 },
  iconBtnShadow: {
    position: 'absolute', top: 3, left: 3, right: -3, bottom: -3,
    backgroundColor: '#000', borderRadius: Neubrutalism.borderRadius,
  },
  iconBtnMain: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: Neubrutalism.borderRadius,
    borderWidth: Neubrutalism.borderWidth,
    borderColor: '#000',
    justifyContent: 'center', alignItems: 'center',
  },
  iconBtnText: { fontSize: 20 },
  filterBadge: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: COLORS.ACCENT, borderRadius: 99,
    width: 16, height: 16, justifyContent: 'center', alignItems: 'center',
  },
  filterBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },

  // ── Filter Panel ──
  filterPanel: {
    marginTop: 14,
    borderWidth: Neubrutalism.borderWidth,
    borderColor: '#000',
    borderRadius: Neubrutalism.borderRadius,
    backgroundColor: COLORS.CARD_BACKGROUND,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  filterSection: { marginBottom: 12 },
  filterLabel: { fontSize: 12, fontWeight: '900', marginBottom: 8, color: COLORS.TEXT_MAIN },
  filterScroll: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: {
    paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 99, borderWidth: 1.5, borderColor: '#000',
  },
  filterChipText: { fontSize: 12, fontWeight: '800' },
  applyBtn: {
    marginTop: 8,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: Neubrutalism.borderRadius,
    borderWidth: Neubrutalism.borderWidth,
    borderColor: '#000',
    paddingVertical: 10,
    alignItems: 'center',
  },
  applyBtnText: { fontWeight: '900', fontSize: 14, color: '#000' },

  // ── Results ──
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  clearBtn: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderWidth: Neubrutalism.borderWidth,
    borderColor: '#000',
    borderRadius: Neubrutalism.borderRadius,
    paddingVertical: 6, paddingHorizontal: 14,
  },
  clearBtnText: { fontWeight: '900', fontSize: 13, color: COLORS.TEXT_MAIN },
  emptyState: { padding: 36, alignItems: "center" },
  emptyStateText: { color: COLORS.TEXT_SECONDARY, fontWeight: "bold", fontSize: 16, marginBottom: 12 },

  // ── Nav Cards ──
  navGrid: { gap: 12 },
  navRow: { flexDirection: 'row', gap: 12 },
  navCardShadow: {
    position: 'absolute', top: 4, left: 4, right: -4, bottom: -4,
    backgroundColor: '#000', borderRadius: Neubrutalism.borderRadius,
    zIndex: 0,
  },
  navCard: {
    borderRadius: Neubrutalism.borderRadius,
    borderWidth: Neubrutalism.borderWidth,
    borderColor: '#000',
    padding: 16,
    height: 90,
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
  navCardIcon: { fontSize: 22, marginBottom: 4 },
  navCardLabel: { fontSize: 15, fontWeight: '900' },
  navCardSub: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  genreChipsPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, maxWidth: 160 },
  genrePreviewChip: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 99, borderWidth: 1, borderColor: '#000',
  },
  genrePreviewText: { fontSize: 10, fontWeight: '800', color: '#000' },

  // ── Genre Modal ──
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderWidth: Neubrutalism.borderWidth,
    borderBottomWidth: 0,
    maxHeight: '80%',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32,
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: '#ccc', borderRadius: 99,
    alignSelf: 'center', marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '900' },
  modalCloseBtn: {
    width: 36, height: 36, borderRadius: 99,
    borderWidth: Neubrutalism.borderWidth,
    justifyContent: 'center', alignItems: 'center',
  },
  modalCloseText: { fontWeight: '900', fontSize: 16 },
  modalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 20 },
});
