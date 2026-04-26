import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import BottomNav from '../components/BottomNav';
import OtterMascot from '../components/OtterMascot';
import { getFundraisers, Fundraiser, getFundraiserAccount, isFullyVerified, getNextVerificationStep } from '../utils/donations';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function DonationsFeedScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = theme;
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    loadFundraisers();
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const closeMenu = () => setMenuOpen(false);

  useFocusEffect(
    useCallback(() => {
      loadFundraisers();
    }, [])
  );

  const loadFundraisers = async () => {
    const data = await getFundraisers();
    setFundraisers(data);
    setLoading(false);
  };

  const handleCreateFundraiser = async () => {
    closeMenu();
    const account = await getFundraiserAccount();
    const verified = isFullyVerified(account);
    if (!verified) {
      const nextStep = getNextVerificationStep(account);
      if (nextStep) {
        navigation.navigate(nextStep);
      } else {
        navigation.navigate('VerificationType');
      }
    } else {
      navigation.navigate('CreateFundraiser');
    }
  };

  const progress = (f: Fundraiser) =>
    f.goalAmount > 0 ? Math.min((f.raisedAmount / f.goalAmount) * 100, 100) : 0;
  const progressFill = (f: Fundraiser) => {
    const pct = progress(f);
    return f.raisedAmount > 0 && pct > 0 ? Math.max(pct, 1) : pct;
  };
  const progressLabel = (f: Fundraiser) => {
    const pct = progress(f);
    return f.raisedAmount > 0 && pct > 0 && pct < 1 ? '<1' : `${Math.round(pct)}`;
  };

  const formatCurrency = (n: number) =>
    `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const filtered = searchQuery.trim()
    ? fundraisers.filter((f) => {
        const q = searchQuery.toLowerCase();
        return (
          f.title.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.creatorName.toLowerCase().includes(q) ||
          (f.orgName && f.orgName.toLowerCase().includes(q))
        );
      })
    : fundraisers;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={styles.brand}>
          <Ionicons name="heart-circle" size={sc(20)} color={colors.primary} />
          <Text style={[styles.brandText, { color: colors.primary }]}>
            Pill | Donation
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.menuBtn, { backgroundColor: colors.surfaceContainerHigh }]}
          onPress={toggleMenu}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={sc(20)} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
      {menuOpen && (
        <View style={styles.menuOverlay}>
          <View style={[styles.menuDropdown, { backgroundColor: colors.surface, borderColor: colors.outlineVariant + '44' }]}>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.outlineVariant + '22' }]}
              onPress={handleCreateFundraiser}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={sc(18)} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.onSurface }]}>Create Fundraiser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.outlineVariant + '22' }]}
              onPress={() => { closeMenu(); navigation.navigate('DonationHistory'); }}
              activeOpacity={0.7}
            >
              <Ionicons name="receipt-outline" size={sc(18)} color={colors.tertiary} />
              <Text style={[styles.menuItemText, { color: colors.onSurface }]}>My Donations</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { closeMenu(); navigation.navigate('MyFundraiser'); }}
              activeOpacity={0.7}
            >
              <Ionicons name="heart-outline" size={sc(18)} color={colors.secondary} />
              <Text style={[styles.menuItemText, { color: colors.onSurface }]}>My Fundraiser</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={sc(18)} color={colors.onSurfaceVariant} style={styles.searchIcon} />
        <TextInput
          style={[
            styles.searchInput,
            { backgroundColor: colors.surfaceContainer, color: colors.onSurface },
          ]}
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

      {/* Feed */}
      {loading ? (
        <View style={styles.stateContainer}>
          <OtterMascot name="donate" size={sc(112)} containerStyle={styles.stateMascot} />
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : fundraisers.length === 0 ? (
        <View style={styles.stateContainer}>
          <OtterMascot name="donate" size={sc(136)} containerStyle={styles.stateMascot} />
          <Text style={[styles.stateTitle, { color: colors.onSurface }]}>No fundraisers yet</Text>
          <Text style={[styles.stateSub, { color: colors.onSurfaceVariant }]}>
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
              <Text style={[styles.emptyBtnText, { color: colors.onPrimary }]}>
                Create Fundraiser
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 && searchQuery.trim().length > 0 ? (
            <View style={styles.stateContainer}>
              <Ionicons name="search-outline" size={sc(48)} color={colors.outlineVariant} />
              <Text style={[styles.stateTitle, { color: colors.onSurface }]}>No results found</Text>
              <Text style={[styles.stateSub, { color: colors.onSurfaceVariant }]}>
                Try a different search term
              </Text>
            </View>
          ) : (
            filtered.map((f) => (
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
                        style={[styles.progressFill, { width: `${progressFill(f)}%` }]}
                      />
                    </View>
                  </View>
                  <View style={styles.progressRow}>
                    <Text style={[styles.raised, { color: colors.primary }]}>
                      {formatCurrency(f.raisedAmount)} raised
                    </Text>
                    <Text style={[styles.goal, { color: colors.onSurfaceVariant }]}>
                      {progressLabel(f)}% of {formatCurrency(f.goalAmount)}
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
            ))
          )}
          <View style={{ height: sc(80) }} />
        </ScrollView>
      )}

      <BottomNav navigation={navigation} activeScreen="DonationsFeed" theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: sc(20),
    paddingBottom: sc(12),
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: sc(6) },
  brandText: { fontSize: sc(16), fontWeight: '800', letterSpacing: -0.5 },
  menuBtn: {
    width: sc(36),
    height: sc(36),
    borderRadius: sc(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sc(20),
    paddingBottom: sc(10),
  },
  searchIcon: { position: 'absolute', left: sc(30), zIndex: 1 },
  searchInput: {
    flex: 1,
    borderRadius: sc(14),
    paddingVertical: sc(11),
    paddingHorizontal: sc(40),
    fontSize: sc(14),
  },
  scrollContent: { paddingHorizontal: sc(16), paddingTop: sc(8) },
  stateContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: sc(32) },
  stateMascot: { marginBottom: sc(12) },
  stateTitle: { fontSize: sc(20), fontWeight: '800', marginTop: sc(16), marginBottom: sc(6) },
  stateSub: { fontSize: sc(14), textAlign: 'center', marginBottom: sc(24) },
  emptyBtn: { borderRadius: sc(16), overflow: 'hidden' },
  emptyBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sc(6),
    paddingVertical: sc(14),
    paddingHorizontal: sc(24),
    minHeight: sc(48),
  },
  emptyBtnText: { fontSize: sc(14), fontWeight: '700' },
  card: { borderRadius: sc(16), marginBottom: sc(12), overflow: 'hidden' },
  cardImage: { width: '100%', height: sc(140), resizeMode: 'cover' },
  cardImagePlaceholder: {
    width: '100%',
    height: sc(100),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { padding: sc(14) },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: sc(6), marginBottom: sc(6) },
  cardTitle: { fontSize: sc(15), fontWeight: '700', flex: 1 },
  cardCreator: { flexDirection: 'row', alignItems: 'center', gap: sc(6), marginBottom: sc(10) },
  creatorAvatar: {
    width: sc(22),
    height: sc(22),
    borderRadius: sc(11),
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorName: { fontSize: sc(12), fontWeight: '500' },
  progressWrap: { marginBottom: sc(8) },
  progressBg: { height: sc(6), borderRadius: sc(3), overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: sc(3) },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  raised: { fontSize: sc(12), fontWeight: '700' },
  goal: { fontSize: sc(11) },
  giftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sc(4),
    borderRadius: sc(8),
    paddingHorizontal: sc(8),
    paddingVertical: sc(3),
    alignSelf: 'flex-start',
    marginTop: sc(4),
  },
  giftBadgeText: { fontSize: sc(10), fontWeight: '700' },
  menuOverlay: {
    position: 'absolute',
    top: sc(60),
    right: sc(20),
    zIndex: 100,
  },
  menuDropdown: {
    borderRadius: sc(12),
    borderWidth: 1,
    overflow: 'hidden',
    minWidth: sc(200),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sc(10),
    paddingVertical: sc(14),
    paddingHorizontal: sc(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuItemText: {
    fontSize: sc(14),
    fontWeight: '600',
  },
});
