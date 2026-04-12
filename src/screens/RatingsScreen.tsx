import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const allRatings = [
  { name: 'Calm', avatar: '🌿', rating: 5, text: 'Felt truly heard. Thank you for your gentle presence.', time: '2 hours ago', tags: ['Warm', 'Helpful'] },
  { name: 'Sky', avatar: '☁️', rating: 4, text: 'Good listener, gentle presence. Made me feel comfortable.', time: '5 hours ago', tags: ['Patient'] },
  { name: 'Stone', avatar: '🪨', rating: 5, text: 'Helped me through a tough moment. Really appreciate it.', time: '1 day ago', tags: ['Warm', 'Helpful', 'Quick'] },
  { name: 'River', avatar: '🌊', rating: 5, text: 'Very patient and kind. I felt safe sharing.', time: '2 days ago', tags: ['Warm'] },
  { name: 'Fern', avatar: '🍃', rating: 3, text: 'It was okay. Could have been more engaged.', time: '3 days ago', tags: [] },
  { name: 'Dawn', avatar: '🌅', rating: 5, text: 'Exactly what I needed. Thank you for listening.', time: '4 days ago', tags: ['Helpful', 'Warm'] },
  { name: 'Ash', avatar: '🍂', rating: 4, text: 'Nice experience overall. Felt heard.', time: '5 days ago', tags: ['Patient'] },
  { name: 'Cedar', avatar: '🌲', rating: 5, text: 'Amazing listener. I felt so much better after.', time: '6 days ago', tags: ['Warm', 'Helpful', 'Quick'] },
];

const ratingDistribution = [
  { stars: 5, count: 78, pct: 0.65 },
  { stars: 4, count: 28, pct: 0.23 },
  { stars: 3, count: 10, pct: 0.08 },
  { stars: 2, count: 3, pct: 0.03 },
  { stars: 1, count: 1, pct: 0.01 },
];

export default function RatingsScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [filter, setFilter] = useState<'all' | 5 | 4 | 3 | 2 | 1>('all');

  const avgRating = 4.7;
  const totalRatings = 120;

  const filtered = filter === 'all' ? allRatings : allRatings.filter((r) => r.rating === filter);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.surfaceContainerLow }]} activeOpacity={0.5}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.onSurface }]}>Ratings & Feedback</Text>
        <View style={{ width: sc(38) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Rating Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surfaceContainerLow }]}>
          <View style={styles.summaryLeft}>
            <Text style={[styles.bigRating, { color: colors.primary }]}>{avgRating}</Text>
            <View style={styles.summaryStars}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons
                  key={s}
                  name={s <= Math.round(avgRating) ? 'star' : 'star-half' as any}
                  size={sc(16)}
                  color={colors.tertiary}
                />
              ))}
            </View>
            <Text style={[styles.totalRatings, { color: colors.onSurfaceVariant }]}>{totalRatings} total ratings</Text>
          </View>
          <View style={styles.distribution}>
            {ratingDistribution.map((row) => (
              <View key={row.stars} style={styles.distRow}>
                <Text style={[styles.distStarLabel, { color: colors.onSurfaceVariant }]}>{row.stars}</Text>
                <Ionicons name="star" size={sc(10)} color={colors.tertiary} />
                <View style={[styles.distBar, { backgroundColor: colors.surfaceContainerHigh }]}>
                  <View style={[styles.distBarFill, { width: `${row.pct * 100}%`, backgroundColor: colors.tertiary }]} />
                </View>
                <Text style={[styles.distCount, { color: colors.onSurfaceVariant }]}>{row.count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {(['all', 5, 4, 3, 2, 1] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, { backgroundColor: filter === f ? colors.primaryContainer : colors.surfaceContainerHigh }]}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}
            >
              {f === 'all' ? (
                <Text style={[styles.filterText, { color: filter === 'all' ? colors.onPrimaryContainer : colors.onSurfaceVariant }]}>All</Text>
              ) : (
                <View style={styles.filterWithStar}>
                  <Ionicons name="star" size={sc(10)} color={filter === f ? colors.onPrimaryContainer : colors.tertiary} />
                  <Text style={[styles.filterText, { color: filter === f ? colors.onPrimaryContainer : colors.onSurfaceVariant }]}>{f}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Comments List */}
        {filtered.map((item, i) => (
          <View key={i} style={[styles.commentCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.commentHeader}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons
                    key={s}
                    name={s <= item.rating ? 'star' : 'star-outline'}
                    size={sc(12)}
                    color={s <= item.rating ? colors.tertiary : colors.outlineVariant}
                  />
                ))}
              </View>
              <Text style={[styles.commentTime, { color: colors.onSurfaceVariant }]}>{item.time}</Text>
            </View>
            <Text style={[styles.commentText, { color: colors.onSurfaceVariant }]}>{item.text}</Text>
            {item.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {item.tags.map((tag, j) => (
                  <View key={j} style={[styles.tag, { backgroundColor: colors.primaryContainer + '33' }]}>
                    <Text style={[styles.tagText, { color: colors.onPrimaryContainer }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(18), paddingBottom: sc(12), paddingTop: sc(8) },
  backButton: { width: sc(38), height: sc(38), borderRadius: sc(19), alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: sc(16), fontWeight: '700', letterSpacing: -0.3 },
  scrollContent: { paddingHorizontal: sc(18), paddingTop: sc(8), paddingBottom: sc(40) },

  summaryCard: { borderRadius: sc(16), padding: sc(18), marginBottom: sc(10), flexDirection: 'row', gap: sc(14) },
  summaryLeft: { alignItems: 'center' },
  bigRating: { fontSize: sc(36), fontWeight: '800', letterSpacing: -1 },
  summaryStars: { flexDirection: 'row', gap: sc(2), marginTop: sc(2) },
  totalRatings: { fontSize: sc(10), marginTop: sc(4) },
  distribution: { flex: 1 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: sc(4), marginBottom: sc(4) },
  distStarLabel: { fontSize: sc(10), fontWeight: '600', width: sc(10), textAlign: 'center' },
  distBar: { flex: 1, height: sc(6), borderRadius: sc(3) },
  distBarFill: { height: '100%', borderRadius: sc(3) },
  distCount: { fontSize: sc(10), width: sc(20), textAlign: 'right' },

  filterRow: { gap: sc(6), marginBottom: sc(10) },
  filterBtn: { paddingHorizontal: sc(12), paddingVertical: sc(6), borderRadius: sc(20) },
  filterText: { fontSize: sc(11), fontWeight: '600' },
  filterWithStar: { flexDirection: 'row', alignItems: 'center', gap: sc(3) },

  commentCard: { borderRadius: sc(14), padding: sc(16), marginBottom: sc(10) },
  commentHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: sc(10), marginBottom: sc(8) },
  commentAvatar: { width: sc(36), height: sc(36), borderRadius: sc(18), alignItems: 'center', justifyContent: 'center' },
  commentEmoji: { fontSize: sc(18) },
  commentNameRow: { flexDirection: 'row', justifyContent: 'space-between' },
  commentName: { fontSize: sc(12), fontWeight: '700' },
  commentTime: { fontSize: sc(10) },
  stars: { flexDirection: 'row', gap: sc(2), marginTop: sc(2) },
  commentText: { fontSize: sc(12), lineHeight: sc(18) },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: sc(6), marginTop: sc(8) },
  tag: { paddingHorizontal: sc(8), paddingVertical: sc(3), borderRadius: sc(20) },
  tagText: { fontSize: sc(10), fontWeight: '600' },
});
