import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OtterMascot from '../components/OtterMascot';
import BrandLogo from '../components/BrandLogo';

const { width: W, height: H } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function ActiveCallScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [showControls, setShowControls] = useState(true);

  // Animation refs
  const avatarScale = useRef(new Animated.Value(1)).current;
  const ringScale = useRef(new Animated.Value(0.8)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;
  const breathScale = useRef(new Animated.Value(1)).current;
  const breathOpacity = useRef(new Animated.Value(1)).current;
  const controlsTranslateY = useRef(new Animated.Value(0)).current;
  const fadeBg = useRef(new Animated.Value(0)).current;

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Avatar breathing pulse
  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(avatarScale, { toValue: 1.05, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(avatarScale, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]).start(loop);
    };
    loop();
  }, []);

  // Ring pulse
  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale, { toValue: 1.4, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(ringScale, { toValue: 0.8, duration: 0, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ]).start(loop);
    };
    loop();
  }, []);

  // Breathing exercise cycle (4-4-4 box breathing)
  useEffect(() => {
    const cycleBreathing = () => {
      // Inhale 4s
      Animated.sequence([
        Animated.parallel([
          Animated.timing(breathScale, { toValue: 1.6, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(breathOpacity, { toValue: 0.7, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.delay(4000), // Hold 4s
        Animated.parallel([
          Animated.timing(breathScale, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(breathOpacity, { toValue: 0.3, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ]).start(() => cycleBreathing());
    };
    cycleBreathing();
  }, []);

  // Breathing phase text
  useEffect(() => {
    const phaseLoop = () => {
      setBreathPhase('inhale');
      setTimeout(() => setBreathPhase('hold'), 4000);
      setTimeout(() => setBreathPhase('exhale'), 8000);
      setTimeout(phaseLoop, 12000);
    };
    phaseLoop();
  }, []);

  // Tap screen to toggle controls visibility
  const toggleControls = () => {
    if (showControls) {
      Animated.parallel([
        Animated.timing(controlsTranslateY, { toValue: H, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(fadeBg, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start(() => setShowControls(false));
    } else {
      setShowControls(true);
      controlsTranslateY.setValue(H);
      fadeBg.setValue(1);
      Animated.parallel([
        Animated.timing(controlsTranslateY, { toValue: 0, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(fadeBg, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const breathInstruction = breathPhase === 'inhale' ? 'Breathe in' : breathPhase === 'hold' ? 'Hold' : 'Breathe out';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} translucent />

      {/* Ambient background blobs */}
      <View style={[styles.bgBlob1, { backgroundColor: colors.primaryContainer + '08' }]} pointerEvents="none" />
      <View style={[styles.bgBlob2, { backgroundColor: colors.tertiaryContainer + '06' }]} pointerEvents="none" />

      {/* Tap area to toggle controls (full screen) */}
      <TouchableOpacity
        style={styles.fullScreenTap}
        activeOpacity={1}
        onPress={toggleControls}
      >
        {/* Session Header */}
        <View style={[styles.sessionHeader, { paddingTop: insets.top + sc(12) }]}>
          <View style={styles.brand}>
            <BrandLogo width={sc(78)} height={sc(34)} />
          </View>

        </View>

        {/* Center: Avatar + Breathing Exercise */}
        <View style={styles.centerArea}>
          {/* Breathing ring */}
          <Animated.View style={{ position: 'absolute', transform: [{ scale: breathScale }], opacity: breathOpacity }}>
            <View style={[styles.breathRing, { borderColor: colors.primary + '44' }]} />
          </Animated.View>

          {/* Avatar with pulse rings */}
          <View style={styles.avatarContainer}>
            <Animated.View style={{ position: 'absolute', transform: [{ scale: ringScale }], opacity: ringOpacity }}>
              <View style={[styles.pulseRing, { borderColor: colors.primaryFixed + '66' }]} />
            </Animated.View>
            <Animated.View style={{ transform: [{ scale: avatarScale }] }}>
              <View style={[styles.avatar, { backgroundColor: colors.surfaceContainerLowest }]}>
                <OtterMascot name="calm" size={sc(126)} />
              </View>
            </Animated.View>
          </View>

          {/* Listener name */}
          <Text style={[styles.listenerName, { color: colors.onSurface }]}>Anonymous Listener</Text>

          {/* Session timer */}
          <Text style={[styles.sessionTimer, { color: colors.onSurfaceVariant }]}>
            {formatTime(seconds)}
          </Text>

          {/* Breathing instruction */}
          <View style={[styles.breathCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <Ionicons name="leaf-outline" size={sc(20)} color={colors.primary} />
            <Text style={[styles.breathInstruction, { color: colors.primary }]}>
              {breathInstruction}
            </Text>
          </View>

          {/* Connection status - taps to Trust System */}
          <TouchableOpacity
            style={styles.statusRow}
            onPress={() => navigation.navigate('TrustSystem')}
            activeOpacity={0.7}
          >
            <Ionicons name="lock-closed" size={sc(10)} color={colors.outlineVariant} />
            <Text style={[styles.statusText, { color: colors.outlineVariant }]}>
              End-to-end encrypted — Trust system
            </Text>
            <Ionicons name="chevron-forward" size={sc(14)} color={colors.outlineVariant} />
          </TouchableOpacity>

          {/* Safety Report Button */}
          <TouchableOpacity
            style={[styles.safetyReportBtn, { backgroundColor: colors.errorContainer + '1A', borderColor: colors.error + '22' }]}
            onPress={() => navigation.navigate('SafetyReport')}
            activeOpacity={0.7}
          >
            <Ionicons name="warning-outline" size={sc(16)} color={colors.error} />
            <Text style={[styles.safetyReportBtnText, { color: colors.error }]}>
              Report a Safety Concern
            </Text>
          </TouchableOpacity>
        </View>

        {/* End session hint */}
        <View style={[styles.endHint, { paddingBottom: insets.top + sc(8) }]}>
          <Text style={[styles.endHintText, { color: colors.outlineVariant }]}>
            Tap to hide controls
          </Text>
        </View>
      </TouchableOpacity>

      {/* Controls panel - slides up from bottom */}
      <Animated.View
        style={[
          styles.controlsPanel,
          {
            paddingBottom: Math.max(insets.bottom, 12),
            backgroundColor: colors.surfaceContainerLow + 'F2',
            borderTopColor: colors.outlineVariant + '11',
            transform: [{ translateY: controlsTranslateY }],
            opacity: fadeBg.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.85],
            }),
          },
        ]}
      >
        {/* Control buttons row */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.ctrlButton, { backgroundColor: isMuted ? colors.primaryContainer + '44' : colors.surfaceContainerHigh }]}
            onPress={() => setIsMuted(!isMuted)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={sc(22)}
              color={isMuted ? colors.primary : colors.onSurface}
            />
            <Text style={[styles.ctrlLabel, { color: isMuted ? colors.primary : colors.onSurfaceVariant }]}>
              {isMuted ? 'Unmute' : 'Mute'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ctrlButton, { backgroundColor: isSpeaker ? colors.primaryContainer + '44' : colors.surfaceContainerHigh }]}
            onPress={() => setIsSpeaker(!isSpeaker)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isSpeaker ? 'volume-high' : 'volume-low'}
              size={sc(22)}
              color={isSpeaker ? colors.primary : colors.onSurface}
            />
            <Text style={[styles.ctrlLabel, { color: isSpeaker ? colors.primary : colors.onSurfaceVariant }]}>
              Speaker
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ctrlButton, { backgroundColor: colors.surfaceContainerHigh }]}
            onPress={() => navigation.navigate('SafetyReport')}
            activeOpacity={0.7}
          >
            <Ionicons name="shield-outline" size={sc(22)} color={colors.error} />
            <Text style={[styles.ctrlLabel, { color: colors.error }]}>Report</Text>
          </TouchableOpacity>
        </View>

        {/* End session button */}
        <TouchableOpacity
          style={[styles.endButton, { backgroundColor: colors.error }]}
          onPress={() => navigation.navigate('DonationScreen')}
          activeOpacity={0.8}
        >
          <Ionicons name="call" size={sc(20)} color={colors.onError} style={{ transform: [{ rotate: '135deg' }] }} />
          <Text style={[styles.endButtonText, { color: colors.onError }]}>End Session</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenTap: { flex: 1 },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: sc(20),
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: sc(5) },
  brandText: { fontSize: sc(14), fontWeight: '800', letterSpacing: -0.5 },

  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    width: sc(132),
    height: sc(132),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sc(16),
  },
  pulseRing: {
    width: sc(154),
    height: sc(154),
    borderRadius: 70,
    borderWidth: 2,
  },
  avatar: {
    width: sc(118),
    height: sc(118),
    borderRadius: sc(59),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  breathRing: {
    width: sc(200),
    height: sc(200),
    borderRadius: 100,
    borderWidth: 2,
    position: 'absolute',
  },
  listenerName: {
    fontSize: sc(18),
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: sc(4),
  },
  sessionTimer: {
    fontSize: sc(28),
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginBottom: sc(24),
    letterSpacing: -0.5,
  },
  breathCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sc(8),
    paddingHorizontal: sc(18),
    paddingVertical: sc(10),
    borderRadius: sc(20),
    marginBottom: sc(16),
  },
  breathInstruction: {
    fontSize: sc(14),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sc(5),
    marginTop: sc(8),
    paddingHorizontal: sc(12),
    paddingVertical: sc(8),
    borderRadius: sc(12),
  },
  statusText: {
    fontSize: sc(10),
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  safetyReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sc(6),
    paddingHorizontal: sc(18),
    paddingVertical: sc(10),
    borderRadius: sc(20),
    borderWidth: 1,
    marginTop: sc(12),
    minHeight: 44,
  },
  safetyReportBtnText: {
    fontSize: sc(12),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  endHint: { alignItems: 'center', paddingBottom: sc(8) },
  endHintText: { fontSize: sc(10), fontWeight: '500' },
  controlsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: sc(20),
    paddingTop: sc(16),
    borderTopLeftRadius: sc(24),
    borderTopRightRadius: sc(24),
    borderTopWidth: 1,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: sc(10),
    marginBottom: sc(12),
  },
  ctrlButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: sc(16),
    paddingVertical: sc(14),
    gap: sc(4),
    minHeight: sc(56),
  },
  ctrlLabel: { fontSize: sc(10), fontWeight: '700', letterSpacing: 0.5 },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sc(8),
    borderRadius: sc(24),
    paddingVertical: sc(14),
    minHeight: 52,
    marginBottom: sc(8),
  },
  endButtonText: { fontSize: sc(15), fontWeight: '800', letterSpacing: 0.5 },
  bgBlob1: {
    position: 'absolute',
    top: -sc(60),
    right: -sc(60),
    width: sc(200),
    height: sc(200),
    borderRadius: sc(100),
    pointerEvents: 'none',
  },
  bgBlob2: {
    position: 'absolute',
    bottom: H * 0.3,
    left: -sc(40),
    width: sc(160),
    height: sc(160),
    borderRadius: sc(80),
    pointerEvents: 'none',
  },
});
