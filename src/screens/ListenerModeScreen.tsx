import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OtterMascot from '../components/OtterMascot';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function ListenerModeScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [isAvailable, setIsAvailable] = React.useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Decorative BG first */}
      <View style={[styles.statGlow, { backgroundColor: colors.primaryContainer + '33' }]} pointerEvents="none" />

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={styles.brand}>
          <Ionicons name="shield-checkmark" size={sc(22)} color={colors.primary} />
          <Text style={[styles.brandText, { color: colors.primary }]}>Pill</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Section */}
        <View style={styles.statusSection}>
          <View style={styles.pulseContainer}>
            <View style={[styles.pulseCircle, styles.pulseOuter, { backgroundColor: colors.primaryContainer + '4D' }]} />
            <View style={[styles.pulseCircleMid, { borderColor: colors.primary + '0D' }]} />
            <View style={[styles.pulseCircleInner, { borderColor: colors.primaryContainer, backgroundColor: colors.surfaceContainerLowest }]}>
              <OtterMascot name="tea" size={sc(128)} />
            </View>
          </View>
          <Text style={[styles.statusTitle, { color: colors.onSurface }]}>You are available to listen.</Text>
          <Text style={[styles.statusDesc, { color: colors.onSurfaceVariant }]}>We will notify you of incoming calls. Your presence is a gift to those seeking peace.</Text>
        </View>

        {/* Stats Bento */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCardWide, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.statContent}>
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>PRIVATE ACHIEVEMENT</Text>
              <Text style={[styles.statNumber, { color: colors.primary }]}>124</Text>
              <Text style={[styles.statTitle, { color: colors.onSurfaceVariant }]}>Lives Impacted</Text>
              <Text style={[styles.statDesc, { color: colors.onSurfaceVariant + '99' }]}>Your compassionate listening has provided essential support to over a hundred souls this month.</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.surfaceContainerLowest }]}>
              <Ionicons name="time" size={sc(22)} color={colors.secondary} />
              <Text style={[styles.statCardNumber, { color: colors.onSurface }]}>42h</Text>
              <Text style={[styles.statCardTitle, { color: colors.onSurfaceVariant }]}>Quiet Presence</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.secondaryContainer }]}>
              <Ionicons name="earth" size={sc(22)} color={colors.onSecondaryContainer} />
              <Text style={[styles.statCardNumber, { color: colors.onSecondaryContainer }]}>High</Text>
              <Text style={[styles.statCardTitle, { color: colors.onSecondaryContainer + 'CC' }]}>Call Demand</Text>
            </View>
          </View>
        </View>

        {/* Availability Toggle */}
        <TouchableOpacity style={[styles.availabilityRow, { backgroundColor: colors.surfaceContainerHigh }]} onPress={() => setIsAvailable(!isAvailable)} activeOpacity={0.7}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: sc(12) }}>
            <View style={[styles.availIconCircle, { backgroundColor: colors.surfaceContainerLowest }]}>
              <Ionicons name="power" size={sc(22)} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.availTitle, { color: colors.onSurface }]}>Availability</Text>
              <Text style={[styles.availDesc, { color: colors.onSurfaceVariant }]}>Ready to support</Text>
            </View>
          </View>
          <View style={[styles.toggle, isAvailable ? { backgroundColor: colors.primary } : { backgroundColor: colors.outlineVariant }]}>
            <View style={styles.toggleThumb} />
          </View>
        </TouchableOpacity>

        {/* Stop Listening */}
        <TouchableOpacity style={[styles.stopButton, { backgroundColor: colors.errorContainer }]} onPress={() => navigation.navigate('ListenerDashboard')} activeOpacity={0.8}>
          <Ionicons name="close" size={sc(20)} color={colors.onErrorContainer} />
          <Text style={[styles.stopButtonText, { color: colors.onErrorContainer }]}>Instantly Stop Listening</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation - outside ScrollView */}
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
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(18), paddingBottom: sc(10) },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  brandText: { fontSize: sc(16), fontWeight: '800', letterSpacing: -0.5 },
  scrollContent: { paddingTop: sc(8), paddingBottom: sc(20) },
  statusSection: { alignItems: 'center', marginBottom: sc(24), paddingHorizontal: sc(18) },
  pulseContainer: { width: sc(180), height: sc(180), alignItems: 'center', justifyContent: 'center', marginBottom: sc(24) },
  pulseCircle: { position: 'absolute', borderRadius: 9999 },
  pulseOuter: { width: '100%', height: '100%', opacity: 0.3, position: 'absolute' },
  pulseCircleMid: { width: '75%', height: '75%', borderRadius: 9999, borderWidth: 1, opacity: 0.3, position: 'absolute' },
  pulseCircleInner: { width: sc(130), height: sc(130), borderRadius: sc(65), borderWidth: sc(4), alignItems: 'center', justifyContent: 'center' },
  statusTitle: { fontSize: sc(22), fontWeight: '800', textAlign: 'center', letterSpacing: -0.3, marginBottom: sc(6) },
  statusDesc: { fontSize: sc(13), lineHeight: sc(20), textAlign: 'center', paddingHorizontal: sc(16) },
  statsGrid: { gap: sc(10), marginBottom: sc(24), paddingHorizontal: sc(18) },
  statCardWide: { borderRadius: sc(16), padding: sc(20), position: 'relative', overflow: 'hidden' },
  statContent: { zIndex: 10 },
  statLabel: { fontSize: sc(8), fontWeight: '600', letterSpacing: 2, marginBottom: sc(6) },
  statNumber: { fontSize: sc(36), fontWeight: '800', marginBottom: sc(3) },
  statTitle: { fontSize: sc(13), fontWeight: '500', marginBottom: sc(10) },
  statDesc: { fontSize: sc(10), lineHeight: sc(14), maxWidth: sc(180) },
  statGlow: { position: 'absolute', right: -sc(24), top: sc(80), width: sc(100), height: sc(100), borderRadius: sc(50) },
  statsRow: { flexDirection: 'row', gap: sc(10) },
  statCard: { flex: 1, borderRadius: sc(12), padding: sc(18) },
  statCardNumber: { fontSize: sc(20), fontWeight: '700', marginTop: sc(10) },
  statCardTitle: { fontSize: sc(12), marginTop: sc(2) },
  availabilityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: sc(26), paddingHorizontal: sc(18), paddingVertical: sc(12), marginBottom: sc(20), marginHorizontal: sc(18) },
  availIconCircle: { width: sc(40), height: sc(40), borderRadius: sc(20), alignItems: 'center', justifyContent: 'center' },
  availTitle: { fontSize: sc(14), fontWeight: '700' },
  availDesc: { fontSize: sc(11), marginTop: sc(2) },
  toggle: { width: sc(50), height: sc(28), borderRadius: sc(14), justifyContent: 'center', alignItems: 'flex-start', padding: 3 },
  toggleThumb: { width: sc(22), height: sc(22), borderRadius: sc(11), backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 3 },
  stopButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(6), paddingVertical: sc(14), borderRadius: sc(26), marginBottom: sc(40), marginHorizontal: sc(18), minHeight: 48 },
  stopButtonText: { fontSize: sc(14), fontWeight: '700' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: sc(10), borderTopLeftRadius: sc(32), borderTopRightRadius: sc(32), borderTopWidth: 1 },
  navItem: { alignItems: 'center', paddingVertical: sc(6), paddingHorizontal: sc(18), borderRadius: sc(20), minHeight: 44, justifyContent: 'center' },
  navItemActive: { alignItems: 'center', paddingVertical: sc(6), paddingHorizontal: sc(18), borderRadius: sc(20), minHeight: 44, justifyContent: 'center' },
  navLabel: { fontSize: sc(10), fontWeight: '600', marginTop: 2 },
  navLabelActive: { fontSize: sc(10), fontWeight: '600', marginTop: 2 },
});
