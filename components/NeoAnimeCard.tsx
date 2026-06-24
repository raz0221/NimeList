import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, STATUS_COLORS, Neubrutalism } from '@/constants/theme';
import { ThemedText } from './themed-text';
import { NeoCard } from './NeoKit';
import { useTheme } from '@/src/context/ThemeContext';

export interface AnimeData {
  id: number | string;
  title: {
    romaji?: string;
    english?: string;
  };
  coverImage?: {
    large?: string;
  };
  startDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  episodes?: number;
  duration?: number;
  genres?: string[];
  description?: string;
  studios?: {
    nodes?: { name: string }[];
  };
  source?: string;
  averageScore?: number;
  format?: string;
  isAdult?: boolean;
  status?: string;
}

export interface NeoAnimeCardProps {
  anime: AnimeData;
  onPress?: () => void;
  rank?: number | string;
  color?: string;
  style?: ViewStyle;
  footerComponent?: React.ReactNode;
  /** Teks opsional yang ditampilkan di kanan subheader (contoh: status tayang, waktu tonton) */
  topRightText?: string;
}

const stripHtml = (html?: string) => {
  if (!html) return "Tidak ada sinopsis.";
  return html.replace(/<[^>]*>?/gm, '');
};

const getMonthName = (month?: number) => {
  if (!month) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[month - 1] || "";
};

const formatSource = (source?: string) => {
  if (!source) return "Original";
  return source.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
};

export function NeoAnimeCard({ anime, onPress, rank, color, topRightText, style, footerComponent }: NeoAnimeCardProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const titleMain = anime.title.romaji || anime.title.english || "Unknown Title";
  const titleSub = anime.title.english && anime.title.english !== anime.title.romaji ? anime.title.english : null;
  
  const dateStr = anime.startDate?.year ? `${getMonthName(anime.startDate.month)} ${anime.startDate.day ? anime.startDate.day + ', ' : ''}${anime.startDate.year}` : "TBA";
  const epsStr = anime.episodes ? `${anime.episodes} eps` : "? eps";
  const durationStr = anime.duration ? `${anime.duration} min` : "? min";
  
  const studio = anime.studios?.nodes?.[0]?.name || "Unknown Studio";
  const source = formatSource(anime.source);
  
  // Try to extract Demographic from genres (Shounen, Seinen, Shoujo, Josei)
  const demographicsList = ["Shounen", "Seinen", "Shoujo", "Josei", "Kids"];
  const demographic = anime.genres?.find(g => demographicsList.includes(g)) || "N/A";
  
  // Filter out demographics from themes/genres
  const themes = anime.genres?.filter(g => !demographicsList.includes(g)) || [];

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.container, style]}>
      <NeoCard color={colors.card} contentStyle={{ padding: 0 }}>
        
        {/* HEADER SECTION */}
        <View style={[styles.header, { borderColor: colors.border, backgroundColor: colors.shadow === '#000000' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }]}>
          <ThemedText style={styles.titleMain} numberOfLines={2}>{titleMain}</ThemedText>
          {titleSub && <ThemedText style={[styles.titleSub, { color: colors.textMuted }]} numberOfLines={1}>{titleSub}</ThemedText>}
        </View>

        {/* SUBHEADER SECTION */}
        <View style={[styles.subHeader, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <ThemedText style={styles.subHeaderText}>{dateStr}</ThemedText>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <ThemedText style={styles.subHeaderText}>{epsStr}, {durationStr}</ThemedText>
          {topRightText && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <ThemedText style={[styles.subHeaderText, { color: STATUS_COLORS.ON_AIR }]}>{topRightText}</ThemedText>
            </>
          )}
        </View>

        {/* GENRES SECTION */}
        {themes.length > 0 && (
          <View style={[styles.genresContainer, { borderColor: colors.border, backgroundColor: colors.shadow === '#000000' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }]}>
            {themes.slice(0, 4).map(genre => (
              <View key={genre} style={[styles.smallBadge, { borderColor: colors.border }]}>
                <ThemedText style={[styles.smallBadgeText, { color: '#000' }]}>{genre}</ThemedText>
              </View>
            ))}
          </View>
        )}

        {/* BODY SECTION (Poster + Details) */}
        <View style={[styles.body, { borderColor: colors.border }]}>
          {/* Left: Poster */}
          <View style={[styles.posterContainer, { borderColor: colors.border }]}>
            <Image source={{ uri: anime.coverImage?.large }} style={styles.poster} contentFit="cover" />
            {rank && (
              <View style={[styles.rankBadge, { borderColor: colors.border }]}>
                <ThemedText style={styles.rankText}>#{rank}</ThemedText>
              </View>
            )}
          </View>

          {/* Right: Details */}
          <View style={[styles.detailsContainer, { backgroundColor: colors.card }]}>
            <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
              <ThemedText style={styles.synopsis} numberOfLines={expanded ? undefined : 4}>
                {stripHtml(anime.description)}
              </ThemedText>
              <View style={styles.expandArrowContainer}>
                <ThemedText style={[styles.expandArrow, { color: colors.textMuted }]}>{expanded ? "▲" : "▼"}</ThemedText>
              </View>
            </TouchableOpacity>

            <View style={styles.metaRow}>
              <ThemedText style={styles.metaLabel}>Studio:</ThemedText>
              <ThemedText style={styles.metaValue} numberOfLines={1}>{studio}</ThemedText>
            </View>
            <View style={styles.metaRow}>
              <ThemedText style={styles.metaLabel}>Source:</ThemedText>
              <ThemedText style={styles.metaValue} numberOfLines={1}>{source}</ThemedText>
            </View>
            <View style={styles.metaRow}>
              <ThemedText style={styles.metaLabel}>Demographic:</ThemedText>
              <ThemedText style={styles.metaValue} numberOfLines={1}>{demographic}</ThemedText>
            </View>
          </View>
        </View>

        {/* FOOTER SECTION */}
        <View style={[styles.footer, { backgroundColor: colors.card }]}>
          <View style={styles.footerItem}>
            <ThemedText style={[styles.footerLabel, { color: colors.textMuted }]}>RATING</ThemedText>
            <ThemedText style={styles.footerValue}>⭐ {anime.averageScore ? (anime.averageScore / 10).toFixed(1) : "N/A"}</ThemedText>
          </View>
          <View style={[styles.footerItem, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border }]}>
            <ThemedText style={[styles.footerLabel, { color: colors.textMuted }]}>FORMAT</ThemedText>
            <ThemedText style={styles.footerValue}>{anime.format || "TV"}</ThemedText>
          </View>
          <View style={styles.footerItem}>
            <ThemedText style={[styles.footerLabel, { color: colors.textMuted }]}>RATING USIA</ThemedText>
            <ThemedText style={styles.footerValue}>{anime.isAdult ? "R-18+" : "PG-13"}</ThemedText>
          </View>
        </View>

        {footerComponent && (
          <View style={{ borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.shadow === '#000000' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)', padding: 8 }}>
            {footerComponent}
          </View>
        )}

      </NeoCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  header: {
    padding: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  titleMain: {
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  titleSub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: 'bold',
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  subHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: 12,
    marginHorizontal: 12,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    padding: 8,
    borderBottomWidth: 1,
  },
  smallBadge: {
    backgroundColor: COLORS.ACCENT,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  smallBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000',
  },
  body: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  posterContainer: {
    width: 140,
    borderRightWidth: 1,
    position: 'relative',
  },
  poster: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: STATUS_COLORS.DEFAULT,
  },
  rankBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderBottomRightRadius: 8,
  },
  rankText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 14,
  },
  detailsContainer: {
    flex: 1,
    padding: 12,
  },
  synopsis: {
    fontSize: 12,
    lineHeight: 18,
  },
  expandArrowContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  expandArrow: {
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '900',
    width: 90,
  },
  metaValue: {
    fontSize: 12,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
  },
  footerItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  footerValue: {
    fontSize: 12,
    fontWeight: '900',
  },
});
