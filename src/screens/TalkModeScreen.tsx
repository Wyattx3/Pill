import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OtterMascot from '../components/OtterMascot';
import BrandLogo from '../components/BrandLogo';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function TalkModeScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('ActiveCall');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Decorative BG first with pointerEvents=none */}
      <View style={[styles.bgBlur1, { backgroundColor: colors.primaryContainer + '33' }]} pointerEvents="none" />
      <View style={[styles.bgBlur2, { backgroundColor: colors.secondaryContainer + '1A' }]} pointerEvents="none" />

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={styles.brand}>
          <BrandLogo width={sc(86)} height={sc(38)} />
        </View>
      </View>

      {/* Main Content - centered */}
      <View style={styles.content}>
        <View style={styles.pulseContainer}>
          <View style={[styles.pulseCircle, styles.pulseOuter, { backgroundColor: colors.primaryContainer + '4D' }]} />
          <View style={[styles.pulseCircle, styles.pulseMid, { borderColor: colors.primary + '1A' }]} />
          <View style={[styles.blob, { backgroundColor: colors.surfaceContainerLowest }]}>
            <OtterMascot name="listener" size={sc(138)} />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.onSurface }]}>Finding a listener for you...</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>Take a deep breath. We are matching you with someone who is ready to listen.</Text>

        <View style={[styles.privacyCard, { backgroundColor: colors.surfaceContainerLow }]}>
          <Ionicons name="lock-closed" size={sc(20)} color={colors.primary} />
          <View style={styles.privacyText}>
            <Text style={[styles.privacyTitle, { color: colors.onSurface }]}>Completely Anonymous</Text>
            <Text style={[styles.privacyDesc, { color: colors.onSurfaceVariant }]}>Your identity and conversation are shielded. We prioritize your privacy and emotional safety above all else.</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.surfaceContainerHighest }]} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="close" size={sc(18)} color={colors.onSurface} />
          <Text style={[styles.cancelText, { color: colors.onSurface }]}>Cancel Request</Text>
        </TouchableOpacity>

        <View style={styles.loadingDots}>
          <View style={[styles.loadingDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.loadingDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.loadingDot, { backgroundColor: colors.primary }]} />
        </View>
      </View>

      {/* Quick Exit - outside ScrollView, with high zIndex */}
      <TouchableOpacity style={[styles.exitButton, { bottom: sc(80) + Math.max(insets.bottom, 0), right: sc(18), backgroundColor: colors.errorContainer }]} activeOpacity={0.8}>
        <Ionicons name="flash" size={sc(14)} color={colors.onErrorContainer} />
        <Text style={[styles.exitText, { color: colors.onErrorContainer }]}>Quick Exit</Text>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 8), paddingTop: sc(8), backgroundColor: colors.surface + 'E6', borderTopColor: colors.outlineVariant + '22' }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')} activeOpacity={0.5}>
          <Ionicons name="home-outline" size={sc(22)} color={colors.onSurfaceVariant} />
          <Text style={[styles.navLabel, { color: colors.onSurfaceVariant }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItemActive, { backgroundColor: colors.primaryFixed }]} activeOpacity={0.5}>
          <Ionicons name="shield" size={sc(22)} color={colors.primary} />
          <Text style={[styles.navLabelActive, { color: colors.primary }]}>Safety</Text>
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
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(20), paddingBottom: sc(10) },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  brandText: { fontSize: sc(16), fontWeight: '800', letterSpacing: -0.5 },

  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: sc(20) },
  pulseContainer: { width: sc(200), height: sc(200), alignItems: 'center', justifyContent: 'center', marginBottom: sc(32) },
  pulseCircle: { position: 'absolute', borderRadius: 9999 },
  pulseOuter: { width: '100%', height: '100%', opacity: 0.3 },
  pulseMid: { width: '75%', height: '75%', borderWidth: 1, opacity: 0.4 },
  blob: { width: sc(136), height: sc(136), borderRadius: sc(68), alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  title: { fontSize: sc(22), fontWeight: '700', textAlign: 'center', marginBottom: sc(10), letterSpacing: -0.3, lineHeight: sc(28) },
  subtitle: { fontSize: sc(13), lineHeight: sc(20), textAlign: 'center', maxWidth: '85%', marginBottom: sc(20) },
  privacyCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: sc(14), padding: sc(18), gap: sc(12), width: '100%', maxWidth: sc(340), marginBottom: sc(20) },
  privacyText: { flex: 1 },
  privacyTitle: { fontSize: sc(13), fontWeight: '700', marginBottom: sc(3) },
  privacyDesc: { fontSize: sc(11), lineHeight: sc(17) },
  cancelButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: sc(20), paddingVertical: sc(12), borderRadius: sc(26), marginBottom: sc(12), minHeight: 44 },
  cancelText: { fontSize: sc(14), fontWeight: '600' },
  loadingDots: { flexDirection: 'row', gap: 6, opacity: 0.5 },
  loadingDot: { width: 6, height: 6, borderRadius: 3 },
  exitButton: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: sc(14), paddingVertical: 7, borderRadius: sc(26), zIndex: 99 },
  exitText: { fontSize: sc(11), fontWeight: '700', letterSpacing: 1 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: sc(10), borderTopLeftRadius: sc(32), borderTopRightRadius: sc(32), borderTopWidth: 1 },
  navItem: { alignItems: 'center', paddingVertical: sc(6), paddingHorizontal: sc(18), borderRadius: sc(20), minHeight: 44, justifyContent: 'center' },
  navItemActive: { alignItems: 'center', paddingVertical: sc(6), paddingHorizontal: sc(18), borderRadius: sc(20), minHeight: 44, justifyContent: 'center' },
  navLabel: { fontSize: sc(10), fontWeight: '600', marginTop: 2 },
  navLabelActive: { fontSize: sc(10), fontWeight: '600', marginTop: 2 },
  bgBlur1: { position: 'absolute', top: '20%', left: -sc(40), width: sc(160), height: sc(160), borderRadius: sc(80) },
  bgBlur2: { position: 'absolute', bottom: '15%', right: -sc(40), width: sc(200), height: sc(200), borderRadius: sc(100) },
});
