import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function HomeScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [isTalkMode, setIsTalkMode] = useState(true);
  const isOnline = false;
  const quote = 'The sun will rise again tomorrow, but for now, it is enough to just exist in the quiet.';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Decorative BG first */}
      <View style={[styles.bgBlur1, { backgroundColor: colors.primary + '0A' }]} pointerEvents="none" />
      <View style={[styles.bgBlur2, { backgroundColor: colors.secondary + '0A' }]} pointerEvents="none" />

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={styles.brand}>
          <Ionicons name="shield-checkmark" size={sc(22)} color={colors.primary} />
          <Text style={[styles.brandText, { color: colors.primary }]}>Pill</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Welcome */}
        <View style={styles.welcome}>
          <Text style={[styles.welcomeTitle, { color: colors.onSurface }]}>
            Welcome back,{'\n'}
            <Text style={[styles.welcomeAccent, { color: colors.primary }]}>Gentle Soul.</Text>
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.onSurfaceVariant }]}>
            Take a breath. You are in a safe space where every thought has a place to rest.
          </Text>
        </View>

        {/* Status Indicator */}
        <View style={[styles.statusRow, { backgroundColor: colors.surfaceContainerLow }]}>
          <View style={[styles.statusDot, isOnline ? { backgroundColor: '#4CAF50' } : { backgroundColor: colors.error }]} />
          <Text style={[styles.statusText, { color: colors.onSurfaceVariant }]}>You are currently offline</Text>
        </View>

        {/* Mode Toggle */}
        <View style={[styles.modeToggle, { backgroundColor: colors.surfaceContainerHigh }]}>
          <TouchableOpacity
            style={[styles.modeBtn, isTalkMode && { backgroundColor: colors.primary }]}
            onPress={() => { setIsTalkMode(true); navigation.navigate('TalkMode'); }}
            activeOpacity={0.8}
          >
            <Ionicons name="mic" size={sc(18)} color={isTalkMode ? colors.onPrimary : colors.onSurfaceVariant} />
            <Text style={[styles.modeBtnText, isTalkMode ? { color: colors.onPrimary } : { color: colors.onSurfaceVariant }]}>Talk Mode</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, !isTalkMode && { backgroundColor: colors.primary }]}
            onPress={() => { setIsTalkMode(false); navigation.navigate('ListenerVerification'); }}
            activeOpacity={0.8}
          >
            <Ionicons name="ear-outline" size={sc(18)} color={!isTalkMode ? colors.onPrimary : colors.onSurfaceVariant} />
            <Text style={[styles.modeBtnText, !isTalkMode ? { color: colors.onPrimary } : { color: colors.onSurfaceVariant }]}>Listener Mode</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Quote */}
        <View style={[styles.quoteCard, { backgroundColor: colors.surfaceContainerLowest }]}>
          <View style={[styles.quoteGlow1, { backgroundColor: colors.primaryContainer + '33' }]} pointerEvents="none" />
          <View style={[styles.quoteGlow2, { backgroundColor: colors.tertiaryContainer + '22' }]} pointerEvents="none" />
          <Ionicons name="chatbubble-ellipses" size={sc(32)} color={colors.primaryFixedDim} />
          <Text style={[styles.quoteText, { color: colors.onSurface }]}>{quote}</Text>
          <Text style={[styles.quoteAttrib, { color: colors.onSurfaceVariant }]}>— Sanctuary Daily</Text>
        </View>

        {/* Bento Grid Actions */}
        <View style={styles.bentoGrid}>
          <TouchableOpacity style={[styles.bentoDanger, { backgroundColor: colors.errorContainer + '1A' }]} onPress={() => navigation.navigate('SafetyCenter')} activeOpacity={0.8}>
            <Ionicons name="shield-outline" size={sc(28)} color={colors.error} />
            <View>
              <Text style={[styles.bentoDangerTitle, { color: colors.onErrorContainer }]}>Safety Center</Text>
              <Text style={[styles.bentoDesc, { color: colors.onSurfaceVariant }]}>Resources & Crisis Help</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.bentoCard, { backgroundColor: colors.surfaceContainerHigh }]} activeOpacity={0.8} onPress={() => navigation.navigate('ListenerDashboard')}>
            <Ionicons name="sparkles" size={sc(28)} color={colors.secondary} />
            <View>
              <Text style={[styles.bentoTitle, { color: colors.onSurface }]}>Your Journey</Text>
              <Text style={[styles.bentoDesc, { color: colors.onSurfaceVariant }]}>Reflection History</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation - absolute, below content */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12), paddingTop: sc(8), backgroundColor: colors.surface + 'E6', borderTopColor: colors.outlineVariant + '22' }]}>
        <TouchableOpacity style={[styles.navItemActive, { backgroundColor: colors.primaryFixed }]} activeOpacity={0.5}>
          <Ionicons name="home" size={sc(22)} color={colors.primary} />
          <Text style={[styles.navLabelActive, { color: colors.primary }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('SafetyCenter')} activeOpacity={0.5}>
          <Ionicons name="shield-outline" size={sc(22)} color={colors.onSurfaceVariant} />
          <Text style={[styles.navLabel, { color: colors.onSurfaceVariant }]}>Safety</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')} activeOpacity={0.5}>
          <Ionicons name="settings-outline" size={sc(22)} color={colors.onSurfaceVariant} />
          <Text style={[styles.navLabel, { color: colors.onSurfaceVariant }]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(20), paddingBottom: sc(12) },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandText: { fontSize: sc(17), fontWeight: '800', letterSpacing: -0.5 },
  scrollContent: { paddingHorizontal: sc(20), paddingTop: sc(12), paddingBottom: sc(100) },
  welcome: { marginBottom: sc(12) },
  welcomeTitle: { fontSize: sc(26), fontWeight: '800', lineHeight: sc(32), letterSpacing: -0.3 },
  welcomeAccent: { fontStyle: 'italic' },
  welcomeSubtitle: { marginTop: sc(8), fontSize: sc(13), lineHeight: sc(20), maxWidth: '85%' },
  statusRow: { flexDirection: 'row', alignItems: 'center', borderRadius: sc(10), paddingHorizontal: sc(12), paddingVertical: sc(8), marginBottom: sc(10) },
  statusDot: { width: sc(8), height: sc(8), borderRadius: sc(4), marginRight: sc(8) },
  statusText: { fontSize: sc(12), fontWeight: '600' },
  modeToggle: { flexDirection: 'row', borderRadius: sc(26), padding: sc(3), marginBottom: sc(10) },
  modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(6), paddingVertical: sc(12), borderRadius: sc(26), minHeight: 44 },
  modeBtnText: { fontSize: sc(13), fontWeight: '700' },
  quoteCard: { borderRadius: sc(20), padding: sc(24), marginBottom: sc(10), overflow: 'hidden', position: 'relative' },
  quoteGlow1: { position: 'absolute', right: -sc(24), top: -sc(24), width: sc(80), height: sc(80), borderRadius: sc(40) },
  quoteGlow2: { position: 'absolute', left: -sc(12), bottom: -sc(12), width: sc(64), height: sc(64), borderRadius: sc(32) },
  quoteText: { fontSize: sc(15), fontWeight: '700', lineHeight: sc(22), marginTop: sc(10) },
  quoteAttrib: { marginTop: sc(10), fontSize: sc(10), fontWeight: '500' },
  bentoGrid: { flexDirection: 'row', gap: sc(10), marginBottom: sc(20) },
  bentoDanger: { flex: 1, borderRadius: sc(14), padding: sc(18), justifyContent: 'space-between' },
  bentoCard: { flex: 1, borderRadius: sc(14), padding: sc(18), justifyContent: 'space-between' },
  bentoTitle: { fontSize: sc(13), fontWeight: '700' },
  bentoDangerTitle: { fontSize: sc(13), fontWeight: '700' },
  bentoDesc: { fontSize: sc(10), marginTop: sc(2) },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: sc(12), borderTopLeftRadius: sc(32), borderTopRightRadius: sc(32), borderTopWidth: 1 },
  navItem: { alignItems: 'center', paddingVertical: sc(6), paddingHorizontal: sc(20), borderRadius: sc(20), minHeight: 44, justifyContent: 'center' },
  navItemActive: { alignItems: 'center', paddingVertical: sc(6), paddingHorizontal: sc(20), borderRadius: sc(20), minHeight: 44, justifyContent: 'center' },
  navLabel: { fontSize: sc(10), fontWeight: '600', marginTop: 2 },
  navLabelActive: { fontSize: sc(10), fontWeight: '600', marginTop: 2 },
  bgBlur1: { position: 'absolute', top: -sc(40), left: -sc(40), width: sc(160), height: sc(160), borderRadius: sc(80) },
  bgBlur2: { position: 'absolute', bottom: 0, right: -sc(40), width: sc(160), height: sc(160), borderRadius: sc(80) },
});
