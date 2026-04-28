import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  getMyFundraisers,
  updateMyFundraiser,
  deleteMyFundraiser,
  getCommentsForFundraiser,
  getReplies,
  MyFundraiser,
} from '../utils/donations';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const STATUS_COLORS: Record<string, string> = {
  active: '#34C759',
  paused: '#FF9500',
  completed: '#007AFF',
  draft: '#8E8E93',
};

// ── Pixel Grid Graph (rows x cols, fills bottom-up, left-right) ──
const PixelGrid = ({ value, max, cols, color }: { value: number; max: number; cols: number; color: string }) => {
  const rows = 5;
  const total = cols * rows;
  const filledCount = max > 0 ? Math.round((value / max) * total) : 0;
  return (
    <View style={styles.pixelGrid}>
      {Array.from({ length: rows }).map((_, r) => (
        <View key={r} style={styles.pixelGridRow}>
          {Array.from({ length: cols }).map((__, c) => {
            const dotIdx = (rows - 1 - r) * cols + c;
            const isFilled = dotIdx < filledCount;
            return (
              <View
                key={c}
                style={[
                  styles.pixelGridDot,
                  { backgroundColor: isFilled ? color : color + '14' },
                ]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

// ── Pixel Bar (horizontal strip) ──
const PixelBar = ({ pct, color, count = 30 }: { pct: number; color: string; count?: number }) => (
  <View style={styles.pixelBarRow}>
    {Array.from({ length: count }).map((_, i) => (
      <View
        key={i}
        style={[styles.pixelBarDot, { backgroundColor: (i / count) * 100 < pct ? color : color + '14' }]}
      />
    ))}
  </View>
);

// ── Pixel Donut (circular progress) ──
const PixelDonut = ({ pct, color, size = 140 }: { pct: number; color: string; size?: number }) => {
  const segments = 24;
  const filled = Math.round((pct / 100) * segments);

  return (
    <View style={[styles.donutContainer, { width: size, height: size }]}>
      {Array.from({ length: segments }).map((_, i) => {
        const angle = (i / segments) * 360 - 90;
        const isFilled = i < filled;
        const radius = size * 0.42;
        const dotSize = size * 0.1;
        const x = radius * Math.cos((angle * Math.PI) / 180) + size / 2 - dotSize / 2;
        const y = radius * Math.sin((angle * Math.PI) / 180) + size / 2 - dotSize / 2;

        return (
          <View
            key={i}
            style={[
              styles.donutDot,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 4,
                backgroundColor: isFilled ? color : color + '12',
                transform: [{ translateX: x }, { translateY: y }],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

// ── Clean Professional Analytics Screen ──
function AnalyticsScreen({ fund, data, onClose, colors }: { fund: MyFundraiser; data: { comments: number; replies: number; pct: number; raisedAmount: number; donorCount: number; commenters: { name: string; amount: number; type: string }[] }; onClose: () => void; colors: any }) {
  const insets = useSafeAreaInsets();
  const fmt = (n: number) => `$${n.toLocaleString('en-US')}`;
  const totalActivity = data.comments + data.replies;
  const statusColor = STATUS_COLORS[fund.status] || colors.outlineVariant;

  return (
    <View style={[styles.analyticsRoot, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.background === '#1a1c1a' ? 'light' : 'dark'} />

      {/* Minimal Header */}
      <View style={[styles.analyticsHeader, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
          <Ionicons name="close" size={sc(24)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Analytics</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.analyticsScroll} showsVerticalScrollIndicator={false}>
        {/* Hero Card - Large Progress */}
        <View style={[styles.heroCard, { backgroundColor: colors.surfaceContainerLow }]}>
          <View style={styles.heroTop}>
            <Text style={[styles.heroTitle, { color: colors.onSurface }]} numberOfLines={2}>{fund.title}</Text>
            <View style={[styles.heroBadge, { backgroundColor: statusColor + '15' }]}>
              <Text style={[styles.heroBadgeText, { color: statusColor }]}>{fund.status}</Text>
            </View>
          </View>

          {/* Large Progress Circle */}
          <View style={styles.heroProgress}>
            <PixelDonut pct={data.pct} color={colors.primary} size={sc(140)} />
            <View style={styles.heroCenter}>
              <Text style={[styles.heroPct, { color: colors.onSurface }]}>{data.pct}%</Text>
              <Text style={[styles.heroPctLabel, { color: colors.onSurfaceVariant }]}>to goal</Text>
            </View>
          </View>

          {/* Raised Amount */}
          <View style={styles.heroAmounts}>
            <Text style={[styles.heroRaised, { color: colors.onSurface }]}>{fmt(data.raisedAmount)}</Text>
            <Text style={[styles.heroGoal, { color: colors.onSurfaceVariant }]}>raised of {fmt(fund.goalAmount)}</Text>
          </View>
        </View>

        {/* Stats Row - Horizontal */}
        <View style={styles.statsRow}>
          <View style={[styles.statItem, { backgroundColor: colors.surfaceContainerLow }]}>
            <Ionicons name="people" size={sc(18)} color={colors.primary} style={styles.statItemIcon} />
            <Text style={[styles.statItemValue, { color: colors.onSurface }]}>{data.donorCount}</Text>
            <Text style={[styles.statItemLabel, { color: colors.onSurfaceVariant }]}>Donors</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.surfaceContainerLow }]}>
            <Ionicons name="chatbubble" size={sc(18)} color={colors.secondary} style={styles.statItemIcon} />
            <Text style={[styles.statItemValue, { color: colors.onSurface }]}>{data.comments}</Text>
            <Text style={[styles.statItemLabel, { color: colors.onSurfaceVariant }]}>Comments</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.surfaceContainerLow }]}>
            <Ionicons name="return-down-back" size={sc(18)} color={colors.tertiary} style={styles.statItemIcon} />
            <Text style={[styles.statItemValue, { color: colors.onSurface }]}>{data.replies}</Text>
            <Text style={[styles.statItemLabel, { color: colors.onSurfaceVariant }]}>Replies</Text>
          </View>
        </View>

        {/* Engagement Card */}
        <View style={[styles.engagementCard, { backgroundColor: colors.surfaceContainerLow }]}>
          <View style={styles.engagementHeader}>
            <Text style={[styles.engagementTitle, { color: colors.onSurface }]}>Engagement</Text>
            <Text style={[styles.engagementTotal, { color: colors.onSurfaceVariant }]}>{totalActivity} total</Text>
          </View>

          {/* Single Horizontal Bar */}
          <View style={styles.engagementBar}>
            <View style={[styles.engagementTrack, { backgroundColor: colors.outlineVariant + '15' }]}>
              {totalActivity > 0 ? (
                <>
                  <View style={[styles.engagementFill, { width: `${(data.comments / totalActivity) * 100}%`, backgroundColor: colors.secondary }]} />
                  <View style={[styles.engagementFill, { width: `${(data.replies / totalActivity) * 100}%`, backgroundColor: colors.tertiary }]} />
                </>
              ) : (
                <View style={[styles.engagementFill, { width: '100%', backgroundColor: colors.outlineVariant + '25' }]} />
              )}
            </View>
          </View>

          {/* Legend Row */}
          <View style={styles.engagementLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
              <Text style={[styles.legendText, { color: colors.onSurfaceVariant }]}>Comments</Text>
              <Text style={[styles.legendValue, { color: colors.onSurface }]}>{data.comments}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.tertiary }]} />
              <Text style={[styles.legendText, { color: colors.onSurfaceVariant }]}>Replies</Text>
              <Text style={[styles.legendValue, { color: colors.onSurface }]}>{data.replies}</Text>
            </View>
          </View>
        </View>

        {/* Recent Supporters */}
        {data.commenters.length > 0 && (
          <View style={styles.supportersSection}>
            <Text style={[styles.sectionHeading, { color: colors.onSurface }]}>Recent Supporters</Text>
            <View style={[styles.supportersList, { backgroundColor: colors.surfaceContainerLow }]}>
              {data.commenters.slice(0, 5).map((c, i) => (
                <View
                  key={i}
                  style={[
                    styles.supporterRow,
                    i < Math.min(data.commenters.slice(0, 5).length, 5) - 1 && { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant + '15' },
                  ]}
                >
                  <View style={[styles.supporterAvatar, { backgroundColor: c.type === 'money' ? colors.primary + '12' : colors.tertiary + '12' }]}>
                    <Ionicons name={c.type === 'money' ? 'cash-outline' : 'videocam-outline'} size={sc(16)} color={c.type === 'money' ? colors.primary : colors.tertiary} />
                  </View>
                  <View style={styles.supporterInfo}>
                    <Text style={[styles.supporterName, { color: colors.onSurface }]}>{c.name}</Text>
                    <Text style={[styles.supporterType, { color: colors.onSurfaceVariant }]}>
                      {c.type === 'money' ? 'Donation' : 'Ad view'}
                    </Text>
                  </View>
                  <Text style={[styles.supporterValue, { color: c.type === 'money' ? colors.primary : colors.tertiary }]}>
                    {c.type === 'money' ? fmt(c.amount) : 'Ad'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.analyticsFooter}>
          <Text style={[styles.footerText, { color: colors.onSurfaceVariant }]}>
            Created {new Date(fund.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
        <View style={{ height: sc(32) }} />
      </ScrollView>
    </View>
  );
}

// ── Main Screen ──
export default function ManageFundraisersScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = theme;
  const [fundraisers, setFundraisers] = useState<MyFundraiser[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [analyticsFund, setAnalyticsFund] = useState<MyFundraiser | null>(null);
  const [analyticsData, setAnalyticsData] = useState<{ comments: number; replies: number; pct: number; raisedAmount: number; donorCount: number; commenters: { name: string; amount: number; type: string }[] } | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const data = await getMyFundraisers();
    setFundraisers(data);
  };

  const openAnalytics = async (fund: MyFundraiser) => {
    setAnalyticsLoading(true);
    setAnalyticsFund(fund);

    // Reload fresh data so raisedAmount/donorCount reflect latest donations
    const freshList = await getMyFundraisers();
    const freshFund = freshList.find((f) => f.id === fund.id) || fund;

    // Use getCommentsForFundraiser for robust comment retrieval (includes title fallback)
    const cms = await getCommentsForFundraiser(freshFund.id);

    let totalReplies = 0;
    const commenters: { name: string; amount: number; type: string }[] = [];
    let totalRaisedFromComments = 0;
    for (const c of cms) {
      const replies = await getReplies(c.id);
      totalReplies += replies.length;
      commenters.push({ name: c.donorName || 'Anonymous', amount: c.amount || 0, type: c.donationType });
      totalRaisedFromComments += c.amount || 0;
    }

    // Use the freshest raisedAmount from storage; fallback to comment sum if needed
    const totalRaised = Math.max(freshFund.raisedAmount || 0, totalRaisedFromComments);
    const donorCount = cms.length > 0
      ? new Set(cms.map((c) => c.donorName || 'Anonymous')).size
      : (freshFund.donorCount || 0);

    const pct = freshFund.goalAmount > 0 ? Math.round((totalRaised / freshFund.goalAmount) * 100) : 0;
    setAnalyticsData({ comments: cms.length, replies: totalReplies, pct, raisedAmount: totalRaised, donorCount, commenters });
    setAnalyticsLoading(false);
  };

  const closeAnalytics = () => {
    setAnalyticsFund(null);
    setAnalyticsData(null);
    setAnalyticsLoading(false);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === fundraisers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(fundraisers.map((f) => f.id)));
    }
  };

  const bulkStatusChange = (status: string) => {
    Alert.alert(
      'Change Status',
      `Set ${selectedIds.size} fundraiser(s) to "${status}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const updated = await Promise.all(
              Array.from(selectedIds).map((id) =>
                updateMyFundraiser(id, { status: status as 'active' | 'paused' | 'completed' | 'draft' })
              )
            );
            const map: Record<string, MyFundraiser> = {};
            updated.filter(Boolean).forEach((f) => { if (f) map[f.id] = f; });
            setFundraisers((prev) => prev.map((f) => map[f.id] || f));
            setSelectedIds(new Set());
          },
        },
      ]
    );
  };

  const bulkDelete = () => {
    Alert.alert(
      'Delete Fundraisers',
      `Delete ${selectedIds.size} fundraiser(s)? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await Promise.all(Array.from(selectedIds).map((id) => deleteMyFundraiser(id)));
            setFundraisers((prev) => prev.filter((f) => !selectedIds.has(f.id)));
            setSelectedIds(new Set());
          },
        },
      ]
    );
  };

  const fmt = (n: number) => `$${n.toLocaleString('en-US')}`;
  const isSelecting = selectedIds.size > 0;

  // Show analytics screen when data is ready
  if (analyticsFund && analyticsData && !analyticsLoading) {
    return <AnalyticsScreen fund={analyticsFund} data={analyticsData} onClose={closeAnalytics} colors={colors} />;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.onSurface }]}>Manage Campaigns</Text>
        <TouchableOpacity onPress={toggleSelectAll} activeOpacity={0.7}>
          <Text style={[styles.selectText, { color: colors.primary }]}>
            {isSelecting ? 'Deselect' : 'Select All'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>


        {/* Campaign List */}
        {fundraisers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="albums-outline" size={sc(56)} color={colors.outlineVariant} />
            <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>No campaigns yet</Text>
            <Text style={[styles.emptySub, { color: colors.onSurfaceVariant }]}>Create your first fundraiser</Text>
          </View>
        ) : (
          fundraisers.map((f) => {
            const isSelected = selectedIds.has(f.id);
            const pct = f.goalAmount > 0 ? Math.round((f.raisedAmount / f.goalAmount) * 100) : 0;
            const statusColor = STATUS_COLORS[f.status] || colors.outlineVariant;
            return (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.campaignCard,
                  { backgroundColor: colors.surfaceContainerLow },
                  isSelected && { borderColor: colors.primary, borderWidth: 2 },
                ]}
                onPress={() => {
                  if (isSelecting) toggleSelect(f.id);
                  else openAnalytics(f);
                }}
                onLongPress={() => toggleSelect(f.id)}
                activeOpacity={0.85}
              >
                <View style={styles.cardTopRow}>
                  <View style={[styles.checkbox, {
                    borderColor: isSelected ? colors.primary : colors.outlineVariant,
                    backgroundColor: isSelected ? colors.primary : 'transparent',
                  }]}>
                    {isSelected && <Ionicons name="checkmark" size={sc(12)} color={colors.onPrimary} />}
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, { color: colors.onSurface }]} numberOfLines={1}>{f.title}</Text>
                    <Text style={[styles.cardSub, { color: colors.onSurfaceVariant }]}>{fmt(f.raisedAmount)} / {fmt(f.goalAmount)}</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: statusColor + '18' }]}>
                    <View style={[styles.statusPillDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusPillText, { color: statusColor }]}>{f.status}</Text>
                  </View>
                </View>
                <PixelBar pct={pct} color={statusColor} count={20} />
                <View style={styles.cardMeta}>
                  <Text style={[styles.cardDonors, { color: colors.onSurfaceVariant }]}>{f.donorCount} donor{f.donorCount !== 1 ? 's' : ''}</Text>
                  <Text style={[styles.cardPct, { color: statusColor }]}>{pct}%</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: sc(60) }} />
      </ScrollView>

      {/* Floating Bulk Action Bar */}
      {isSelecting && (
        <View style={[styles.floatingActionBar, { 
          backgroundColor: theme.isDark ? '#2A2A2A' : '#FFFFFF', 
          bottom: Math.max(insets.bottom + sc(20), sc(40)),
          shadowColor: theme.isDark ? '#000' : '#888',
        }]}>
          <View style={styles.floatingActionLeft}>
            <View style={[styles.floatingActionBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.floatingActionBadgeText}>{selectedIds.size}</Text>
            </View>
            <Text style={[styles.floatingActionTitle, { color: colors.onSurface }]}>Selected</Text>
          </View>

          <View style={styles.floatingActionDivider} />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.floatingActionScroll}>
            {(['active', 'paused', 'completed', 'draft'] as string[]).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.floatingActionBtn, { backgroundColor: colors.surfaceContainerHigh }]}
                onPress={() => bulkStatusChange(s)}
                activeOpacity={0.7}
              >
                <View style={[styles.floatingActionDot, { backgroundColor: STATUS_COLORS[s] }]} />
                <Text style={[styles.floatingActionText, { color: colors.onSurface }]}>{s}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.floatingActionBtn, { backgroundColor: colors.error + '15' }]} onPress={bulkDelete} activeOpacity={0.7}>
              <Ionicons name="trash" size={sc(14)} color={colors.error} />
              <Text style={[styles.floatingActionText, { color: colors.error }]}>Delete</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(20), paddingVertical: sc(12) },
  topTitle: { fontSize: sc(16), fontWeight: '700' },
  selectText: { fontSize: sc(13), fontWeight: '600' },
  content: { paddingHorizontal: sc(16), paddingTop: sc(8) },

  // Floating Action Bar
  floatingActionBar: {
    position: 'absolute',
    left: sc(16),
    right: sc(16),
    borderRadius: sc(100),
    padding: sc(8),
    paddingLeft: sc(16),
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  floatingActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: sc(12),
  },
  floatingActionBadge: {
    width: sc(24),
    height: sc(24),
    borderRadius: sc(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: sc(8),
  },
  floatingActionBadgeText: {
    color: '#FFF',
    fontSize: sc(12),
    fontWeight: '800',
  },
  floatingActionTitle: {
    fontSize: sc(13),
    fontWeight: '700',
  },
  floatingActionDivider: {
    width: 1,
    height: sc(24),
    backgroundColor: '#88888840',
    marginRight: sc(12),
  },
  floatingActionScroll: {
    flex: 1,
  },
  floatingActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sc(6),
    borderRadius: sc(20),
    paddingHorizontal: sc(16),
    paddingVertical: sc(10),
    marginRight: sc(8),
  },
  floatingActionDot: {
    width: sc(8),
    height: sc(8),
    borderRadius: sc(4),
  },
  floatingActionText: {
    fontSize: sc(13),
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Campaign card
  campaignCard: { borderRadius: sc(14), padding: sc(14), marginBottom: sc(8) },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: sc(10), marginBottom: sc(10) },
  checkbox: { width: sc(22), height: sc(22), borderRadius: sc(6), borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: sc(14), fontWeight: '700' },
  cardSub: { fontSize: sc(11), marginTop: sc(2) },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: sc(6) },
  cardDonors: { fontSize: sc(10) },
  cardPct: { fontSize: sc(10), fontWeight: '700' },

  // Status pill
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: sc(4), borderRadius: sc(10), paddingHorizontal: sc(8), paddingVertical: sc(3) },
  statusPillDot: { width: sc(6), height: sc(6), borderRadius: sc(3) },
  statusPillText: { fontSize: sc(9), fontWeight: '700', textTransform: 'capitalize' },

  // Pixel bar
  pixelBarRow: { flexDirection: 'row', gap: sc(2) },
  pixelBarDot: { flex: 1, height: sc(4), borderRadius: sc(2) },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: sc(60) },
  emptyTitle: { fontSize: sc(18), fontWeight: '700', marginTop: sc(12) },
  emptySub: { fontSize: sc(13), marginTop: sc(4) },

  // Pixel grid
  pixelGrid: { gap: sc(2) },
  pixelGridRow: { flexDirection: 'row', gap: sc(2), justifyContent: 'center' },
  pixelGridDot: { width: sc(10), height: sc(10), borderRadius: sc(2) },

  // ── Clean Analytics Styles ──
  analyticsRoot: { flex: 1 },
  analyticsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(20), paddingVertical: sc(12) },
  headerBtn: { width: sc(40), height: sc(40), alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: sc(17), fontWeight: '600' },
  analyticsScroll: { paddingHorizontal: sc(16) },

  // Hero Card
  heroCard: { borderRadius: sc(24), padding: sc(24), marginBottom: sc(16), alignItems: 'center' },
  heroTop: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: sc(16) },
  heroTitle: { fontSize: sc(16), fontWeight: '700', flex: 1, marginRight: sc(12), lineHeight: sc(22) },
  heroBadge: { borderRadius: sc(12), paddingHorizontal: sc(10), paddingVertical: sc(4) },
  heroBadgeText: { fontSize: sc(10), fontWeight: '700', textTransform: 'capitalize' },

  heroProgress: { width: sc(140), height: sc(140), alignItems: 'center', justifyContent: 'center', marginVertical: sc(8) },
  heroCenter: { position: 'absolute', alignItems: 'center' },
  heroPct: { fontSize: sc(32), fontWeight: '800' },
  heroPctLabel: { fontSize: sc(12), marginTop: sc(-2) },

  heroAmounts: { alignItems: 'center', marginTop: sc(8) },
  heroRaised: { fontSize: sc(24), fontWeight: '800' },
  heroGoal: { fontSize: sc(13), marginTop: sc(2) },

  // Stats Row
  statsRow: { flexDirection: 'row', gap: sc(10), marginBottom: sc(16) },
  statItem: { flex: 1, borderRadius: sc(16), padding: sc(14), alignItems: 'center' },
  statItemIcon: { marginBottom: sc(6) },
  statItemValue: { fontSize: sc(20), fontWeight: '800' },
  statItemLabel: { fontSize: sc(10), marginTop: sc(2), textTransform: 'uppercase', letterSpacing: 0.5 },

  // Engagement Card
  engagementCard: { borderRadius: sc(20), padding: sc(20), marginBottom: sc(16) },
  engagementHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: sc(16) },
  engagementTitle: { fontSize: sc(15), fontWeight: '700' },
  engagementTotal: { fontSize: sc(13), fontWeight: '500' },

  engagementBar: { marginBottom: sc(16) },
  engagementTrack: { height: sc(10), borderRadius: sc(5), overflow: 'hidden', flexDirection: 'row' },
  engagementFill: { height: '100%' },

  engagementLegend: { flexDirection: 'row', gap: sc(24) },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: sc(8) },
  legendDot: { width: sc(10), height: sc(10), borderRadius: sc(3) },
  legendText: { fontSize: sc(12), fontWeight: '500' },
  legendValue: { fontSize: sc(12), fontWeight: '700', marginLeft: sc(4) },

  // Supporters
  supportersSection: { marginBottom: sc(16) },
  sectionHeading: { fontSize: sc(15), fontWeight: '700', marginBottom: sc(12), paddingHorizontal: sc(4) },
  supportersList: { borderRadius: sc(20), padding: sc(8) },
  supporterRow: { flexDirection: 'row', alignItems: 'center', padding: sc(12) },
  supporterAvatar: { width: sc(40), height: sc(40), borderRadius: sc(12), alignItems: 'center', justifyContent: 'center' },
  supporterInfo: { flex: 1, marginLeft: sc(12) },
  supporterName: { fontSize: sc(14), fontWeight: '600' },
  supporterType: { fontSize: sc(11), marginTop: sc(1) },
  supporterValue: { fontSize: sc(14), fontWeight: '700' },

  // Footer
  analyticsFooter: { marginTop: sc(8), alignItems: 'center' },
  footerText: { fontSize: sc(11), fontWeight: '500' },

  // Pixel Donut
  donutContainer: { position: 'relative' },
  donutDot: { position: 'absolute' },
});
