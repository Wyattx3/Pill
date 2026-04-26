import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OtterMascot from '../components/OtterMascot';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const TOTAL_STEPS = 5;
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const GUIDELINES = [
  { icon: 'ear-outline', title: 'Listen Without Judgment', desc: 'Allow speakers to share freely without advice or interruption.' },
  { icon: 'lock-closed-outline', title: 'Absolute Confidentiality', desc: 'Never share, record, or discuss anything you hear.' },
  { icon: 'heart-outline', title: 'Emotional Safety First', desc: 'Respond with empathy. Guide crises to professional resources.' },
  { icon: 'shield-checkmark-outline', title: 'Respect Anonymity', desc: 'Never attempt to identify or contact speakers outside the app.' },
];

const verificationMascots = ['tea', 'tea', 'note', 'shield', 'note'] as const;

export default function ListenerVerificationScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [currentStep, setCurrentStep] = useState(0);

  // Email + OTP
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(0);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  // Identity
  const [fullName, setFullName] = useState('');
  const [dobDay, setDobDay] = useState(1);
  const [dobMonth, setDobMonth] = useState(1);
  const [dobYear, setDobYear] = useState(2000);
  const [idUploaded, setIdUploaded] = useState(false);

  // Agreements
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const progress = (currentStep + 1) / TOTAL_STEPS;
  const emailValid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const otpValid = () => otpCode.every((d) => d.length === 1);
  const dobValid = useMemo(() => {
    const d = new Date(dobYear, dobMonth - 1, dobDay);
    return d.getFullYear() === dobYear && d.getMonth() === dobMonth - 1 && d.getDate() === dobDay;
  }, [dobYear, dobMonth, dobDay]);

  useEffect(() => {
    if (otpTimer <= 0) return;
    const t = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    return () => clearTimeout(t);
  }, [otpTimer]);

  const handleSendOTP = () => {
    if (!emailValid()) return;
    setOtpTimer(30);
    setCurrentStep(1);
  };

  const handleOTPInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpCode];
    if (value.length > 1) {
      const chars = value.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) newOtp[i] = chars[i] || '';
      setOtpCode(newOtp);
      if (chars.length >= 6) otpRefs.current[5]?.focus();
      return;
    }
    newOtp[index] = value;
    setOtpCode(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOTPBackspace = (index: number) => {
    if (index > 0 && otpCode[index] === '') otpRefs.current[index - 1]?.focus();
  };

  const canProceed = () => {
    if (currentStep === 0) return emailValid();
    if (currentStep === 1) return otpValid();
    if (currentStep === 2) return fullName.length >= 2 && dobValid && idUploaded;
    if (currentStep === 3) return guidelinesAccepted;
    if (currentStep === 4) return agreementChecked;
    return false;
  };

  const navigateNext = () => {
    if (!canProceed()) return;
    if (currentStep === 4) {
      setSubmitted(true);
      setTimeout(() => navigation.navigate('AvatarSelector'), 2500);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const adjustDay = (delta: number) =>
    setDobDay((prev) => {
      const max = new Date(dobYear, dobMonth, 0).getDate();
      let next = prev + delta;
      if (next < 1) next = max;
      if (next > max) next = 1;
      return next;
    });
  const adjustMonth = (delta: number) =>
    setDobMonth((prev) => {
      let next = prev + delta;
      if (next < 1) next = 12;
      if (next > 12) next = 1;
      return next;
    });
  const adjustYear = (delta: number) =>
    setDobYear((prev) => {
      let next = prev + delta;
      if (next < 1926) next = 2026;
      if (next > 2026) next = 1926;
      return next;
    });

  /* ───────────── Render ───────────── */

  if (submitted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={styles.successWrap}>
          <OtterMascot name="celebrate" size={sc(132)} containerStyle={styles.successMascot} />
          <View style={[styles.successRing, { borderColor: colors.primary + '33' }]}>
            <Ionicons name="checkmark" size={sc(40)} color={colors.primary} />
          </View>
          <Text style={[styles.successTitle, { color: colors.onSurface }]}>Application Sent</Text>
          <Text style={[styles.successBody, { color: colors.onSurfaceVariant }]}>
            We are reviewing your details. You will be notified within 24 hours.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top bar */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, sc(12)) }]}>
        <TouchableOpacity
          onPress={() => (currentStep > 0 ? setCurrentStep(currentStep - 1) : navigation.goBack())}
          style={styles.backBtn}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerCount, { color: colors.onSurfaceVariant }]}>
          {currentStep + 1} / {TOTAL_STEPS}
        </Text>
        <View style={{ width: sc(40) }} />
      </View>

      {/* Thin progress bar */}
      <View style={styles.progressWrap}>
        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceContainerHigh }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress * 100}%` }]} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.stepMascotWrap}>
          <OtterMascot name={verificationMascots[currentStep]} size={sc(88)} />
        </View>

        {/* ═════ Step 0 : Email ═════ */}
        {currentStep === 0 && (
          <>
            <Text style={[styles.headline, { color: colors.onSurface }]}>What is your{'\n'}email address?</Text>
            <Text style={[styles.body, { color: colors.onSurfaceVariant }]}>
              We will send a one-time verification code to confirm it is you.
            </Text>

            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceContainerLow, color: colors.onSurface }]}
                placeholder="you@example.com"
                placeholderTextColor={colors.onSurfaceVariant + '55'}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </>
        )}

        {/* ═════ Step 1 : OTP ═════ */}
        {currentStep === 1 && (
          <>
            <Text style={[styles.headline, { color: colors.onSurface }]}>Enter the{'\n'}verification code</Text>
            <Text style={[styles.body, { color: colors.onSurfaceVariant }]}>
              Code sent to <Text style={{ color: colors.onSurface, fontWeight: '700' }}>{email}</Text>
            </Text>

            <View style={styles.otpRow}>
              {otpCode.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  style={[
                    styles.otpBox,
                    {
                      backgroundColor: digit ? colors.surface : colors.surfaceContainerLow,
                      borderColor: digit ? colors.primary : colors.outlineVariant + '33',
                      color: colors.onSurface,
                    },
                  ]}
                  value={digit}
                  onChangeText={(v) => handleOTPInput(i, v)}
                  onKeyPress={({ nativeEvent: { key } }) => key === 'Backspace' && handleOTPBackspace(i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                />
              ))}
            </View>

            <View style={styles.resendRow}>
              <Text style={[styles.resendLabel, { color: colors.onSurfaceVariant }]}>Did not receive? </Text>
              <TouchableOpacity onPress={handleSendOTP} disabled={otpTimer > 0} activeOpacity={0.7}>
                <Text style={[styles.resendAction, { color: otpTimer > 0 ? colors.outlineVariant : colors.primary }]}>
                  {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ═════ Step 2 : Identity ═════ */}
        {currentStep === 2 && (
          <>
            <Text style={[styles.headline, { color: colors.onSurface }]}>Confirm your{'\n'}identity</Text>
            <Text style={[styles.body, { color: colors.onSurfaceVariant }]}>
              This is only used for verification and is never shown to speakers.
            </Text>

            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.onSurfaceVariant }]}>Full Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceContainerLow, color: colors.onSurface }]}
                placeholder="Enter your full name"
                placeholderTextColor={colors.onSurfaceVariant + '55'}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.onSurfaceVariant }]}>Date of Birth</Text>
              <View style={styles.dobWrap}>
                {/* Day */}
                <View style={[styles.dobCol, { borderColor: colors.outlineVariant + '22' }]}>
                  <TouchableOpacity onPress={() => adjustDay(1)} activeOpacity={0.5}>
                    <Ionicons name="chevron-up" size={sc(16)} color={colors.primary} />
                  </TouchableOpacity>
                  <Text style={[styles.dobValue, { color: colors.onSurface }]}>{String(dobDay).padStart(2, '0')}</Text>
                  <TouchableOpacity onPress={() => adjustDay(-1)} activeOpacity={0.5}>
                    <Ionicons name="chevron-down" size={sc(16)} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                {/* Month */}
                <View style={[styles.dobCol, { borderColor: colors.outlineVariant + '22' }]}>
                  <TouchableOpacity onPress={() => adjustMonth(1)} activeOpacity={0.5}>
                    <Ionicons name="chevron-up" size={sc(16)} color={colors.primary} />
                  </TouchableOpacity>
                  <Text style={[styles.dobValue, { color: colors.onSurface }]}>{MONTHS[dobMonth - 1]}</Text>
                  <TouchableOpacity onPress={() => adjustMonth(-1)} activeOpacity={0.5}>
                    <Ionicons name="chevron-down" size={sc(16)} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                {/* Year */}
                <View style={[styles.dobCol, { borderColor: colors.outlineVariant + '22' }]}>
                  <TouchableOpacity onPress={() => adjustYear(1)} activeOpacity={0.5}>
                    <Ionicons name="chevron-up" size={sc(16)} color={colors.primary} />
                  </TouchableOpacity>
                  <Text style={[styles.dobValue, { color: colors.onSurface }]}>{dobYear}</Text>
                  <TouchableOpacity onPress={() => adjustYear(-1)} activeOpacity={0.5}>
                    <Ionicons name="chevron-down" size={sc(16)} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.onSurfaceVariant }]}>Photo ID</Text>
              <TouchableOpacity
                style={[
                  styles.uploadArea,
                  {
                    backgroundColor: idUploaded ? colors.primaryContainer + '12' : colors.surfaceContainerLow,
                    borderColor: idUploaded ? colors.primary + '40' : colors.outlineVariant + '30',
                  },
                ]}
                onPress={() => setIdUploaded(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={idUploaded ? 'checkmark-circle' : 'camera-outline'}
                  size={sc(24)}
                  color={idUploaded ? colors.primary : colors.onSurfaceVariant}
                />
                <Text style={[styles.uploadLabel, { color: idUploaded ? colors.primary : colors.onSurfaceVariant }]}>
                  {idUploaded ? 'Uploaded successfully' : 'Tap to upload a photo ID'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ═════ Step 3 : Guidelines ═════ */}
        {currentStep === 3 && (
          <>
            <Text style={[styles.headline, { color: colors.onSurface }]}>Community{'\n'}Guidelines</Text>
            <Text style={[styles.body, { color: colors.onSurfaceVariant }]}>
              Every listener agrees to uphold these standards.
            </Text>

            <View style={{ marginTop: sc(8) }}>
              {GUIDELINES.map((g, i) => (
                <View key={i} style={styles.ruleRow}>
                  <View style={[styles.ruleIcon, { backgroundColor: colors.primary + '12' }]}>
                    <Ionicons name={g.icon as any} size={sc(18)} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.ruleTitle, { color: colors.onSurface }]}>{g.title}</Text>
                    <Text style={[styles.ruleDesc, { color: colors.onSurfaceVariant }]}>{g.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.agreeRow}
              onPress={() => setGuidelinesAccepted(!guidelinesAccepted)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.agreeCheck,
                  {
                    borderColor: guidelinesAccepted ? colors.primary : colors.outlineVariant,
                    backgroundColor: guidelinesAccepted ? colors.primary : 'transparent',
                  },
                ]}
              >
                {guidelinesAccepted && <Ionicons name="checkmark" size={sc(14)} color={colors.onPrimary} />}
              </View>
              <Text style={[styles.agreeText, { color: colors.onSurface }]}>
                I agree to follow all community guidelines
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* ═════ Step 4 : Agreement ═════ */}
        {currentStep === 4 && (
          <>
            <Text style={[styles.headline, { color: colors.onSurface }]}>Listener{'\n'}Agreement</Text>
            <Text style={[styles.body, { color: colors.onSurfaceVariant }]}>
              Please review the terms before submitting your application.
            </Text>

            <View style={[styles.termsCard, { backgroundColor: colors.surfaceContainerLow }]}>
              {[
                'You must be 18 or older to serve as a listener.',
                'All conversations are confidential and must not be recorded.',
                'You are providing peer support, not therapy.',
                'Pill may revoke listener status for guideline violations.',
                'Earnings are calculated per minute of active listening.',
                'You agree to receive anonymized session feedback.',
              ].map((t, i) => (
                <View key={i} style={styles.termsItem}>
                  <Text style={[styles.termsBullet, { color: colors.primary }]}>—</Text>
                  <Text style={[styles.termsLine, { color: colors.onSurfaceVariant }]}>{t}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.agreeRow}
              onPress={() => setAgreementChecked(!agreementChecked)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.agreeCheck,
                  {
                    borderColor: agreementChecked ? colors.primary : colors.outlineVariant,
                    backgroundColor: agreementChecked ? colors.primary : 'transparent',
                  },
                ]}
              >
                {agreementChecked && <Ionicons name="checkmark" size={sc(14)} color={colors.onPrimary} />}
              </View>
              <Text style={[styles.agreeText, { color: colors.onSurface }]}>
                I have read and accept the agreement
              </Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: sc(32) }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.ctaBar, { paddingBottom: Math.max(insets.bottom, sc(20)) }]}>
        <TouchableOpacity
          style={[
            styles.ctaBtn,
            {
              backgroundColor: canProceed() ? colors.primary : colors.surfaceContainerHigh,
            },
          ]}
          onPress={navigateNext}
          activeOpacity={canProceed() ? 0.85 : 1}
        >
          <Text
            style={[
              styles.ctaText,
              { color: canProceed() ? colors.onPrimary : colors.onSurfaceVariant + '88' },
            ]}
          >
            {currentStep === 0
              ? 'Send Code'
              : currentStep === 1
              ? 'Verify'
              : currentStep === 4
              ? 'Submit Application'
              : 'Continue'}
          </Text>
          {canProceed() && (
            <Ionicons
              name={currentStep === 4 ? 'shield-checkmark' : 'arrow-forward'}
              size={sc(18)}
              color={colors.onPrimary}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sc(20),
    paddingBottom: sc(8),
  },
  backBtn: {
    width: sc(40),
    height: sc(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCount: { fontSize: sc(14), fontWeight: '600' },

  /* Progress */
  progressWrap: { paddingHorizontal: sc(20), marginBottom: sc(20) },
  progressTrack: { height: 2, borderRadius: 1, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 1 },

  /* Scroll */
  scroll: { paddingHorizontal: sc(24), paddingTop: sc(4) },
  stepMascotWrap: { alignItems: 'center', marginBottom: sc(8) },

  /* Typography */
  headline: { fontSize: sc(28), fontWeight: '800', letterSpacing: -0.6, lineHeight: sc(34), marginBottom: sc(12) },
  body: { fontSize: sc(15), lineHeight: sc(22), marginBottom: sc(28) },

  /* Inputs */
  inputWrap: { marginBottom: sc(16) },
  input: {
    borderRadius: sc(14),
    paddingHorizontal: sc(16),
    paddingVertical: sc(16),
    fontSize: sc(16),
    minHeight: sc(54),
  },

  /* OTP */
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: sc(10),
    marginBottom: sc(20),
  },
  otpBox: {
    width: sc(48),
    height: sc(56),
    borderRadius: sc(14),
    fontSize: sc(24),
    fontWeight: '700',
    borderWidth: 1,
  },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  resendLabel: { fontSize: sc(14) },
  resendAction: { fontSize: sc(14), fontWeight: '700' },

  /* Form section */
  formSection: { marginBottom: sc(20) },
  formLabel: { fontSize: sc(12), fontWeight: '600', marginBottom: sc(8), letterSpacing: 0.3 },

  /* DOB */
  dobWrap: { flexDirection: 'row', gap: sc(12) },
  dobCol: {
    flex: 1,
    alignItems: 'center',
    borderRadius: sc(14),
    borderWidth: 1,
    paddingVertical: sc(10),
    gap: sc(4),
  },
  dobValue: { fontSize: sc(17), fontWeight: '700', minWidth: sc(60), textAlign: 'center' },

  /* Upload */
  uploadArea: {
    borderRadius: sc(14),
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sc(28),
    gap: sc(8),
  },
  uploadLabel: { fontSize: sc(14), fontWeight: '500' },

  /* Guidelines */
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: sc(14),
    marginBottom: sc(18),
  },
  ruleIcon: {
    width: sc(36),
    height: sc(36),
    borderRadius: sc(18),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ruleTitle: { fontSize: sc(15), fontWeight: '700', marginBottom: sc(3) },
  ruleDesc: { fontSize: sc(13), lineHeight: sc(19) },

  /* Agreement */
  termsCard: { borderRadius: sc(16), padding: sc(20), marginTop: sc(4), marginBottom: sc(8) },
  termsItem: { flexDirection: 'row', gap: sc(10), marginBottom: sc(12), alignItems: 'flex-start' },
  termsBullet: { fontSize: sc(13), fontWeight: '700', marginTop: sc(1) },
  termsLine: { fontSize: sc(13), lineHeight: sc(20), flex: 1 },

  /* Checkbox */
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sc(12),
    marginTop: sc(24),
    paddingVertical: sc(4),
  },
  agreeCheck: {
    width: sc(24),
    height: sc(24),
    borderRadius: sc(8),
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  agreeText: { fontSize: sc(15), fontWeight: '600', flex: 1 },

  /* CTA */
  ctaBar: { paddingHorizontal: sc(24), paddingTop: sc(12) },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sc(8),
    borderRadius: sc(16),
    paddingVertical: sc(18),
    minHeight: sc(56),
  },
  ctaText: { fontSize: sc(16), fontWeight: '700' },

  /* Success */
  successWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: sc(32) },
  successMascot: { marginBottom: sc(8) },
  successRing: {
    width: sc(80),
    height: sc(80),
    borderRadius: sc(40),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sc(24),
  },
  successTitle: { fontSize: sc(26), fontWeight: '800', marginBottom: sc(8), letterSpacing: -0.3 },
  successBody: { fontSize: sc(15), lineHeight: sc(22), textAlign: 'center' },
});
