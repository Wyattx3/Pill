import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function SecureSetupScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Decorative BG */}
      <View style={[styles.bgBlur1, { backgroundColor: colors.primaryContainer + '1A' }]} pointerEvents="none" />
      <View style={[styles.bgBlur2, { backgroundColor: colors.secondaryContainer + '1A' }]} pointerEvents="none" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brand}>
          <Ionicons name="shield-checkmark" size={sc(22)} color={colors.primary} />
          <Text style={[styles.brandText, { color: colors.primary }]}>Pill</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()} activeOpacity={0.5}>
          <Ionicons name="close" size={sc(24)} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={[styles.title, { color: colors.onSurface }]}>
            A space that's{'\n'}
            <Text style={[styles.titleAccent, { color: colors.primary }]}>truly yours.</Text>
          </Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            No emails, no phone numbers, no tracking. Your identity is tied to this device alone.
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.bentoGrid}>
          <View style={[styles.bentoCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={[styles.bentoIconCircle, { backgroundColor: colors.primaryContainer }]}>
              <Ionicons name="phone-portrait" size={sc(22)} color={colors.onPrimaryContainer} />
            </View>
            <Text style={[styles.bentoTitle, { color: colors.onSurface }]}>Device-Linked</Text>
            <Text style={[styles.bentoDesc, { color: colors.onSurfaceVariant }]}>Your data never leaves this phone. No cloud storage, no leaked databases.</Text>
          </View>
          <View style={[styles.bentoCardAlt, { backgroundColor: colors.surfaceContainer }]}>
            <View style={[styles.bentoIconCircleAlt, { backgroundColor: colors.secondaryContainer }]}>
              <Ionicons name="eye-off" size={sc(22)} color={colors.onSecondaryContainer} />
            </View>
            <Text style={[styles.bentoTitle, { color: colors.onSurface }]}>Anonymous</Text>
            <Text style={[styles.bentoDesc, { color: colors.onSurfaceVariant }]}>We don't know who you are, and that's how it should be. Total privacy by design.</Text>
          </View>
        </View>

        {/* Passcode CTA */}
        <View style={[styles.ctaCard, { backgroundColor: colors.surfaceContainerLowest }]}>
          <View style={[styles.ctaIconCircle, { backgroundColor: colors.primaryContainer }]}>
            <Ionicons name="lock-closed" size={sc(28)} color={colors.onPrimaryContainer} />
          </View>
          <Text style={[styles.ctaTitle, { color: colors.onSurface }]}>Secure Your Space</Text>
          <Text style={[styles.ctaDesc, { color: colors.onSurfaceVariant }]}>
            Set a 4-digit passcode to protect your private sanctuary. This is the only way back in.
          </Text>
        </View>

        {/* Primary Action */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('PasscodeCreate')}
          activeOpacity={0.8}
        >
          <LinearGradient colors={[colors.primary, colors.primaryContainer]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
            <Text style={[styles.primaryBtnText, { color: colors.onPrimary }]}>Create My Secure Space</Text>
            <Ionicons name="shield-checkmark" size={sc(18)} color={colors.onPrimary} />
          </LinearGradient>
        </TouchableOpacity>

        <Text style={[styles.disclaimer, { color: colors.onSurfaceVariant }]}>By continuing, you agree that your data is stored locally on this device. If you delete the app, your data will be lost.</Text>
      </ScrollView>

      {/* Quick Exit */}
      <TouchableOpacity style={[styles.exitBtn, { backgroundColor: colors.errorContainer }]} activeOpacity={0.8} onPress={() => navigation.goBack()}>
        <Ionicons name="flash" size={sc(14)} color={colors.onErrorContainer} />
        <Text style={[styles.exitText, { color: colors.onErrorContainer }]}>Quick Exit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(20), paddingBottom: sc(12) },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandText: { fontSize: sc(17), fontWeight: '800', letterSpacing: -0.5 },
  closeBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: sc(20), paddingTop: sc(8), paddingBottom: sc(100) },
  hero: { marginBottom: sc(24) },
  title: { fontSize: sc(30), fontWeight: '800', lineHeight: sc(36), letterSpacing: -0.5, marginBottom: sc(10) },
  titleAccent: { fontStyle: 'italic' },
  subtitle: { fontSize: sc(13), lineHeight: sc(20) },
  bentoGrid: { flexDirection: 'row', gap: sc(10), marginBottom: sc(24) },
  bentoCard: { flex: 1, borderRadius: sc(16), padding: sc(16) },
  bentoCardAlt: { flex: 1, borderRadius: sc(16), padding: sc(16) },
  bentoIconCircle: { width: sc(40), height: sc(40), borderRadius: sc(20), alignItems: 'center', justifyContent: 'center', marginBottom: sc(10) },
  bentoIconCircleAlt: { width: sc(40), height: sc(40), borderRadius: sc(20), alignItems: 'center', justifyContent: 'center', marginBottom: sc(10) },
  bentoTitle: { fontSize: sc(14), fontWeight: '700', marginBottom: sc(4) },
  bentoDesc: { fontSize: sc(11), lineHeight: sc(16) },
  ctaCard: { borderRadius: sc(16), padding: sc(24), marginBottom: sc(24), alignItems: 'center' },
  ctaIconCircle: { width: sc(56), height: sc(56), borderRadius: sc(28), alignItems: 'center', justifyContent: 'center', marginBottom: sc(12) },
  ctaTitle: { fontSize: sc(18), fontWeight: '700', marginBottom: sc(4) },
  ctaDesc: { fontSize: sc(12), lineHeight: sc(18), textAlign: 'center', maxWidth: '90%' },
  primaryBtn: { borderRadius: sc(26), overflow: 'hidden', marginBottom: sc(16) },
  gradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(8), paddingVertical: sc(16) },
  primaryBtnText: { fontSize: sc(15), fontWeight: '700' },
  disclaimer: { fontSize: sc(11), textAlign: 'center', opacity: 0.7, paddingBottom: 120 },
  exitBtn: { position: 'absolute', bottom: sc(24), right: sc(20), flexDirection: 'row', alignItems: 'center', gap: sc(6), paddingHorizontal: sc(14), paddingVertical: 8, borderRadius: sc(26), zIndex: 99 },
  exitText: { fontSize: sc(12), fontWeight: '700', letterSpacing: 1 },
  bgBlur1: { position: 'absolute', top: 0, right: 0, width: W * 0.8, height: W * 0.8, borderRadius: W * 0.4, pointerEvents: 'none' },
  bgBlur2: { position: 'absolute', bottom: 0, left: 0, width: W * 0.6, height: W * 0.6, borderRadius: W * 0.3, pointerEvents: 'none' },
});
