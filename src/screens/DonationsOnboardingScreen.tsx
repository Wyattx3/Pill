import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isOnboarded, setOnboarded } from '../utils/donations';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const features = [
  { icon: 'create-outline', title: 'Create Fundraisers', desc: 'Start a campaign for causes you care about' },
  { icon: 'heart-outline', title: 'Donate & Support', desc: 'Give money or watch ads to contribute to others' },
  { icon: 'shield-checkmark-outline', title: 'Verified & Trusted', desc: 'Organizations get blue badges for authenticity' },
];

export default function DonationsOnboardingScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    isOnboarded().then((v) => {
      if (v) {
        navigation.replace('DonationsFeed');
      }
      setChecked(true);
    });
  }, []);

  const handleContinue = async () => {
    await setOnboarded();
    navigation.replace('DonationsFeed');
  };

  if (!checked) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={[styles.hero, { paddingTop: insets.top + sc(40) }]}>
        <View style={[styles.heroIcon, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="heart-circle" size={sc(64)} color={colors.primary} />
        </View>
        <Text style={[styles.heroTitle, { color: colors.onSurface }]}>Support Each Other</Text>
        <Text style={[styles.heroSub, { color: colors.onSurfaceVariant }]}>
          Give, receive, and grow together. Every contribution — big or small — makes a difference.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {features.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primaryFixed + '33' }]}>
              <Ionicons name={f.icon as any} size={sc(24)} color={colors.primary} />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.onSurface }]}>{f.title}</Text>
              <Text style={[styles.featureDesc, { color: colors.onSurfaceVariant }]}>{f.desc}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.btnWrap} onPress={handleContinue} activeOpacity={0.85}>
          <LinearGradient
            colors={[colors.primaryDim, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Text style={[styles.btnText, { color: colors.onPrimary }]}>Continue to Feed</Text>
            <Ionicons name="arrow-forward" size={sc(18)} color={colors.onPrimary} />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { alignItems: 'center', paddingHorizontal: sc(28) },
  heroIcon: {
    width: sc(100), height: sc(100), borderRadius: sc(50),
    alignItems: 'center', justifyContent: 'center', marginBottom: sc(20),
  },
  heroTitle: {
    fontSize: sc(24), fontWeight: '800', letterSpacing: -0.5, textAlign: 'center', marginBottom: sc(8),
  },
  heroSub: {
    fontSize: sc(14), lineHeight: sc(22), textAlign: 'center', maxWidth: '90%',
  },
  scrollContent: { paddingHorizontal: sc(24), paddingTop: sc(28), paddingBottom: sc(40) },
  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: sc(14),
    paddingVertical: sc(16), borderBottomWidth: StyleSheet.hairlineWidth,
  },
  featureIcon: {
    width: sc(48), height: sc(48), borderRadius: sc(24),
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: { flex: 1 },
  featureTitle: { fontSize: sc(15), fontWeight: '700', marginBottom: sc(2) },
  featureDesc: { fontSize: sc(12), lineHeight: sc(18) },
  btnWrap: { marginTop: sc(24), borderRadius: sc(16), overflow: 'hidden' },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: sc(8), paddingVertical: sc(16), minHeight: sc(52),
  },
  btnText: { fontSize: sc(15), fontWeight: '700' },
});
