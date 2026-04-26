import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OtterMascot from '../components/OtterMascot';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function ProfileScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;

  const accountName = 'Stone';
  const accountAvatar = '🪨';
  const joinDate = 'Member since January 2025';

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.surfaceContainerLow }]} activeOpacity={0.5}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.onSurface }]}>My Profile</Text>
        <View style={{ width: sc(38) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar & Name */}
        <View style={[styles.profileCard, { backgroundColor: colors.surfaceContainerLow }]}>
          <OtterMascot name="note" size={sc(86)} containerStyle={styles.profileMascot} />
          <View style={[styles.avatarLarge, { backgroundColor: colors.primaryContainer + '33' }]}>
            <Text style={{ fontSize: sc(40) }}>{accountAvatar}</Text>
          </View>
          <Text style={[styles.profileName, { color: colors.onSurface }]}>{accountName}</Text>
          <Text style={[styles.profileDate, { color: colors.onSurfaceVariant }]}>{joinDate}</Text>
        </View>

        {/* Account Status - clickable card */}
        <TouchableOpacity
          style={[styles.statusCard, { backgroundColor: colors.surfaceContainerLow }]}
          onPress={() => navigation.navigate('AccountStatus')}
          activeOpacity={0.7}
        >
          <View style={styles.rowBetween}>
            <View style={styles.statusLeft}>
              <View style={[styles.statusIconCircle, { backgroundColor: '#4CAF5022' }]}>
                <Ionicons name="shield-checkmark" size={sc(18)} color="#4CAF50" />
              </View>
              <View>
                <Text style={[styles.statusLabel, { color: colors.onSurface }]}>Account Status</Text>
                <Text style={[styles.statusDesc, { color: '#4CAF50' }]}>Good Standing</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={sc(18)} color={colors.onSurfaceVariant} />
          </View>
        </TouchableOpacity>

        {/* Menu Items */}
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Settings</Text>
        {[
          { icon: 'person-outline', label: 'Edit Profile', screen: 'EditProfile', desc: 'Change name & avatar' },
          { icon: 'lock-closed-outline', label: 'Privacy & Security', screen: 'PrivacySecurity', desc: 'Email & account' },
          { icon: 'help-circle-outline', label: 'Help & Support', screen: 'FAQ', desc: 'FAQ & contact us' },
        ].map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <View style={styles.rowBetween}>
              <View style={styles.rowLeft}>
                <Ionicons name={item.icon as any} size={sc(20)} color={colors.secondary} />
                <View>
                  <Text style={[styles.rowText, { color: colors.onSurface }]}>{item.label}</Text>
                  <Text style={[styles.rowDesc, { color: colors.onSurfaceVariant }]}>{item.desc}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={sc(18)} color={colors.onSurfaceVariant} />
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: sc(40) }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(18), paddingBottom: sc(12), paddingTop: sc(8) },
  backButton: { width: sc(38), height: sc(38), borderRadius: sc(19), alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: sc(16), fontWeight: '700', letterSpacing: -0.3 },
  scrollContent: { paddingHorizontal: sc(18), paddingTop: sc(8), paddingBottom: sc(20) },

  profileCard: { borderRadius: sc(16), padding: sc(24), alignItems: 'center', marginBottom: sc(14) },
  profileMascot: { marginBottom: sc(6) },
  avatarLarge: { width: sc(72), height: sc(72), borderRadius: sc(36), alignItems: 'center', justifyContent: 'center', marginBottom: sc(12) },
  profileName: { fontSize: sc(22), fontWeight: '800' },
  profileDate: { fontSize: sc(11), marginTop: sc(4) },

  sectionTitle: { fontSize: sc(14), fontWeight: '700', marginBottom: sc(8), marginTop: sc(4) },

  // Account Status clickable card
  statusCard: { borderRadius: sc(14), padding: sc(16), marginBottom: sc(10) },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: sc(10) },
  statusIconCircle: { width: sc(32), height: sc(32), borderRadius: sc(16), alignItems: 'center', justifyContent: 'center' },
  statusLabel: { fontSize: sc(13), fontWeight: '600' },
  statusDesc: { fontSize: sc(11), fontWeight: '600' },

  // Menu cards
  card: { borderRadius: sc(14), padding: sc(16), marginBottom: sc(10) },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: sc(10) },
  rowText: { fontSize: sc(13), fontWeight: '600' },
  rowDesc: { fontSize: sc(11), marginTop: sc(2) },
});
