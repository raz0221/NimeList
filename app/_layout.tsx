import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

import { useColorScheme } from '@/hooks/use-color-scheme';
import '@/src/i18n';
import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/src/lib/firebase';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '@/constants/theme';
import { AppThemeProvider, useTheme } from '@/src/context/ThemeContext';
import { registerForPushNotificationsAsync, saveTokenToFirestore } from '@/src/services/notificationService';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { colors, isDark } = useTheme();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <ThemeProvider value={navTheme}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {children}
      </View>
    </ThemeProvider>
  );
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Global Auth Listener & Initialization
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      await SplashScreen.hideAsync();

      // Daftar dan simpan push token ke Firestore bila pengguna login
      if (currentUser) {
        try {
          const token = await registerForPushNotificationsAsync();
          if (token) {
            await saveTokenToFirestore(currentUser.uid, token);
          }
        } catch (error) {
          console.warn('[Layout] Error saving push token:', error);
        }
      }
    });
    return () => unsub();
  }, []);

  // Auth Guard Logic (Proteksi Halaman)
  useEffect(() => {
    if (!isAuthReady) return;

    // Rute autentikasi (login / register)
    const isAuthRoute = segments.includes('login') || segments.includes('register');
    // Cek apakah user berada di root / belum di dalam tab apapun
    const isAtRoot = segments.length === 0 || (segments.length === 1 && segments[0] === '(tabs)');

    if (!user && !isAuthRoute) {
      // Belum login -> Paksa ke login
      router.replace('/(tabs)/profile/login');
    } else if (user && isAuthRoute) {
      // Sudah login tapi di halaman login -> Arahkan ke profil untuk me-reset stack profile
      router.replace('/(tabs)/profile');
    } else if (user && isAtRoot) {
      // Sudah login tapi masih di root saat app reload -> Arahkan ke root tabs
      router.replace('/(tabs)/home');
    }
  }, [user, segments, isAuthReady]);

  return (
    <AppThemeProvider>
      <ThemeWrapper>
        <View style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="info" options={{ headerShown: false }} />
            <Stack.Screen name="anime/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="my-reviews" options={{ headerShown: false }} />
            <Stack.Screen name="my-reminders" options={{ headerShown: false }} />
          </Stack>
          {!isAuthReady && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff', justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#000'} />
            </View>
          )}
        </View>
        <StatusBar style="auto" />
      </ThemeWrapper>
    </AppThemeProvider>
  );
}
