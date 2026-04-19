import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFundraiserAccount, FundraiserAccount } from '../utils/donations';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function ProfileSettingsScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = theme;
  const [account, setAccount] = useState<FundraiserAccount | null>(null);

  useEffect(() => {
    loadAccount();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAccount();
    });
    return unsubscribe;
  }, [navigation]);

  const loadAccount = async () => {
    const acc = await getFundraiserAccount();
    setAccount(acc);
  };

  const handleUpgradeOrg = () => {
    if (account?.type === 'organization') {
      Alert.alert('Already Organization', 'Your account is already an organization account.');
      return;
    }
    navigation.navigate('OrgDocumentsUpload');
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', onPress: () => navigation.navigate('MyFundraiserAuth') },
    ]);
  };

  const displayName = account ? (account.email?.split('@')[0] || 'User') : 'User';
  const currentEmail = account?.email || '';
  const currentPhone = account?.phone || 'Not set';

  const InfoRow = ({ icon, label, value, screen }: {
    icon: string; label: string; value: string; screen: string;
  }) => (
    <TouchableOpacity
      style={styles.infoRow}
      onPress={() => navigation.navigate(screen)}
      activeOpacity={0.7}
    >
      <View style={[styles.infoIcon, { backgroundColor: colors.primary + '12' }]}>
        <Ionicons name={icon as any} size={sc(16)} color={colors.primary} />
      </View>
      <View style={styles.infoBody}>
        <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.onSurface }]} numberOfLines={1}>{value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={sc(16)} color={colors.onSurfaceVariant} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.onSurface }]}>Profile & Settings</Text>
        <View style={{ width: sc(38) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.profileCard, { backgroundColor: colors.surfaceContainerLow }]}>
          <LinearGradient
            colors={[colors.primary + '18', colors.primary + '08', colors.surfaceContainerLow]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileInner}
          >
            <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
              <Ionicons name="person" size={sc(32)} color={colors.onPrimary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.onSurface }]}>{displayName}</Text>
              <View style={[styles.profileBadge, {
                backgroundColor: account?.type === 'organization' ? colors.primary + '22' : colors.secondary + '18',
              }]}>
                <Ionicons
                  name={account?.type === 'organization' ? 'business' : account?.type === 'individual' ? 'person-circle' : 'help-circle'}
                  size={sc(11)}
                  color={account?.type === 'organization' ? colors.primary : account?.type === 'individual' ? colors.secondary : colors.onSurfaceVariant}
                />
                <Text style={[styles.profileBadgeText, {
                  color: account?.type === 'organization' ? colors.primary : account?.type === 'individual' ? colors.secondary : colors.onSurfaceVariant,
                }]}>
                  {account?.type === 'organization' ? 'Organization' : account?.type === 'individual' ? 'Individual' : 'Not Verified'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Account Info */}
        <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>Account Information</Text>

        <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLow }]}>
          <InfoRow icon="person-outline" label="Display Name" value={displayName} screen="EditDisplayName" />
          <View style={[styles.divider, { backgroundColor: colors.outlineVariant + '20' }]} />
          <InfoRow icon="mail-outline" label="Email" value={currentEmail} screen="EditEmail" />
          <View style={[styles.divider, { backgroundColor: colors.outlineVariant + '20' }]} />
          <InfoRow icon="call-outline" label="Phone" value={currentPhone} screen="EditPhone" />
        </View>

        {/* Actions */}
        <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>Actions</Text>

        <View style={[styles.sectionCard, { backgroundColor: colors.surfaceContainerLow }]}>
          <TouchableOpacity style={styles.actionRow} onPress={handleUpgradeOrg} activeOpacity={0.7}>
            <View style={[styles.actionIconWrap, { backgroundColor: colors.tertiary + '12' }]}>
              <Ionicons name="arrow-up-circle" size={sc(20)} color={colors.tertiary} />
            </View>
            <View style={styles.actionBody}>
              <Text style={[styles.actionLabel, { color: colors.onSurface }]}>Upgrade to Organization</Text>
              <Text style={[styles.actionSub, { color: colors.onSurfaceVariant }]}>Verified badge and team features</Text>
            </View>
            <Ionicons name="chevron-forward" size={sc(16)} color={colors.onSurfaceVariant} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.outlineVariant + '20' }]} />

          <View style={styles.actionRow}>
            <View style={[styles.actionIconWrap, { backgroundColor: colors.primary + '12' }]}>
              <Ionicons name="shield-checkmark" size={sc(20)} color={colors.primary} />
            </View>
            <View style={styles.actionBody}>
              <Text style={[styles.actionLabel, { color: colors.onSurface }]}>Verification Status</Text>
              <Text style={[styles.actionSub, { color: colors.onSurfaceVariant }]}>
                {account?.nrcVerified ? 'Identity verified' : 'Pending verification'}
              </Text>
            </View>
            <View style={[styles.statusPill, {
              backgroundColor: account?.nrcVerified ? colors.primary + '18' : colors.outlineVariant + '18',
            }]}>
              <Text style={[styles.statusText, {
                color: account?.nrcVerified ? colors.primary : colors.onSurfaceVariant,
              }]}>
                {account?.nrcVerified ? 'Verified' : 'Pending'}
              </Text>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <Text style={[styles.sectionTitle, { color: colors.error }]}>Account</Text>

        <TouchableOpacity style={[styles.signOutCard, { backgroundColor: colors.error + '08', borderColor: colors.error + '20', borderWidth: 1 }]} onPress={handleSignOut} activeOpacity={0.7}>
          <View style={[styles.signOutIconWrap, { backgroundColor: colors.error + '12' }]}>
            <Ionicons name="log-out-outline" size={sc(20)} color={colors.error} />
          </View>
          <View style={styles.actionBody}>
            <Text style={[styles.signOutLabel, { color: colors.error }]}>Sign Out</Text>
            <Text style={[styles.signOutSub, { color: colors.error + '99' }]}>Sign out of your fundraiser account</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: sc(40) }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(20), paddingVertical: sc(12) },
  backBtn: { padding: sc(8), minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  topTitle: { fontSize: sc(16), fontWeight: '700' },

  scrollContent: { paddingHorizontal: sc(16), paddingTop: sc(8) },

  // Profile card
  profileCard: { borderRadius: sc(20), overflow: 'hidden', marginBottom: sc(20) },
  profileInner: { flexDirection: 'row', alignItems: 'center', padding: sc(20), gap: sc(16) },
  profileAvatar: { width: sc(64), height: sc(64), borderRadius: sc(32), alignItems: 'center', justifyContent: 'center' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: sc(20), fontWeight: '800', marginBottom: sc(4) },
  profileBadge: { flexDirection: 'row', alignItems: 'center', gap: sc(4), borderRadius: sc(10), paddingHorizontal: sc(10), paddingVertical: sc(4), alignSelf: 'flex-start' },
  profileBadgeText: { fontSize: sc(10), fontWeight: '600' },

  // Section
  sectionTitle: { fontSize: sc(11), fontWeight: '700', marginBottom: sc(8), textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionCard: { borderRadius: sc(16), overflow: 'hidden', marginBottom: sc(16) },
  divider: { height: 1, marginHorizontal: sc(16) },

  // Info row
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: sc(14), paddingHorizontal: sc(14), gap: sc(12) },
  infoIcon: { width: sc(36), height: sc(36), borderRadius: sc(18), alignItems: 'center', justifyContent: 'center' },
  infoBody: { flex: 1 },
  infoLabel: { fontSize: sc(11), fontWeight: '500', marginBottom: sc(2) },
  infoValue: { fontSize: sc(14), fontWeight: '600' },

  // Action row
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: sc(14), paddingHorizontal: sc(14), gap: sc(12) },
  actionIconWrap: { width: sc(42), height: sc(42), borderRadius: sc(21), alignItems: 'center', justifyContent: 'center' },
  actionBody: { flex: 1 },
  actionLabel: { fontSize: sc(14), fontWeight: '600' },
  actionSub: { fontSize: sc(11), marginTop: sc(2) },
  statusPill: { borderRadius: sc(8), paddingHorizontal: sc(8), paddingVertical: sc(3) },
  statusText: { fontSize: sc(10), fontWeight: '600' },

  // Sign out
  signOutCard: { flexDirection: 'row', alignItems: 'center', borderRadius: sc(16), padding: sc(16), gap: sc(12) },
  signOutIconWrap: { width: sc(42), height: sc(42), borderRadius: sc(21), alignItems: 'center', justifyContent: 'center' },
  signOutLabel: { fontSize: sc(14), fontWeight: '700' },
  signOutSub: { fontSize: sc(11), marginTop: sc(2) },
});
