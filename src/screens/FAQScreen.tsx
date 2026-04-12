import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const faqData = [
  {
    category: 'Getting Started',
    items: [
      { q: 'What is The Sanctuary?', a: 'The Sanctuary is a peer-to-peer listening platform that connects you with trained listeners who provide support, empathy, and a safe space to talk about anything on your mind.' },
      { q: 'How do I start a conversation?', a: 'Tap "Talk Mode" on the Home screen to connect with a verified listener. You will be matched based on your preferences and availability.' },
      { q: 'Is it free to use?', a: 'Yes, using The Sanctuary as a speaker is completely free. We also offer optional donations if you would like to support our community.' },
      { q: 'How do I become a Listener?', a: 'Tap "Listener Mode" on the Home screen and complete the verification process. This includes identity verification, community guidelines review, and agreement to our terms.' },
    ],
  },
  {
    category: 'Privacy & Safety',
    items: [
      { q: 'Are my conversations private?', a: 'Yes. All conversations on The Sanctuary are strictly confidential. We do not record sessions, and listener-speaker identities are protected through anonymization.' },
      { q: 'What happens if I feel unsafe?', a: 'Use the Safety Center to access crisis resources, report concerns, or connect with professional help. The 988 Lifeline is available 24/7.' },
      { q: 'Can I choose my listener?', a: 'Yes, you can browse verified listeners and select someone whose profile feels right for you.' },
      { q: 'What is the reporting process?', a: 'If you encounter inappropriate behavior, you can file a report through the Safety Report screen. Our safety team reviews all reports within 24 hours.' },
    ],
  },
  {
    category: 'Earnings & Payouts',
    items: [
      { q: 'How do listeners earn money?', a: 'Listeners earn a rate per minute of active listening time. Your earnings accumulate and can be withdrawn on a monthly basis.' },
      { q: 'When do I get paid?', a: 'Payouts are processed monthly. You can view your earnings dashboard and withdraw available funds through your preferred payment method.' },
      { q: 'What if I disagree with my payout?', a: 'You can raise a dispute through the Earnings screen. Our safety team will review your case and respond within 5 business days.' },
    ],
  },
  {
    category: 'Community',
    items: [
      { q: 'What are the community guidelines?', a: 'Our guidelines include: listen without judgment, maintain confidentiality, avoid harassment, respect boundaries, and be inclusive. Full details are in the Safety Center.' },
      { q: 'How are listeners rated?', a: 'Speakers provide feedback after each session. Ratings help maintain quality and allow listeners to earn badges like "Warm," "Patient," and "Helpful."' },
      { q: 'Can I leave feedback?', a: 'Yes, after every session you will be prompted to rate your experience and leave anonymous feedback about your listener.' },
      { q: 'What if I want to stop being a listener?', a: 'You can pause or deactivate your listener status at any time through Settings. Your earnings and history will be preserved if you return.' },
    ],
  },
];

export default function FAQScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const toggleItem = (key: string) => {
    setExpandedIndex(expandedIndex === key ? null : key);
  };

  // Filter based on search
  const filteredData = searchQuery.length > 0
    ? faqData
        .map((cat) => ({
          ...cat,
          items: cat.items.filter(
            (item) =>
              item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.a.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((cat) => cat.items.length > 0)
    : faqData;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 8) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.surfaceContainerLow }]} activeOpacity={0.5}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.onSurface }]}>Frequently Asked Questions</Text>
        <View style={{ width: sc(38) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Search */}
        <View style={[
          styles.searchBar,
          { backgroundColor: colors.surfaceContainerLow, borderColor: searchFocused ? colors.primary + '66' : colors.outlineVariant + '22' },
        ]}>
          <Ionicons name="search" size={sc(20)} color={searchFocused ? colors.primary : colors.onSurfaceVariant} />
          <TextInput
            style={[styles.searchInput, { color: colors.onSurface }]}
            placeholder="Search questions..."
            placeholderTextColor={colors.onSurfaceVariant + '66'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.5}>
              <Ionicons name="close-circle" size={sc(18)} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        {filteredData.map((category, ci) => (
          <View key={ci} style={styles.category}>
            <Text style={[styles.categoryTitle, { color: colors.primary }]}>{category.category}</Text>
            {category.items.map((item, ii) => {
              const key = `${ci}-${ii}`;
              const isExpanded = expandedIndex === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.faqItem, { backgroundColor: colors.surfaceContainerLow, borderColor: isExpanded ? colors.primary + '44' : colors.outlineVariant + '11' }]}
                  onPress={() => toggleItem(key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqQuestion}>
                    <Text style={[styles.questionText, { color: colors.onSurface }]}>{item.q}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={sc(18)}
                      color={isExpanded ? colors.primary : colors.onSurfaceVariant}
                    />
                  </View>
                  {isExpanded && (
                    <Text style={[styles.answerText, { color: colors.onSurfaceVariant }]}>{item.a}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {filteredData.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="help-circle-outline" size={sc(48)} color={colors.outline} />
            <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>No results found</Text>
            <Text style={[styles.emptyDesc, { color: colors.onSurfaceVariant }]}>
              Try a different search or contact support below.
            </Text>
          </View>
        )}

        {/* Still need help CTA */}
        <View style={styles.ctaSection}>
          <Text style={[styles.ctaTitle, { color: colors.onSurface }]}>Still need help?</Text>
          <Text style={[styles.ctaDesc, { color: colors.onSurfaceVariant }]}>
            Our support team is here for you.
          </Text>
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('ContactSupport')}
            activeOpacity={0.8}
          >
            <Ionicons name="mail-outline" size={sc(18)} color={colors.onPrimary} />
            <Text style={[styles.ctaButtonText, { color: colors.onPrimary }]}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(16), paddingBottom: sc(10) },
  backButton: { width: sc(38), height: sc(38), borderRadius: sc(19), alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: sc(14), fontWeight: '700', maxWidth: '70%' },
  scrollContent: { paddingHorizontal: sc(18), paddingTop: sc(8), paddingBottom: sc(40) },

  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: sc(14), paddingHorizontal: sc(14), paddingVertical: sc(4), marginBottom: sc(20), borderWidth: 1.5, minHeight: sc(44), gap: sc(10) },
  searchInput: { flex: 1, fontSize: sc(14), paddingVertical: sc(6) },

  category: { marginBottom: sc(20) },
  categoryTitle: { fontSize: sc(11), fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: sc(8) },
  faqItem: { borderRadius: sc(12), padding: sc(14), marginBottom: sc(8), borderWidth: 1 },
  faqQuestion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: sc(10) },
  questionText: { fontSize: sc(13), fontWeight: '600', flex: 1, lineHeight: sc(18) },
  answerText: { fontSize: sc(12), lineHeight: sc(18), marginTop: sc(10) },

  emptyState: { alignItems: 'center', paddingVertical: sc(40) },
  emptyTitle: { fontSize: sc(16), fontWeight: '700', marginTop: sc(12), marginBottom: sc(4) },
  emptyDesc: { fontSize: sc(12), textAlign: 'center' },

  ctaSection: { alignItems: 'center', paddingVertical: sc(20) },
  ctaTitle: { fontSize: sc(18), fontWeight: '700', marginBottom: sc(4) },
  ctaDesc: { fontSize: sc(12), marginBottom: sc(16) },
  ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(8), borderRadius: sc(26), paddingVertical: sc(14), paddingHorizontal: sc(28), minHeight: 50 },
  ctaButtonText: { fontSize: sc(14), fontWeight: '700' },
});
