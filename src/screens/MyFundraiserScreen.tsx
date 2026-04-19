import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Animated,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  getMyFundraisers,
  getFundraiserAccount,
  MyFundraiser,
  FundraiserAccount,
} from '../utils/donations';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function MyFundraiserScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = theme;
  const [fundraisers, setFundraisers] = useState<MyFundraiser[]>([]);
  const [account, setAccount] = useState<FundraiserAccount | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const slideAnim = useState(new Animated.Value(-W * 0.75))[0];

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const data = await getMyFundraisers();
    setFundraisers(data);
    const acc = await getFundraiserAccount();
    setAccount(acc);
  };

  const toggleSidebar = () => {
    if (sidebarOpen) {
      Animated.timing(slideAnim, {
        toValue: -W * 0.75,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setSidebarOpen(false));
    } else {
      setSidebarOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  const openScreen = (screen: string, params?: any) => {
    toggleSidebar();
    navigation.navigate(screen, params);
  };

  // Check if account exists, if not go to auth
  if (!account) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <View style={[styles.topBar, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.topTitle, { color: colors.onSurface }]}>My Fundraiser</Text>
          <View style={{ width: sc(22) }} />
        </View>
        <View style={styles.authPrompt}>
          <View style={[styles.authIcon, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="lock-closed-outline" size={sc(48)} color={colors.primary} />
          </View>
          <Text style={[styles.authTitle, { color: colors.onSurface }]}>Sign In Required</Text>
          <Text style={[styles.authSub, { color: colors.onSurfaceVariant }]}>
            Sign in or create an account to manage your fundraisers
          </Text>
          <TouchableOpacity
            style={styles.authBtn}
            onPress={() => navigation.navigate('MyFundraiserAuth')}
            activeOpacity={0.85}
          >
            <LinearGradient colors={[colors.primaryDim, colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.authBtnInner}>
              <Text style={[styles.authBtnText, { color: colors.onPrimary }]}>Sign In / Create Account</Text>
              <Ionicons name="arrow-forward" size={sc(18)} color={colors.onPrimary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.onSurface }]}>My Fundraiser</Text>
        <TouchableOpacity
          style={[styles.menuBtn, { backgroundColor: colors.surfaceContainerHigh }]}
          onPress={toggleSidebar}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={sc(22)} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Sidebar Modal */}
      <Modal visible={sidebarOpen} transparent animationType="fade" onRequestClose={toggleSidebar}>
        <View style={styles.sidebarModalRoot}>
          <TouchableOpacity style={styles.sidebarOverlay} activeOpacity={1} onPress={toggleSidebar} />
          <Animated.View
            style={[
              styles.sidebar,
              {
                backgroundColor: colors.surface,
                paddingTop: insets.top + sc(12),
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={styles.sidebarHeader}>
              <View style={[styles.sidebarAvatar, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="person-circle" size={sc(36)} color={colors.primary} />
              </View>
              <Text style={[styles.sidebarName, { color: colors.onSurface }]}>
                {account.email.split('@')[0] || 'User'}
              </Text>
              <View style={[styles.sidebarBadge, {
                backgroundColor: account.type === 'organization' ? colors.primary + '22' : colors.secondary + '22',
              }]}>
                <Text style={[styles.sidebarBadgeText, {
                  color: account.type === 'organization' ? colors.primary : colors.secondary,
                }]}>
                  {account.type === 'organization' ? 'Organization' : 'Individual'}
                </Text>
              </View>
            </View>

            <View style={[styles.sidebarDivider, { backgroundColor: colors.outlineVariant + '30' }]} />

            <Text style={[styles.sidebarSectionLabel, { color: colors.onSurfaceVariant }]}>Management</Text>

            <TouchableOpacity style={styles.sidebarItem} onPress={() => openScreen('CommentReply', { postId: fundraisers[0]?.id })} activeOpacity={0.7}>
              <Ionicons name="chatbubble-ellipses-outline" size={sc(18)} color={colors.onSurfaceVariant} />
              <Text style={[styles.sidebarItemText, { color: colors.onSurface }]}>Comments & Replies</Text>
              <Ionicons name="chevron-forward" size={sc(16)} color={colors.onSurfaceVariant} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarItem} onPress={() => openScreen('FundraiserEdit', { fundraiserId: fundraisers[0]?.id })} activeOpacity={0.7}>
              <Ionicons name="create-outline" size={sc(18)} color={colors.onSurfaceVariant} />
              <Text style={[styles.sidebarItemText, { color: colors.onSurface }]}>Edit Fundraiser</Text>
              <Ionicons name="chevron-forward" size={sc(16)} color={colors.onSurfaceVariant} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarItem} onPress={() => openScreen('ProfileSettings')} activeOpacity={0.7}>
              <Ionicons name="person-outline" size={sc(18)} color={colors.onSurfaceVariant} />
              <Text style={[styles.sidebarItemText, { color: colors.onSurface }]}>Profile & Settings</Text>
              <Ionicons name="chevron-forward" size={sc(16)} color={colors.onSurfaceVariant} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.sidebarItem} onPress={() => { toggleSidebar(); navigation.navigate('Payout'); }} activeOpacity={0.7}>
              <Ionicons name="card-outline" size={sc(18)} color={colors.onSurfaceVariant} />
              <Text style={[styles.sidebarItemText, { color: colors.onSurface }]}>Payouts</Text>
              <Ionicons name="chevron-forward" size={sc(16)} color={colors.onSurfaceVariant} />
            </TouchableOpacity>

            {account.type === 'individual' && (
              <TouchableOpacity style={styles.sidebarItem} onPress={() => openScreen('OrgDocumentsUpload')} activeOpacity={0.7}>
                <Ionicons name="arrow-up-circle-outline" size={sc(18)} color={colors.tertiary} />
                <Text style={[styles.sidebarItemText, { color: colors.onSurface }]}>Upgrade to Organization</Text>
                <Ionicons name="chevron-forward" size={sc(16)} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.sidebarItem} onPress={() => { toggleSidebar(); navigation.navigate('MyFundraiserAuth'); }} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={sc(18)} color={colors.error} />
              <Text style={[styles.sidebarItemText, { color: colors.error }]}>Sign Out</Text>
              <Ionicons name="chevron-forward" size={sc(16)} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Campaigns */}
        {/* Campaigns */}
        <View style={styles.campaignsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>My Campaigns</Text>
          <TouchableOpacity
            style={[styles.newCampaignBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('CreateFundraiser')}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={sc(16)} color={colors.onPrimary} />
            <Text style={[styles.newCampaignText, { color: colors.onPrimary }]}>New</Text>
          </TouchableOpacity>
        </View>

        {fundraisers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="megaphone-outline" size={sc(48)} color={colors.outlineVariant} />
            <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>No campaigns yet</Text>
            <Text style={[styles.emptySub, { color: colors.onSurfaceVariant }]}>
              Start your first fundraiser and reach supporters
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('CreateFundraiser')} activeOpacity={0.85}>
              <LinearGradient colors={[colors.primaryDim, colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.emptyBtnInner}>
                <Ionicons name="add-circle" size={sc(16)} color={colors.onPrimary} />
                <Text style={[styles.emptyBtnText, { color: colors.onPrimary }]}>Start Campaign</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          fundraisers.map((f) => (
            <View key={f.id} style={[styles.campaignCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <TouchableOpacity
                style={styles.campaignContent}
                onPress={() => navigation.navigate('DonationPostDetail', { postId: f.id })}
                activeOpacity={0.85}
              >
                {f.imageUrl ? (
                  <Image source={{ uri: f.imageUrl }} style={styles.campaignImage} />
                ) : (
                  <View style={[styles.campaignImagePlaceholder, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="heart" size={sc(32)} color={colors.primaryFixedDim} />
                  </View>
                )}
                <View style={styles.campaignInfo}>
                  <View style={styles.campaignTopRow}>
                    <Text style={[styles.campaignTitle, { color: colors.onSurface }]} numberOfLines={1}>
                      {f.title}
                    </Text>
                    <View style={[styles.statusBadge, {
                      backgroundColor: f.status === 'active' ? colors.primary + '22' : f.status === 'paused' ? colors.tertiary + '22' : colors.outlineVariant + '22',
                    }]}>
                      <Text style={[styles.statusText, {
                        color: f.status === 'active' ? colors.primary : f.status === 'paused' ? colors.tertiary : colors.onSurfaceVariant,
                      }]}>
                        {f.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.campaignDesc, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
                    {f.description}
                  </Text>
                </View>
              </TouchableOpacity>
                <View style={styles.campaignActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.surfaceContainerHigh }]}
                    onPress={() => navigation.navigate('CommentReply', { postId: f.id })}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chatbubble-ellipses" size={sc(14)} color={colors.primary} />
                    <Text style={[styles.actionBtnText, { color: colors.primary }]}>Reply</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.surfaceContainerHigh }]}
                    onPress={() => navigation.navigate('FundraiserEdit', { fundraiserId: f.id })}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="create-outline" size={sc(14)} color={colors.onSurfaceVariant} />
                    <Text style={[styles.actionBtnText, { color: colors.onSurfaceVariant }]}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

        <View style={{ height: sc(80) }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: sc(16), paddingBottom: sc(12),
  },
  topTitle: { fontSize: sc(16), fontWeight: '700' },
  menuBtn: { width: sc(36), height: sc(36), borderRadius: sc(18), alignItems: 'center', justifyContent: 'center' },

  // Auth prompt
  authPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: sc(32) },
  authIcon: { width: sc(96), height: sc(96), borderRadius: sc(48), alignItems: 'center', justifyContent: 'center', marginBottom: sc(24) },
  authTitle: { fontSize: sc(22), fontWeight: '800', marginBottom: sc(8) },
  authSub: { fontSize: sc(14), textAlign: 'center', marginBottom: sc(24) },
  authBtn: { borderRadius: sc(24), overflow: 'hidden' },
  authBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(8), paddingVertical: sc(14), paddingHorizontal: sc(24), minHeight: sc(52) },
  authBtnText: { fontSize: sc(15), fontWeight: '700' },

  // Sidebar
  sidebarModalRoot: { flex: 1 },
  sidebarOverlay: { flex: 1, backgroundColor: '#00000044' },
  sidebar: { position: 'absolute', top: 0, left: 0, bottom: 0, width: W * 0.75, paddingHorizontal: sc(20), zIndex: 1000 },
  sidebarHeader: { alignItems: 'center', paddingVertical: sc(16) },
  sidebarAvatar: { width: sc(64), height: sc(64), borderRadius: sc(32), alignItems: 'center', justifyContent: 'center', marginBottom: sc(10) },
  sidebarName: { fontSize: sc(16), fontWeight: '700', marginBottom: sc(6) },
  sidebarBadge: { borderRadius: sc(10), paddingHorizontal: sc(12), paddingVertical: sc(4) },
  sidebarBadgeText: { fontSize: sc(11), fontWeight: '600' },
  sidebarDivider: { height: 1, marginVertical: sc(12) },
  sidebarSectionLabel: { fontSize: sc(11), fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: sc(8) },
  sidebarItem: { flexDirection: 'row', alignItems: 'center', gap: sc(12), paddingVertical: sc(14), borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#00000011' },
  sidebarItemText: { fontSize: sc(14), fontWeight: '500', flex: 1 },

  // Content
  scrollContent: { paddingHorizontal: sc(16), paddingTop: sc(8) },
  sectionTitle: { fontSize: sc(13), fontWeight: '700' },

  campaignsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: sc(12) },
  newCampaignBtn: { flexDirection: 'row', alignItems: 'center', gap: sc(4), borderRadius: sc(10), paddingHorizontal: sc(12), paddingVertical: sc(6) },
  newCampaignText: { fontSize: sc(12), fontWeight: '700' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: sc(32), paddingVertical: sc(40) },
  emptyTitle: { fontSize: sc(18), fontWeight: '700', marginTop: sc(12), marginBottom: sc(4) },
  emptySub: { fontSize: sc(13), textAlign: 'center', marginBottom: sc(20) },
  emptyBtn: { borderRadius: sc(16), overflow: 'hidden' },
  emptyBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(6), paddingVertical: sc(14), paddingHorizontal: sc(24), minHeight: sc(48) },
  emptyBtnText: { fontSize: sc(14), fontWeight: '700' },

  campaignCard: { borderRadius: sc(14), marginBottom: sc(10), overflow: 'hidden' },
  campaignContent: {},
  campaignImage: { width: '100%', height: sc(120), resizeMode: 'cover' },
  campaignImagePlaceholder: { width: '100%', height: sc(100), alignItems: 'center', justifyContent: 'center' },
  campaignInfo: { padding: sc(14) },
  campaignTopRow: { flexDirection: 'row', alignItems: 'center', gap: sc(6), marginBottom: sc(4) },
  campaignTitle: { fontSize: sc(14), fontWeight: '700', flex: 1 },
  statusBadge: { borderRadius: sc(6), paddingHorizontal: sc(8), paddingVertical: sc(2) },
  statusText: { fontSize: sc(10), fontWeight: '700', textTransform: 'capitalize' },
  campaignDesc: { fontSize: sc(12), lineHeight: sc(18), marginBottom: sc(8) },
  campaignActions: { flexDirection: 'row', gap: sc(8), paddingHorizontal: sc(14), paddingBottom: sc(12) },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: sc(4), borderRadius: sc(8), paddingHorizontal: sc(12), paddingVertical: sc(6) },
  actionBtnText: { fontSize: sc(11), fontWeight: '600' },
});
