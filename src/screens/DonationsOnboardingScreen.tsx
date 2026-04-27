import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setOnboarded } from '../utils/donations';
import OtterMascot from '../components/OtterMascot';
import BrandLogo from '../components/BrandLogo';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const pages = [
  {
    icon: 'heart-circle' as const,
    mascot: 'donate' as const,
    title: 'Support Causes',
    titleAccent: 'That Matter',
    subtitle: 'Discover and support fundraisers that resonate with your values. Every contribution makes a difference.',
    cardDesc: 'Give what you can, when you can',
    icon1: 'heart',
    icon2: 'hands-clap',
    buttonLabel: 'Continue',
  },
  {
    icon: 'gift' as const,
    mascot: 'donationThanks' as const,
    title: 'Earn Rewards',
    titleAccent: 'As You Give',
    subtitle: 'Unlock gift tiers and earn shareable certificates for your contributions. Giving feels even better with recognition.',
    cardDesc: 'Track your impact & get rewarded',
    icon1: 'trophy',
    icon2: 'ribbon',
    buttonLabel: 'Next',
  },
  {
    icon: 'people' as const,
    mascot: 'fundraiserCreate' as const,
    title: 'Start Your Own',
    titleAccent: 'Fundraiser',
    subtitle: 'Create campaigns for causes you care about. Get verified and reach a community ready to support.',
    cardDesc: 'Your story can inspire change',
    icon1: 'create',
    icon2: 'megaphone',
    buttonLabel: 'Explore Feed',
  },
];

export default function DonationsOnboardingScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = theme;
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNext = async () => {
    if (currentPage < pages.length - 1) {
      scrollViewRef.current?.scrollTo({ x: W * (currentPage + 1), animated: true });
    } else {
      await setOnboarded();
      navigation.navigate('DonationsFeed');
    }
  };

  const handleScroll = (event: any) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / W);
    if (page !== currentPage && page >= 0 && page < pages.length) {
      setCurrentPage(page);
    }
  };

  const handleSkip = async () => {
    await setOnboarded();
    navigation.navigate('DonationsFeed');
  };

  const page = pages[currentPage];

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brand}>
          <BrandLogo width={sc(86)} height={sc(38)} />
        </View>
        {currentPage < pages.length - 1 && (
          <TouchableOpacity onPress={handleSkip} style={styles.touch44} activeOpacity={0.5}>
            <Text style={[styles.skipText, { color: colors.onSurfaceVariant }]}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
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
        {pages.map((p, index) => (
          <View key={index} style={styles.page}>
            {/* Icon Card */}
            <View style={[styles.iconCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={[styles.iconCardGlow, { backgroundColor: colors.tertiaryContainer + '33' }]} pointerEvents="none" />
              <OtterMascot name={p.mascot} size={sc(202)} />
              <View style={styles.cardGlass}>
                <View style={styles.iconRow}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.primaryContainer + '1A' }]}>
                    <Ionicons name={p.icon1 as any} size={sc(16)} color={colors.primary} />
                  </View>
                  <View style={[styles.iconDivider, { backgroundColor: colors.primary + '33' }]} />
                  <View style={[styles.iconCircle, { backgroundColor: colors.primaryContainer + '1A' }]}>
                    <Ionicons name={p.icon2 as any} size={sc(16)} color={colors.secondary} />
                  </View>
                </View>
                <Text style={[styles.cardDescription, { color: colors.onSurface }]}>{p.cardDesc}</Text>
              </View>
            </View>

            {/* Text */}
            <View style={styles.textSection}>
              <Text style={[styles.title, { color: colors.onSurface }]}>
                {p.title}{'\n'}
                <Text style={[styles.titleAccent, { color: colors.primary }]}>{p.titleAccent}</Text>
              </Text>
              <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{p.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.progressDots}>
          {pages.map((_, i) => (
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
            colors={[colors.primaryDim, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
              {currentPage === pages.length - 1 ? 'Explore Feed' : 'Next'}
            </Text>
            <Ionicons name="arrow-forward" size={sc(18)} color={colors.onPrimary} />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={[styles.privacyText, { color: colors.onSurfaceVariant }]}>Support anonymously</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(24), paddingBottom: sc(16) },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  brandText: { fontSize: sc(16), fontWeight: '800', letterSpacing: -0.5 },
  touch44: { paddingVertical: 10, paddingHorizontal: 10, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  skipText: { fontSize: sc(13), fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: {},
  page: { justifyContent: 'center', width: W, paddingHorizontal: sc(24) },
  iconCard: { width: '100%', aspectRatio: 4 / 3, borderRadius: sc(24), alignItems: 'center', justifyContent: 'center', marginBottom: sc(24), overflow: 'hidden' },
  iconCardGlow: { position: 'absolute', width: sc(190), height: sc(190), borderRadius: sc(95), opacity: 0.45 },
  cardGlass: { position: 'absolute', left: sc(16), right: sc(16), bottom: sc(16), backgroundColor: 'rgba(251,249,245,0.7)', borderRadius: sc(12), padding: sc(14) },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  iconCircle: { padding: 7, borderRadius: 18 },
  iconDivider: { width: 30, height: 3, borderRadius: 2 },
  cardDescription: { fontSize: sc(11), lineHeight: sc(16), textAlign: 'center' },
  textSection: { alignItems: 'center' },
  title: { fontSize: sc(28), fontWeight: '800', lineHeight: sc(34), letterSpacing: -0.5, textAlign: 'center', marginBottom: sc(8) },
  titleAccent: { fontStyle: 'italic' },
  subtitle: { fontSize: sc(14), lineHeight: sc(21), textAlign: 'center', maxWidth: '85%' },
  footer: { alignItems: 'center', gap: sc(14), paddingTop: sc(8), paddingHorizontal: sc(24) },
  progressDots: { flexDirection: 'row', gap: 5 },
  dot: { borderRadius: 10 },
  dotInactive: { width: 7, height: 7 },
  dotActive: { width: sc(24), height: 7 },
  primaryButton: { width: '100%', borderRadius: sc(28), overflow: 'hidden' },
  gradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: sc(16) },
  primaryButtonText: { fontSize: sc(15), fontWeight: '700' },
  privacyText: { fontSize: sc(10), textTransform: 'uppercase', letterSpacing: 2, opacity: 0.7 },
});
