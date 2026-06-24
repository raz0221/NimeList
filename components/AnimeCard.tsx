import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from './themed-text';
import { COLORS, STATUS_COLORS, Neubrutalism } from '@/constants/theme';
import { NeoCard, NeoBadge, NeoButton } from './NeoKit';

export interface AnimeCardProps {
  id: number | string;
  poster: string;
  title: string;
  status?: string;
  rating?: number | string;
  episode?: number | string;
  genre?: string;
  type?: string;
  variant?: 'default' | 'compact';
  onPress?: () => void;
  containerStyle?: object;
  actionButtons?: React.ReactNode;
}

export function AnimeCard({
  poster,
  title,
  status,
  rating,
  episode,
  genre,
  type,
  variant = 'default',
  onPress,
  containerStyle,
  actionButtons
}: AnimeCardProps) {
  const isCompact = variant === 'compact';

  const CardWrapper = onPress ? TouchableOpacity : View;

  if (isCompact) {
    return (
      <CardWrapper 
        style={[styles.wrapper, containerStyle]} 
        onPress={onPress}
        activeOpacity={0.8}
      >
        <NeoCard contentStyle={styles.compactCardContent}>
          <Image 
            source={{ uri: poster || 'https://via.placeholder.com/150x200' }} 
            style={styles.compactPoster}
            contentFit="cover"
          />
          <View style={styles.compactInfo}>
            <ThemedText style={styles.compactTitle} numberOfLines={2}>{title}</ThemedText>
            
            <View style={styles.compactMetaRow}>
              {rating && rating !== "-" && (
                <NeoBadge label={`⭐ ${rating}`} color={COLORS.PRIMARY} />
              )}
              {episode && episode !== 0 && (
                <NeoBadge label={`Ep. ${episode}`} color={COLORS.BACKGROUND} />
              )}
              {status && (
                <NeoBadge label={status} color={COLORS.ACCENT} />
              )}
            </View>

            {actionButtons ? (
              <View style={styles.compactActionContainer}>
                {actionButtons}
              </View>
            ) : (
              // Contoh Penggunaan NeoButton
              <View style={{ marginTop: 8 }}>
                <NeoButton 
                  title="Tonton" 
                  color={COLORS.PRIMARY} 
                  textStyle={{ paddingVertical: 4, paddingHorizontal: 12, fontSize: 12 }} 
                />
              </View>
            )}
          </View>
        </NeoCard>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper 
      style={[styles.wrapper, containerStyle]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <NeoCard contentStyle={styles.cardContent}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: poster || 'https://via.placeholder.com/150x200' }} 
            style={styles.poster}
            contentFit="cover"
          />
          {rating && (
            <View style={styles.ratingBadge}>
              <ThemedText style={styles.ratingText}>★ {rating}</ThemedText>
            </View>
          )}
        </View>
        <View style={styles.contentContainer}>
          <ThemedText style={styles.title} numberOfLines={2}>{title}</ThemedText>
          
          <View style={styles.tagsContainer}>
            {status && (
              <NeoBadge label={status} color={COLORS.ACCENT} />
            )}
            {type && (
              <NeoBadge label={type} color={STATUS_COLORS.FINISHED} />
            )}
          </View>

          <View style={styles.infoRow}>
            {episode && (
              <ThemedText style={styles.infoText}>📺 {episode} Eps</ThemedText>
            )}
            {genre && (
              <ThemedText style={styles.infoText} numberOfLines={1}>🏷️ {genre}</ThemedText>
            )}
          </View>

          {actionButtons ? (
            <View style={styles.actionContainer}>
              {actionButtons}
            </View>
          ) : (
            // Contoh Penggunaan NeoButton
            <View style={styles.actionContainer}>
              <NeoButton 
                title="Tonton Sekarang" 
                color={COLORS.PRIMARY} 
                textStyle={{ paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 }}
              />
            </View>
          )}
        </View>
      </NeoCard>
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    width: '100%',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 0,
    alignItems: 'stretch',
  },
  imageContainer: {
    width: 100,
    borderRightWidth: Neubrutalism.borderWidth,
    borderRightColor: Neubrutalism.borderColor,
    backgroundColor: STATUS_COLORS.DEFAULT,
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: '100%',
    minHeight: 140,
  },
  ratingBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomRightRadius: Neubrutalism.borderRadius,
    borderRightWidth: Neubrutalism.borderWidth,
    borderBottomWidth: Neubrutalism.borderWidth,
    borderColor: Neubrutalism.borderColor,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.TEXT_MAIN,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.TEXT_MAIN,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'column',
    gap: 4,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.TEXT_SECONDARY,
  },
  actionContainer: {
    marginTop: 'auto',
    alignItems: 'flex-start',
  },

  compactCardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  compactPoster: {
    width: 60,
    height: 80,
    borderRadius: Neubrutalism.borderRadius,
    borderWidth: Neubrutalism.borderWidth,
    borderColor: Neubrutalism.borderColor,
    backgroundColor: STATUS_COLORS.DEFAULT,
  },
  compactInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  compactTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.TEXT_MAIN,
    marginBottom: 8,
  },
  compactMetaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  compactActionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  }
});
