import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OtterMascot from '../components/OtterMascot';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const onboardingData = [
  {
    mascot: 'wave' as const,
    title: 'Welcome to',
    titleAccent: 'Pill',
    subtitle: 'A safe, anonymous space to talk and be heard. Connect with trained listeners who care.',
    icon1: 'shield-checkmark',
    icon2: 'heart',
    cardDesc: 'Your safe space to be yourself',
    buttonLabel: 'Continue',
  },
  {
    mascot: 'listener' as const,
    title: 'Be the Voice or',
    titleAccent: 'Be the Listener',
    subtitle: 'Talk when you need support, or listen when someone else needs to be heard. You choose your role.',
    icon1: 'mic',
    icon2: 'ear-outline',
    cardDesc: 'A dynamic ecosystem where your voice matters as much as your ears.',
    buttonLabel: 'Next',
  },
  {
    mascot: 'secure' as const,
    title: 'Privacy is Our',
    titleAccent: 'Promise',
    subtitle: 'All conversations are anonymous, encrypted, and never recorded. Your safety comes first.',
    icon1: 'lock-closed',
    icon2: 'finger-print',
    cardDesc: 'End-to-end privacy you can trust',
    buttonLabel: 'Get Started',
  },
];

export default function OnboardingScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNext = () => {
    if (currentPage < 2) {
      scrollViewRef.current?.scrollTo({ x: W * (currentPage + 1), animated: true });
    } else {
      navigation.navigate('SecureSetup');
    }
  };

  const handleScroll = (event: any) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / W);
    if (page !== currentPage && page >= 0 && page <= 2) {
      setCurrentPage(page);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Atmospheric BG */}
      <View style={styles.bgBlur1} pointerEvents="none" />
      <View style={styles.bgBlur2} pointerEvents="none" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brand}>
          <Ionicons name="shield-checkmark" size={sc(22)} color={colors.primary} />
          <Text style={[styles.brandText, { color: colors.primary }]}>Pill</Text>
        </View>
        {currentPage < 2 && (
          <TouchableOpacity onPress={() => navigation.navigate('SecureSetup')} style={styles.touch44} activeOpacity={0.5}>
            <Text style={[styles.skipText, { color: colors.onSurfaceVariant }]}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Pager */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {onboardingData.map((page, index) => (
          <View key={index} style={styles.page}>
            {/* Image Card */}
            <View style={[styles.cardContainer, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={[styles.cardGlow, { backgroundColor: colors.primaryContainer + '55' }]} pointerEvents="none" />
              <OtterMascot name={page.mascot} size={sc(250)} containerStyle={styles.cardMascot} />
              <View style={styles.glassOverlay}>
                <View style={styles.iconRow}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.primaryContainer + '1A' }]}>
                    <Ionicons name={page.icon1 as any} size={sc(18)} color={colors.primary} />
                  </View>
                  <View style={[styles.iconDivider, { backgroundColor: colors.primary + '33' }]} />
                  <View style={[styles.iconCircle, { backgroundColor: colors.primaryContainer + '1A' }]}>
                    <Ionicons name={page.icon2 as any} size={sc(18)} color={colors.secondary} />
                  </View>
                </View>
                <Text style={[styles.cardDescription, { color: colors.onSurface }]}>{page.cardDesc}</Text>
              </View>
            </View>

            {/* Text */}
            <View style={styles.textSection}>
              <Text style={[styles.title, { color: colors.onSurface }]}>
                {page.title}{'\n'}
                <Text style={[styles.titleAccent, { color: colors.primary }]}>{page.titleAccent}</Text>
              </Text>
              <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{page.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.progressDots}>
          {[0, 1, 2].map(i => (
            <View
              key={i}
              style={[
                styles.dot,
                currentPage === i ? styles.dotActive : styles.dotInactive,
                { backgroundColor: currentPage === i ? colors.primary : colors.outlineVariant + '4D' },
              ]}
            />
          ))}
        </View>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
              {currentPage === 2 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons name="arrow-forward" size={sc(18)} color={colors.onPrimary} />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={[styles.privacyText, { color: colors.onSurfaceVariant }]}>Your privacy is our priority</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(24), paddingBottom: sc(16) },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  brandText: { fontSize: sc(17), fontWeight: '800', letterSpacing: -0.5 },
  touch44: { paddingVertical: 10, paddingHorizontal: 10, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  skipText: { fontSize: sc(13), fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: {},
  page: { justifyContent: 'center', width: W, paddingHorizontal: sc(24) },
  cardContainer: { width: '100%', aspectRatio: 4 / 5, borderRadius: sc(24), overflow: 'hidden', marginBottom: sc(20), alignItems: 'center', justifyContent: 'center' },
  cardGlow: { position: 'absolute', width: sc(220), height: sc(220), borderRadius: sc(110), opacity: 0.28 },
  cardMascot: { marginBottom: sc(30) },
  glassOverlay: { position: 'absolute', left: sc(16), right: sc(16), bottom: sc(16), backgroundColor: 'rgba(251,249,245,0.5)', borderRadius: sc(12), padding: sc(18) },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  iconCircle: { padding: 7, borderRadius: 18 },
  iconDivider: { width: 36, height: 4, borderRadius: 2 },
  cardDescription: { fontSize: sc(12), lineHeight: sc(18) },
  textSection: { alignItems: 'center' },
  title: { fontSize: sc(30), fontWeight: '800', lineHeight: sc(36), letterSpacing: -0.5, textAlign: 'center', marginBottom: sc(10) },
  titleAccent: { fontStyle: 'italic' },
  subtitle: { fontSize: sc(14), lineHeight: sc(21), textAlign: 'center', maxWidth: '85%' },
  footer: { alignItems: 'center', gap: sc(16), paddingTop: sc(8), paddingHorizontal: sc(24) },
  progressDots: { flexDirection: 'row', gap: 5 },
  dot: { borderRadius: 10 },
  dotInactive: { width: 7, height: 7 },
  dotActive: { width: sc(24), height: 7 },
  primaryButton: { width: '100%', borderRadius: sc(28), overflow: 'hidden' },
  gradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: sc(16) },
  primaryButtonText: { fontSize: sc(15), fontWeight: '700' },
  privacyText: { fontSize: sc(10), textTransform: 'uppercase', letterSpacing: 2, opacity: 0.7 },
  bgBlur1: { position: 'absolute', top: -sc(60), left: -sc(60), width: sc(220), height: sc(220), borderRadius: sc(110), opacity: 0.06 },
  bgBlur2: { position: 'absolute', bottom: -sc(60), right: -sc(60), width: sc(220), height: sc(220), borderRadius: sc(110), opacity: 0.06 },
});
