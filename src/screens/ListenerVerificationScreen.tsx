import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const steps = [
  { id: 0, title: 'Verify Email', icon: 'mail-outline' },
  { id: 1, title: 'OTP Code', icon: 'key-outline' },
  { id: 2, title: 'Your Identity', icon: 'person-outline' },
  { id: 3, title: 'Guidelines', icon: 'shield-checkmark-outline' },
  { id: 4, title: 'Agreement', icon: 'document-text-outline' },
];

export default function ListenerVerificationScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const [currentStep, setCurrentStep] = useState(0);

  // Email + OTP state
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  // Identity state
  const [fullName, setFullName] = useState('');
  const [dobDay, setDobDay] = useState(1);
  const [dobMonth, setDobMonth] = useState(1);
  const [dobYear, setDobYear] = useState(2000);
  const [idUploaded, setIdUploaded] = useState(false);

  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);
  const months = useMemo(() => [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ], []);
  const years = useMemo(() => Array.from({ length: 100 }, (_, i) => 2026 - i), []);

  const dob = `${dobYear}-${String(dobMonth).padStart(2, '0')}-${String(dobDay).padStart(2, '0')}`;
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const emailValid = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const otpValid = () => otpCode.every((d) => d.length === 1);

  const handleSendOTP = () => {
    if (!emailValid()) return;
    setOtpSent(true);
    setResendDisabled(true);
    setOtpTimer(30);
    setCurrentStep(1); // Auto-navigate to OTP step
  };

  const handleResendOTP = () => {
    if (resendDisabled) return;
    handleSendOTP();
  };

  useEffect(() => {
    if (otpTimer <= 0) {
      setResendDisabled(false);
      return;
    }
    const t = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    return () => clearTimeout(t);
  }, [otpTimer]);

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
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPBackspace = (index: number) => {
    if (index > 0 && otpCode[index] === '') {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = () => {
    if (!otpValid()) return;
    setCurrentStep(2); // Move to Identity step
  };

  const canProceed = () => {
    if (currentStep === 0) return emailValid();
    if (currentStep === 1) return otpValid();
    if (currentStep === 2) return fullName.length >= 2 && dob.length >= 1 && idUploaded;
    if (currentStep === 3) return guidelinesAccepted;
    if (currentStep === 4) return agreementChecked;
    return false;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      navigation.navigate('AvatarSelector');
    }, 2500);
  };

  if (submitted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={styles.successContent}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={sc(64)} color={colors.primary} />
          </View>
          <Text style={[styles.successTitle, { color: colors.onSurface }]}>Verification Submitted</Text>
          <Text style={[styles.successDesc, { color: colors.onSurfaceVariant }]}>
            Your identity is being reviewed. We'll notify you within 24 hours once verification is complete.
          </Text>
          <View style={styles.successSteps}>
            {steps.map((step, i) => (
              <View key={i} style={styles.successStepItem}>
                <Ionicons name="checkmark-circle" size={sc(18)} color={colors.primary} />
                <Text style={[styles.successStepText, { color: colors.onSurface }]}>{step.title} verified</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.surfaceContainerLow }]} activeOpacity={0.5}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.onSurface }]}>Become a Listener</Text>
        <View style={{ width: sc(38) }} />
      </View>

      {/* Step Indicators - compact row */}
      <View style={styles.stepBar}>
        <View style={styles.stepBarInner}>
          {steps.map((step, i) => (
            <View key={i} style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                i < currentStep
                  ? { backgroundColor: colors.primary }
                  : i === currentStep
                    ? { backgroundColor: colors.primaryContainer, borderColor: colors.primary, borderWidth: 2 }
                    : { backgroundColor: colors.surfaceContainerHigh }
              ]}>
                {i < currentStep ? (
                  <Ionicons name="checkmark" size={sc(14)} color={colors.onPrimary} />
                ) : (
                  <Text style={[
                    styles.stepCircleLabel,
                    i === currentStep ? { color: colors.primary } : { color: colors.onSurfaceVariant }
                  ]}>{i + 1}</Text>
                )}
              </View>
              {i < steps.length - 1 && (
                <View style={[styles.stepLine, { backgroundColor: i < currentStep ? colors.primary : colors.surfaceContainerHigh }]} />
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Step Title Header */}
      <View style={styles.stepHeader}>
        <Text style={[styles.stepHeaderTitle, { color: colors.onSurface }]}>{steps[currentStep].title}</Text>
        <Text style={[styles.stepHeaderSub, { color: colors.onSurfaceVariant }]}>Step {currentStep + 1} of {steps.length}</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step 0: Email */}
        {currentStep === 0 && (
          <View style={styles.stepContent}>
            <View style={styles.emailIconWrap}>
              <Ionicons name="mail" size={sc(48)} color={colors.primary} />
            </View>
            <Text style={[styles.sectionDesc, { color: colors.onSurfaceVariant }, { textAlign: 'center' }]}>
              We need your email to verify your identity and send important account notifications.
            </Text>

            <View style={[styles.formCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>Email Address</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.onSurface }]}
                placeholder="Enter your email"
                placeholderTextColor={colors.onSurfaceVariant + '66'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />

              <TouchableOpacity
                style={[styles.sendOTPButton, !emailValid() && { opacity: 0.5 }]}
                onPress={handleSendOTP}
                disabled={!emailValid()}
                activeOpacity={emailValid() ? 0.8 : 0.5}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryContainer]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradient}
                  pointerEvents="none"
                >
                  <Text style={[styles.nextButtonText, { color: colors.onPrimary }]}>Send Verification Code</Text>
                  <Ionicons name="arrow-forward" size={sc(18)} color={colors.onPrimary} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 1: OTP Code */}
        {currentStep === 1 && (
          <View style={styles.stepContent}>
            <View style={styles.emailIconWrap}>
              <Ionicons name="key" size={sc(48)} color={colors.primary} />
            </View>
            <Text style={[styles.sectionDesc, { color: colors.onSurfaceVariant }, { textAlign: 'center' }]}>
              We sent a 6-digit code to{'\n'}
              <Text style={{ color: colors.onSurface, fontWeight: '700' }}>{email}</Text>
            </Text>

            <View style={[styles.formCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={styles.otpRow}>
                {otpCode.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    style={[
                      styles.otpInput,
                      { backgroundColor: colors.surface, color: colors.onSurface, borderColor: digit ? colors.primary : colors.outlineVariant + '44' },
                    ]}
                    value={digit}
                    onChangeText={(v) => handleOTPInput(i, v)}
                    onKeyPress={({ nativeEvent: { key } }) => key === 'Backspace' && handleOTPBackspace(i)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                  />
                ))}
              </View>

              <View style={styles.resendRow}>
                <Text style={[styles.resendText, { color: colors.onSurfaceVariant }]}>Didn't receive code? </Text>
                <TouchableOpacity
                  onPress={handleResendOTP}
                  disabled={resendDisabled}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.resendBtnText, { color: resendDisabled ? colors.outlineVariant : colors.primary, fontWeight: '700' }]}>
                    {resendDisabled ? `Resend in ${otpTimer}s` : 'Resend Code'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Step 2: Identity */}
        {currentStep === 2 && (
          <View style={styles.stepContent}>
            <Text style={[styles.sectionDesc, { color: colors.onSurfaceVariant }]}>
              We verify all listeners to keep the community safe. Your identity is used for verification only and is never shown to speakers.
            </Text>

            <View style={[styles.formCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>Full Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.onSurface }]}
                placeholder="Enter your name"
                placeholderTextColor={colors.onSurfaceVariant + '66'}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />

              <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>Date of Birth</Text>
              <Text style={[styles.dobDisplay, { color: colors.onSurface }]}>{dob}</Text>

              <View style={styles.dobRow}>
                {/* Day Column */}
                <View style={styles.dobColumn}>
                  <Text style={[styles.dobColumnLabel, { color: colors.onSurfaceVariant }]}>Day</Text>
                  <View style={[styles.dobWheel, { backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }]}>
                    <FlatList
                      data={days}
                      keyExtractor={(item) => item.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[styles.dobItem, item === dobDay && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                          onPress={() => setDobDay(item)}
                          activeOpacity={0.6}
                        >
                          <Text style={[styles.dobItemText, { color: item === dobDay ? colors.primary : colors.onSurfaceVariant, fontWeight: item === dobDay ? '800' : '500' }]}>
                            {item}
                          </Text>
                        </TouchableOpacity>
                      )}
                      initialScrollIndex={0}
                      getItemLayout={(_, i) => ({ length: sc(44), offset: sc(44) * i, index: i })}
                      showsVerticalScrollIndicator={false}
                      style={styles.dobWheelList}
                    />
                  </View>
                </View>

                {/* Month Column */}
                <View style={styles.dobColumn}>
                  <Text style={[styles.dobColumnLabel, { color: colors.onSurfaceVariant }]}>Month</Text>
                  <View style={[styles.dobWheel, { backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }]}>
                    <FlatList
                      data={months}
                      keyExtractor={(_, i) => i.toString()}
                      renderItem={({ item, index }) => (
                        <TouchableOpacity
                          style={[styles.dobItem, index + 1 === dobMonth && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                          onPress={() => setDobMonth(index + 1)}
                          activeOpacity={0.6}
                        >
                          <Text style={[styles.dobItemText, { color: index + 1 === dobMonth ? colors.primary : colors.onSurfaceVariant, fontWeight: index + 1 === dobMonth ? '800' : '500' }]}>
                            {item}
                          </Text>
                        </TouchableOpacity>
                      )}
                      initialScrollIndex={0}
                      getItemLayout={(_, i) => ({ length: sc(44), offset: sc(44) * i, index: i })}
                      showsVerticalScrollIndicator={false}
                      style={styles.dobWheelList}
                    />
                  </View>
                </View>

                {/* Year Column */}
                <View style={[styles.dobColumn, { flex: 1.2 }]}>
                  <Text style={[styles.dobColumnLabel, { color: colors.onSurfaceVariant }]}>Year</Text>
                  <View style={[styles.dobWheel, { backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }]}>
                    <FlatList
                      data={years}
                      keyExtractor={(item) => item.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[styles.dobItem, item === dobYear && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                          onPress={() => setDobYear(item)}
                          activeOpacity={0.6}
                        >
                          <Text style={[styles.dobItemText, { color: item === dobYear ? colors.primary : colors.onSurfaceVariant, fontWeight: item === dobYear ? '800' : '500' }]}>
                            {item}
                          </Text>
                        </TouchableOpacity>
                      )}
                      initialScrollIndex={26}
                      getItemLayout={(_, i) => ({ length: sc(44), offset: sc(44) * i, index: i })}
                      showsVerticalScrollIndicator={false}
                      style={styles.dobWheelList}
                    />
                  </View>
                </View>
              </View>

              <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>ID Verification</Text>
              <TouchableOpacity
                style={[styles.uploadBox, { backgroundColor: colors.surface, borderColor: colors.outlineVariant + '33' }, idUploaded && { borderColor: colors.primary + '44', backgroundColor: colors.primaryContainer + '11' }]}
                onPress={() => setIdUploaded(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={idUploaded ? 'checkmark-circle' : 'camera-outline'}
                  size={sc(25)}
                  color={idUploaded ? colors.primary : colors.onSurfaceVariant}
                />
                <Text style={[styles.uploadText, { color: colors.onSurfaceVariant }, idUploaded && { color: colors.primary }]}>
                  {idUploaded ? 'ID Verified' : 'Tap to upload a photo ID'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 3: Community Guidelines */}
        {currentStep === 3 && (
          <View style={styles.stepContent}>
            <Text style={[styles.sectionDesc, { color: colors.onSurfaceVariant }]}>
              To maintain a safe, supportive environment, all listeners must agree to these guidelines.
            </Text>

            <View style={[styles.formCard, { backgroundColor: colors.surfaceContainerLow }]}>
              {[
                { icon: 'ear', title: 'Listen Without Judgment', desc: 'Allow speakers to share freely without advice, criticism, or interruption.' },
                { icon: 'lock-closed', title: 'Absolute Confidentiality', desc: 'Never share, record, or discuss anything you hear during a session.' },
                { icon: 'heart', title: 'Emotional Safety First', desc: 'Respond with empathy. If someone is in crisis, guide them to professional resources.' },
                { icon: 'ban', title: 'No Harassment or Abuse', desc: 'Zero tolerance for offensive, discriminatory, or harmful behavior of any kind.' },
                { icon: 'shield-checkmark', title: 'Respect Anonymity', desc: 'Never attempt to identify, contact, or follow a speaker outside the app.' },
              ].map((item, i) => (
                <View key={i} style={styles.guidelineItem}>
                  <View style={[styles.guidelineIcon, { backgroundColor: colors.primaryContainer + '33' }]}>
                    <Ionicons name={item.icon as any} size={sc(20)} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.guidelineTitle, { color: colors.onSurface }]}>{item.title}</Text>
                    <Text style={[styles.guidelineDesc, { color: colors.onSurfaceVariant }]}>{item.desc}</Text>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={[styles.acceptBox, guidelinesAccepted && { backgroundColor: colors.primaryContainer + '11' }]}
                onPress={() => setGuidelinesAccepted(!guidelinesAccepted)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, { backgroundColor: guidelinesAccepted ? colors.primary : colors.surface, borderColor: colors.primary }, guidelinesAccepted && { backgroundColor: colors.primary }]}>
                  {guidelinesAccepted && <Ionicons name="checkmark" size={sc(14)} color="#fff" />}
                </View>
                <Text style={[styles.acceptText, { color: colors.onSurface }]}>I agree to follow all community guidelines</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 4: Agreement */}
        {currentStep === 4 && (
          <View style={styles.stepContent}>
            <Text style={[styles.sectionDesc, { color: colors.onSurfaceVariant }]}>
              Please review and accept the terms of service for becoming a verified listener.
            </Text>

            <View style={[styles.formCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={[styles.termsBox, { backgroundColor: colors.surface }]}>
                <Text style={[styles.termsTitle, { color: colors.onSurface }]}>Key Terms</Text>
                {[
                  'You must be 18 or older to serve as a listener.',
                  'All conversations are confidential and must not be recorded.',
                  'You are not providing therapy — only peer support and listening.',
                  'Pill reserves the right to revoke listener status for guideline violations.',
                  'Earnings are calculated per minute of active listening time.',
                  'You agree to receive anonymized speaker feedback about your sessions.',
                  'Disputes regarding payouts or ratings will be reviewed by our safety team.',
                ].map((term, i) => (
                  <View key={i} style={styles.termItem}>
                    <Text style={[styles.termBullet, { color: colors.primary }]}>•</Text>
                    <Text style={[styles.termText, { color: colors.onSurfaceVariant }]}>{term}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.acceptBox, agreementChecked && { backgroundColor: colors.primaryContainer + '11' }]}
                onPress={() => setAgreementChecked(!agreementChecked)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, { backgroundColor: agreementChecked ? colors.primary : colors.surface, borderColor: colors.primary }]}>
                  {agreementChecked && <Ionicons name="checkmark" size={sc(14)} color="#fff" />}
                </View>
                <Text style={[styles.acceptText, { color: colors.onSurface }]}>I have read and accept the Listener Agreement</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Nav - fixed outside ScrollView */}
      <View style={[styles.bottomNav, { backgroundColor: colors.background }]}>
        {currentStep > 0 ? (
          <TouchableOpacity style={[styles.backNavBtn, { borderColor: colors.outlineVariant }]} onPress={() => setCurrentStep(currentStep - 1)} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={sc(18)} color={colors.onSurface} />
          </TouchableOpacity>
        ) : <View style={{ width: sc(48) }} />}

        {currentStep === 1 && (
          <TouchableOpacity
            style={[styles.nextButton, { flex: 1, opacity: canProceed() ? 1 : 0.4 }]}
            onPress={handleVerifyOTP}
            disabled={!canProceed()}
            activeOpacity={canProceed() ? 0.8 : 0.5}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
              pointerEvents="none"
            >
              <Text style={[styles.nextButtonText, { color: colors.onPrimary }]}>Verify Code</Text>
              <Ionicons name="arrow-forward" size={sc(18)} color={colors.onPrimary} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {(currentStep === 2 || currentStep === 3) && (
          <TouchableOpacity
            style={[styles.nextButton, { flex: 1, opacity: canProceed() ? 1 : 0.4 }]}
            onPress={() => canProceed() && setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
            activeOpacity={canProceed() ? 0.8 : 0.5}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
              pointerEvents="none"
            >
              <Text style={[styles.nextButtonText, { color: colors.onPrimary }]}>Continue</Text>
              <Ionicons name="arrow-forward" size={sc(18)} color={colors.onPrimary} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {currentStep === 4 && (
          <TouchableOpacity
            style={[styles.nextButton, { flex: 1, opacity: canProceed() ? 1 : 0.4 }]}
            onPress={handleSubmit}
            disabled={!canProceed()}
            activeOpacity={canProceed() ? 0.8 : 0.5}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
              pointerEvents="none"
            >
              <Text style={[styles.nextButtonText, { color: colors.onPrimary }]}>Submit</Text>
              <Ionicons name="shield-checkmark" size={sc(18)} color={colors.onPrimary} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {currentStep === 0 && <View style={{ width: sc(48) }} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(18), paddingBottom: sc(10), paddingTop: sc(6) },
  backButton: { width: sc(38), height: sc(38), borderRadius: sc(19), alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: sc(16), fontWeight: '700', letterSpacing: -0.3 },

  // Step bar - compact
  stepBar: { paddingHorizontal: sc(36), paddingVertical: sc(12) },
  stepBarInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: { width: sc(30), height: sc(30), borderRadius: sc(15), alignItems: 'center', justifyContent: 'center' },
  stepCircleLabel: { fontSize: sc(12), fontWeight: '700' },
  stepLine: { width: sc(20), height: 2.5, marginHorizontal: sc(3) },

  // Step header
  stepHeader: { paddingHorizontal: sc(24), paddingBottom: sc(12), alignItems: 'center' },
  stepHeaderTitle: { fontSize: sc(20), fontWeight: '800', letterSpacing: -0.3 },
  stepHeaderSub: { fontSize: sc(11), marginTop: sc(2) },

  // Scroll content
  scrollContent: { paddingHorizontal: sc(20), paddingTop: sc(4), paddingBottom: sc(16) },

  // Step content
  stepContent: {},
  emailIconWrap: { alignItems: 'center', marginBottom: sc(16) },
  sectionDesc: { fontSize: sc(13), lineHeight: sc(20), marginBottom: sc(16), textAlign: 'center' },

  // Form card
  formCard: { borderRadius: sc(16), padding: sc(18), marginBottom: sc(16) },
  inputLabel: { fontSize: sc(11), fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: sc(6), marginTop: sc(8) },
  input: { width: '100%', borderRadius: sc(12), padding: sc(14), fontSize: sc(14), marginBottom: sc(4), minHeight: 50, borderWidth: 1, borderColor: 'transparent' },
  dobDisplay: { fontSize: sc(16), fontWeight: '700', marginBottom: sc(12), marginTop: sc(4), textAlign: 'center' },
  dobRow: { flexDirection: 'row', gap: sc(8) },
  dobColumn: { flex: 1, alignItems: 'center' },
  dobColumnLabel: { fontSize: sc(10), fontWeight: '600', marginBottom: sc(6), textTransform: 'uppercase', letterSpacing: 1 },
  dobWheel: { borderRadius: sc(12), borderWidth: 1, overflow: 'hidden', width: '100%' },
  dobWheelList: { height: sc(132), maxHeight: sc(132) },
  dobItem: { height: sc(44), alignItems: 'center', justifyContent: 'center', paddingHorizontal: sc(8) },
  dobItemText: { fontSize: sc(14), fontWeight: '500' },
  uploadBox: { flexDirection: 'row', alignItems: 'center', gap: sc(10), borderRadius: sc(12), padding: sc(16), marginTop: sc(6), borderWidth: 2, borderStyle: 'dashed' },
  uploadText: { fontSize: sc(13), fontWeight: '600' },

  // OTP
  sendOTPButton: { borderRadius: sc(14), overflow: 'hidden', marginTop: sc(12) },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: sc(8), marginVertical: sc(16) },
  otpInput: { width: sc(44), height: sc(54), borderRadius: sc(12), fontSize: sc(22), fontWeight: '800', borderWidth: 2 },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: sc(8) },
  resendText: { fontSize: sc(13) },
  resendBtnText: { fontSize: sc(13) },

  // Guidelines
  guidelineItem: { flexDirection: 'row', alignItems: 'flex-start', gap: sc(12), marginBottom: sc(14) },
  guidelineIcon: { width: sc(34), height: sc(34), borderRadius: sc(17), alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  guidelineTitle: { fontSize: sc(13), fontWeight: '700', marginBottom: sc(2) },
  guidelineDesc: { fontSize: sc(11), lineHeight: sc(16) },
  acceptBox: { flexDirection: 'row', alignItems: 'center', gap: sc(10), marginTop: sc(14), padding: sc(12), borderRadius: sc(10) },
  checkbox: { width: sc(22), height: sc(22), borderRadius: sc(6), alignItems: 'center', justifyContent: 'center', borderWidth: 2, flexShrink: 0 },
  acceptText: { fontSize: sc(13), fontWeight: '600', flex: 1 },

  // Terms
  termsBox: { borderRadius: sc(12), padding: sc(16), marginBottom: sc(12) },
  termsTitle: { fontSize: sc(14), fontWeight: '700', marginBottom: sc(12) },
  termItem: { flexDirection: 'row', gap: sc(8), marginBottom: sc(10) },
  termBullet: { fontSize: sc(14), lineHeight: sc(18) },
  termText: { fontSize: sc(12), lineHeight: sc(18), flex: 1 },

  // Bottom nav
  bottomNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: sc(20), paddingVertical: sc(12), borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  backNavBtn: { width: sc(48), height: sc(48), borderRadius: sc(24), alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  nextButton: { borderRadius: sc(14), overflow: 'hidden', marginLeft: sc(12) },
  gradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(8), paddingVertical: sc(14), paddingHorizontal: sc(20), minHeight: 50 },
  nextButtonText: { fontSize: sc(14), fontWeight: '700' },

  // Success
  successContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: sc(30) },
  successIcon: { marginBottom: sc(20) },
  successTitle: { fontSize: sc(24), fontWeight: '800', marginBottom: sc(10), letterSpacing: -0.3 },
  successDesc: { fontSize: sc(13), lineHeight: sc(20), textAlign: 'center', marginBottom: sc(28) },
  successSteps: { width: '100%' },
  successStepItem: { flexDirection: 'row', alignItems: 'center', gap: sc(10), marginBottom: sc(10) },
  successStepText: { fontSize: sc(13), fontWeight: '600' },
});
