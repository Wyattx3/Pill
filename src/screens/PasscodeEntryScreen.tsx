import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function PasscodeEntryScreen({ navigation, theme }: any) {
  navigation.replace('Onboarding');
  const { colors, isDark } = theme;
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
