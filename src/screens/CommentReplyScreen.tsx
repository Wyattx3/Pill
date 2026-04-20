import React, { useState, useEffect, useCallback } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getCommentsForFundraiser, getMyFundraisers, getReplies, CommentReply, DonationComment, getFundraisers, Fundraiser, MyFundraiser } from '../utils/donations';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function CommentReplyScreen({ navigation, route, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = theme;
  const { postId } = route.params || {};
  const [comments, setComments] = useState<(DonationComment & { replies: CommentReply[] })[]>([]);
  const [fundraiser, setFundraiser] = useState<Fundraiser | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [postId])
  );

  const loadData = async () => {
    const cms = await getCommentsForFundraiser(postId);
    const fnd = await getFundraisers();
    let found = fnd.find((f) => f.id === postId);

    if (!found) {
      const myFnd = await getMyFundraisers();
      const myFound = myFnd.find((f: MyFundraiser) => f.id === postId);
      if (myFound) {
        found = {
          id: myFound.id,
          title: myFound.title,
          description: myFound.description,
          imageUrl: myFound.imageUrl,
          media: myFound.media || [],
          goalAmount: myFound.goalAmount,
          raisedAmount: myFound.raisedAmount,
          creatorName: 'You',
          creatorType: 'individual' as const,
          verificationStatus: 'approved' as const,
          submittedAt: myFound.createdAt,
          isPublished: true,
          giftTiers: [],
        };
      }
    }

    if (found) setFundraiser(found);

    const commentsWithReplies = await Promise.all(
      cms.map(async (c) => {
        const replies = await getReplies(c.id);
        return { ...c, replies };
      })
    );
    setComments(commentsWithReplies);
  };

  const handleReply = (commentId: string, comment: DonationComment) => {
    navigation.navigate('Reply', { postId, commentId, comment });
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const formatCurrency = (n: number) =>
    `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.onSurface }]}>Comments & Replies</Text>
        <View style={{ width: sc(22) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {comments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={sc(48)} color={colors.outlineVariant} />
            <Text style={[styles.emptyText, { color: colors.onSurface }]}>No comments yet</Text>
            <Text style={[styles.emptySubText, { color: colors.onSurfaceVariant }]}>
              When supporters comment, you'll see them here
            </Text>
          </View>
        ) : (
          comments.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.commentCard, { backgroundColor: colors.surfaceContainerLow }]}
              onPress={() => handleReply(c.id, c)}
              activeOpacity={0.7}
            >
              {/* Comment header */}
              <View style={styles.commentHeader}>
                <View style={[styles.commentAvatar, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="person" size={sc(14)} color={colors.primary} />
                </View>
                <View style={styles.commentMeta}>
                  <Text style={[styles.commentName, { color: colors.onSurface }]}>
                    {c.donorName || 'Anonymous'}
                  </Text>
                  <Text style={[styles.commentTime, { color: colors.outlineVariant }]}>
                    {formatTime(c.timestamp)}
                  </Text>
                </View>
                <View style={[styles.commentAmount, {
                  backgroundColor: c.donationType === 'money' ? colors.primary + '15' : colors.tertiary + '15',
                }]}>
                  <Text style={[styles.commentAmountText, {
                    color: c.donationType === 'money' ? colors.primary : colors.tertiary,
                  }]}>
                    {c.donationType === 'money' ? formatCurrency(c.amount) : 'Ad'}
                  </Text>
                </View>
              </View>

              {/* Comment message */}
              {c.message ? (
                <Text style={[styles.commentMsg, { color: colors.onSurfaceVariant }]}>
                  "{c.message}"
                </Text>
              ) : null}

              {/* Replies count + reply action */}
              <View style={styles.commentFooter}>
                {c.replies.length > 0 && (
                  <View style={styles.replyCount}>
                    <Ionicons name="chatbubble-outline" size={sc(12)} color={colors.primary} />
                    <Text style={[styles.replyCountText, { color: colors.primary }]}>
                      {c.replies.length} {c.replies.length === 1 ? 'reply' : 'replies'}
                    </Text>
                  </View>
                )}
                <View style={styles.replyBtn}>
                  <Ionicons name="return-down-back" size={sc(14)} color={colors.primary} />
                  <Text style={[styles.replyBtnText, { color: colors.primary }]}>Reply</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: sc(40) }} />
      </ScrollView>
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
  scrollContent: { paddingHorizontal: sc(16) },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: sc(60) },
  emptyText: { fontSize: sc(16), fontWeight: '700', marginTop: sc(12) },
  emptySubText: { fontSize: sc(13), marginTop: sc(4) },

  commentCard: { borderRadius: sc(14), padding: sc(14), marginBottom: sc(10) },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: sc(8), marginBottom: sc(8) },
  commentAvatar: { width: sc(30), height: sc(30), borderRadius: sc(15), alignItems: 'center', justifyContent: 'center' },
  commentMeta: { flex: 1 },
  commentName: { fontSize: sc(13), fontWeight: '600' },
  commentTime: { fontSize: sc(10) },
  commentAmount: { borderRadius: sc(8), paddingHorizontal: sc(8), paddingVertical: sc(3) },
  commentAmountText: { fontSize: sc(11), fontWeight: '700' },
  commentMsg: { fontSize: sc(13), lineHeight: sc(20), fontStyle: 'italic', marginBottom: sc(6), opacity: 0.8 },

  commentFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: sc(8), paddingTop: sc(8), borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#00000015' },
  replyCount: { flexDirection: 'row', alignItems: 'center', gap: sc(4) },
  replyCountText: { fontSize: sc(11), fontWeight: '600' },
  replyBtn: { flexDirection: 'row', alignItems: 'center', gap: sc(4) },
  replyBtnText: { fontSize: sc(12), fontWeight: '600' },
});
