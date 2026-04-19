import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getCommentsForFundraiser, getMyFundraisers, getReplies, addReply, CommentReply, DonationComment, getFundraisers, Fundraiser, MyFundraiser } from '../utils/donations';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function CommentReplyScreen({ navigation, route, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = theme;
  const { postId } = route.params || {};
  const [comments, setComments] = useState<(DonationComment & { replies: CommentReply[] })[]>([]);
  const [fundraiser, setFundraiser] = useState<Fundraiser | null>(null);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

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

  const handleReply = async (commentId: string) => {
    const text = replyText[commentId]?.trim();
    if (!text) return;

    const reply: CommentReply = {
      id: `reply-${Date.now()}-${commentId}`,
      commentId,
      postId,
      reply: text,
      timestamp: Date.now(),
    };
    await addReply(reply);
    setReplyText((prev) => ({ ...prev, [commentId]: '' }));
    loadData();
  };

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

  const totalRaised = comments.reduce((sum, c) => sum + c.amount, 0);

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

      {/* Stats bar */}
      {fundraiser && (
        <View style={[styles.statsBar, { backgroundColor: colors.surfaceContainerLow }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{formatCurrency(totalRaised)}</Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Raised</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.outlineVariant + '30' }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.tertiary }]}>{comments.length}</Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Comments</Text>
          </View>
        </View>
      )}

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
            <View key={c.id} style={[styles.commentCard, { backgroundColor: colors.surfaceContainerLow }]}>
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
                <View style={[styles.commentAmount, { backgroundColor: c.donationType === 'money' ? colors.primary + '15' : colors.tertiary + '15' }]}>
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

              {/* Reply input */}
              <View style={styles.replyInputWrap}>
                <TextInput
                  style={[styles.replyInput, {
                    backgroundColor: colors.surfaceContainer,
                    color: colors.onSurface,
                    borderColor: colors.outlineVariant,
                  }]}
                  placeholder="Reply..."
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={replyText[c.id] || ''}
                  onChangeText={(v) => setReplyText((prev) => ({ ...prev, [c.id]: v }))}
                  multiline
                  maxLength={200}
                />
                <TouchableOpacity
                  style={[styles.replySendBtn, { backgroundColor: replyText[c.id]?.trim() ? colors.primary : colors.outlineVariant }]}
                  onPress={() => handleReply(c.id)}
                  disabled={!replyText[c.id]?.trim()}
                  activeOpacity={0.7}
                >
                  <Ionicons name="send" size={sc(16)} color={replyText[c.id]?.trim() ? colors.onPrimary : colors.surface} />
                </TouchableOpacity>
              </View>
            </View>
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
  statsBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: sc(16), marginBottom: sc(12), borderRadius: sc(12), padding: sc(12) },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: sc(18), fontWeight: '800' },
  statLabel: { fontSize: sc(10), marginTop: sc(2) },
  statDivider: { width: 1, height: sc(28) },
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
  commentMsg: { fontSize: sc(13), lineHeight: sc(20), fontStyle: 'italic', marginBottom: sc(8), opacity: 0.8 },

  repliesContainer: { marginBottom: sc(10) },
  replyItem: { paddingLeft: sc(12), borderLeftWidth: 2, marginBottom: sc(8) },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: sc(4), marginBottom: sc(2) },
  replyName: { fontSize: sc(11), fontWeight: '700' },
  replyTime: { fontSize: sc(9) },
  replyText: { fontSize: sc(12), lineHeight: sc(18) },

  replyInputWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: sc(6), marginTop: sc(4) },
  replyInput: { flex: 1, borderRadius: sc(10), borderWidth: 1, paddingHorizontal: sc(12), paddingVertical: sc(8), fontSize: sc(13), minHeight: sc(36), maxHeight: sc(80) },
  replySendBtn: { width: sc(36), height: sc(36), borderRadius: sc(8), alignItems: 'center', justifyContent: 'center' },
});
