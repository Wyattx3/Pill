import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, DarkColors } from './index';

const DARK_MODE_KEY = '@sanctuary_dark_mode';

type ThemeColors = typeof Colors;

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    AsyncStorage.getItem(DARK_MODE_KEY).then((value) => {
      if (value !== null) {
        setIsDark(value === 'true');
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(DARK_MODE_KEY, isDark ? 'true' : 'false');
  }, [isDark]);

  const toggleDarkMode = () => setIsDark((prev) => !prev);

  const colors = isDark ? DarkColors : Colors;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
