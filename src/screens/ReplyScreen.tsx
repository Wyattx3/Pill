import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getReplies, addReply, CommentReply, getCommentsForFundraiser, DonationComment, Fundraiser, getFundraisers, getMyFundraisers, MyFundraiser } from '../utils/donations';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function ReplyScreen({ navigation, route, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = theme;
  const { postId, commentId, comment } = route.params;
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<CommentReply[]>([]);
  const [fundraiser, setFundraiser] = useState<Fundraiser | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [commentId])
  );

  const loadData = async () => {
    const r = await getReplies(commentId);
    setReplies(r);

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
          creatorType: 'individual',
          verificationStatus: 'approved',
          submittedAt: myFound.createdAt,
          isPublished: true,
          giftTiers: [],
        };
      }
    }
    if (found) setFundraiser(found);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    const reply: CommentReply = {
      id: `reply-${Date.now()}-${commentId}`,
      commentId,
      postId,
      reply: replyText.trim(),
      timestamp: Date.now(),
    };
    await addReply(reply);
    setReplyText('');
    loadData();
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
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.onSurface }]}>Reply</Text>
        <View style={{ width: sc(22) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Original comment card */}
        <View style={[styles.commentCard, { backgroundColor: colors.surfaceContainerLow }]}>
          <View style={styles.commentHeader}>
            <View style={[styles.commentAvatar, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="person" size={sc(14)} color={colors.primary} />
            </View>
            <View style={styles.commentMeta}>
              <Text style={[styles.commentName, { color: colors.onSurface }]}>
                {comment?.donorName || 'Anonymous'}
              </Text>
              <Text style={[styles.commentTime, { color: colors.outlineVariant }]}>
                {comment?.timestamp ? formatTime(comment.timestamp) : ''}
              </Text>
            </View>
            <View style={[styles.commentAmount, {
              backgroundColor: comment?.donationType === 'money' ? colors.primary + '15' : colors.tertiary + '15',
            }]}>
              <Text style={[styles.commentAmountText, {
                color: comment?.donationType === 'money' ? colors.primary : colors.tertiary,
              }]}>
                {comment?.donationType === 'money' ? formatCurrency(comment.amount) : 'Ad'}
              </Text>
            </View>
          </View>

          {comment?.message ? (
            <Text style={[styles.commentMsg, { color: colors.onSurfaceVariant }]}>
              "{comment.message}"
            </Text>
          ) : null}
        </View>

        {/* Replies list */}
        <Text style={[styles.repliesTitle, { color: colors.onSurface }]}>
          Replies ({replies.length})
        </Text>

        {replies.length === 0 ? (
          <View style={styles.emptyReplies}>
            <Ionicons name="chatbubble-outline" size={sc(36)} color={colors.outlineVariant} />
            <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>No replies yet</Text>
          </View>
        ) : (
          replies.map((r) => (
            <View key={r.id} style={[styles.replyCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={styles.replyHeader}>
                <View style={[styles.replyAvatar, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="return-down-back" size={sc(12)} color={colors.primary} />
                </View>
                <View style={styles.replyMeta}>
                  <Text style={[styles.replyName, { color: colors.primary }]}>You</Text>
                  <Text style={[styles.replyTime, { color: colors.outlineVariant }]}>{formatTime(r.timestamp)}</Text>
                </View>
              </View>
              <Text style={[styles.replyText, { color: colors.onSurface }]}>{r.reply}</Text>
            </View>
          ))
        )}

        <View style={{ height: sc(100) }} />
      </ScrollView>

      {/* Reply input bar */}
      <View style={[styles.replyBar, {
        backgroundColor: colors.surface,
        borderTopColor: colors.outlineVariant + '22',
        paddingBottom: Math.max(insets.bottom, 8),
      }]}>
        <TextInput
          style={[styles.replyBarInput, {
            backgroundColor: colors.surfaceContainerLow,
            color: colors.onSurface,
            borderColor: colors.outlineVariant,
          }]}
          placeholder="Write your reply..."
          placeholderTextColor={colors.onSurfaceVariant}
          value={replyText}
          onChangeText={setReplyText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.replyBarBtn, { opacity: replyText.trim() ? 1 : 0.35 }]}
          onPress={handleSendReply}
          disabled={!replyText.trim()}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.primaryDim, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.replyBarBtnInner}
          >
            <Ionicons name="send" size={sc(18)} color={colors.onPrimary} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(20), paddingVertical: sc(12) },
  topTitle: { fontSize: sc(16), fontWeight: '700' },

  scrollContent: { paddingHorizontal: sc(16), paddingTop: sc(8) },

  // Comment card
  commentCard: { borderRadius: sc(14), padding: sc(14), marginBottom: sc(16) },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: sc(8), marginBottom: sc(8) },
  commentAvatar: { width: sc(30), height: sc(30), borderRadius: sc(15), alignItems: 'center', justifyContent: 'center' },
  commentMeta: { flex: 1 },
  commentName: { fontSize: sc(13), fontWeight: '600' },
  commentTime: { fontSize: sc(10) },
  commentAmount: { borderRadius: sc(8), paddingHorizontal: sc(8), paddingVertical: sc(3) },
  commentAmountText: { fontSize: sc(11), fontWeight: '700' },
  commentMsg: { fontSize: sc(13), lineHeight: sc(20), fontStyle: 'italic' },

  // Replies
  repliesTitle: { fontSize: sc(13), fontWeight: '700', marginBottom: sc(10) },
  emptyReplies: { alignItems: 'center', paddingVertical: sc(30) },
  emptyText: { fontSize: sc(13), marginTop: sc(6) },

  replyCard: { borderRadius: sc(12), padding: sc(14), marginBottom: sc(8) },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: sc(8), marginBottom: sc(8) },
  replyAvatar: { width: sc(24), height: sc(24), borderRadius: sc(12), alignItems: 'center', justifyContent: 'center' },
  replyMeta: { gap: sc(4) },
  replyName: { fontSize: sc(12), fontWeight: '700' },
  replyTime: { fontSize: sc(9) },
  replyText: { fontSize: sc(13), lineHeight: sc(20) },

  // Reply bar
  replyBar: { flexDirection: 'row', alignItems: 'center', gap: sc(8), paddingHorizontal: sc(16), paddingTop: sc(10), borderTopWidth: StyleSheet.hairlineWidth },
  replyBarInput: { flex: 1, borderRadius: sc(20), borderWidth: 1, paddingHorizontal: sc(14), paddingVertical: sc(8), fontSize: sc(13), minHeight: sc(40), maxHeight: sc(100) },
  replyBarBtn: { borderRadius: sc(20), overflow: 'hidden', width: sc(44), height: sc(44), alignItems: 'center', justifyContent: 'center' },
  replyBarBtnInner: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: sc(20) },
});
