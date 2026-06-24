import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  TextInputProps 
} from 'react-native';
import { COLORS, Neubrutalism } from '@/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';

export * from './NeoAnimeCard';

export interface NeoButtonProps {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  color?: string;
  children?: React.ReactNode;
}

export function NeoButton({ 
  title, 
  onPress, 
  style, 
  textStyle, 
  color, 
  children 
}: NeoButtonProps) {
  const { colors } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  const buttonColor = color || colors.primary;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={onPress}
      style={[styles.container, style]}
    >
      <View style={[styles.shadow, { borderRadius: Neubrutalism.borderRadius, top: 4, left: 4, right: -4, bottom: -4, backgroundColor: colors.shadow }]} />
      <View style={[
        styles.mainLayer,
        { 
          backgroundColor: buttonColor, 
          borderColor: colors.border,
          borderRadius: Neubrutalism.borderRadius,
          borderWidth: Neubrutalism.borderWidth,
          transform: [{ translateX: isPressed ? 4 : 0 }, { translateY: isPressed ? 4 : 0 }]
        }
      ]}>
        {children ? children : <Text style={[styles.btnText, { color: colors.text }, textStyle]}>{title}</Text>}
      </View>
    </TouchableOpacity>
  );
}

export interface NeoCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  color?: string;
}

export function NeoCard({ children, style, contentStyle, color }: NeoCardProps) {
  const { colors } = useTheme();
  const cardColor = color || colors.card;
  return (
    <View style={[styles.container, { width: '100%' }, style]}>
      <View style={[styles.shadow, { borderRadius: Neubrutalism.borderRadius, top: 5, left: 5, right: -5, bottom: -5, backgroundColor: colors.shadow }]} />
      <View style={[
        styles.mainLayer,
        {
          backgroundColor: cardColor,
          borderColor: colors.border,
          borderRadius: Neubrutalism.borderRadius,
          borderWidth: Neubrutalism.borderWidth,
          overflow: 'hidden',
          padding: 16,
        },
        contentStyle
      ]}>
        {children}
      </View>
    </View>
  );
}

export interface NeoBadgeProps {
  label: string;
  color?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function NeoBadge({ label, color, style, textStyle }: NeoBadgeProps) {
  const { colors } = useTheme();
  const badgeColor = color || colors.accent;
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.shadow, { borderRadius: Neubrutalism.borderRadius, top: 2, left: 2, right: -2, bottom: -2, backgroundColor: colors.shadow }]} />
      <View style={[
        styles.mainLayer,
        {
          backgroundColor: badgeColor,
          borderColor: colors.border,
          borderRadius: Neubrutalism.borderRadius,
          borderWidth: Neubrutalism.borderWidth,
          paddingVertical: 4,
          paddingHorizontal: 8,
          alignItems: 'center',
          justifyContent: 'center',
        }
      ]}>
        <Text style={[styles.badgeText, { color: colors.text }, textStyle]}>{label}</Text>
      </View>
    </View>
  );
}

export interface NeoInputProps extends TextInputProps {
  containerStyle?: ViewStyle;
  onClear?: () => void;
}

export function NeoInput({ containerStyle, onClear, style: inputStyle, ...props }: NeoInputProps) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.inputContainer, { width: '100%' }, containerStyle]}>
      <View style={[
        styles.shadow, 
        { 
          borderRadius: Neubrutalism.borderRadius, 
          top: isFocused ? 5 : 4, 
          left: isFocused ? 5 : 4,
          right: isFocused ? -5 : -4,
          bottom: isFocused ? -5 : -4,
          backgroundColor: isFocused ? colors.primary : colors.shadow
        }
      ]} />
      <View style={[
        styles.mainLayer,
        {
          backgroundColor: colors.input,
          borderColor: colors.border,
          borderRadius: Neubrutalism.borderRadius,
          borderWidth: Neubrutalism.borderWidth,
          flexDirection: 'row',
          alignItems: props.multiline ? 'flex-start' : 'center',
          transform: [{ translateX: isFocused ? -1 : 0 }, { translateY: isFocused ? -1 : 0 }]
        }
      ]}>
        <TextInput
          style={[{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
          }, inputStyle]}
          placeholderTextColor={props.placeholderTextColor || colors.textMuted}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {props.value ? (
          <TouchableOpacity onPress={onClear} style={{ paddingHorizontal: 12, paddingVertical: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  inputContainer: {
    position: 'relative',
    alignSelf: 'stretch',
    width: '100%',
  },
  shadow: {
    position: 'absolute',
    backgroundColor: '#000000',
  },
  mainLayer: {
    borderColor: '#000000',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
  }
});
