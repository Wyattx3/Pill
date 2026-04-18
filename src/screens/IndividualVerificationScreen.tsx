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

export default function IndividualVerificationScreen({ navigation, route, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const { fundraiserData, verificationType } = route.params || {};

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [idUploaded, setIdUploaded] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const canSubmit = fullName.trim().length >= 2 && dob.trim().length >= 8 && idUploaded && termsAccepted;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const fundraiser = await createFundraiser({
      title: fundraiserData?.title || '',
      description: fundraiserData?.description || '',
      goalAmount: fundraiserData?.goalAmount || 100,
      imageUrl: fundraiserData?.imageUrl || '',
      creatorName: fullName.trim(),
      creatorType: 'individual',
      verificationStatus: 'approved',
    });

    await submitVerification({
      type: 'individual',
      status: 'approved',
      submittedAt: Date.now(),
      fullName: fullName.trim(),
    });

    Alert.alert(
      'Submitted for Review',
      'Your fundraiser has been submitted. It will be live once the review is complete.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('DonationsFeed'),
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
        <Text style={[styles.topTitle, { color: colors.onSurface }]}>Individual Verification</Text>
        <View style={{ width: sc(22) }} />
      </View>

      {/* Info banner */}
      <View style={[styles.banner, { backgroundColor: colors.primaryFixed + '33' }]}>
        <Ionicons name="information-circle-outline" size={sc(20)} color={colors.primary} />
        <Text style={[styles.bannerText, { color: colors.primary }]}>
          Review takes up to 24 hours. You'll be notified when approved.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Full Name */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.onSurface }]}>
            Full Name <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: colors.surfaceContainerLowest,
              color: colors.onSurface,
              borderColor: colors.outlineVariant,
            }]}
            placeholder="Enter your full name"
            placeholderTextColor={colors.onSurfaceVariant}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        </View>

        {/* Date of Birth */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.onSurface }]}>
            Date of Birth <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: colors.surfaceContainerLowest,
              color: colors.onSurface,
              borderColor: colors.outlineVariant,
            }]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.onSurfaceVariant}
            value={dob}
            onChangeText={setDob}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        {/* ID Upload */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.onSurface }]}>
            ID Verification <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.uploadBtn, {
              backgroundColor: idUploaded ? colors.primary + '15' : colors.surfaceContainerLow,
              borderColor: idUploaded ? colors.primary : colors.outlineVariant,
            }]}
            onPress={() => setIdUploaded(true)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={idUploaded ? 'checkmark-circle' : 'cloud-upload-outline'}
              size={sc(24)}
              color={idUploaded ? colors.primary : colors.onSurfaceVariant}
            />
            <Text style={[
              styles.uploadText,
              { color: idUploaded ? colors.primary : colors.onSurfaceVariant },
            ]}>
              {idUploaded ? 'ID Uploaded' : 'Tap to upload ID (simulated)'}
            </Text>
          </TouchableOpacity>
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
            I confirm this information is accurate
          </Text>
        </TouchableOpacity>

        {/* Submit button */}
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
            <Ionicons name="shield-checkmark" size={sc(18)} color={colors.onPrimary} />
            <Text style={[styles.btnText, { color: colors.onPrimary }]}>Submit for Review</Text>
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
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: sc(10),
    borderRadius: sc(12), borderWidth: 1, padding: sc(16),
  },
  uploadText: { fontSize: sc(14), fontWeight: '600' },
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
