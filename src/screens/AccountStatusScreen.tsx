import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

// Dummy data — replace with real backend data
const accountHistory = [
  {
    id: 1,
    type: 'warning',
    title: 'Warning Issued',
    description: 'Reported by a talker for dismissive tone during session. First warning — no penalty applied.',
    date: 'Apr 8, 2025',
    icon: 'warning',
    color: '#FF9800',
  },
  {
    id: 2,
    type: 'strike',
    title: 'Strike Received',
    description: 'Reported for sharing personal contact information. This violates platform policy. 1 of 3 strikes.',
    date: 'Mar 22, 2025',
    icon: 'alert-circle',
    color: '#F44336',
  },
  {
    id: 3,
    type: 'tempban',
    title: 'Temporary Suspension',
    description: 'Account suspended for 3 days due to repeated policy violations. Suspended from Mar 23 – Mar 26.',
    date: 'Mar 23, 2025',
    icon: 'ban',
    color: '#E91E63',
  },
  {
    id: 4,
    type: 'resolved',
    title: 'Strike Resolved',
    description: 'Your earlier warning has been resolved after 30 days of good standing. Well done!',
    date: 'May 9, 2025',
    icon: 'checkmark-circle',
    color: '#4CAF50',
  },
];

const overallStatus = 'good'; // 'good' | 'warning' | 'strike' | 'suspended'

const statusConfig = {
  good: {
    label: 'Good Standing',
    icon: 'shield-checkmark',
    color: '#4CAF50',
    bg: '#4CAF501A',
    desc: 'Your account is in good standing. Keep up the great work as a listener!',
  },
  warning: {
    label: 'Warning Active',
    icon: 'warning',
    color: '#FF9800',
    bg: '#FF98001A',
    desc: 'You have an active warning. Repeated violations may result in strikes or suspension.',
  },
  strike: {
    label: 'Strike on Record',
    icon: 'alert-circle',
    color: '#F44336',
    bg: '#F443361A',
    desc: 'You have 1 of 3 strikes. Another 2 strikes will result in a temporary or permanent ban.',
  },
  suspended: {
    label: 'Account Suspended',
    icon: 'ban',
    color: '#E91E63',
    bg: '#E91E631A',
    desc: 'Your account is currently suspended. You cannot receive calls during this period.',
  },
};

export default function AccountStatusScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = theme;
  const status = statusConfig[overallStatus as keyof typeof statusConfig];

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.surfaceContainerLow }]} activeOpacity={0.5}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.onSurface }]}>Account Status</Text>
        <View style={{ width: sc(38) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Overall Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: status.bg }]}>
          <View style={[styles.statusIconWrap, { backgroundColor: status.color + '22' }]}>
            <Ionicons name={status.icon as any} size={sc(32)} color={status.color} />
          </View>
          <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
          <Text style={[styles.statusDesc, { color: colors.onSurfaceVariant }]}>{status.desc}</Text>
        </View>

        {/* Strike Counter */}
        <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}>
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Strike Progress</Text>
          <Text style={[styles.cardSub, { color: colors.onSurfaceVariant }]}>3 strikes and your account will be permanently banned</Text>
          <View style={styles.strikeRow}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.strikeDot, { backgroundColor: i < 1 ? colors.error : colors.surfaceContainerHigh }]}>
                {i < 1 && <Ionicons name="close" size={sc(12)} color={colors.onError} />}
              </View>
            ))}
          </View>
          <Text style={[styles.strikeText, { color: colors.onSurfaceVariant }]}>1 of 3 strikes used</Text>
        </View>

        {/* Violation History */}
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Account History</Text>
        {accountHistory.map((item) => (
          <View key={item.id} style={[styles.historyCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.historyHeader}>
              <View style={[styles.historyIcon, { backgroundColor: item.color + '1A' }]}>
                <Ionicons name={item.icon as any} size={sc(16)} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.historyTitle, { color: colors.onSurface }]}>{item.title}</Text>
                <Text style={[styles.historyDate, { color: colors.onSurfaceVariant }]}>{item.date}</Text>
              </View>
              <View style={[styles.historyBadge, { backgroundColor: item.color + '1A' }]}>
                <Text style={[styles.historyBadgeText, { color: item.color }]}>{item.type.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={[styles.historyDesc, { color: colors.onSurfaceVariant }]}>{item.description}</Text>
          </View>
        ))}

        <View style={{ height: sc(40) }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(18), paddingBottom: sc(12), paddingTop: sc(8) },
  backButton: { width: sc(38), height: sc(38), borderRadius: sc(19), alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: sc(16), fontWeight: '700', letterSpacing: -0.3 },
  scrollContent: { paddingHorizontal: sc(18), paddingTop: sc(8), paddingBottom: sc(20) },

  // Status Banner
  statusBanner: { borderRadius: sc(16), padding: sc(20), alignItems: 'center', marginBottom: sc(14) },
  statusIconWrap: { width: sc(56), height: sc(56), borderRadius: sc(28), alignItems: 'center', justifyContent: 'center', marginBottom: sc(10) },
  statusLabel: { fontSize: sc(18), fontWeight: '800', marginBottom: sc(4) },
  statusDesc: { fontSize: sc(12), lineHeight: sc(18), textAlign: 'center' },

  // Strike Card
  card: { borderRadius: sc(14), padding: sc(16), marginBottom: sc(14) },
  cardTitle: { fontSize: sc(14), fontWeight: '700', marginBottom: sc(2) },
  cardSub: { fontSize: sc(11), marginBottom: sc(12) },
  strikeRow: { flexDirection: 'row', gap: sc(8), marginBottom: sc(6) },
  strikeDot: { width: sc(28), height: sc(28), borderRadius: sc(14), alignItems: 'center', justifyContent: 'center' },
  strikeText: { fontSize: sc(11), fontWeight: '600' },

  // History
  sectionTitle: { fontSize: sc(14), fontWeight: '700', marginBottom: sc(8) },
  historyCard: { borderRadius: sc(14), padding: sc(14), marginBottom: sc(10) },
  historyHeader: { flexDirection: 'row', alignItems: 'center', gap: sc(8), marginBottom: sc(8) },
  historyIcon: { width: sc(30), height: sc(30), borderRadius: sc(15), alignItems: 'center', justifyContent: 'center' },
  historyTitle: { fontSize: sc(13), fontWeight: '700' },
  historyDate: { fontSize: sc(10) },
  historyBadge: { paddingHorizontal: sc(8), paddingVertical: sc(4), borderRadius: sc(8) },
  historyBadgeText: { fontSize: sc(9), fontWeight: '700', letterSpacing: 1 },
  historyDesc: { fontSize: sc(11), lineHeight: sc(16) },
});
