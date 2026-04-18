import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function VerificationTypeScreen({ navigation, route, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const fundraiserData = route.params || {};
  const [selected, setSelected] = useState<'individual' | 'organization' | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    if (selected === 'individual') {
      navigation.navigate('IndividualVerification', { fundraiserData, verificationType: 'individual' });
    } else {
      navigation.navigate('OrganizationVerification', { fundraiserData, verificationType: 'organization' });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.onSurface }]}>Verification</Text>
        <View style={{ width: sc(22) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.onSurface }]}>Choose Verification Type</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          How would you like to verify your identity for this fundraiser?
        </Text>

        {/* Individual Card */}
        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant },
            selected === 'individual' && {
              borderColor: colors.primary,
              backgroundColor: colors.primary + '12',
            },
          ]}
          onPress={() => setSelected('individual')}
          activeOpacity={0.8}
        >
          <View style={[styles.cardIcon, { backgroundColor: colors.secondaryFixed + '55' }]}>
            <Ionicons name="person-outline" size={sc(28)} color={colors.secondary} />
          </View>
          <View style={styles.cardBody}>
            <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Individual</Text>
            <Text style={[styles.cardDesc, { color: colors.onSurfaceVariant }]}>
              Verify as an individual. Your fundraiser will go through a quick review before going live.
            </Text>
          </View>
          {selected === 'individual' && (
            <Ionicons name="checkmark-circle" size={sc(22)} color={colors.primary} />
          )}
        </TouchableOpacity>

        {/* Organization Card */}
        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant },
            selected === 'organization' && {
              borderColor: colors.primary,
              backgroundColor: colors.primary + '12',
            },
          ]}
          onPress={() => setSelected('organization')}
          activeOpacity={0.8}
        >
          <View style={[styles.cardIcon, { backgroundColor: colors.primaryFixed + '55' }]}>
            <Ionicons name="business-outline" size={sc(28)} color={colors.primary} />
          </View>
          <View style={styles.cardBody}>
            <View style={styles.cardTitleRow}>
              <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Organization</Text>
              <Ionicons name="checkmark-circle" size={sc(14)} color={colors.primary} />
            </View>
            <Text style={[styles.cardDesc, { color: colors.onSurfaceVariant }]}>
              Verify as an organization. Get a blue verification badge and instant publishing.
            </Text>
          </View>
          {selected === 'organization' && (
            <Ionicons name="checkmark-circle" size={sc(22)} color={colors.primary} />
          )}
        </TouchableOpacity>

        {/* Continue button */}
        <TouchableOpacity
          style={[styles.btnWrap, { opacity: selected ? 1 : 0.4 }]}
          onPress={handleContinue}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.primaryDim, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Text style={[styles.btnText, { color: colors.onPrimary }]}>Continue</Text>
            <Ionicons name="arrow-forward" size={sc(18)} color={colors.onPrimary} />
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: sc(40) }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: sc(16), paddingBottom: sc(12),
  },
  topTitle: { fontSize: sc(16), fontWeight: '700' },
  scrollContent: { paddingHorizontal: sc(16), paddingTop: sc(8) },
  title: { fontSize: sc(22), fontWeight: '800', marginBottom: sc(6) },
  subtitle: { fontSize: sc(14), lineHeight: sc(22), marginBottom: sc(20) },
  card: {
    flexDirection: 'row', alignItems: 'center', borderRadius: sc(16),
    borderWidth: 1, padding: sc(16), marginBottom: sc(12), gap: sc(12),
  },
  cardIcon: {
    width: sc(52), height: sc(52), borderRadius: sc(26),
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: sc(15), fontWeight: '700' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: sc(6) },
  cardDesc: { fontSize: sc(12), lineHeight: sc(18), marginTop: sc(3) },
  btnWrap: { borderRadius: sc(24), overflow: 'hidden', marginTop: sc(16) },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: sc(8), paddingVertical: sc(15), minHeight: sc(52),
  },
  btnText: { fontSize: sc(15), fontWeight: '700' },
});
