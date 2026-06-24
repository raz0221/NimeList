import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeType = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  text: string;
  textSecondary: string; // Keeping this for backward compatibility if any component still uses it
  textMuted: string;
  card: string;
  input: string;
  border: string;
  shadow: string;
  primary: string;
  accent: string;
}

export const lightColors: ThemeColors = {
  background: '#F8F9FA',
  text: '#111827',
  textSecondary: '#4B5563', // Fallback mapped to textMuted
  textMuted: '#4B5563',
  card: '#FFFFFF',
  input: '#FFFFFF',
  border: '#000000',
  shadow: '#000000',
  primary: '#88AAEE',
  accent: '#FBCFE8',
};

export const darkColors: ThemeColors = {
  background: '#121212',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF', // Fallback mapped to textMuted
  textMuted: '#9CA3AF',
  card: '#1E1E1E',
  input: '#333333',
  border: '#FFFFFF',
  shadow: '#FFFFFF',
  primary: '#6B8ECA', 
  accent: '#E5A5C7', 
};

interface ThemeContextProps {
  theme: ThemeType;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  colors: lightColors,
  toggleTheme: () => {},
  isDark: false,
});

export const useTheme = () => useContext(ThemeContext);

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<ThemeType>('light');

  useEffect(() => {
    // Load theme from storage on mount
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@app_theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('@app_theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};
