import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

interface NavItem {
  icon: string;
  activeIcon: string;
  label: string;
  screen: string;
}

const items: NavItem[] = [
  { icon: 'home-outline', activeIcon: 'home', label: 'Home', screen: 'Home' },
  { icon: 'shield-outline', activeIcon: 'shield', label: 'Safety', screen: 'SafetyCenter' },
  { icon: 'settings-outline', activeIcon: 'settings', label: 'Settings', screen: 'Settings' },
];

export default function BottomNav({ navigation, activeScreen, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = theme;

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12), paddingTop: sc(8), backgroundColor: colors.surface + 'E6', borderTopColor: colors.outlineVariant + '22' }]}>
      {items.map((item) => {
        const isActive = activeScreen === item.screen;
        return (
          <TouchableOpacity
            key={item.screen}
            style={[isActive ? styles.navItemActive : styles.navItem]}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.5}
          >
            <Ionicons
              name={(isActive ? item.activeIcon : item.icon) as any}
              size={sc(22)}
              color={isActive ? colors.primary : colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.navLabel,
                isActive ? { color: colors.primary } : { color: colors.onSurfaceVariant },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: sc(12),
    borderTopLeftRadius: sc(32),
    borderTopRightRadius: sc(32),
    borderTopWidth: 1,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: sc(6),
    paddingHorizontal: sc(20),
    borderRadius: sc(20),
    minHeight: 44,
    justifyContent: 'center',
  },
  navItemActive: {
    alignItems: 'center',
    paddingVertical: sc(6),
    paddingHorizontal: sc(20),
    borderRadius: sc(20),
    minHeight: 44,
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: sc(10),
    fontWeight: '600',
    marginTop: 2,
  },
});
