import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const resourceContent: Record<string, { fullText: string[]; externalUrl?: string }> = {
  'How to be a good listener': {
    fullText: [
      'Good listening is more than just hearing words — it is about creating a space where someone feels truly seen and understood. Here are some proven techniques to become a better listener.',
      '1. Give Your Full Attention',
      'Put away distractions. Silence your phone, close other tabs, and focus entirely on the person speaking. Your presence is the most powerful gift you can offer.',
      '2. Listen Without Interrupting',
      'Resist the urge to jump in with advice or your own stories. Let the speaker finish their thoughts completely. Silence is not awkward — it is respectful.',
      '3. Reflect and Validate',
      'Use phrases like "It sounds like you are going through a really tough time" or "I can understand why you would feel that way." This shows you are truly listening.',
      '4. Ask Open-Ended Questions',
      'Instead of yes/no questions, try "Can you tell me more about that?" or "How did that make you feel?" This encourages deeper sharing.',
      '5. Avoid Judgment',
      'Your role is not to fix, judge, or critique. It is to be a safe, supportive presence. Every person\'s experience is valid.',
      '6. Be Comfortable with Silence',
      'Sometimes the most meaningful moments in a conversation happen in the pauses. Don\'t rush to fill every gap.',
      '7. Take Care of Yourself',
      'Listening can be emotionally demanding. Make sure you are taking breaks and processing your own feelings so you can show up fully for others.',
    ],
  },
  'Coping with difficult calls': {
    fullText: [
      'Not every conversation will be easy. Some calls will challenge you emotionally, and that is completely normal. Here are strategies to protect your well-being while still being a compassionate listener.',
      '1. Set Emotional Boundaries',
      'You are a listener, not a therapist. It is okay to gently guide someone toward professional help if they are dealing with severe trauma or crisis.',
      '2. Recognize Compassion Fatigue',
      'Signs include feeling drained, irritable, or numb after sessions. If you notice these patterns, take a break and reach out for support.',
      '3. Use Grounding Techniques',
      'Between calls, try the 5-4-3-2-1 method: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste.',
      '4. Debrief Safely',
      'Talk to a trusted colleague or supervisor about difficult calls without sharing identifying details. Processing helps release emotional weight.',
      '5. Know Your Limits',
      'If a conversation makes you deeply uncomfortable or unsafe, it is okay to end the session gracefully and report the concern.',
      '6. Practice Self-Care Rituals',
      'After a tough call, do something that recharges you — a walk, music, meditation, or simply a few minutes of quiet breathing.',
    ],
  },
  'Community Guidelines': {
    fullText: [
      'Pill thrives because of the shared commitment to kindness, respect, and confidentiality. These guidelines help maintain the safe space we have built together.',
      '1. Confidentiality is Absolute',
      'Nothing shared in a session ever leaves the session. Do not record, screenshot, or discuss the content of any conversation outside the app.',
      '2. No Advice-Giving',
      'Listeners are peers, not therapists. Avoid giving advice, diagnosing, or telling someone what to do. Your role is to listen and validate.',
      '3. Zero Tolerance for Harassment',
      'Any form of harassment, discrimination, or abuse — whether from a speaker or listener — will result in immediate action from our safety team.',
      '4. Respect Boundaries',
      'Never attempt to contact someone outside the app. Do not ask for personal identifying information beyond what is necessary.',
      '5. Be Inclusive',
      'Everyone deserves to be heard regardless of their background, identity, beliefs, or experiences. Approach every conversation with an open mind.',
      '6. Report Concerns',
      'If you witness or experience anything that violates these guidelines, use the in-app reporting tool. Our safety team reviews every report within 24 hours.',
      '7. Take Breaks When Needed',
      'Your emotional health matters. If you are feeling overwhelmed, step back from listening sessions until you feel ready again.',
    ],
  },
};

export default function ResourceDetailScreen({ navigation, route, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const { title, desc, image } = route.params || {};
  const content = resourceContent[title] || { fullText: [desc, 'Full article coming soon.'] };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 8) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.surfaceContainerLow }]} activeOpacity={0.5}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.onSurface }]} numberOfLines={1}>
          {title || 'Resource'}
        </Text>
        <View style={{ width: sc(38) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        {image && (
          <Image source={{ uri: image }} style={styles.heroImage} />
        )}

        {/* Title */}
        <Text style={[styles.articleTitle, { color: colors.onSurface }]}>{title}</Text>

        {/* Content */}
        {content.fullText.map((paragraph, i) => (
          <Text
            key={i}
            style={[
              i === 0 ? styles.articleIntro : styles.articleParagraph,
              { color: colors.onSurfaceVariant },
              paragraph.startsWith('1.') || paragraph.startsWith('2.') || paragraph.startsWith('3.') || paragraph.startsWith('4.') || paragraph.startsWith('5.') || paragraph.startsWith('6.') || paragraph.startsWith('7.')
                ? styles.articleHeading
                : {},
            ]}
          >
            {paragraph}
          </Text>
        ))}

        {/* Bottom CTA */}
        <View style={styles.bottomCTA}>
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
            onPress={() => Linking.openURL('https://988lifeline.org')}
          >
            <Ionicons name="help-circle" size={sc(18)} color={colors.onPrimary} />
            <Text style={[styles.ctaText, { color: colors.onPrimary }]}>Need more help? Visit 988 Lifeline</Text>
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
  scrollContent: { paddingHorizontal: sc(18), paddingBottom: sc(40) },
  heroImage: { width: '100%', height: sc(160), borderRadius: sc(16), marginBottom: sc(16) },
  articleTitle: { fontSize: sc(22), fontWeight: '800', lineHeight: sc(28), marginBottom: sc(12), letterSpacing: -0.3 },
  articleIntro: { fontSize: sc(13), lineHeight: sc(22), marginBottom: sc(18), fontStyle: 'italic' },
  articleParagraph: { fontSize: sc(13), lineHeight: sc(22), marginBottom: sc(10) },
  articleHeading: { fontSize: sc(14), fontWeight: '700', marginTop: sc(14), marginBottom: sc(4), fontStyle: 'normal' as any },
  bottomCTA: { marginTop: sc(30), marginBottom: sc(20) },
  ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(8), borderRadius: sc(26), paddingVertical: sc(14) },
  ctaText: { fontSize: sc(13), fontWeight: '700' },
});
