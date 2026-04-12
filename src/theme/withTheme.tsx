import React from 'react';
import { useTheme } from './ThemeProvider';

export function withTheme(Component: React.ComponentType<any>) {
  return function ThemedComponent(props: any) {
    const { colors, isDark, toggleDarkMode } = useTheme();
    return (
      <Component
        {...props}
        theme={{ colors, isDark, toggleDarkMode }}
      />
    );
  };
}
