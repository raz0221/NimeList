import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, DimensionValue, ViewStyle } from 'react-native';
import { CARD_STYLE, Neubrutalism } from '@/constants/theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  style?: ViewStyle | ViewStyle[];
  borderRadius?: number;
}

export const Skeleton = ({ width = '100%', height = 20, style, borderRadius = Neubrutalism.borderRadius }: SkeletonProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        })
      ])
    ).start();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E7EB', '#D1D5DB']
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, backgroundColor, borderRadius },
        style
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    ...CARD_STYLE,
    // we override some styles if needed, but the base CARD_STYLE applies neubrutalism
  }
});
