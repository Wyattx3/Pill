import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  DimensionValue,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import OtterMascot from '../components/OtterMascot';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const feedbackTemplates = [
  'You showed real courage opening up tonight. Your vulnerability is your strength. Keep going.',
  'It is okay to not be okay. Rest is productive too. Your feelings are valid and they matter.',
  'You are doing better than you think. Small steps still move you forward.',
];

function getStatusColor(percentage: number) {
  if (percentage >= 80) return '#4CAF50';
  if (percentage >= 60) return '#FF9800';
  return '#F44336';
}

function getStatusLabel(percentage: number) {
  if (percentage >= 80) return 'Thriving';
  if (percentage >= 60) return 'Steady';
  return 'Fragile';
}

function clampPercent(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export default function ListenerCallReviewScreen({ navigation, route, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const duration = route?.params?.duration ?? '00:00';
  const talkerName = route?.params?.talkerName ?? 'Anonymous Talker';
  const [mentalStatus, setMentalStatus] = useState(70);
  const [barWidth, setBarWidth] = useState(0);
  const [feedback, setFeedback] = useState(feedbackTemplates[1]);

  const statusColor = getStatusColor(mentalStatus);
  const statusLabel = getStatusLabel(mentalStatus);
  const statusWidth = useMemo<DimensionValue>(() => `${mentalStatus}%` as DimensionValue, [mentalStatus]);

  const submitReview = () => {
    navigation.replace('ListenerDashboard', {
      lastReview: {
        mentalStatus,
        feedback,
        duration,
      },
    });
  };

  const updateMentalStatus = (value: number) => {
    const next = clampPercent(value);
    setMentalStatus(next);
  };

  const handleBarLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  };

  const updateMentalStatusFromBar = (locationX: number) => {
    if (!barWidth) return;
    const clampedX = Math.max(0, Math.min(barWidth, locationX));
    updateMentalStatus(Math.round((clampedX / barWidth) * 100));
  };

  const barResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => updateMentalStatusFromBar(event.nativeEvent.locationX),
        onPanResponderMove: (event) => updateMentalStatusFromBar(event.nativeEvent.locationX),
      }),
    [barWidth]
  );

  const handleBarPress = (event: any) => {
    if (event?.nativeEvent?.locationX !== undefined) {
      updateMentalStatusFromBar(event.nativeEvent.locationX);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={[styles.topBar, { paddingTop: insets.top + sc(8) }]}>
        <TouchableOpacity onPress={() => navigation.replace('ListenerDashboard')} style={[styles.iconButton, { backgroundColor: colors.surfaceContainerLow }]} activeOpacity={0.65}>
          <Ionicons name="close" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.onSurface }]}>Session Notes</Text>
        <View style={{ width: sc(40) }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: sc(36) + insets.bottom }]}
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroRow}>
          <View style={styles.heroCopy}>
            <Text style={[styles.heroTitle, { color: colors.onSurface }]}>How is the talker doing?</Text>
            <Text style={[styles.heroDesc, { color: colors.onSurfaceVariant }]}>
              Set a mental status and leave a kind note, like the feedback shown in Your Status.
            </Text>
          </View>
          <OtterMascot name="listenerReview" size={sc(104)} containerStyle={styles.heroMascot} />
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant + '22' }]}>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>CALL WITH</Text>
            <Text style={[styles.summaryName, { color: colors.onSurface }]}>{talkerName}</Text>
          </View>
          <View style={[styles.durationPill, { backgroundColor: colors.surfaceContainerLowest }]}>
            <Ionicons name="time-outline" size={sc(14)} color={colors.primary} />
            <Text style={[styles.durationText, { color: colors.primary }]}>{duration}</Text>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionTop}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Mental Status</Text>
            <Text style={[styles.statusValue, { color: statusColor }]}>{mentalStatus}%</Text>
          </View>
          <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
          <View
            style={styles.sliderHitArea}
            onLayout={handleBarLayout}
            onStartShouldSetResponder={() => true}
            onResponderGrant={handleBarPress}
            onResponderMove={handleBarPress}
            {...barResponder.panHandlers}
          >
            <View pointerEvents="none" style={[styles.sliderTrack, { backgroundColor: colors.outlineVariant + '22' }]}>
              <LinearGradient
                colors={['#F44336', '#FF9800', '#4CAF50']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sliderSpectrum}
              />
              <View style={[styles.sliderMask, { left: statusWidth, backgroundColor: colors.background + 'CC' }]} />
            </View>
            <View
              pointerEvents="none"
              style={[
                styles.sliderThumb,
                {
                  left: statusWidth,
                  backgroundColor: statusColor,
                  borderColor: colors.surfaceContainerLowest,
                },
              ]}
            />
          </View>
          <View style={styles.sliderLabels}>
            <Text style={[styles.sliderLabel, { color: colors.onSurfaceVariant }]}>Fragile</Text>
            <Text style={[styles.sliderLabel, { color: colors.onSurfaceVariant }]}>Steady</Text>
            <Text style={[styles.sliderLabel, { color: colors.onSurfaceVariant }]}>Thriving</Text>
          </View>
          <Text style={[styles.sliderHint, { color: colors.onSurfaceVariant }]}>Drag the bar to set a custom score.</Text>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Feedback</Text>
          <View style={styles.templateList}>
            {feedbackTemplates.map((template) => {
              const selected = feedback === template;
              return (
                <TouchableOpacity
                  key={template}
                  style={[
                    styles.templateButton,
                    {
                      backgroundColor: selected ? colors.primaryContainer + '55' : colors.surfaceContainerLow,
                      borderColor: selected ? colors.primary + '40' : colors.outlineVariant + '20',
                    },
                  ]}
                  onPress={() => setFeedback(template)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.templateText, { color: colors.onSurfaceVariant }]}>{template}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TextInput
            value={feedback}
            onChangeText={setFeedback}
            multiline
            textAlignVertical="top"
            placeholder="Write a gentle feedback note..."
            placeholderTextColor={colors.onSurfaceVariant + '88'}
            style={[
              styles.feedbackInput,
              {
                backgroundColor: colors.surfaceContainerLowest,
                color: colors.onSurface,
                borderColor: colors.outlineVariant + '26',
              },
            ]}
          />
        </View>

        <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={submitReview} activeOpacity={0.85}>
          <Ionicons name="checkmark-circle" size={sc(20)} color={colors.onPrimary} />
          <Text style={[styles.submitText, { color: colors.onPrimary }]}>Save Session Feedback</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={() => navigation.replace('ListenerDashboard')} activeOpacity={0.65}>
          <Text style={[styles.skipText, { color: colors.onSurfaceVariant }]}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: sc(18), paddingBottom: sc(12) },
  iconButton: { width: sc(40), height: sc(40), borderRadius: sc(20), alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: sc(16), fontWeight: '800' },
  scrollContent: { paddingHorizontal: sc(18), paddingTop: sc(8), paddingBottom: sc(28) },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: sc(8), marginBottom: sc(14) },
  heroCopy: { flex: 1 },
  heroTitle: { fontSize: sc(25), fontWeight: '800', lineHeight: sc(31), marginBottom: sc(8) },
  heroDesc: { fontSize: sc(13), lineHeight: sc(20) },
  heroMascot: { flexShrink: 0, marginRight: -sc(6) },
  summaryCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: sc(16), padding: sc(16), borderWidth: 1, marginBottom: sc(20) },
  summaryLabel: { fontSize: sc(9), fontWeight: '800', letterSpacing: 1.3, marginBottom: sc(3) },
  summaryName: { fontSize: sc(15), fontWeight: '800' },
  durationPill: { flexDirection: 'row', alignItems: 'center', gap: sc(5), paddingHorizontal: sc(10), paddingVertical: sc(8), borderRadius: sc(999) },
  durationText: { fontSize: sc(12), fontWeight: '800', fontVariant: ['tabular-nums'] },
  sectionBlock: { marginBottom: sc(20) },
  sectionTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: sc(8) },
  sectionTitle: { fontSize: sc(16), fontWeight: '800', marginBottom: sc(10) },
  statusValue: { fontSize: sc(20), fontWeight: '900' },
  statusLabel: { fontSize: sc(13), fontWeight: '800', marginTop: -sc(2), marginBottom: sc(12) },
  sliderHitArea: { height: sc(50), justifyContent: 'center', marginBottom: sc(4) },
  sliderTrack: { height: sc(13), borderRadius: sc(999), overflow: 'hidden' },
  sliderSpectrum: { height: '100%', width: '100%', borderRadius: sc(999) },
  sliderMask: { position: 'absolute', top: 0, right: 0, bottom: 0 },
  sliderThumb: { position: 'absolute', width: sc(28), height: sc(28), borderRadius: sc(14), marginLeft: -sc(14), borderWidth: sc(4) },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: sc(5) },
  sliderLabel: { fontSize: sc(10), fontWeight: '800' },
  sliderHint: { fontSize: sc(11), lineHeight: sc(16), fontWeight: '600' },
  templateList: { gap: sc(8), marginBottom: sc(10) },
  templateButton: { borderRadius: sc(14), borderWidth: 1, paddingHorizontal: sc(14), paddingVertical: sc(12) },
  templateText: { fontSize: sc(12), lineHeight: sc(18), fontWeight: '600' },
  feedbackInput: { minHeight: sc(118), borderRadius: sc(16), borderWidth: 1, padding: sc(14), fontSize: sc(13), lineHeight: sc(20) },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(8), minHeight: 52, borderRadius: sc(26), marginTop: sc(4) },
  submitText: { fontSize: sc(14), fontWeight: '900' },
  skipButton: { minHeight: 44, justifyContent: 'center', alignItems: 'center', marginTop: sc(8) },
  skipText: { fontSize: sc(13), fontWeight: '700' },
});
