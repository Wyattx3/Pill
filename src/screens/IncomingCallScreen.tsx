import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OtterMascot from '../components/OtterMascot';

const { width: W, height: H } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function IncomingCallScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [countdown, setCountdown] = useState(10);

  const declineCall = () => {
    navigation.replace('ListenerDashboard', { callMissed: true });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigation.replace('ListenerDashboard', { callMissed: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Ambient Background - render FIRST with pointerEvents=none */}
      <View style={styles.ambientBg} pointerEvents="none">
        <View style={[styles.glowPulse, { backgroundColor: colors.primaryContainer + '66' }]} />
        <View style={[styles.bgBlur1, { backgroundColor: colors.primaryContainer + '33' }]} />
        <View style={[styles.bgBlur2, { backgroundColor: colors.secondaryContainer + '4D' }]} />
      </View>

      {/* Upper Content */}
      <View style={[styles.upperContent, { paddingTop: insets.top + sc(32) }]}>
        <View style={[styles.shieldIcon, { backgroundColor: colors.surfaceContainerLowest }]}>
          <Ionicons name="radio" size={sc(30)} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.onSurface }]}>Mock talker is calling...</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>Accept when you are ready to hold a calm, private space.</Text>
      </View>

      {/* Pulse Illustration */}
      <View style={styles.pulseSection}>
        <View style={styles.pulseContainer}>
          <View style={[styles.pulseRing, styles.pulseRingOuter, { borderColor: colors.primary + '1A' }]} />
          <View style={[styles.pulseRing, styles.pulseRingMid, { borderColor: colors.primary + '33' }]} />
          <View style={[styles.pulseGlass, { backgroundColor: colors.primaryContainer + '4D' }]}>
            <OtterMascot name="homeCall" size={sc(92)} />
          </View>
        </View>

        <View style={styles.timerSection}>
          <Text style={[styles.timerLabel, { color: colors.onSurfaceVariant }]}>Auto-declines in</Text>
          <Text style={[styles.timerCountdown, { color: colors.primary }]}>
            00:{countdown.toString().padStart(2, '0')}
          </Text>
        </View>
      </View>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + sc(20) }]}>
        <TouchableOpacity style={[styles.acceptButton, { backgroundColor: colors.primary }]} onPress={() => navigation.replace('ListenerCall')} activeOpacity={0.8}>
          <Ionicons name="call" size={sc(22)} color={colors.onPrimary} />
          <Text style={[styles.acceptText, { color: colors.onPrimary }]}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.declineButton, { backgroundColor: colors.surfaceContainerHigh }]} onPress={declineCall} activeOpacity={0.8}>
          <Ionicons name="call" size={sc(22)} color={colors.onSurfaceVariant} style={{ transform: [{ rotate: '135deg' }] }} />
          <Text style={[styles.declineText, { color: colors.onSurfaceVariant }]}>Decline</Text>
        </TouchableOpacity>

        <Text style={[styles.declineNote, { color: colors.onSurfaceVariant }]}>If you do not answer within 10 seconds, the call is automatically passed on.</Text>
      </View>

      {/* Exit Button - render last with high zIndex */}
      <TouchableOpacity style={[styles.exitButton, { top: insets.top + sc(16), right: sc(16) }]} onPress={declineCall} activeOpacity={0.8}>
        <View style={[styles.exitButtonInner, { backgroundColor: colors.errorContainer + '33' }]}>
          <Ionicons name="close" size={sc(18)} color={colors.onErrorContainer} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between' },
  ambientBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  glowPulse: { position: 'absolute', top: H * 0.3, left: -W * 0.3, width: W * 1.6, height: W * 1.6, borderRadius: W * 0.8, opacity: 0.6 },
  bgBlur1: { position: 'absolute', top: 0, right: -W * 0.2, width: W * 0.9, height: W * 0.9, borderRadius: W * 0.45 },
  bgBlur2: { position: 'absolute', bottom: 0, left: -W * 0.2, width: W * 0.8, height: W * 0.8, borderRadius: W * 0.4 },
  upperContent: { alignItems: 'center', paddingHorizontal: sc(24), zIndex: 10 },
  shieldIcon: { width: sc(60), height: sc(60), borderRadius: sc(30), alignItems: 'center', justifyContent: 'center', marginBottom: sc(20) },
  title: { fontSize: sc(22), fontWeight: '800', textAlign: 'center', letterSpacing: -0.3, marginBottom: sc(10), lineHeight: sc(28) },
  subtitle: { fontSize: sc(14), lineHeight: sc(21), textAlign: 'center', fontWeight: '300' },
  pulseSection: { alignItems: 'center', zIndex: 10 },
  pulseContainer: { width: sc(160), height: sc(160), alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: sc(24) },
  pulseRing: { position: 'absolute', borderRadius: 9999 },
  pulseRingOuter: { width: '100%', height: '100%', borderWidth: 1, opacity: 0.2 },
  pulseRingMid: { width: '75%', height: '75%', borderWidth: 1, opacity: 0.4 },
  pulseGlass: { width: sc(96), height: sc(96), borderRadius: sc(48), alignItems: 'center', justifyContent: 'center' },
  timerSection: { alignItems: 'center' },
  timerLabel: { fontSize: sc(9), fontWeight: '600', textTransform: 'uppercase', letterSpacing: 3, marginBottom: sc(4) },
  timerCountdown: { fontSize: sc(28), fontWeight: '700' },
  bottomActions: { paddingHorizontal: sc(20), width: '100%', zIndex: 10 },
  acceptButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(8), paddingVertical: sc(18), borderRadius: sc(26), marginBottom: sc(10), minHeight: 52 },
  acceptText: { fontSize: sc(15), fontWeight: '700' },
  declineButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(8), paddingVertical: sc(18), borderRadius: sc(26), marginBottom: sc(10), minHeight: 52 },
  declineText: { fontSize: sc(15), fontWeight: '600' },
  declineNote: { textAlign: 'center', fontSize: sc(10), opacity: 0.4, paddingTop: sc(10) },
  exitButton: { position: 'absolute', zIndex: 99 },
  exitButtonInner: { width: sc(40), height: sc(40), borderRadius: sc(20), alignItems: 'center', justifyContent: 'center' },
});
