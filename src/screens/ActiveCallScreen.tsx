import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const WAVE_HEIGHTS = [40, 70, 100, 70, 40, 60, 90, 50, 80, 45, 65, 85, 55, 75, 95, 50];

export default function ActiveCallScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // Animation values
  const fadeAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;
  const slideAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(40))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const waveAnims = useRef(WAVE_HEIGHTS.map(() => new Animated.Value(1))).current;

  // Entrance animations
  useEffect(() => {
    fadeAnims.forEach((fade, i) => {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 500,
          delay: i * 120,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnims[i], {
          toValue: 0,
          duration: 500,
          delay: i * 120,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  // Breathing pulse for avatar
  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(loop);
    };
    loop();
  }, []);

  // Glow pulse for call indicator
  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(loop);
    };
    loop();
  }, []);

  // Wave animation
  useEffect(() => {
    const loop = () => {
      Animated.parallel(
        waveAnims.map((wave, i) => {
          const direction = i % 2 === 0 ? 1.3 : 0.7;
          return Animated.sequence([
            Animated.timing(wave, {
              toValue: direction,
              duration: 300 + i * 60,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(wave, {
              toValue: 1,
              duration: 300 + i * 60,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]);
        })
      ).start(loop);
    };
    loop();
  }, []);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const AnimatedCard = ({ children, index }: { children: React.ReactNode; index: number }) => (
    <Animated.View
      style={{
        opacity: fadeAnims[index],
        transform: [{ translateY: slideAnims[index] }],
      }}
    >
      {children}
    </Animated.View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Decorative BG */}
      <View style={[styles.bgBlur1, { backgroundColor: colors.primaryContainer + '0D' }]} pointerEvents="none" />
      <View style={[styles.bgBlur2, { backgroundColor: colors.secondaryContainer + '0D' }]} pointerEvents="none" />

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + sc(8), paddingHorizontal: sc(20) }]}>
        <View style={styles.brand}>
          <Ionicons name="shield-checkmark" size={sc(20)} color={colors.primary} />
          <Text style={[styles.brandText, { color: colors.primary }]}>Active Session</Text>
        </View>
        <View style={{ width: sc(40) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Call Info Card */}
        <AnimatedCard index={0}>
          <View style={[styles.callInfoCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <View style={[styles.callerAvatar, { backgroundColor: colors.primary }]}>
                <Ionicons name="person" size={sc(28)} color={colors.onPrimary} />
              </View>
            </Animated.View>
            <Text style={[styles.callerName, { color: colors.onSurface }]}>Anonymous Listener</Text>
            <Animated.View style={[styles.timerBadge, { backgroundColor: colors.surfaceContainerHigh }, { opacity: glowAnim }]}>
              <View style={[styles.timerDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.timerText, { color: colors.primary }]}>{formatTime(seconds)}</Text>
            </Animated.View>
            <View style={styles.callerStatus}>
              <Ionicons name="checkmark-circle" size={sc(10)} color={colors.primary} />
              <Text style={[styles.callerStatusText, { color: colors.primary }]}>Connected & encrypted</Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Voice Visualization */}
        <AnimatedCard index={1}>
          <View style={styles.voiceSection}>
            <View style={[styles.voicePulseOuter, { backgroundColor: colors.primaryContainer + '22', borderColor: colors.primary + '11' }]}>
              <View style={[styles.voicePulseInner, { backgroundColor: colors.surface }]}>
                <Ionicons name="mic" size={sc(32)} color={colors.primary} />
              </View>
            </View>
            {/* Sound Wave Lines */}
            <View style={styles.waveContainer}>
              {waveAnims.map((waveAnim, i) => {
                const baseHeight = WAVE_HEIGHTS[i];
                return (
                  <Animated.View
                    key={i}
                    style={[
                      styles.waveBar,
                      {
                        height: sc(baseHeight / 3.5),
                        opacity: Animated.add(0.2, Animated.multiply(waveAnim, 0.5)),
                        backgroundColor: colors.primary,
                        transform: [{ scaleY: waveAnim }],
                      },
                    ]}
                  />
                );
              })}
            </View>
          </View>
        </AnimatedCard>

        {/* Controls */}
        <AnimatedCard index={2}>
          <View style={styles.controlsGrid}>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.surfaceContainerLow }, isMuted && { backgroundColor: colors.primaryContainer + '44' }]}
              onPress={() => setIsMuted(!isMuted)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isMuted ? 'mic-off' : 'mic'}
                size={sc(24)}
                color={isMuted ? colors.primary : colors.onSurfaceVariant}
              />
              <Text style={[styles.controlLabel, { color: isMuted ? colors.primary : colors.onSurfaceVariant }]}>
                {isMuted ? 'Unmute' : 'Mute'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.surfaceContainerLow }, isSpeaker && { backgroundColor: colors.primaryContainer + '44' }]}
              onPress={() => setIsSpeaker(!isSpeaker)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isSpeaker ? 'volume-high' : 'volume-low'}
                size={sc(24)}
                color={isSpeaker ? colors.primary : colors.onSurfaceVariant}
              />
              <Text style={[styles.controlLabel, { color: isSpeaker ? colors.primary : colors.onSurfaceVariant }]}>
                {isSpeaker ? 'Speaker On' : 'Speaker'}
              </Text>
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        {/* End Session */}
        <AnimatedCard index={3}>
          <TouchableOpacity
            style={[styles.endCallButton, { backgroundColor: colors.error }]}
            onPress={() => navigation.navigate('DonationScreen')}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={sc(22)} color={colors.onError} style={{ transform: [{ rotate: '135deg' }] }} />
            <Text style={[styles.endCallText, { color: colors.onError }]}>End Session</Text>
          </TouchableOpacity>

          {/* Safety */}
          <TouchableOpacity
            style={[styles.safetyButton, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.error + '22' }]}
            onPress={() => navigation.navigate('SafetyReport')}
            activeOpacity={0.7}
          >
            <Ionicons name="shield-outline" size={sc(16)} color={colors.error} />
            <Text style={[styles.safetyButtonText, { color: colors.error }]}>Safety & Reporting</Text>
          </TouchableOpacity>
        </AnimatedCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: sc(8) },
  brand: { flexDirection: 'row', alignItems: 'center', gap: sc(6) },
  brandText: { fontSize: sc(15), fontWeight: '800', letterSpacing: -0.5 },
  exitButton: { width: sc(40), height: sc(40), borderRadius: sc(20), alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: sc(20), paddingTop: sc(8), paddingBottom: sc(40) },

  callInfoCard: { alignItems: 'center', borderRadius: sc(20), paddingVertical: sc(24), paddingHorizontal: sc(20), marginBottom: sc(24) },
  callerAvatar: { width: sc(64), height: sc(64), borderRadius: sc(32), alignItems: 'center', justifyContent: 'center', marginBottom: sc(12) },
  callerName: { fontSize: sc(20), fontWeight: '800', marginBottom: sc(8), letterSpacing: -0.3 },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: sc(6), paddingHorizontal: sc(14), paddingVertical: sc(6), borderRadius: sc(18), marginBottom: sc(8) },
  timerDot: { width: 8, height: 8, borderRadius: 4 },
  timerText: { fontSize: sc(16), fontWeight: '700', fontVariant: ['tabular-nums'] },
  callerStatus: { flexDirection: 'row', alignItems: 'center', gap: sc(4) },
  callerStatusText: { fontSize: sc(11), fontWeight: '600', opacity: 0.8 },

  voiceSection: { alignItems: 'center', marginBottom: sc(28) },
  voicePulseOuter: { width: sc(120), height: sc(120), borderRadius: sc(60), alignItems: 'center', justifyContent: 'center', marginBottom: sc(20), borderWidth: 2 },
  voicePulseInner: { width: sc(72), height: sc(72), borderRadius: sc(36), alignItems: 'center', justifyContent: 'center' },
  waveContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(3), height: sc(40) },
  waveBar: { width: sc(3), borderRadius: sc(1.5) },

  controlsGrid: { flexDirection: 'row', gap: sc(10), marginBottom: sc(16) },
  controlButton: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: sc(16), paddingVertical: sc(18), gap: sc(8), minHeight: 44 },
  controlLabel: { fontSize: sc(12), fontWeight: '700' },

  endCallButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(8), paddingVertical: sc(16), borderRadius: sc(28), minHeight: 52, marginBottom: sc(10) },
  endCallText: { fontSize: sc(15), fontWeight: '800', letterSpacing: 0.5 },
  safetyButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(6), paddingVertical: sc(12), borderRadius: sc(20), minHeight: 44, borderWidth: 1 },
  safetyButtonText: { fontSize: sc(12), fontWeight: '700', letterSpacing: 0.5 },

  bgBlur1: { position: 'absolute', top: 0, right: 0, width: W * 0.5, height: W * 0.5, borderRadius: W * 0.25, pointerEvents: 'none' },
  bgBlur2: { position: 'absolute', bottom: 0, left: 0, width: W * 0.4, height: W * 0.4, borderRadius: W * 0.2, pointerEvents: 'none' },
});
