import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const listenerFeedbacks = [
  {
    id: '1',
    listenerName: 'Aura_7',
    mentalStatus: 78,
    message: 'You showed real courage opening up tonight. Your vulnerability is your strength. Keep going.',
    date: 'Apr 20, 2025',
  },
  {
    id: '2',
    listenerName: 'Echo_3',
    mentalStatus: 85,
    message: 'You are doing better than you think. Small steps still move you forward. Be patient with your healing.',
    date: 'Apr 18, 2025',
  },
  {
    id: '3',
    listenerName: 'Sage_9',
    mentalStatus: 62,
    message: "It's okay to not be okay. Rest is productive too. Your feelings are valid and they matter.",
    date: 'Apr 15, 2025',
  },
  {
    id: '4',
    listenerName: 'Haven_2',
    mentalStatus: 91,
    message: 'Your growth mindset is inspiring. Keep nurturing yourself with the same kindness you offer others.',
    date: 'Apr 10, 2025',
  },
  {
    id: '5',
    listenerName: 'River_5',
    mentalStatus: 70,
    message: 'You carried a heavy conversation with grace. Be gentle with yourself after.',
    date: 'Apr 5, 2025',
  },
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

/**
 * Half-arc gauge using a full circle clipped to its top half.
 * Track draws the background arc. Progress uses borderTopColor AND borderRightColor
 * to create a 180-degree arc, rotated progressively into view.
 */
function HalfArcGauge({
  percentage,
  color,
  trackColor,
  size,
  stroke,
}: {
  percentage: number;
  color: string;
  trackColor: string;
  size: number;
  stroke: number;
}) {
  const half = size / 2;
  const clamped = Math.max(0, Math.min(100, percentage));
  
  // A standard circle with borderTop & borderRight colored spans 180°.
  // We rotate it by 135° + (percentage * 1.8) to sweep from left to right.
  const sweep = (clamped / 100) * 180;
  const rotation = 135 + sweep;

  return (
    <View style={{ width: size, height: half, overflow: 'hidden', alignItems: 'center' }}>
      {/* Background track — full border visible as top semicircle */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          width: size,
          height: size,
          borderRadius: half,
          borderWidth: stroke,
          borderColor: trackColor,
        }}
      />

      {/* Progress arc — 180 degree colored border, rotated into view */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          width: size,
          height: size,
          borderRadius: half,
          borderWidth: stroke,
          borderColor: 'transparent',
          borderTopColor: color,
          borderRightColor: color,
          transform: [{ rotateZ: `${rotation}deg` }],
        }}
      />
    </View>
  );
}

export default function YourStatusScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;

  const totalStatus = Math.round(
    listenerFeedbacks.reduce((sum, f) => sum + f.mentalStatus, 0) / listenerFeedbacks.length
  );
  const totalColor = getStatusColor(totalStatus);
  const totalLabel = getStatusLabel(totalStatus);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={[styles.topBar, { paddingTop: insets.top + sc(8) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.surfaceContainerLow }]} activeOpacity={0.5}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.onSurface }]}>Your Status</Text>
        <View style={{ width: sc(38) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Half-arc gauge */}
        <View style={styles.hero}>
          <View style={styles.gaugeContainer}>
            <HalfArcGauge
              percentage={totalStatus}
              color={totalColor}
              trackColor={colors.outlineVariant + '40'}
              size={sc(220)}
              stroke={sc(14)}
            />
            <View style={styles.scoreWrap}>
              <Text style={[styles.scoreValue, { color: totalColor }]}>{totalStatus}%</Text>
              <Text style={[styles.scoreLabel, { color: colors.onSurfaceVariant }]}>{totalLabel}</Text>
            </View>
          </View>
          <Text style={[styles.caption, { color: colors.onSurfaceVariant }]}>
            From {listenerFeedbacks.length} listener sessions
          </Text>
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <Text style={[styles.summaryTitle, { color: colors.onSurface }]}>
            Overall Mental Health
          </Text>
          <Text style={[styles.summaryDesc, { color: colors.onSurfaceVariant }]}>
            Based on feedback from {listenerFeedbacks.length} listener sessions. You are in a{' '}
            <Text style={{ color: totalColor, fontWeight: '700' }}>{totalLabel.toLowerCase()}</Text> state.
          </Text>
        </View>

        {/* Section header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Listener Feedback</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.onSurfaceVariant }]}>
            {listenerFeedbacks.length} reviews
          </Text>
        </View>

        {/* List items */}
        {listenerFeedbacks.map((feedback, index) => {
          const statusColor = getStatusColor(feedback.mentalStatus);
          const isLast = index === listenerFeedbacks.length - 1;
          return (
            <View key={feedback.id}>
              <View style={styles.listItem}>
                <View style={styles.listTop}>
                  <View style={styles.listLeft}>
                    <View style={[styles.avatarCircle, { backgroundColor: colors.primary + '12' }]}>
                      <Text style={[styles.avatarInitial, { color: colors.primary }]}>
                        {feedback.listenerName.charAt(0)}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.listenerName, { color: colors.onSurface }]}>
                        {feedback.listenerName}
                      </Text>
                      <Text style={[styles.feedbackDate, { color: colors.onSurfaceVariant }]}>
                        {feedback.date}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.scoreText, { color: statusColor }]}>
                    {feedback.mentalStatus}%
                  </Text>
                </View>

                <View style={[styles.barTrack, { backgroundColor: colors.outlineVariant + '22' }]}>
                  <LinearGradient
                    colors={[statusColor + '88', statusColor]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.barFill, { width: `${feedback.mentalStatus}%` }]}
                  />
                </View>

                <Text style={[styles.feedbackMessage, { color: colors.onSurfaceVariant }]}>
                  {feedback.message}
                </Text>
              </View>
              {!isLast && <View style={[styles.separator, { backgroundColor: colors.outlineVariant + '33' }]} />}
            </View>
          );
        })}

        <View style={{ height: sc(40) }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: sc(18),
    paddingBottom: sc(12),
  },
  backButton: {
    width: sc(38),
    height: sc(38),
    borderRadius: sc(19),
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: { fontSize: sc(16), fontWeight: '700', letterSpacing: -0.3 },

  scrollContent: { paddingHorizontal: sc(18), paddingTop: sc(12), paddingBottom: sc(20) },

  // Hero
  hero: { alignItems: 'center', marginBottom: sc(6), marginTop: sc(10) },
  gaugeContainer: { width: sc(220), height: sc(110), alignItems: 'center' },
  scoreWrap: { position: 'absolute', bottom: -sc(12), alignItems: 'center' },
  scoreValue: { fontSize: sc(38), fontWeight: '800', letterSpacing: -1 },
  scoreLabel: { fontSize: sc(13), fontWeight: '600', marginTop: sc(0) },
  caption: { fontSize: sc(12), marginTop: sc(20) },

  // Summary
  summarySection: { marginTop: sc(14), marginBottom: sc(24) },
  summaryTitle: { fontSize: sc(15), fontWeight: '700', marginBottom: sc(4) },
  summaryDesc: { fontSize: sc(13), lineHeight: sc(21) },

  // Section
  sectionHeader: { marginBottom: sc(12) },
  sectionTitle: { fontSize: sc(15), fontWeight: '700' },
  sectionSubtitle: { fontSize: sc(11), fontWeight: '500', marginTop: sc(2) },

  // List
  listItem: { paddingVertical: sc(14) },
  listTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: sc(10),
  },
  listLeft: { flexDirection: 'row', alignItems: 'center', gap: sc(10) },
  avatarCircle: {
    width: sc(34),
    height: sc(34),
    borderRadius: sc(17),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: sc(14), fontWeight: '700' },
  listenerName: { fontSize: sc(14), fontWeight: '600' },
  feedbackDate: { fontSize: sc(11), marginTop: sc(1) },
  scoreText: { fontSize: sc(15), fontWeight: '800' },

  barTrack: {
    width: '100%',
    height: sc(5),
    borderRadius: sc(3),
    overflow: 'hidden',
    marginBottom: sc(10),
  },
  barFill: { height: '100%', borderRadius: sc(3) },

  feedbackMessage: { fontSize: sc(13), lineHeight: sc(20) },

  separator: { height: StyleSheet.hairlineWidth, marginLeft: sc(44) },
});
