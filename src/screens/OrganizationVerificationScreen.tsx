import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createFundraiser, submitVerification } from '../utils/donations';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const ORG_TYPES = ['Nonprofit', 'Business', 'Community Group', 'Other'];

export default function OrganizationVerificationScreen({ navigation, route, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const { fundraiserData, verificationType } = route.params || {};

  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const canSubmit = orgName.trim().length >= 2 && orgType && termsAccepted;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const fundraiser = await createFundraiser({
      title: fundraiserData?.title || '',
      description: fundraiserData?.description || '',
      goalAmount: fundraiserData?.goalAmount || 100,
      imageUrl: fundraiserData?.imageUrl || '',
      creatorName: orgName.trim(),
      creatorType: 'organization',
      verificationStatus: 'approved',
      orgName: orgName.trim(),
    });

    await submitVerification({
      type: 'organization',
      status: 'approved',
      submittedAt: Date.now(),
      orgName: orgName.trim(),
      orgType,
      website,
    });

    Alert.alert(
      'Published Successfully',
      `Your fundraiser "${fundraiser.title}" is now live with a verified badge.`,
      [
        {
          text: 'View',
          onPress: () => navigation.navigate('DonationPostDetail', { postId: fundraiser.id }),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.onSurface }]}>Organization Verification</Text>
        <View style={{ width: sc(22) }} />
      </View>

      {/* Info banner */}
      <View style={[styles.banner, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons name="checkmark-circle" size={sc(20)} color={colors.primary} />
        <Text style={[styles.bannerText, { color: colors.primary }]}>
          Instant approval with blue verification badge
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Organization Name */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.onSurface }]}>
            Organization Name <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: colors.surfaceContainerLowest,
              color: colors.onSurface,
              borderColor: colors.outlineVariant,
            }]}
            placeholder="Enter organization name"
            placeholderTextColor={colors.onSurfaceVariant}
            value={orgName}
            onChangeText={setOrgName}
            autoCapitalize="words"
          />
        </View>

        {/* Organization Type */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.onSurface }]}>
            Organization Type <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <View style={styles.typeGrid}>
            {ORG_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.typeChip,
                  { borderColor: colors.outlineVariant },
                  orgType === t && {
                    borderColor: colors.primary,
                    backgroundColor: colors.primary + '22',
                  },
                ]}
                onPress={() => setOrgType(t)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.typeChipText,
                  { color: orgType === t ? colors.primary : colors.onSurfaceVariant },
                ]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Website */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.onSurface }]}>Website (optional)</Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: colors.surfaceContainerLowest,
              color: colors.onSurface,
              borderColor: colors.outlineVariant,
            }]}
            placeholder="https://example.com"
            placeholderTextColor={colors.onSurfaceVariant}
            value={website}
            onChangeText={setWebsite}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.onSurface }]}>About the organization</Text>
          <TextInput
            style={[styles.textArea, {
              backgroundColor: colors.surfaceContainerLowest,
              color: colors.onSurface,
              borderColor: colors.outlineVariant,
            }]}
            placeholder="Tell us about your organization..."
            placeholderTextColor={colors.onSurfaceVariant}
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        {/* Terms checkbox */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setTermsAccepted(!termsAccepted)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, {
            borderColor: termsAccepted ? colors.primary : colors.outlineVariant,
            backgroundColor: termsAccepted ? colors.primary : 'transparent',
          }]}>
            {termsAccepted && <Ionicons name="checkmark" size={sc(12)} color={colors.onPrimary} />}
          </View>
          <Text style={[styles.termsText, { color: colors.onSurface }]}>
            I confirm this is a legitimate organization
          </Text>
        </TouchableOpacity>

        {/* Publish button */}
        <TouchableOpacity
          style={[styles.btnWrap, { opacity: canSubmit ? 1 : 0.4 }]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.primaryDim, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Ionicons name="checkmark-circle" size={sc(18)} color={colors.onPrimary} />
            <Text style={[styles.btnText, { color: colors.onPrimary }]}>Publish Fundraiser</Text>
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
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: sc(8),
    marginHorizontal: sc(16), marginTop: sc(8), marginBottom: sc(12),
    borderRadius: sc(12), padding: sc(12),
  },
  bannerText: { fontSize: sc(12), fontWeight: '600', flex: 1 },
  scrollContent: { paddingHorizontal: sc(16) },
  field: { marginBottom: sc(16) },
  label: { fontSize: sc(13), fontWeight: '600', marginBottom: sc(6) },
  input: {
    borderRadius: sc(12), borderWidth: 1, paddingHorizontal: sc(14),
    paddingVertical: sc(12), fontSize: sc(15),
  },
  textArea: {
    borderRadius: sc(12), borderWidth: 1, paddingHorizontal: sc(14),
    paddingVertical: sc(12), fontSize: sc(14), textAlignVertical: 'top',
    minHeight: sc(80),
  },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: sc(8) },
  typeChip: {
    borderWidth: 1, borderRadius: sc(20), paddingHorizontal: sc(14),
    paddingVertical: sc(8),
  },
  typeChipText: { fontSize: sc(12), fontWeight: '600' },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: sc(10), marginBottom: sc(20) },
  checkbox: {
    width: sc(22), height: sc(22), borderRadius: sc(4), borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  termsText: { fontSize: sc(13), fontWeight: '500' },
  btnWrap: { borderRadius: sc(24), overflow: 'hidden', marginTop: sc(8) },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: sc(8), paddingVertical: sc(15), minHeight: sc(52),
  },
  btnText: { fontSize: sc(15), fontWeight: '700' },
});
