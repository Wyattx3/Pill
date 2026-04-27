import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

const logoTextLight = require('../../assets/brand/logo-text.png');
const logoTextDark = require('../../assets/brand/logo-text-dark.png');

type BrandLogoProps = {
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
};

export default function BrandLogo({ width = 86, height = 38, style }: BrandLogoProps) {
  const { isDark } = useTheme();

  return (
    <Image
      source={isDark ? logoTextDark : logoTextLight}
      resizeMode="contain"
      style={[{ width, height }, style]}
      accessible
      accessibilityLabel="Pill"
    />
  );
}
