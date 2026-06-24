import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import '@/src/i18n';
import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/src/lib/firebase';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '@/constants/theme';
import { AppThemeProvider, useTheme } from '@/src/context/ThemeContext';

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
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Auth Guard Logic (Proteksi Halaman)
  useEffect(() => {
    if (!isAuthReady) return;

    // Definisikan rute mana saja yang harus login terlebih dahulu
    // Contoh: semua halaman edit profil, settings, pencapaian.
    // Jika Anda ingin seluruh tab profil dikunci, Anda bisa tambahkan 'profile' 
    // tapi ingat 'profile/login' dan 'profile/register' TIDAK boleh dikunci!
    const inProtectedRoute = 
      segments.includes('edit') || 
      segments.includes('settings') || 
      segments.includes('achievements');

    if (!user && inProtectedRoute) {
      // User mencoba mengakses rute private namun belum login, lempar ke login
      router.replace('/(tabs)/profile/login');
    }
  }, [user, segments, isAuthReady]);

  if (!isAuthReady) {
    // Mencegah flickering dengan menampilkan layar loading 
    // sampai status autentikasi awal Firebase selesai dievaluasi.
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.BACKGROUND, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <AppThemeProvider>
      <ThemeWrapper>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeWrapper>
    </AppThemeProvider>
  );
}
