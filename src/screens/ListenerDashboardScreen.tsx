import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const recentComments = [
  { name: 'Calm', avatar: '🌿', rating: 5, text: 'Felt truly heard. Thank you.', time: '2h ago' },
  { name: 'Sky', avatar: '☁️', rating: 4, text: 'Good listener, gentle presence.', time: '5h ago' },
  { name: 'Stone', avatar: '🪨', rating: 5, text: 'Helped me through a tough moment.', time: '1d ago' },
  { name: 'River', avatar: '🌊', rating: 5, text: 'Very patient and kind.', time: '2d ago' },
];

export default function ListenerDashboardScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [isAvailable, setIsAvailable] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('month');

  const stats = {
    week: { calls: 12, minutes: 186, rating: 4.8, helped: 12 },
    month: { calls: 47, minutes: 720, rating: 4.9, helped: 42 },
    all: { calls: 156, minutes: 2340, rating: 4.9, helped: 124 },
  };

  const current = stats[timeFilter];
  const earnings = { total: 234.50, pending: 45.00, paid: 189.50 };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Decorative BG */}
      <View style={[styles.bgBlur, { backgroundColor: colors.primaryContainer + '1A' }]} pointerEvents="none" />

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, sc(8)) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.surfaceContainerLow }]} activeOpacity={0.5}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.brand}>
          <Ionicons name="shield-checkmark" size={sc(22)} color={colors.primary} />
          <Text style={[styles.brandText, { color: colors.primary }]}>Listener Dashboard</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={[styles.avatar, { backgroundColor: colors.surfaceContainerHigh }]} activeOpacity={0.5}>
          <Ionicons name="person" size={sc(18)} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Availability Toggle */}
        {/* Availability Toggle */}
        <TouchableOpacity
          style={[styles.availCard, { backgroundColor: isAvailable ? colors.primaryContainer + '1A' : colors.surfaceContainerLow }]}
          onPress={() => setIsAvailable(!isAvailable)}
          activeOpacity={0.7}
        >
          <View style={styles.availLeft}>
            <View style={[styles.availIconCircle, { backgroundColor: colors.surface }]}>
              <Ionicons name={isAvailable ? 'checkmark-circle' : 'pause-circle'} size={sc(24)} color={isAvailable ? colors.primary : colors.outlineVariant} />
            </View>
            <View>
              <Text style={[styles.availTitle, { color: colors.onSurface }]}>{isAvailable ? 'You Are Available' : 'You Are Paused'}</Text>
              <Text style={[styles.availDesc, { color: colors.onSurfaceVariant }]}>
                {isAvailable ? 'Ready to receive incoming calls' : 'Toggle on to start receiving calls'}
              </Text>
            </View>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: colors.outlineVariant + '66', true: colors.primary }}
            thumbColor={colors.background}
          />
        </TouchableOpacity>

        {/* Customize Availability Card */}
        <TouchableOpacity
          style={[styles.scheduleCard, { backgroundColor: colors.surfaceContainerLow }]}
          onPress={() => navigation.navigate('AvailabilitySchedule')}
          activeOpacity={0.7}
        >
          <View style={styles.scheduleRow}>
            <View style={[styles.scheduleIconWrap, { backgroundColor: colors.primaryContainer + '33' }]}>
              <Ionicons name="calendar-outline" size={sc(20)} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.scheduleTitle, { color: colors.onSurface }]}>Customize Availability</Text>
              <Text style={[styles.scheduleDesc, { color: colors.onSurfaceVariant }]}>Set your days, hours, and daily call limits</Text>
            </View>
            <Ionicons name="chevron-forward" size={sc(18)} color={colors.onSurfaceVariant} />
          </View>
        </TouchableOpacity>

        {/* Stats Grid */}
        <View style={styles.statsHeader}>
          <Text style={[styles.statsTitle, { color: colors.onSurface }]}>Your Impact</Text>
          <View style={styles.filterRow}>
            {(['week', 'month', 'all'] as const).map((f) => (
              <TouchableOpacity key={f} style={[styles.filterBtn, { backgroundColor: timeFilter === f ? colors.primaryContainer : colors.surfaceContainerLow }]} onPress={() => setTimeFilter(f)} activeOpacity={0.7}>
                <Text style={[styles.filterText, { color: timeFilter === f ? colors.onPrimaryContainer : colors.onSurfaceVariant }]}>{f === 'all' ? 'All' : f === 'week' ? 'Week' : 'Month'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <Ionicons name="call" size={sc(20)} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.onSurface }]}>{current.calls}</Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Sessions</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <Ionicons name="time" size={sc(20)} color={colors.secondary} />
            <Text style={[styles.statNumber, { color: colors.onSurface }]}>{Math.round(current.minutes / 60)}h</Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Minutes</Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <View style={[styles.statCard, { backgroundColor: colors.primaryContainer + '22' }]}>
            <Ionicons name="star" size={sc(20)} color={colors.tertiary} />
            <Text style={[styles.statNumber, { color: colors.tertiary }]}>{current.rating}</Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Avg Rating</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <Ionicons name="people" size={sc(20)} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.onSurface }]}>{current.helped}</Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>People Helped</Text>
          </View>
        </View>

        {/* Earnings Summary */}
        <View style={[styles.earningsCard, { backgroundColor: colors.surfaceContainerLowest }]}>
          <View style={styles.earningsHeader}>
            <Ionicons name="wallet" size={sc(20)} color={colors.primary} />
            <Text style={[styles.earningsTitle, { color: colors.onSurfaceVariant }]}>Earnings</Text>
          </View>
          <Text style={[styles.earningsTotal, { color: colors.primary }]}>${earnings.total.toFixed(2)}</Text>
          <Text style={[styles.earningsLabel, { color: colors.onSurfaceVariant }]}>Total Earned</Text>
          <View style={styles.earningsRow}>
            <View>
              <Text style={[styles.earningsSubTitle, { color: colors.onSurface }]}>${earnings.pending.toFixed(2)}</Text>
              <Text style={[styles.earningsSubLabel, { color: colors.onSurfaceVariant }]}>Pending</Text>
            </View>
            <View>
              <Text style={[styles.earningsSubTitle, { color: colors.onSurface }]}>${earnings.paid.toFixed(2)}</Text>
              <Text style={[styles.earningsSubLabel, { color: colors.onSurfaceVariant }]}>Paid Out</Text>
            </View>
            <View>
              <TouchableOpacity style={styles.payoutBtn} onPress={() => navigation.navigate('EarningsScreen')} activeOpacity={0.7}>
                <Text style={[styles.payoutBtnText, { color: colors.primary }]}>View All</Text>
                <Ionicons name="arrow-forward" size={sc(14)} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent Comments */}
        <View style={styles.commentsHeader}>
          <Text style={[styles.commentsTitle, { color: colors.onSurface }]}>Recent Feedback</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RatingsScreen')} activeOpacity={0.7}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        {recentComments.map((c, i) => (
          <View key={i} style={[styles.commentCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.commentContent}>
              <View style={styles.commentTop}>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons key={s} name={s <= c.rating ? 'star' : 'star-outline'} size={sc(12)} color={s <= c.rating ? colors.tertiary : colors.outlineVariant} />
                  ))}
                </View>
                <Text style={[styles.commentTime, { color: colors.onSurfaceVariant }]}>{c.time}</Text>
              </View>
              <Text style={[styles.commentText, { color: colors.onSurfaceVariant }]}>{c.text}</Text>
            </View>
          </View>
        ))}

        {/* Quick Actions */}
        <Text style={[styles.quickTitle, { color: colors.onSurface }]}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity style={[styles.quickCard, { backgroundColor: colors.surfaceContainerLow }]} onPress={() => navigation.navigate('EarningsScreen')} activeOpacity={0.7}>
            <Ionicons name="cash-outline" size={sc(22)} color={colors.primary} />
            <Text style={[styles.quickCardTitle, { color: colors.onSurface }]}>Payout Setup</Text>
            <Text style={[styles.quickCardDesc, { color: colors.onSurfaceVariant }]}>Configure your withdrawal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickCard, { backgroundColor: colors.surfaceContainerLow }]} onPress={() => navigation.navigate('RatingsScreen')} activeOpacity={0.7}>
            <Ionicons name="star-outline" size={sc(22)} color={colors.tertiary} />
            <Text style={[styles.quickCardTitle, { color: colors.onSurface }]}>All Ratings</Text>
            <Text style={[styles.quickCardDesc, { color: colors.onSurfaceVariant }]}>View full feedback</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickCard, { backgroundColor: colors.surfaceContainerLow }]} onPress={() => navigation.navigate('Profile')} activeOpacity={0.7}>
            <Ionicons name="settings-outline" size={sc(22)} color={colors.secondary} />
            <Text style={[styles.quickCardTitle, { color: colors.onSurface }]}>Settings</Text>
            <Text style={[styles.quickCardDesc, { color: colors.onSurfaceVariant }]}>Manage your profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 8), paddingTop: sc(8), backgroundColor: colors.surface + 'E6', borderTopColor: colors.outlineVariant + '22' }]}>
        <TouchableOpacity style={[styles.navItemActive, { backgroundColor: colors.primaryFixed }]} activeOpacity={0.5}>
          <Ionicons name="home" size={sc(22)} color={colors.primary} />
          <Text style={[styles.navLabelActive, { color: colors.primary }]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('EarningsScreen')} activeOpacity={0.5}>
          <Ionicons name="wallet-outline" size={sc(22)} color={colors.onSurfaceVariant} />
          <Text style={[styles.navLabel, { color: colors.onSurfaceVariant }]}>Earnings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('RatingsScreen')} activeOpacity={0.5}>
          <Ionicons name="star-outline" size={sc(22)} color={colors.onSurfaceVariant} />
          <Text style={[styles.navLabel, { color: colors.onSurfaceVariant }]}>Ratings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgBlur: { position: 'absolute', top: sc(120), right: -sc(60), width: sc(200), height: sc(200), borderRadius: sc(100), pointerEvents: 'none' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(18), paddingBottom: sc(10) },
  backButton: { width: sc(38), height: sc(38), borderRadius: sc(19), alignItems: 'center', justifyContent: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: sc(6) },
  brandText: { fontSize: sc(15), fontWeight: '800', letterSpacing: -0.5 },
  avatar: { width: sc(36), height: sc(36), borderRadius: sc(18), alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: sc(18), paddingTop: sc(8), paddingBottom: sc(100) },

  availCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: sc(14), paddingHorizontal: sc(18), paddingVertical: sc(14), marginBottom: sc(6) },
  availLeft: { flexDirection: 'row', alignItems: 'center', gap: sc(10) },
  availIconCircle: { width: sc(40), height: sc(40), borderRadius: sc(20), alignItems: 'center', justifyContent: 'center' },
  availTitle: { fontSize: sc(14), fontWeight: '700' },
  availDesc: { fontSize: sc(11), marginTop: sc(2) },

  scheduleCard: { borderRadius: sc(14), padding: sc(14), marginBottom: sc(10) },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', gap: sc(10) },
  scheduleIconWrap: { width: sc(36), height: sc(36), borderRadius: sc(18), alignItems: 'center', justifyContent: 'center' },
  scheduleTitle: { fontSize: sc(14), fontWeight: '700' },
  scheduleDesc: { fontSize: sc(11), marginTop: sc(2) },

  statsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: sc(12), marginBottom: sc(10) },
  statsTitle: { fontSize: sc(16), fontWeight: '700' },
  filterRow: { flexDirection: 'row', gap: sc(6) },
  filterBtn: { paddingHorizontal: sc(10), paddingVertical: sc(6), borderRadius: sc(20) },
  filterText: { fontSize: sc(10), fontWeight: '600' },
  statRow: { flexDirection: 'row', gap: sc(10), marginBottom: sc(10) },
  statCard: { flex: 1, borderRadius: sc(14), padding: sc(16), alignItems: 'center' },
  statNumber: { fontSize: sc(24), fontWeight: '800', marginTop: sc(4) },
  statLabel: { fontSize: sc(10), marginTop: sc(2) },

  earningsCard: { borderRadius: sc(14), padding: sc(18), marginBottom: sc(10) },
  earningsHeader: { flexDirection: 'row', alignItems: 'center', gap: sc(6), marginBottom: sc(8) },
  earningsTitle: { fontSize: sc(12), fontWeight: '600' },
  earningsTotal: { fontSize: sc(32), fontWeight: '800', letterSpacing: -1 },
  earningsLabel: { fontSize: sc(10), marginBottom: sc(12) },
  earningsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  earningsSubTitle: { fontSize: sc(14), fontWeight: '700' },
  earningsSubLabel: { fontSize: sc(10) },
  payoutBtn: { flexDirection: 'row', alignItems: 'center', gap: sc(4) },
  payoutBtnText: { fontSize: sc(12), fontWeight: '600' },

  commentsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: sc(10), marginBottom: sc(10) },
  commentsTitle: { fontSize: sc(16), fontWeight: '700' },
  commentTime: { fontSize: sc(11), fontWeight: '500' },
  seeAll: { fontSize: sc(12), fontWeight: '600' },
  commentCard: { flexDirection: 'row', gap: sc(12), borderRadius: sc(14), padding: sc(14), marginBottom: sc(8) },
  commentContent: { flex: 1 },
  commentTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stars: { flexDirection: 'row', gap: sc(2), marginVertical: sc(2) },
  commentText: { fontSize: sc(12), lineHeight: sc(17) },

  quickTitle: { fontSize: sc(16), fontWeight: '700', marginTop: sc(10), marginBottom: sc(10) },
  quickGrid: { gap: sc(10), marginBottom: sc(20) },
  quickCard: { borderRadius: sc(14), padding: sc(16), gap: sc(6) },
  quickCardTitle: { fontSize: sc(13), fontWeight: '700' },
  quickCardDesc: { fontSize: sc(11) },

  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: sc(10), borderTopLeftRadius: sc(32), borderTopRightRadius: sc(32), borderTopWidth: 1 },
  navItem: { alignItems: 'center', paddingVertical: sc(6), paddingHorizontal: sc(18), borderRadius: sc(20), minHeight: 44, justifyContent: 'center' },
  navItemActive: { alignItems: 'center', paddingVertical: sc(6), paddingHorizontal: sc(18), borderRadius: sc(20), minHeight: 44, justifyContent: 'center' },
  navLabel: { fontSize: sc(10), fontWeight: '600', marginTop: 2 },
  navLabelActive: { fontSize: sc(10), fontWeight: '600', marginTop: 2 },
});
