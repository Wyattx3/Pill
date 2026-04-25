import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import BottomNav from '../components/BottomNav';
import { getFundraisers, getMyFundraisers, getCommentsForFundraiser, getReplies, Fundraiser, MyFundraiser, DonationComment, CommentReply } from '../utils/donations';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function DonationPostDetailScreen({ navigation, route, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const { postId } = route.params || {};
  const [fundraiser, setFundraiser] = useState<Fundraiser | null>(null);
  const [comments, setComments] = useState<(DonationComment & { replies: CommentReply[] })[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [postId])
  );

  const loadData = async () => {
    const fundraisers = await getFundraisers();
    const found = fundraisers.find((f) => f.id === postId);
    if (found) {
      setFundraiser(found);
    } else {
      // Fallback: search in my fundraisers
      const myFundraisers = await getMyFundraisers();
      const myFound = myFundraisers.find((f) => f.id === postId);
      if (myFound) {
        setFundraiser({
          id: myFound.id,
          title: myFound.title,
          description: myFound.description,
          imageUrl: myFound.imageUrl,
          media: myFound.media || [],
          goalAmount: myFound.goalAmount,
          raisedAmount: myFound.raisedAmount,
          creatorName: 'You',
          creatorType: 'individual',
          verificationStatus: 'approved',
          submittedAt: myFound.createdAt,
          isPublished: true,
          giftTiers: [],
        });
      }
    }
    const cms = await getCommentsForFundraiser(postId);

    // Fetch replies for each comment
    const commentsWithReplies = await Promise.all(
      cms.map(async (c) => {
        const replies = await getReplies(c.id);
        return { ...c, replies };
      })
    );
    setComments(commentsWithReplies);
  };

  const progress = fundraiser && fundraiser.goalAmount > 0
    ? Math.min((fundraiser.raisedAmount / fundraiser.goalAmount) * 100, 100)
    : 0;
  const progressFill = fundraiser && fundraiser.raisedAmount > 0 && progress > 0
    ? Math.max(progress, 1)
    : progress;
  const progressLabel = fundraiser && fundraiser.raisedAmount > 0 && progress > 0 && progress < 1
    ? '<1'
    : `${Math.round(progress)}`;

  const formatCurrency = (n: number) =>
    `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (!fundraiser) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={[styles.topBar, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={sc(48)} color={colors.outlineVariant} />
          <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>Fundraiser not found</Text>
        </View>
      </View>
    );
  }

  const hasMedia = fundraiser.media && fundraiser.media.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.onSurface }]}>Fundraiser</Text>
        <View style={{ width: sc(22) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Media */}
        {hasMedia ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaCarousel}>
            {fundraiser.media.map((m, i) => (
              <View key={m.id} style={styles.mediaItem}>
                {m.type === 'video' ? (
                  <View style={[styles.mediaVideo, { backgroundColor: colors.surfaceContainerHigh }]}>
                    <Ionicons name="play-circle" size={sc(56)} color={colors.primary} />
                  </View>
                ) : (
                  <Image source={{ uri: m.uri }} style={styles.mediaImage} />
                )}
              </View>
            ))}
          </ScrollView>
        ) : fundraiser.imageUrl ? (
          <Image source={{ uri: fundraiser.imageUrl }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImagePlaceholder, { backgroundColor: colors.primary + '12' }]}>
            <Ionicons name="heart" size={sc(56)} color={colors.primaryFixedDim} />
          </View>
        )}

        {/* Title & Creator */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.onSurface }]}>{fundraiser.title}</Text>
            {fundraiser.creatorType === 'organization' && (
              <Ionicons name="checkmark-circle" size={sc(20)} color={colors.primary} />
            )}
          </View>
          <View style={styles.creatorRow}>
            <View style={[styles.creatorAvatar, { backgroundColor: colors.surfaceVariant }]}>
              <Ionicons
                name={fundraiser.creatorType === 'organization' ? 'business' : 'person'}
                size={sc(14)}
                color={colors.onSurfaceVariant}
              />
            </View>
            <Text style={[styles.creatorText, { color: colors.onSurfaceVariant }]}>
              {fundraiser.creatorType === 'organization' ? fundraiser.orgName : fundraiser.creatorName}
            </Text>
          </View>
        </View>

        {/* Progress */}
        <View style={[styles.progressSection, { backgroundColor: colors.surfaceContainerLow }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressRaised, { color: colors.primary }]}>
              {formatCurrency(fundraiser.raisedAmount)}
            </Text>
            <Text style={[styles.progressGoal, { color: colors.onSurfaceVariant }]}>
              of {formatCurrency(fundraiser.goalAmount)}
            </Text>
          </View>
          <View style={[styles.progressBg, { backgroundColor: colors.surfaceContainerHigh }]}>
            <LinearGradient
              colors={[colors.primaryDim, colors.primaryFixedDim]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progressFill}%` }]}
            />
          </View>
          <Text style={[styles.progressPct, { color: colors.onSurfaceVariant }]}>
            {progressLabel}% funded
          </Text>
        </View>

        {/* Description */}
        <View style={styles.descSection}>
          <Text style={[styles.descTitle, { color: colors.onSurface }]}>About this fundraiser</Text>
          <Text style={[styles.descText, { color: colors.onSurfaceVariant }]}>
            {fundraiser.description}
          </Text>
        </View>

        {/* Gift Tiers */}
        {fundraiser.giftTiers && fundraiser.giftTiers.length > 0 && (
          <View style={styles.giftSection}>
            <Text style={[styles.giftSectionTitle, { color: colors.onSurface }]}>Gift Rewards</Text>
            {fundraiser.giftTiers.map((tier) => (
              <View key={tier.id} style={styles.giftTierCard}>
                {tier.imageUrl ? (
                  <Image source={{ uri: tier.imageUrl }} style={styles.giftTierImage} />
                ) : (
                  <View style={[styles.giftTierImagePlaceholder, { backgroundColor: colors.surfaceContainerHigh }]}>
                    <Ionicons name="gift-outline" size={sc(18)} color={colors.onSurfaceVariant} />
                  </View>
                )}
                <View style={styles.giftTierInfo}>
                  <Text style={[styles.giftTierTitle, { color: colors.onSurface }]}>{tier.title}</Text>
                  <Text style={[styles.giftTierDesc, { color: colors.onSurfaceVariant }]}>{tier.description}</Text>
                </View>
                <View style={[styles.giftTierBadge, { backgroundColor: colors.surfaceContainer }]}>
                  <Text style={[styles.giftTierBadgeText, { color: colors.primary }]}>
                    ${tier.minAmount}+
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Comments */}
        <View style={styles.commentsSection}>
          <Text style={[styles.commentsTitle, { color: colors.onSurface }]}>
            Recent Support ({comments.length})
          </Text>
          {comments.length === 0 ? (
            <View style={styles.noComments}>
              <Ionicons name="chatbubble-outline" size={sc(28)} color={colors.outlineVariant} />
              <Text style={[styles.noCommentsText, { color: colors.onSurfaceVariant }]}>
                No donations yet. Be the first to support!
              </Text>
            </View>
          ) : (
            comments.slice(0, 10).map((c) => (
              <View key={c.id} style={[styles.commentCard, { backgroundColor: colors.surfaceContainer }]}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentDonor}>
                    {c.donorName ? (
                      <Text style={[styles.commentName, { color: colors.onSurface }]}>{c.donorName}</Text>
                    ) : (
                      <Text style={[styles.commentName, { color: colors.onSurfaceVariant }]}>
                        <Ionicons name="eye-off-outline" size={sc(12)} color={colors.onSurfaceVariant} /> Anonymous
                      </Text>
                    )}
                    <View style={[styles.typeBadge, {
                      backgroundColor: c.donationType === 'money' ? colors.primary + '22' : colors.tertiaryContainer + '33',
                    }]}>
                      <Ionicons
                        name={c.donationType === 'money' ? 'cash-outline' : 'videocam-outline'}
                        size={sc(10)}
                        color={c.donationType === 'money' ? colors.primary : colors.tertiary}
                      />
                      <Text style={[styles.typeText, {
                        color: c.donationType === 'money' ? colors.primary : colors.tertiary,
                      }]}>
                        {c.donationType === 'money' ? formatCurrency(c.amount) : 'Ad'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.commentTime, { color: colors.outlineVariant }]}>
                    {formatTime(c.timestamp)}
                  </Text>
                </View>
                {c.message ? (
                  <Text style={[styles.commentMsg, { color: colors.onSurfaceVariant }]}>{c.message}</Text>
                ) : null}

                {/* Replies */}
                {c.replies.length > 0 && (
                  <View style={styles.repliesContainer}>
                    {c.replies.map((r) => (
                      <View key={r.id} style={[styles.replyItem, { borderLeftColor: colors.primary }]}>
                        <View style={styles.replyHeader}>
                          <Ionicons name="return-down-back" size={sc(12)} color={colors.primary} />
                          <Text style={[styles.replyName, { color: colors.primary }]}>You</Text>
                          <Text style={[styles.replyTime, { color: colors.outlineVariant }]}>{formatTime(r.timestamp)}</Text>
                        </View>
                        <Text style={[styles.replyText, { color: colors.onSurfaceVariant }]}>{r.reply}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        <View style={{ height: sc(100) }} />
      </ScrollView>

      {/* Donate CTA */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12), borderTopColor: colors.outlineVariant + '22', backgroundColor: colors.surface + 'F2' }]}>
        <TouchableOpacity
          style={styles.donateBtn}
          onPress={() => navigation.navigate('DonateScreen', { postId })}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.primaryDim, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.donateBtnInner}
          >
            <Ionicons name="heart" size={sc(18)} color={colors.onPrimary} />
            <Text style={[styles.donateBtnText, { color: colors.onPrimary }]}>Donate Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <BottomNav navigation={navigation} activeScreen="DonationsFeed" theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: sc(16), paddingBottom: sc(12),
  },
  topTitle: { fontSize: sc(16), fontWeight: '700' },
  scrollContent: { paddingHorizontal: sc(16), paddingTop: sc(8) },
  mediaCarousel: { marginBottom: sc(16) },
  mediaItem: { marginRight: sc(8) },
  mediaImage: { width: W - sc(32), height: sc(220), borderRadius: sc(16), resizeMode: 'cover' },
  mediaVideo: {
    width: W - sc(32), height: sc(220), borderRadius: sc(16),
    alignItems: 'center', justifyContent: 'center',
  },
  heroImage: { width: '100%', height: sc(200), borderRadius: sc(16), marginBottom: sc(16), resizeMode: 'cover' },
  heroImagePlaceholder: {
    width: '100%', height: sc(160), borderRadius: sc(16), marginBottom: sc(16),
    alignItems: 'center', justifyContent: 'center',
  },
  header: { marginBottom: sc(16) },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: sc(8), marginBottom: sc(8) },
  title: { fontSize: sc(20), fontWeight: '800', flex: 1 },
  creatorRow: { flexDirection: 'row', alignItems: 'center', gap: sc(8) },
  creatorAvatar: {
    width: sc(28), height: sc(28), borderRadius: sc(14),
    alignItems: 'center', justifyContent: 'center',
  },
  creatorText: { fontSize: sc(13), fontWeight: '500' },
  progressSection: { borderRadius: sc(16), padding: sc(16), marginBottom: sc(16) },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: sc(8) },
  progressRaised: { fontSize: sc(22), fontWeight: '800' },
  progressGoal: { fontSize: sc(14) },
  progressBg: { height: sc(8), borderRadius: sc(4), overflow: 'hidden', marginBottom: sc(8) },
  progressFill: { height: '100%', borderRadius: sc(4) },
  progressPct: { fontSize: sc(11), fontWeight: '600' },
  descSection: { marginBottom: sc(16) },
  descTitle: { fontSize: sc(16), fontWeight: '700', marginBottom: sc(8) },
  descText: { fontSize: sc(14), lineHeight: sc(22) },
  commentsSection: { marginBottom: sc(16) },
  commentsTitle: { fontSize: sc(15), fontWeight: '700', marginBottom: sc(10) },
  noComments: { alignItems: 'center', paddingVertical: sc(24) },
  noCommentsText: { fontSize: sc(13), marginTop: sc(8) },
  commentCard: { borderRadius: sc(12), padding: sc(12), marginBottom: sc(8) },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: sc(4) },
  commentDonor: { flexDirection: 'row', alignItems: 'center', gap: sc(8) },
  commentName: { fontSize: sc(13), fontWeight: '600' },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: sc(3),
    borderRadius: sc(8), paddingHorizontal: sc(6), paddingVertical: sc(2),
  },
  typeText: { fontSize: sc(10), fontWeight: '700' },
  commentTime: { fontSize: sc(10) },
  commentMsg: { fontSize: sc(13), lineHeight: sc(18), marginTop: sc(4) },

  repliesContainer: { marginBottom: sc(8), marginTop: sc(6) },
  replyItem: { paddingLeft: sc(12), borderLeftWidth: 2, marginBottom: sc(6) },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: sc(4), marginBottom: sc(2) },
  replyName: { fontSize: sc(11), fontWeight: '700' },
  replyTime: { fontSize: sc(9) },
  replyText: { fontSize: sc(12), lineHeight: sc(18) },
  bottomBar: {
    paddingHorizontal: sc(16), paddingTop: sc(12), borderTopWidth: StyleSheet.hairlineWidth,
  },
  donateBtn: { borderRadius: sc(24), overflow: 'hidden', marginBottom: sc(8) },
  donateBtnInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: sc(8), paddingVertical: sc(14), minHeight: sc(50),
  },
  donateBtnText: { fontSize: sc(15), fontWeight: '800' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: sc(16), marginTop: sc(12) },
  giftSection: { marginBottom: sc(20) },
  giftSectionTitle: { fontSize: sc(13), fontWeight: '700', marginBottom: sc(10), textTransform: 'uppercase', letterSpacing: 0.5 },
  giftTierCard: {
    flexDirection: 'row', alignItems: 'center', gap: sc(12),
    backgroundColor: 'transparent',
    borderRadius: sc(10), padding: sc(8), marginBottom: sc(4),
  },
  giftTierImage: { width: sc(44), height: sc(44), borderRadius: sc(8), resizeMode: 'cover' },
  giftTierImagePlaceholder: { width: sc(44), height: sc(44), borderRadius: sc(8), alignItems: 'center', justifyContent: 'center' },
  giftTierInfo: { flex: 1 },
  giftTierTitle: { fontSize: sc(14), fontWeight: '600', marginBottom: sc(2) },
  giftTierDesc: { fontSize: sc(12), lineHeight: sc(16) },
  giftTierBadge: {
    borderRadius: sc(6), paddingHorizontal: sc(8), paddingVertical: sc(3),
  },
  giftTierBadgeText: { fontSize: sc(12), fontWeight: '700' },
});
