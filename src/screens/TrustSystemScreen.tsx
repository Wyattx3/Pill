import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, Easing, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W, height: H } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

/* ── Types ── */

type InboxItem = {
  id: string;
  icon: string;
  sender: string;
  subject: string;
  body: string;
  time: string;
  read: boolean;
  accent: string;
};

type CaseItem = {
  id: string;
  title: string;
  status: 'open' | 'resolved' | 'in_review';
  body: string;
  date: string;
  replies: CaseReply[];
};

type CaseReply = {
  from: string;
  body: string;
  time: string;
  isStaff: boolean;
};

/* ── Mock Data ── */

const inboxData: InboxItem[] = [
  {
    id: '1', icon: 'shield-checkmark', sender: 'Pill Safety Team',
    subject: 'Report Under Review',
    body: 'Your report regarding user behavior has been received and is being reviewed. Our team typically reviews reports within 24 hours.',
    time: '2:30 PM', read: false, accent: '#126a63',
  },
  {
    id: '2', icon: 'sparkles', sender: 'Pill Verification',
    subject: 'New Badge Earned',
    body: 'Congratulations! You have been awarded the Verified Listener badge based on consistent positive feedback.',
    time: 'Yesterday', read: true, accent: '#7e572e',
  },
  {
    id: '3', icon: 'checkmark-circle', sender: 'Pill Safety Team',
    subject: 'Case #2831 Resolved',
    body: 'The report you submitted has been reviewed and resolved. Appropriate action has been taken.',
    time: 'Apr 10', read: true, accent: '#4CAF50',
  },
  {
    id: '4', icon: 'information-circle', sender: 'Pill System',
    subject: 'Community Guidelines Updated',
    body: 'We have updated our community guidelines with clearer definitions and updated response timeframes.',
    time: 'Apr 8', read: true, accent: '#516261',
  },
];

const caseData: CaseItem[] = [
  {
    id: '1', title: 'Inappropriate Language During Session', status: 'resolved',
    body: 'User used offensive language and dismissive behavior during an active session. Multiple instances of name-calling occurred.',
    date: 'Apr 10, 2026',
    replies: [
      { from: 'Pill Safety Team', body: 'Thank you for your report. We have reviewed the session logs and taken appropriate action. This case has been resolved.', time: 'Apr 11, 2026', isStaff: true },
    ],
  },
  {
    id: '2', title: 'Impersonation of Licensed Professional', status: 'in_review',
    body: 'User claimed to be a licensed therapist and provided medical advice during a session.',
    date: 'Apr 12, 2026',
    replies: [
      { from: 'Pill Safety Team', body: 'We have received your report and are currently investigating. We take impersonation very seriously.', time: 'Apr 12, 2026', isStaff: true },
    ],
  },
];

/* ── Full-screen detail overlay (slide from right) ── */

function FullDetail({ visible, children, onClose }: { visible: boolean; children: React.ReactNode; onClose: () => void }) {
  const slideX = useRef(new Animated.Value(W)).current;
  const fadeBg = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideX.setValue(W);
      fadeBg.setValue(0);
      Animated.parallel([
        Animated.timing(slideX, { toValue: 0, duration: 350, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(fadeBg, { toValue: 0.5, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const close = () => {
    Animated.parallel([
      Animated.timing(slideX, { toValue: W, duration: 300, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      Animated.timing(fadeBg, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  if (!visible) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
      <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000' }, { opacity: fadeBg }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={close} />
      </Animated.View>
      <Animated.View style={{ flex: 1, transform: [{ translateX: slideX }] }}>
        <View style={{ flex: 1 }}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN SCREEN
   ═══════════════════════════════════════════════════════ */

export default function TrustSystemScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;

  const [activeTab, setActiveTab] = useState<'inbox' | 'cases'>('inbox');
  const [selectedInbox, setSelectedInbox] = useState<InboxItem | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const tabSlide = useRef(new Animated.Value(0)).current;

  const unreadCount = inboxData.filter((m) => !m.read).length;

  const submitCompose = () => {
    if (composeSubject.trim()) {
      setShowCompose(false);
    }
  };

  const switchTab = (tab: 'inbox' | 'cases') => {
    setActiveTab(tab);
    Animated.spring(tabSlide, {
      toValue: tab === 'cases' ? 1 : 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
    }).start();
  };

  const indicatorTranslate = tabSlide.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (W - sc(36) * 2 - sc(6)) / 2],
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* ── Top Bar ── */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.surfaceContainerLow }]} activeOpacity={0.6}>
            <Ionicons name="arrow-back" size={sc(18)} color={colors.onSurface} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.topTitle, { color: colors.onSurface }]}>Trust & Safety</Text>
            <Text style={[styles.topSubtitle, { color: colors.onSurfaceVariant }]}>Your protected space</Text>
          </View>
        </View>
        {unreadCount > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: colors.error }]}>
            <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
          </View>
        )}
      </View>

      {/* ── Segmented Tabs ── */}
      <View style={[styles.segWrap, { backgroundColor: colors.surfaceContainerLow }]}>
        <Animated.View style={[styles.segIndicator, { backgroundColor: colors.primary, transform: [{ translateX: indicatorTranslate }] }]} />
        <TouchableOpacity
          style={[styles.segTab, activeTab === 'inbox' && styles.segTabActive]}
          onPress={() => switchTab('inbox')}
          activeOpacity={0.8}
        >
          <Ionicons name="mail" size={sc(14)} color={activeTab === 'inbox' ? colors.onPrimary : colors.onSurfaceVariant} />
          <Text style={[styles.segText, { color: activeTab === 'inbox' ? colors.onPrimary : colors.onSurfaceVariant }]}>
            Inbox
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segTab, activeTab === 'cases' && styles.segTabActive]}
          onPress={() => switchTab('cases')}
          activeOpacity={0.8}
        >
          <Ionicons name="briefcase" size={sc(14)} color={activeTab === 'cases' ? colors.onPrimary : colors.onSurfaceVariant} />
          <Text style={[styles.segText, { color: activeTab === 'cases' ? colors.onPrimary : colors.onSurfaceVariant }]}>
            Cases
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Content ── */}
      <View style={styles.contentArea}>
        {activeTab === 'inbox' && (
          <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {inboxData.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.inboxCard,
                  { backgroundColor: colors.surfaceContainerLowest },
                ]}
                onPress={() => setSelectedInbox(item)}
                activeOpacity={0.6}
              >
                <View style={styles.inboxCardInner}>
                  <View style={styles.inboxText}>
                    <View style={styles.inboxHeader}>
                      <Text style={[styles.inboxSender, { color: item.read ? colors.onSurfaceVariant : colors.onSurface }]}>
                        {item.sender}
                      </Text>
                      <Text style={[styles.inboxTime, { color: colors.outline }]}>{item.time}</Text>
                    </View>
                    <Text style={[styles.inboxSubject, { color: colors.onSurface, fontWeight: item.read ? '600' : '700' }]}>
                      {item.subject}
                    </Text>
                    <Text style={[styles.inboxPreview, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
                      {item.body}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            <View style={{ height: sc(24) }} />
          </ScrollView>
        )}

        {activeTab === 'cases' && (
          <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
            {caseData.map((c) => {
              const sLabel = c.status === 'open' ? 'Open' : c.status === 'resolved' ? 'Resolved' : 'In Review';
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.caseCard, { backgroundColor: colors.surfaceContainerLowest }]}
                  onPress={() => setSelectedCase(c)}
                  activeOpacity={0.6}
                >
                  <View style={styles.caseCardInner}>
                    <View style={styles.caseText}>
                      <Text style={[styles.caseTitle, { color: colors.onSurface }]}>{c.title}</Text>
                      <Text style={[styles.casePreview, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
                        {c.body}
                      </Text>
                      <View style={styles.caseMeta}>
                        <Text style={[styles.caseDate, { color: colors.outline }]}>{c.date}</Text>
                        {c.replies.length > 0 && (
                          <Text style={[styles.caseReplyCount, { color: colors.outline }]}>
                            {c.replies.length} repl{c.replies.length === 1 ? 'y' : 'ies'}
                          </Text>
                        )}
                        <Text style={[styles.caseStatusText, { color: colors.onSurfaceVariant }]}>{sLabel}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
            <View style={{ height: sc(24) }} />
          </ScrollView>
        )}
      </View>

      {/* ── FAB ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCompose(true)}
        activeOpacity={0.8}
      >
        <View style={[styles.fabInner, { backgroundColor: colors.primary }]}>
          <Ionicons name="add" size={sc(22)} color={colors.onPrimary} />
        </View>
      </TouchableOpacity>

      {/* ── Full-Screen Details ── */}
      <FullDetail visible={!!selectedInbox} onClose={() => setSelectedInbox(null)}>
        {selectedInbox && (
          <InboxDetailView msg={selectedInbox} theme={theme} onClose={() => setSelectedInbox(null)} />
        )}
      </FullDetail>

      <FullDetail visible={!!selectedCase} onClose={() => setSelectedCase(null)}>
        {selectedCase && (
          <CaseDetailView caseItem={selectedCase} theme={theme} onClose={() => setSelectedCase(null)} />
        )}
      </FullDetail>

      <FullDetail visible={showCompose} onClose={() => setShowCompose(false)}>
        <ComposeView
          theme={theme}
          subject={composeSubject}
          body={composeBody}
          onSubjectChange={setComposeSubject}
          onBodyChange={setComposeBody}
          onSend={submitCompose}
          onClose={() => setShowCompose(false)}
        />
      </FullDetail>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════
   INBOX DETAIL — document style
   ═══════════════════════════════════════════════════════ */

function InboxDetailView({ msg, theme, onClose }: any) {
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.detailRoot, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />
      <View style={[styles.detailHeader, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={onClose} style={styles.docBackBtn} activeOpacity={0.6}>
          <Ionicons name="arrow-back" size={sc(20)} color={colors.onSurface} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.docBody}>
        {/* Subject line */}
        <Text style={[styles.docSubject, { color: colors.onSurface }]}>{msg.subject}</Text>
        {/* Meta row */}
        <View style={styles.docMetaRow}>
          <Text style={[styles.docMetaLabel, { color: colors.primary }]}>{msg.sender}</Text>
          <Text style={[styles.docMetaLabel, { color: colors.outline }]}>{msg.time}</Text>
        </View>
        {/* Divider */}
        <View style={[styles.docDivider, { backgroundColor: colors.outlineVariant + '33' }]} />
        {/* Body */}
        <Text style={[styles.docBodyText, { color: colors.onSurface }]}>{msg.body}</Text>
      </ScrollView>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════
   CASE DETAIL — document style
   ═══════════════════════════════════════════════════════ */

function CaseDetailView({ caseItem, theme, onClose }: any) {
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const sLabel = caseItem.status === 'open' ? 'Open' : caseItem.status === 'resolved' ? 'Resolved' : 'In Review';

  return (
    <View style={[styles.detailRoot, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />
      <View style={[styles.detailHeader, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={onClose} style={styles.docBackBtn} activeOpacity={0.6}>
          <Ionicons name="arrow-back" size={sc(20)} color={colors.onSurface} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.docBody}>
        {/* Title + status */}
        <Text style={[styles.docSubject, { color: colors.onSurface }]}>{caseItem.title}</Text>
        <Text style={[styles.docCaseDate, { color: colors.outline }]}>{caseItem.date} · {sLabel}</Text>
        <View style={[styles.docDivider, { backgroundColor: colors.outlineVariant + '33' }]} />

        {/* Original report */}
        <Text style={[styles.docSectionLabel, { color: colors.onSurfaceVariant }]}>Original Report</Text>
        <Text style={[styles.docBodyText, { color: colors.onSurface, marginBottom: sc(24) }]}>{caseItem.body}</Text>

        {/* Replies */}
        {caseItem.replies.length > 0 && (
          <>
            <Text style={[styles.docSectionLabel, { color: colors.onSurfaceVariant, marginBottom: sc(12) }]}>
              {caseItem.replies.length} repl{caseItem.replies.length === 1 ? 'y' : 'ies'}
            </Text>
            {caseItem.replies.map((r: CaseReply, i: number) => (
              <View key={i} style={styles.docReplyBlock}>
                <View style={styles.docReplyHeader}>
                  <Text style={[styles.docReplyFrom, { color: r.isStaff ? colors.primary : colors.onSurface }]}>{r.from}</Text>
                  <Text style={[styles.docReplyTime, { color: colors.outline }]}>{r.time}</Text>
                </View>
                <View style={[styles.docDivider, { backgroundColor: colors.outlineVariant + '22', marginVertical: sc(8) }]} />
                <Text style={[styles.docBodyText, { color: colors.onSurface }]}>{r.body}</Text>
              </View>
            ))}
          </>
        )}
        <View style={{ height: sc(20) }} />
      </ScrollView>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════
   COMPOSE VIEW
   ═══════════════════════════════════════════════════════ */

function ComposeView({ theme, subject, body, onSubjectChange, onBodyChange, onSend, onClose }: any) {
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const canSend = subject.trim().length > 0;
  return (
    <View style={[styles.detailRoot, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />
      <View style={[styles.composeHeader, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={onClose} style={styles.docBackBtn} activeOpacity={0.6}>
          <Ionicons name="arrow-back" size={sc(20)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.composeTitle, { color: colors.onSurface }]}>New Case Report</Text>
        <TouchableOpacity
          onPress={onSend}
          style={[styles.sendBtn, { backgroundColor: canSend ? colors.primary : colors.outlineVariant + '44' }]}
          activeOpacity={0.7}
          disabled={!canSend}
        >
          <Ionicons name="send" size={sc(18)} color={canSend ? colors.onPrimary : colors.outlineVariant} />
        </TouchableOpacity>
      </View>
      <View style={[styles.detailDivider, { backgroundColor: colors.outlineVariant + '22' }]} />
      <View style={styles.composeContent}>
        <TextInput
          style={[styles.composeSubject, { color: colors.onSurface, backgroundColor: colors.surfaceContainerLow }]}
          placeholder="Subject — what happened?"
          placeholderTextColor={colors.onSurfaceVariant + '66'}
          value={subject}
          onChangeText={onSubjectChange}
        />
        <TextInput
          style={[styles.composeBodyInput, { color: colors.onSurface, backgroundColor: colors.surfaceContainerLow }]}
          placeholder="Describe the issue in detail..."
          placeholderTextColor={colors.onSurfaceVariant + '66'}
          value={body}
          onChangeText={onBodyChange}
          multiline
          textAlignVertical="top"
        />
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════ */

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Top bar
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: sc(18), paddingBottom: sc(8), paddingTop: sc(8) },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: sc(10) },
  backBtn: { width: sc(36), height: sc(36), borderRadius: sc(18), alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: sc(18), fontWeight: '800', letterSpacing: -0.5 },
  topSubtitle: { fontSize: sc(11), fontWeight: '500', marginTop: sc(1) },
  unreadBadge: { paddingHorizontal: sc(10), paddingVertical: sc(4), borderRadius: sc(12) },
  unreadBadgeText: { fontSize: sc(10), fontWeight: '700', color: '#fff' },

  // Segmented tabs
  segWrap: { flexDirection: 'row', borderRadius: sc(14), marginHorizontal: sc(18), marginVertical: sc(8), padding: sc(3), position: 'relative', overflow: 'hidden' },
  segIndicator: { position: 'absolute', top: sc(3), left: sc(3), width: (W - sc(36) * 2 - sc(6)) / 2, height: '100%', borderRadius: sc(12) },
  segTab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(6), flex: 1, borderRadius: sc(12), paddingVertical: sc(8), zIndex: 1 },
  segTabActive: { backgroundColor: 'transparent' },
  segText: { fontSize: sc(12), fontWeight: '700', letterSpacing: 0.5 },

  // Content area
  contentArea: { flex: 1 },
  scrollPad: { paddingHorizontal: sc(18), paddingTop: sc(6) },

  // Inbox cards — clean, no icons
  inboxCard: { borderRadius: sc(12), marginBottom: sc(6), overflow: 'hidden', position: 'relative' },
  inboxCardInner: { flexDirection: 'row', alignItems: 'flex-start', padding: sc(14), gap: sc(10) },
  inboxText: { flex: 1 },
  inboxHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: sc(2) },
  inboxSender: { fontSize: sc(11) },
  inboxTime: { fontSize: sc(10) },
  inboxSubject: { fontSize: sc(13), marginBottom: sc(3) },
  inboxPreview: { fontSize: sc(11), lineHeight: sc(16) },

  // Case cards — clean
  caseCard: { borderRadius: sc(12), marginBottom: sc(6), overflow: 'hidden' },
  caseCardInner: { flexDirection: 'row', alignItems: 'flex-start', padding: sc(14), gap: sc(10) },
  caseText: { flex: 1 },
  caseTitle: { fontSize: sc(13), fontWeight: '700' },
  casePreview: { fontSize: sc(11), lineHeight: sc(16), marginBottom: sc(6) },
  caseMeta: { flexDirection: 'row', alignItems: 'center', gap: sc(8) },
  caseDate: { fontSize: sc(9) },
  caseReplyCount: { fontSize: sc(9) },
  caseStatusText: { fontSize: sc(9), fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  // FAB
  fab: { position: 'absolute', right: sc(18), bottom: Math.max(sc(16), 20), width: sc(56), height: sc(56), borderRadius: sc(28), alignItems: 'center', justifyContent: 'center' },
  fabInner: { width: sc(56), height: sc(56), borderRadius: sc(28), alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },

  // Detail header (with safe area)
  detailRoot: { flex: 1 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: sc(12), paddingBottom: sc(4) },
  docBackBtn: { width: sc(40), height: sc(40), borderRadius: sc(20), alignItems: 'center', justifyContent: 'center' },

  // Document style detail
  docBody: { paddingHorizontal: sc(20), paddingTop: sc(12) },
  docSubject: { fontSize: sc(22), fontWeight: '800', letterSpacing: -0.5, lineHeight: sc(30), marginBottom: sc(6) },
  docMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: sc(14) },
  docMetaLabel: { fontSize: sc(11), fontWeight: '600' },
  docDivider: { height: 0.5, marginVertical: sc(14) },
  docBodyText: { fontSize: sc(13), lineHeight: sc(22) },

  // Case-specific document styles
  docCaseDate: { fontSize: sc(11), marginBottom: sc(4) },
  docSectionLabel: { fontSize: sc(10), fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  docReplyBlock: { marginBottom: sc(12) },
  docReplyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  docReplyFrom: { fontSize: sc(12), fontWeight: '700' },
  docReplyTime: { fontSize: sc(10) },

  // Compose
  composeHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: sc(12), paddingBottom: sc(4) },
  composeTitle: { flex: 1, fontSize: sc(15), fontWeight: '700', textAlign: 'center' },
  sendBtn: { width: sc(40), height: sc(40), borderRadius: sc(20), alignItems: 'center', justifyContent: 'center' },
  composeContent: { paddingHorizontal: sc(16), paddingTop: sc(8) },
  detailDivider: { height: 0.5 },
  composeSubject: { borderRadius: sc(12), paddingHorizontal: sc(14), paddingVertical: sc(14), fontSize: sc(15), fontWeight: '700', marginBottom: sc(8) },
  composeBodyInput: { borderRadius: sc(12), paddingHorizontal: sc(14), paddingVertical: sc(14), fontSize: sc(13), lineHeight: sc(20), minHeight: sc(300) },
});
