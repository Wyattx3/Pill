import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import OtterMascot from '../components/OtterMascot';
import BrandLogo from '../components/BrandLogo';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function SettingsScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleDarkMode } = theme;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={styles.brand}>
          <BrandLogo width={sc(86)} height={sc(38)} />
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.titleSection}>
          <View style={styles.titleCopy}>
            <Text style={[styles.title, { color: colors.onBackground }]}>Settings</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>Personalize your safe space</Text>
          </View>
          <OtterMascot name="settings" size={sc(92)} containerStyle={styles.settingsMascot} />
        </View>

        {/* Appearance & Privacy PIN */}
        <View style={styles.settingsGrid}>
          <View style={[styles.settingsCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <Ionicons name="moon" size={sc(24)} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Appearance</Text>
            <Text style={[styles.cardDesc, { color: colors.onSurfaceVariant }]}>Switch to Dark Mode</Text>
            <View style={{ marginTop: 'auto', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Switch
                value={isDark}
                onValueChange={toggleDarkMode}
                trackColor={{ false: colors.outlineVariant + '4D', true: colors.primary }}
                thumbColor={colors.surface}
              />
            </View>
            <View style={[styles.cardBlur, { backgroundColor: colors.primary + '0D' }]} pointerEvents="none" />
          </View>

          <View style={[styles.settingsCardAlt, { backgroundColor: colors.surfaceContainerLow }]}>
            <Ionicons name="lock-closed" size={sc(24)} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Privacy PIN</Text>
            <Text style={[styles.cardDesc, { color: colors.onSurfaceVariant }]}>Manage your entry code</Text>
            <TouchableOpacity activeOpacity={0.5} onPress={() => navigation.navigate('UpdatePIN')}>
              <Text style={[styles.updatePin, { color: colors.primary }]}>
                Update PIN <Ionicons name="arrow-forward" size={sc(14)} color={colors.primary} />
              </Text>
            </TouchableOpacity>
            <View style={[styles.cardBlurAlt, { backgroundColor: colors.tertiaryContainer + '1A' }]} pointerEvents="none" />
          </View>
        </View>

        {/* Zero-Data Policy */}
        <View style={[styles.zeroDataRow, { backgroundColor: colors.surfaceContainerLow }]}>
          <View style={[styles.dataRowIcon, { backgroundColor: colors.primaryContainer }]}>
            <Ionicons name="shield-checkmark-outline" size={sc(20)} color={colors.onPrimaryContainer} />
          </View>
          <View style={{ marginBottom: sc(10) }}>
            <Text style={[styles.dataRowTitle, { color: colors.onSurface }]}>Zero-Data Policy</Text>
            <Text style={[styles.dataRowDesc, { color: colors.onSurfaceVariant }]}>Your data is our foundation</Text>
          </View>
          <Text style={[styles.policyText, { color: colors.onSurfaceVariant }]}>
            At Pill, your data never leaves your device. We use end-to-end encryption for local storage and maintain a strict no-logs policy.
          </Text>
        </View>

        <Text style={[styles.version, { color: colors.outline }]}>Pill v2.4.0 • Secure & Encrypted</Text>
      </ScrollView>

      <BottomNav navigation={navigation} activeScreen="Settings" theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(20), paddingBottom: sc(12) },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandText: { fontSize: sc(17), fontWeight: '800', letterSpacing: -0.5 },
  scrollContent: { paddingTop: sc(8), paddingBottom: sc(100) },
  titleSection: { paddingHorizontal: sc(20), marginBottom: sc(24), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleCopy: { flex: 1 },
  settingsMascot: { flexShrink: 0, marginRight: -sc(4) },
  title: { fontSize: sc(28), fontWeight: '800', letterSpacing: -0.5, marginBottom: sc(3) },
  subtitle: { fontSize: sc(13), fontWeight: '500' },
  settingsGrid: { flexDirection: 'row', gap: sc(10), marginBottom: sc(24), paddingHorizontal: sc(20) },
  settingsCard: { flex: 1, borderRadius: sc(14), padding: sc(20), minHeight: sc(148), position: 'relative', overflow: 'hidden', justifyContent: 'space-between' },
  settingsCardAlt: { flex: 1, borderRadius: sc(14), padding: sc(20), minHeight: sc(148), position: 'relative', overflow: 'hidden', justifyContent: 'space-between' },
  cardTitle: { fontSize: sc(14), fontWeight: '700', marginBottom: sc(3) },
  cardDesc: { fontSize: sc(11) },
  updatePin: { fontSize: sc(13), fontWeight: '700' },
  cardBlur: { position: 'absolute', right: -sc(12), bottom: -sc(12), width: sc(64), height: sc(64), borderRadius: sc(32) },
  cardBlurAlt: { position: 'absolute', right: -sc(12), bottom: -sc(12), width: sc(64), height: sc(64), borderRadius: sc(32) },
  dataRowIcon: { width: sc(36), height: sc(36), borderRadius: sc(18), alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  dataRowTitle: { fontSize: sc(14), fontWeight: '700', marginBottom: sc(2) },
  dataRowDesc: { fontSize: sc(11) },
  zeroDataRow: { borderRadius: sc(12), padding: sc(16), marginBottom: sc(20), marginHorizontal: sc(20) },
  policyText: { fontSize: sc(12), lineHeight: sc(18), paddingHorizontal: sc(6) },
  version: { fontSize: sc(9), fontWeight: '700', textTransform: 'uppercase', letterSpacing: 3, opacity: 0.5, textAlign: 'center', marginBottom: sc(20) },
});
