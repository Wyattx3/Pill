import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandLogo from '../components/BrandLogo';
import OtterMascot from '../components/OtterMascot';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const talker = {
  name: 'Anonymous Talker',
  mood: 'Connected',
};

function formatTime(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function ListenerCallScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const finishCall = () => {
    navigation.replace('ListenerCallReview', {
      duration: formatTime(seconds),
      talkerName: talker.name,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={[styles.topBar, { paddingTop: insets.top + sc(8) }]}>
        <BrandLogo width={sc(84)} height={sc(36)} />
        <TouchableOpacity
          style={[styles.reportButton, { backgroundColor: colors.errorContainer + '44', borderColor: colors.error + '22' }]}
          onPress={() => navigation.navigate('SafetyReport')}
          activeOpacity={0.75}
        >
          <Ionicons name="flag-outline" size={sc(15)} color={colors.error} />
          <Text style={[styles.reportText, { color: colors.error }]}>Report</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <OtterMascot name="listenerCall" size={sc(154)} containerStyle={styles.callMascot} />

        <Text style={[styles.talkerName, { color: colors.onSurface }]}>{talker.name}</Text>
        <View style={styles.connectionRow}>
          <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={[styles.connectionText, { color: colors.onSurfaceVariant }]}>{talker.mood}</Text>
        </View>
        <Text style={[styles.timer, { color: colors.primary }]}>{formatTime(seconds)}</Text>
      </View>

      <View style={[styles.controlsPanel, { paddingBottom: Math.max(insets.bottom, sc(12)), backgroundColor: colors.surfaceContainerLow, borderTopColor: colors.outlineVariant + '20' }]}>
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: isMuted ? colors.primaryContainer + '66' : colors.surfaceContainerHighest }]}
            onPress={() => setIsMuted(!isMuted)}
            activeOpacity={0.75}
          >
            <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={sc(22)} color={isMuted ? colors.primary : colors.onSurface} />
            <Text style={[styles.controlLabel, { color: isMuted ? colors.primary : colors.onSurfaceVariant }]}>
              {isMuted ? 'Muted' : 'Mute'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: isSpeaker ? colors.primaryContainer + '66' : colors.surfaceContainerHighest }]}
            onPress={() => setIsSpeaker(!isSpeaker)}
            activeOpacity={0.75}
          >
            <Ionicons name={isSpeaker ? 'volume-high' : 'volume-low'} size={sc(22)} color={isSpeaker ? colors.primary : colors.onSurface} />
            <Text style={[styles.controlLabel, { color: isSpeaker ? colors.primary : colors.onSurfaceVariant }]}>Speaker</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.endCallButton, { backgroundColor: colors.error }]}
            onPress={finishCall}
            activeOpacity={0.85}
          >
            <Ionicons name="call" size={sc(22)} color={colors.onError} style={{ transform: [{ rotate: '135deg' }] }} />
            <Text style={[styles.endCallText, { color: colors.onError }]}>End</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: sc(20), paddingBottom: sc(10) },
  reportButton: { minHeight: sc(34), flexDirection: 'row', alignItems: 'center', gap: sc(5), paddingHorizontal: sc(11), borderRadius: sc(999), borderWidth: 1 },
  reportText: { fontSize: sc(11), fontWeight: '800' },
  content: { flex: 1, paddingHorizontal: sc(24), alignItems: 'center', justifyContent: 'center' },
  callMascot: { marginBottom: sc(14) },
  talkerName: { fontSize: sc(22), fontWeight: '800', textAlign: 'center', letterSpacing: -0.3, marginBottom: sc(8) },
  connectionRow: { flexDirection: 'row', alignItems: 'center', gap: sc(7), marginBottom: sc(22) },
  statusDot: { width: sc(8), height: sc(8), borderRadius: sc(4) },
  connectionText: { fontSize: sc(13), fontWeight: '700' },
  timer: { fontSize: sc(46), fontWeight: '800', fontVariant: ['tabular-nums'], letterSpacing: -1.2 },
  controlsPanel: { borderTopLeftRadius: sc(26), borderTopRightRadius: sc(26), borderTopWidth: 1, paddingHorizontal: sc(20), paddingTop: sc(16) },
  controlsRow: { flexDirection: 'row', alignItems: 'center', gap: sc(10) },
  controlButton: { flex: 1, minHeight: sc(58), borderRadius: sc(18), alignItems: 'center', justifyContent: 'center', gap: sc(4) },
  controlLabel: { fontSize: sc(10), fontWeight: '800' },
  endCallButton: { flex: 1, minHeight: sc(58), borderRadius: sc(18), alignItems: 'center', justifyContent: 'center', gap: sc(4) },
  endCallText: { fontSize: sc(10), fontWeight: '800' },
});
