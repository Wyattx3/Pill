import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import OtterMascot from '../components/OtterMascot';
import BrandLogo from '../components/BrandLogo';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function HomeScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [isTalkMode, setIsTalkMode] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const mockCallTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quote = 'The sun will rise again tomorrow, but for now, it is enough to just exist in the quiet.';

  useEffect(() => {
    return () => {
      if (mockCallTimer.current) {
        clearTimeout(mockCallTimer.current);
      }
    };
  }, []);

  const handleAvailablePress = () => {
    const nextOnline = !isOnline;
    setIsOnline(nextOnline);

    if (mockCallTimer.current) {
      clearTimeout(mockCallTimer.current);
    }

    if (nextOnline) {
      mockCallTimer.current = setTimeout(() => {
        navigation.navigate('IncomingCall', { source: 'homeAvailability' });
      }, 900);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Decorative BG first */}
      <View style={[styles.bgBlur1, { backgroundColor: colors.primary + '0A' }]} pointerEvents="none" />
      <View style={[styles.bgBlur2, { backgroundColor: colors.secondary + '0A' }]} pointerEvents="none" />

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={styles.brand}>
          <BrandLogo width={sc(86)} height={sc(38)} />
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Welcome */}
        <View style={styles.welcome}>
          <View style={styles.welcomeCopy}>
            <Text style={[styles.welcomeTitle, { color: colors.onSurface }]}>
              Welcome back,{'\n'}
              <Text style={[styles.welcomeAccent, { color: colors.primary }]}>Gentle Soul.</Text>
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.onSurfaceVariant }]}>
              Take a breath. You are in a safe space where every thought has a place to rest.
            </Text>
          </View>
          <OtterMascot name="guide" size={sc(104)} containerStyle={styles.welcomeMascot} />
        </View>

        {/* Status Indicator */}
        <View style={[styles.statusRow, { backgroundColor: colors.surfaceContainerLow }]}>
          <OtterMascot name="homeStatus" size={sc(34)} containerStyle={styles.statusMascot} />
          <View style={[styles.statusDot, isOnline ? { backgroundColor: '#4CAF50' } : { backgroundColor: colors.error }]} />
          <Text style={[styles.statusText, { color: colors.onSurfaceVariant }]}>
            {isOnline ? 'You are currently online' : 'You are currently offline'}
          </Text>
        </View>

        {/* Mode Toggle */}
        <View style={[styles.modeToggle, { backgroundColor: colors.surfaceContainerHigh }]}>
          <TouchableOpacity
            style={[styles.modeBtn, isTalkMode && { backgroundColor: colors.primary }]}
            onPress={() => setIsTalkMode(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="mic" size={sc(18)} color={isTalkMode ? colors.onPrimary : colors.onSurfaceVariant} />
            <Text style={[styles.modeBtnText, isTalkMode ? { color: colors.onPrimary } : { color: colors.onSurfaceVariant }]}>Talk Mode</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, !isTalkMode && { backgroundColor: colors.primary }]}
            onPress={() => setIsTalkMode(false)}
            activeOpacity={0.8}
          >
            <Ionicons name="ear-outline" size={sc(18)} color={!isTalkMode ? colors.onPrimary : colors.onSurfaceVariant} />
            <Text style={[styles.modeBtnText, !isTalkMode ? { color: colors.onPrimary } : { color: colors.onSurfaceVariant }]}>Listener Mode</Text>
          </TouchableOpacity>
        </View>

        {/* Mode Actions */}
        <View style={styles.actionRow}>
          {isTalkMode ? (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('TalkMode')}
                activeOpacity={0.8}
              >
                <OtterMascot name="homeCall" size={sc(36)} containerStyle={styles.actionMascot} />
                <Ionicons name="call" size={sc(16)} color={colors.onPrimary} />
                <Text style={[styles.actionBtnText, { color: colors.onPrimary }]}>Call Listener</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.surfaceContainerHighest }]}
                onPress={() => navigation.navigate('YourStatus')}
                activeOpacity={0.8}
              >
                <OtterMascot name="homeStatus" size={sc(36)} containerStyle={styles.actionMascot} />
                <Ionicons name="pulse" size={sc(16)} color={colors.onSurfaceVariant} />
                <Text style={[styles.actionBtnText, { color: colors.onSurfaceVariant }]}>Your Status</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, isOnline ? { backgroundColor: '#4CAF50' } : { backgroundColor: colors.surfaceContainerHighest }]}
                onPress={handleAvailablePress}
                activeOpacity={0.8}
              >
                <OtterMascot name="homeAvailable" size={sc(36)} containerStyle={styles.actionMascot} />
                <Ionicons name={isOnline ? 'radio-button-on' : 'radio-button-off'} size={sc(16)} color={isOnline ? '#fff' : colors.onSurfaceVariant} />
                <Text style={[styles.actionBtnText, { color: isOnline ? '#fff' : colors.onSurfaceVariant }]}>Available</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('ListenerDashboard')}
                activeOpacity={0.8}
              >
                <OtterMascot name="listenerDashboard" size={sc(36)} containerStyle={styles.actionMascot} />
                <Ionicons name="grid" size={sc(16)} color={colors.onPrimary} />
                <Text style={[styles.actionBtnText, { color: colors.onPrimary }]}>Go to Dashboard</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Daily Quote */}
        <View style={[styles.quoteCard, { backgroundColor: colors.surfaceContainerLowest }]}>
          <View style={[styles.quoteGlow1, { backgroundColor: colors.primaryContainer + '33' }]} pointerEvents="none" />
          <View style={[styles.quoteGlow2, { backgroundColor: colors.tertiaryContainer + '22' }]} pointerEvents="none" />
          <Ionicons name="chatbubble-ellipses" size={sc(32)} color={colors.primaryFixedDim} />
          <Text style={[styles.quoteText, { color: colors.onSurface }]}>{quote}</Text>
          <Text style={[styles.quoteAttrib, { color: colors.onSurfaceVariant }]}>— Sanctuary Daily</Text>
        </View>


      </ScrollView>

      <BottomNav navigation={navigation} activeScreen="Home" theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(20), paddingBottom: sc(12) },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandText: { fontSize: sc(17), fontWeight: '800', letterSpacing: -0.5 },
  scrollContent: { paddingHorizontal: sc(20), paddingTop: sc(12), paddingBottom: sc(100) },
  welcome: { marginBottom: sc(12), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: sc(8) },
  welcomeCopy: { flex: 1 },
  welcomeMascot: { flexShrink: 0, marginRight: -sc(4) },
  welcomeTitle: { fontSize: sc(26), fontWeight: '800', lineHeight: sc(32), letterSpacing: -0.3 },
  welcomeAccent: { fontStyle: 'italic' },
  welcomeSubtitle: { marginTop: sc(8), fontSize: sc(13), lineHeight: sc(20), maxWidth: '85%' },
  statusRow: { flexDirection: 'row', alignItems: 'center', borderRadius: sc(10), paddingHorizontal: sc(12), paddingVertical: sc(7), marginBottom: sc(10) },
  statusMascot: { marginRight: sc(8) },
  statusDot: { width: sc(8), height: sc(8), borderRadius: sc(4), marginRight: sc(8) },
  statusText: { fontSize: sc(12), fontWeight: '600' },
  modeToggle: { flexDirection: 'row', borderRadius: sc(26), padding: sc(3), marginBottom: sc(10) },
  modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(6), paddingVertical: sc(12), borderRadius: sc(26), minHeight: 44 },
  modeBtnText: { fontSize: sc(13), fontWeight: '700' },
  actionRow: { flexDirection: 'column', gap: sc(10), marginBottom: sc(10) },
  actionBtn: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(6), paddingVertical: sc(14), borderRadius: sc(14), minHeight: 48 },
  actionMascot: { marginRight: sc(2) },
  actionBtnText: { fontSize: sc(13), fontWeight: '700' },
  quoteCard: { borderRadius: sc(20), padding: sc(24), marginBottom: sc(10), overflow: 'hidden', position: 'relative' },
  quoteGlow1: { position: 'absolute', right: -sc(24), top: -sc(24), width: sc(80), height: sc(80), borderRadius: sc(40) },
  quoteGlow2: { position: 'absolute', left: -sc(12), bottom: -sc(12), width: sc(64), height: sc(64), borderRadius: sc(32) },
  quoteText: { fontSize: sc(15), fontWeight: '700', lineHeight: sc(22), marginTop: sc(10) },
  quoteAttrib: { marginTop: sc(10), fontSize: sc(10), fontWeight: '500' },

  bgBlur1: { position: 'absolute', top: -sc(40), left: -sc(40), width: sc(160), height: sc(160), borderRadius: sc(80) },
  bgBlur2: { position: 'absolute', bottom: 0, right: -sc(40), width: sc(160), height: sc(160), borderRadius: sc(80) },
});
