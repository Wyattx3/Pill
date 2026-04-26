import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import OtterMascot from '../components/OtterMascot';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const resources = [
  { title: 'How to be a good listener', desc: 'Master the art of active listening and creating a non-judgmental space.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqw8SDkBS76RmRkS0WsdFLfMmtDEBDQ1zicoRVO2YkS9XE0_awWfrmSGmo-qgCakFZyJmb_57lPijGTsT0qSPkYK4IPoTDUSgw1foT0LONuv0uS9FPL-ZGcXfhim1Ft9C459J_7_0I7PcqK0LfYayTjG2PW54zZ5wH2xEaVGCFifnPKOGDNflQtJPi0En75PopWl-lwNn6SXEANRwCv-s0A3EiIx6sdkS3ZdzH0otqyeH8ucUMP09BOx-cBCUoU23m_WIdYLrTImxd' },
  { title: 'Coping with difficult calls', desc: 'Protect your own emotional health when dealing with challenging conversations.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeyiI1Ay47achzdHsFnu0CV9BP2M9GyBh239kUjpnpcIpaSiOhD4BmECM-J66hO1OoYyzfSCDawDniZb9fPkyyFWlFPFYQnM69hycUIczT04ZNleRdd0MufugURdti8KnFfBUbd6FqzJOhv9pMzZEzk6voR9Ji3B4bBFz4r_IKLwL3mpXy-9uzZ3iJaUZ8fXAkcQBj1n1cT2EKknr7VefK93-DRV4Iar93DjS1jOjEywU2drp5jOToYee0heCOgSPMrYK-azW_IRJQ' },
  { title: 'Community Guidelines', desc: 'Our collective agreement on respect, privacy, and maintaining the sanctuary vibe.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqi-zRbzOIef-gCyrmJ72LlJwndB7k9k9QEFlFbaSEOxvQdl9CWEQybcPUWD2WswKLrbXWXsZJngCZS4hgCT2aSN-6BsCFsT8fjImSifIwkWYDGGHAPkeLP3G1w23tb3kmx8vilfoPng0OvVeCn0IE9ngeQk_ZlBS34Gw1PxZuKsL6i0MmiqdEhNejyIf8Eev91AKNZ2Ox_iAkgZYnwueQ3m_WIdYLrTImxd' },
];

export default function SafetyCenterScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={styles.brand}>
          <Ionicons name="shield-checkmark" size={sc(22)} color={colors.primary} />
          <Text style={[styles.brandText, { color: colors.primary }]}>Pill</Text>
        </View>
        <TouchableOpacity style={[styles.quickExit, { backgroundColor: colors.errorContainer }]} onPress={() => navigation.navigate('Home')} activeOpacity={0.8}>
          <Ionicons name="close" size={sc(10)} color={colors.onErrorContainer} />
          <Text style={[styles.quickExitText, { color: colors.onErrorContainer }]}>Quick Exit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroRow}>
          <View style={styles.heroCopy}>
            <Text style={[styles.heroTitle, { color: colors.primary }]}>Your Safety Hub</Text>
            <Text style={[styles.heroDesc, { color: colors.onSurfaceVariant }]}>We're here to ensure every connection remains a safe space. Whether you need immediate help or want to learn about our community standards, you're in the right place.</Text>
          </View>
          <OtterMascot name="shield" size={sc(108)} containerStyle={styles.heroMascot} />
        </View>

        {/* Emergency Grid */}
        <View style={[styles.crisisCard, { backgroundColor: colors.errorContainer + '1A', borderLeftColor: colors.error }]}>
          <View style={styles.crisisHeader}>
            <Ionicons name="home" size={sc(16)} color={colors.error} />
            <Text style={[styles.crisisLabel, { color: colors.error }]}>CRISIS ASSISTANCE</Text>
          </View>
          <Text style={[styles.crisisTitle, { color: colors.onErrorContainer }]}>In Immediate Danger?</Text>
          <Text style={[styles.crisisDesc, { color: colors.onErrorContainer + 'CC' }]}>If you or someone else is in immediate danger, please contact local emergency services.</Text>
          <View style={styles.crisisActions}>
            <TouchableOpacity style={[styles.crisisCall, { backgroundColor: colors.error }]} onPress={() => Linking.openURL('tel:988')} activeOpacity={0.8}>
              <Ionicons name="call" size={sc(14)} color="#fff" />
              <Text style={styles.crisisCallText}>Call 988</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.crisisTextBtn, { backgroundColor: colors.surface }]} onPress={() => Linking.openURL('sms:988')} activeOpacity={0.8}>
              <Ionicons name="chatbubble" size={sc(14)} color={colors.onErrorContainer} />
              <Text style={[styles.crisisTextBtnLabel, { color: colors.onErrorContainer }]}>Text Crisis Line</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={[styles.trustCard, { backgroundColor: colors.primaryContainer + '33' }]} onPress={() => navigation.navigate('TrustSystem')} activeOpacity={0.8}>
          <View style={styles.trustCardInner}>
            <View style={[styles.trustCardIcon, { backgroundColor: colors.primaryFixed }]}>
              <Ionicons name="notifications" size={sc(22)} color={colors.primary} />
            </View>
            <View style={styles.trustCardText}>
              <Text style={[styles.trustTitle, { color: colors.primary }]}>Noti Inbox</Text>
              <Text style={[styles.trustDesc, { color: colors.onSurfaceVariant }]}>Check your notifications and alerts here.</Text>
              <Text style={[styles.trustLink, { color: colors.primary }]}>How it works <Ionicons name="arrow-forward" size={sc(12)} color={colors.primary} /></Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Resources */}
        <View style={styles.resourcesHeader}>
          <Text style={[styles.resourcesTitle, { color: colors.onSurface }]}>Educational Resources</Text>
          <Text style={[styles.resourcesCount, { color: colors.onSurfaceVariant }]}>12 articles available</Text>
        </View>
        <View style={styles.resourcesGrid}>
          {resources.map((r, i) => (
            <TouchableOpacity key={i} style={[styles.resourceCard, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant + '22' }]} activeOpacity={0.9} onPress={() => navigation.navigate('ResourceDetail', { title: r.title, desc: r.desc, image: r.image })}>
              <Image source={{ uri: r.image }} style={styles.resourceImage} />
              <Text style={[styles.resourceTitle, { color: colors.onSurface }]}>{r.title}</Text>
              <Text style={[styles.resourceDesc, { color: colors.onSurfaceVariant }]}>{r.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trust System Detail */}
        <View style={[styles.trustSection, { backgroundColor: colors.surfaceContainerLow }]}>
          <Text style={[styles.trustSectionTitle, { color: colors.onSurface }]}>A Shared Responsibility</Text>
          {[
            { icon: 'lock-closed' as const, title: 'End-to-End Privacy', desc: 'Your data and conversations are strictly confidential and encrypted.' },
            { icon: 'sparkles' as const, title: 'Reputation Scoring', desc: 'High-quality listeners earn badges and priority through consistent positive feedback.' },
            { icon: 'flag' as const, title: 'Instant Reporting', desc: 'One-tap reporting flags inappropriate behavior directly to our human safety team.' },
          ].map((item, i) => (
            <View key={i} style={styles.trustItem}>
              <View style={[styles.trustIconCircle, { backgroundColor: colors.primaryContainer }]}>
                <Ionicons name={item.icon} size={sc(18)} color={colors.primary} />
              </View>
              <View style={styles.trustTextContainer}>
                <Text style={[styles.trustItemTitle, { color: colors.onSurface }]}>{item.title}</Text>
                <Text style={[styles.trustItemDesc, { color: colors.onSurfaceVariant }]}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* FAQ */}
        <View style={styles.faqSection}>
          <Text style={[styles.faqTitle, { color: colors.onSurface }]}>Still have questions?</Text>
          <View style={styles.faqButtons}>
            <TouchableOpacity style={[styles.faqButton, { backgroundColor: colors.surfaceContainerHigh }]} activeOpacity={0.7} onPress={() => navigation.navigate('FAQ')}><Text style={[styles.faqButtonText, { color: colors.onSurface }]}>Visit FAQ</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.faqButton, { backgroundColor: colors.surfaceContainerHigh }]} activeOpacity={0.7} onPress={() => navigation.navigate('ContactSupport')}><Text style={[styles.faqButtonText, { color: colors.onSurface }]}>Contact Support</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BottomNav navigation={navigation} activeScreen="SafetyCenter" theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(20), paddingBottom: sc(12) },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandText: { fontSize: sc(17), fontWeight: '800', letterSpacing: -0.5 },
  quickExit: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: sc(10), paddingVertical: 5, borderRadius: sc(26) },
  quickExitText: { fontSize: sc(9), fontWeight: '700', letterSpacing: 0.5 },
  scrollContent: { paddingHorizontal: sc(20), paddingTop: sc(8), paddingBottom: sc(100) },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: sc(10), marginBottom: sc(18) },
  heroCopy: { flex: 1 },
  heroMascot: { flexShrink: 0, marginRight: -sc(6) },
  heroTitle: { fontSize: sc(28), fontWeight: '800', lineHeight: sc(34), letterSpacing: -0.5, marginBottom: sc(10) },
  heroDesc: { fontSize: sc(13), lineHeight: sc(20) },
  crisisCard: { borderRadius: sc(12), padding: sc(20), borderLeftWidth: 4, marginBottom: sc(10) },
  crisisHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: sc(10) },
  crisisLabel: { fontSize: sc(10), fontWeight: '700', letterSpacing: 1.5 },
  crisisTitle: { fontSize: sc(18), fontWeight: '700', marginBottom: sc(6) },
  crisisDesc: { fontSize: sc(11), lineHeight: sc(16), marginBottom: sc(14) },
  crisisActions: { flexDirection: 'row', flexWrap: 'wrap', gap: sc(8) },
  crisisCall: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: sc(14), paddingVertical: 8, borderRadius: sc(26), minHeight: 40, justifyContent: 'center' },
  crisisCallText: { color: '#fff', fontWeight: '700', fontSize: sc(12) },
  crisisTextBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: sc(14), paddingVertical: 8, borderRadius: sc(26), minHeight: 40, justifyContent: 'center' },
  crisisTextBtnLabel: { fontWeight: '700', fontSize: sc(12) },
  trustCard: { borderRadius: sc(12), padding: sc(16), marginBottom: sc(24) },
  trustCardInner: { flexDirection: 'row', alignItems: 'flex-start', gap: sc(12) },
  trustCardIcon: { width: sc(40), height: sc(40), borderRadius: sc(20), alignItems: 'center', justifyContent: 'center' },
  trustCardText: { flex: 1 },
  trustTitle: { fontSize: sc(14), fontWeight: '700', marginBottom: sc(4) },
  trustDesc: { fontSize: sc(11), lineHeight: sc(16), marginBottom: sc(8) },
  trustLink: { fontSize: sc(11), fontWeight: '700' },
  resourcesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: sc(16) },
  resourcesTitle: { fontSize: sc(18), fontWeight: '700' },
  resourcesCount: { fontSize: sc(12) },
  resourcesGrid: { marginBottom: sc(32) },
  resourceCard: { marginBottom: sc(18), borderRadius: sc(16), padding: sc(16), borderWidth: 1 },
  resourceImage: { width: '100%', height: sc(120), borderRadius: sc(12), marginBottom: sc(10) },
  resourceTitle: { fontSize: sc(15), fontWeight: '700', marginBottom: sc(5) },
  resourceDesc: { fontSize: sc(12), lineHeight: sc(18) },
  trustSection: { borderRadius: sc(16), padding: sc(20), marginBottom: sc(32) },
  trustSectionTitle: { fontSize: sc(20), fontWeight: '700', marginBottom: sc(16) },
  trustItem: { flexDirection: 'row', gap: sc(12), marginBottom: sc(16) },
  trustIconCircle: { width: sc(36), height: sc(36), borderRadius: sc(18), alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  trustTextContainer: { flex: 1 },
  trustItemTitle: { fontSize: sc(13), fontWeight: '700', marginBottom: sc(2) },
  trustItemDesc: { fontSize: sc(11), lineHeight: sc(16) },
  faqSection: { alignItems: 'center', paddingBottom: sc(20) },
  faqTitle: { fontSize: sc(15), fontWeight: '700', marginBottom: sc(10) },
  faqButtons: { flexDirection: 'row', gap: sc(10) },
  faqButton: { paddingHorizontal: sc(18), paddingVertical: 7, borderRadius: sc(26), minHeight: 36, justifyContent: 'center' },
  faqButtonText: { fontSize: sc(12), fontWeight: '600' },
});
