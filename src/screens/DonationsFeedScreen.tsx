import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Animated,
  Easing,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import BottomNav from '../components/BottomNav';
import { getFundraisers, Fundraiser, isOnboarded, setOnboarded } from '../utils/donations';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const onboardingFeatures = [
  { icon: 'create-outline', title: 'Create Fundraisers', desc: 'Start a campaign for causes you care about' },
  { icon: 'heart-outline', title: 'Donate & Support', desc: 'Give money or watch ads to contribute to others' },
  { icon: 'shield-checkmark-outline', title: 'Verified & Trusted', desc: 'Organizations get blue badges for authenticity' },
];

export default function DonationsFeedScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFundraisers();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFundraisers();
    }, [])
  );

  const loadFundraisers = async () => {
    const data = await getFundraisers();
    setFundraisers(data);
    setLoading(false);

    const onboarded = await isOnboarded();
    if (!onboarded) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingContinue = async () => {
    await setOnboarded();
    setShowOnboarding(false);
  };

  const progress = (f: Fundraiser) =>
    f.goalAmount > 0 ? Math.min((f.raisedAmount / f.goalAmount) * 100, 100) : 0;

  const formatCurrency = (n: number) =>
    `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  // Onboarding overlay
  if (showOnboarding) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={[styles.topBar, { paddingTop: insets.top }]}>
          <View style={styles.brand}>
            <Ionicons name="heart-circle" size={sc(20)} color={colors.primary} />
            <Text style={[styles.brandText, { color: colors.primary }]}>Pill | Donation</Text>
          </View>
        </View>

        <View style={styles.onboardingContent}>
          <LinearGradient
            colors={[colors.primaryDim + '40', colors.primary + '15', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.heroGradient}
          />
          <View style={[styles.heroIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="heart" size={sc(56)} color={colors.primary} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.onSurface }]}>Make a Difference</Text>
          <Text style={[styles.heroSub, { color: colors.onSurfaceVariant }]}>
            Start a fundraiser, donate with money or ads, and help causes that matter to you.
          </Text>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <Ionicons name="people" size={sc(24)} color={colors.primary} />
              <Text style={[styles.statNum, { color: colors.onSurface }]}>$10,340</Text>
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Total Raised</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <Ionicons name="hand-left" size={sc(24)} color={colors.tertiary} />
              <Text style={[styles.statNum, { color: colors.onSurface }]}>47</Text>
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Donations</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <Ionicons name="shield-checkmark" size={sc(24)} color={colors.primary} />
              <Text style={[styles.statNum, { color: colors.onSurface }]}>{fundraisers.length}</Text>
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Fundraisers</Text>
            </View>
          </View>

          <View style={styles.featuresWrap}>
            {onboardingFeatures.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: colors.primaryFixed + '30' }]}>
                  <Ionicons name={f.icon as any} size={sc(22)} color={colors.primary} />
                </View>
                <View style={styles.featureText}>
                  <Text style={[styles.featureTitle, { color: colors.onSurface }]}>{f.title}</Text>
                  <Text style={[styles.featureDesc, { color: colors.onSurfaceVariant }]}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.onboardingBtnWrap} onPress={handleOnboardingContinue} activeOpacity={0.85}>
            <LinearGradient
              colors={[colors.primaryDim, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.onboardingBtn}
            >
              <Text style={[styles.onboardingBtnText, { color: colors.onPrimary }]}>Get Started</Text>
              <Ionicons name="arrow-forward" size={sc(18)} color={colors.onPrimary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <BottomNav navigation={navigation} activeScreen="DonationsFeed" theme={theme} />
      </View>
    );
  }

  // Loading state inline
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={[styles.topBar, { paddingTop: insets.top }]}>
          <View style={styles.brand}>
            <Ionicons name="heart-circle" size={sc(20)} color={colors.primary} />
            <Text style={[styles.brandText, { color: colors.primary }]}>Pill | Donation</Text>
          </View>
        </View>
        <View style={styles.loadingState}>
          <Ionicons name="heart-circle-outline" size={sc(48)} color={colors.primaryFixedDim} />
        </View>
        <BottomNav navigation={navigation} activeScreen="DonationsFeed" theme={theme} />
      </View>
    );
  }

  // Empty state inline
  if (fundraisers.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={[styles.topBar, { paddingTop: insets.top }]}>
          <View style={styles.brand}>
            <Ionicons name="heart-circle" size={sc(20)} color={colors.primary} />
            <Text style={[styles.brandText, { color: colors.primary }]}>Pill | Donation</Text>
          </View>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={sc(48)} color={colors.outlineVariant} />
          <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>No fundraisers yet</Text>
          <Text style={[styles.emptySub, { color: colors.onSurfaceVariant }]}>
            Be the first to start a campaign
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('CreateFundraiser')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.primaryDim, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.emptyBtnInner}
            >
              <Ionicons name="add-circle" size={sc(16)} color={colors.onPrimary} />
              <Text style={[styles.emptyBtnText, { color: colors.onPrimary }]}>Create Fundraiser</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <BottomNav navigation={navigation} activeScreen="DonationsFeed" theme={theme} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={styles.brand}>
          <Ionicons name="heart-circle" size={sc(18)} color={colors.primary} />
          <Text style={[styles.brandText, { color: colors.primary }]}>Pill | Donation</Text>
        </View>
        <View style={styles.topActions}>
          <TouchableOpacity
            style={[styles.topActionBtn, { backgroundColor: colors.surfaceContainerHigh }]}
            onPress={() => navigation.navigate('DonationHistory')}
            activeOpacity={0.7}
          >
            <Ionicons name="receipt-outline" size={sc(18)} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('CreateFundraiser')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={sc(18)} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={sc(18)} color={colors.onSurfaceVariant} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, {
            backgroundColor: colors.surfaceContainer,
            color: colors.onSurface,
          }]}
          placeholder="Search fundraisers..."
          placeholderTextColor={colors.onSurfaceVariant}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={sc(18)} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {fundraisers
          .filter((f) => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
              f.title.toLowerCase().includes(q) ||
              f.description.toLowerCase().includes(q) ||
              f.creatorName.toLowerCase().includes(q) ||
              (f.orgName && f.orgName.toLowerCase().includes(q))
            );
          })
          .map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}
            onPress={() => navigation.navigate('DonationPostDetail', { postId: f.id })}
            activeOpacity={0.85}
          >
            {f.imageUrl ? (
              <Image source={{ uri: f.imageUrl }} style={styles.cardImage} />
            ) : (
              <View style={[styles.cardImagePlaceholder, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="heart" size={sc(32)} color={colors.primaryFixedDim} />
              </View>
            )}
            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.onSurface }]} numberOfLines={2}>
                  {f.title}
                </Text>
                {f.creatorType === 'organization' && (
                  <Ionicons name="checkmark-circle" size={sc(16)} color={colors.primary} />
                )}
              </View>
              <View style={styles.cardCreator}>
                <View style={[styles.creatorAvatar, { backgroundColor: colors.surfaceVariant }]}>
                  <Ionicons name="person" size={sc(12)} color={colors.onSurfaceVariant} />
                </View>
                <Text style={[styles.creatorName, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                  {f.creatorType === 'organization' ? f.orgName : f.creatorName}
                </Text>
              </View>
              <View style={styles.progressWrap}>
                <View style={[styles.progressBg, { backgroundColor: colors.surfaceContainerHigh }]}>
                  <LinearGradient
                    colors={[colors.primaryDim, colors.primaryFixedDim]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${progress(f)}%` }]}
                  />
                </View>
              </View>
              <View style={styles.progressRow}>
                <Text style={[styles.raised, { color: colors.primary }]}>
                  {formatCurrency(f.raisedAmount)} raised
                </Text>
                <Text style={[styles.goal, { color: colors.onSurfaceVariant }]}>
                  {Math.round(progress(f))}% of {formatCurrency(f.goalAmount)}
                </Text>
              </View>
              {f.giftTiers && f.giftTiers.length > 0 && (
                <View style={[styles.giftBadge, { backgroundColor: colors.tertiaryContainer + '25' }]}>
                  <Ionicons name="gift" size={sc(11)} color={colors.tertiary} />
                  <Text style={[styles.giftBadgeText, { color: colors.tertiary }]}>
                    {f.giftTiers.length} gift{f.giftTiers.length > 1 ? 's' : ''} available
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
        {fundraisers.length > 0 && searchQuery.trim().length > 0 && (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={sc(48)} color={colors.outlineVariant} />
            <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>No results found</Text>
            <Text style={[styles.emptySub, { color: colors.onSurfaceVariant }]}>
              Try a different search term
            </Text>
          </View>
        )}
        <View style={{ height: sc(80) }} />
      </ScrollView>

      <BottomNav navigation={navigation} activeScreen="DonationsFeed" theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: sc(20), paddingBottom: sc(12),
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: sc(6) },
  brandText: { fontSize: sc(16), fontWeight: '800', letterSpacing: -0.5 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: sc(8) },
  topActionBtn: { width: sc(36), height: sc(36), borderRadius: sc(18), alignItems: 'center', justifyContent: 'center' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: sc(20), paddingBottom: sc(10),
  },
  searchIcon: { position: 'absolute', left: sc(30), zIndex: 1 },
  searchInput: {
    flex: 1, borderRadius: sc(14), paddingVertical: sc(11),
    paddingHorizontal: sc(40), fontSize: sc(14),
  },
  noResults: { alignItems: 'center', justifyContent: 'center', paddingVertical: sc(40) },
  giftBadge: {
    flexDirection: 'row', alignItems: 'center', gap: sc(4),
    borderRadius: sc(8), paddingHorizontal: sc(8), paddingVertical: sc(3),
    alignSelf: 'flex-start', marginTop: sc(4),
  },
  giftBadgeText: { fontSize: sc(10), fontWeight: '700' },
  createBtn: {
    width: sc(36), height: sc(36), borderRadius: sc(18),
    alignItems: 'center', justifyContent: 'center',
  },
  scrollContent: { paddingHorizontal: sc(16), paddingTop: sc(8) },
  card: { borderRadius: sc(16), marginBottom: sc(12), overflow: 'hidden' },
  cardImage: { width: '100%', height: sc(140), resizeMode: 'cover' },
  cardImagePlaceholder: {
    width: '100%', height: sc(100), alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { padding: sc(14) },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: sc(6), marginBottom: sc(6) },
  cardTitle: { fontSize: sc(15), fontWeight: '700', flex: 1 },
  cardCreator: { flexDirection: 'row', alignItems: 'center', gap: sc(6), marginBottom: sc(10) },
  creatorAvatar: {
    width: sc(22), height: sc(22), borderRadius: sc(11),
    alignItems: 'center', justifyContent: 'center',
  },
  creatorName: { fontSize: sc(12), fontWeight: '500' },
  progressWrap: { marginBottom: sc(8) },
  progressBg: { height: sc(6), borderRadius: sc(3), overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: sc(3) },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  raised: { fontSize: sc(12), fontWeight: '700' },
  goal: { fontSize: sc(11) },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: sc(32) },
  emptyTitle: { fontSize: sc(20), fontWeight: '800', marginTop: sc(16), marginBottom: sc(6) },
  emptySub: { fontSize: sc(14), textAlign: 'center', marginBottom: sc(24) },
  emptyBtn: { borderRadius: sc(16), overflow: 'hidden' },
  emptyBtnInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: sc(6), paddingVertical: sc(14), paddingHorizontal: sc(24), minHeight: sc(48),
  },
  emptyBtnText: { fontSize: sc(14), fontWeight: '700' },
  onboardingContent: { flex: 1, paddingHorizontal: sc(20), paddingTop: sc(16), alignItems: 'center' },
  heroGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: '40%' },
  heroIcon: { width: sc(80), height: sc(80), borderRadius: sc(40), alignItems: 'center', justifyContent: 'center', marginBottom: sc(12) },
  heroTitle: { fontSize: sc(26), fontWeight: '800', letterSpacing: -0.5, textAlign: 'center', marginBottom: sc(8) },
  heroSub: { fontSize: sc(14), lineHeight: sc(22), textAlign: 'center', maxWidth: '90%', marginBottom: sc(20) },
  statsRow: { flexDirection: 'row', gap: sc(10), width: '100%', marginBottom: sc(20) },
  statCard: { flex: 1, borderRadius: sc(14), paddingVertical: sc(14), alignItems: 'center', paddingHorizontal: sc(8) },
  statNum: { fontSize: sc(18), fontWeight: '800', marginTop: sc(6), marginBottom: sc(2) },
  statLabel: { fontSize: sc(10), textAlign: 'center' },
  featuresWrap: { width: '100%', marginBottom: sc(20) },
  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: sc(14),
    paddingVertical: sc(12), borderBottomWidth: StyleSheet.hairlineWidth,
  },
  featureIcon: { width: sc(40), height: sc(40), borderRadius: sc(20), alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1 },
  featureTitle: { fontSize: sc(14), fontWeight: '700', marginBottom: sc(2) },
  featureDesc: { fontSize: sc(11), lineHeight: sc(16) },
  onboardingBtnWrap: { borderRadius: sc(16), overflow: 'hidden', width: '100%', marginBottom: sc(24) },
  onboardingBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: sc(8), paddingVertical: sc(15), minHeight: sc(50),
  },
  onboardingBtnText: { fontSize: sc(15), fontWeight: '700' },
});
