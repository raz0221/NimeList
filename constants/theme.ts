/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#F97316';

export const Colors = {
  light: {
    text: '#000000',
    background: '#FDFBF7', // Pale bright background (off-white)
    tint: tintColorLight,
    icon: '#000000',
    tabIconDefault: '#000000',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFFFFF',
    background: '#1A1A1A', // Dark but flat background
    tint: tintColorDark,
    icon: '#FFFFFF',
    tabIconDefault: '#888888',
    tabIconSelected: tintColorDark,
  },
};

export const COLORS = {
  PRIMARY: '#88AAEE',
  BACKGROUND: '#FDFBF7',
  CARD_BACKGROUND: '#FFFFFF',
  TEXT_MAIN: '#000000',
  TEXT_SECONDARY: '#374151',
  ACCENT: '#FBCFE8',
  BUTTON_TEXT_LIGHT: '#000000',
  BUTTON_TEXT_DARK: '#000000',
};

export const STATUS_COLORS = {
  ON_AIR: '#A7F3D0',
  FINISHED: '#BAE6FD',
  MOVIE: '#E9D5FF',
  UPCOMING: '#FDBA74',
  DEFAULT: '#F3F4F6',
};

export const Neubrutalism = {
  borderWidth: 3,
  borderColor: '#000000',
  borderRadius: 5,
  shadowColor: '#000000',
  shadowOffset: { width: 5, height: 5 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 0,
};

export const CARD_STYLE = {
  ...Neubrutalism,
  backgroundColor: COLORS.CARD_BACKGROUND,
};

export const THEME_COLORS = {
  primary: '#FEF08A',
  secondary: '#A7F3D0',
  accent: '#FBCFE8',
  info: '#BAE6FD',
  purple: '#E9D5FF',
  orange: '#FDBA74',
  cyan: '#A5F3FC',
  blue: '#BFDBFE',
  gray: '#F3F4F6',
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
