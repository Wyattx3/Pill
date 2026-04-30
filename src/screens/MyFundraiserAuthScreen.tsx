import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import OtterMascot from '../components/OtterMascot';
import { createFundraiserAccount, getFundraiserAccount } from '../utils/donations';

const { width: W, height: H } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const STEPS = ['Account', 'Email', 'Phone', 'ID'];

export default function MyFundraiserAuthScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = theme;
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Form fields
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailOTP, setEmailOTP] = useState(['', '', '', '', '', '']);
  const [phoneOTP, setPhoneOTP] = useState(['', '', '', '', '', '']);
  const [nrcFront, setNrcFront] = useState('');
  const [nrcBack, setNrcBack] = useState('');
  const [nrcSelfie, setNrcSelfie] = useState('');

  // State
  const [emailSent, setEmailSent] = useState(false);
  const [phoneSent, setPhoneSent] = useState(false);
  const [generatedEmailOTP, setGeneratedEmailOTP] = useState('');
  const [generatedPhoneOTP, setGeneratedPhoneOTP] = useState('');

  const emailOTPRefs = useRef<Array<TextInput | null>>([]);
  const phoneOTPRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    checkExistingAccount();
  }, []);

  const checkExistingAccount = async () => {
    const existing = await getFundraiserAccount();
    if (existing?.email) setEmail(existing.email);
  };

  const animateStep = (nextStep: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    setStep(nextStep);
  };

  const goNext = () => { if (step < STEPS.length - 1) animateStep(step + 1); };
  const goBack = () => { if (step > 0) animateStep(step - 1); else navigation.goBack(); };

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setStep(0);
    setEmailSent(false);
    setPhoneSent(false);
    setEmailOTP(['', '', '', '', '', '']);
    setPhoneOTP(['', '', '', '', '', '']);
  };

  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleSendEmail = () => {
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Invalid Email', 'Please enter a valid email.');
      return;
    }
    const otp = generateOTP();
    setGeneratedEmailOTP(otp);
    setEmailSent(true);
    Alert.alert('Email OTP', `Your verification code is: ${otp}`, [{ text: 'OK' }]);
  };

  const handleVerifyEmail = () => {
    const code = emailOTP.join('');
    if (code.length < 6) return;
    if (code !== generatedEmailOTP) {
      Alert.alert('Wrong Code', 'Please check the code and try again.');
      return;
    }
    goNext();
  };

  const handleEmailOTPChange = (text: string, index: number) => {
    const newOTP = [...emailOTP];
    newOTP[index] = text;
    setEmailOTP(newOTP);
    if (text && index < 5) emailOTPRefs.current[index + 1]?.focus();
  };

  const handleSendPhone = () => {
    if (phone.length < 9) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number.');
      return;
    }
    const otp = generateOTP();
    setGeneratedPhoneOTP(otp);
    setPhoneSent(true);
    Alert.alert('Phone OTP', `Your verification code is: ${otp}`, [{ text: 'OK' }]);
  };

  const handleVerifyPhone = () => {
    const code = phoneOTP.join('');
    if (code.length < 6) return;
    if (code !== generatedPhoneOTP) {
      Alert.alert('Wrong Code', 'Please check the code and try again.');
      return;
    }
    goNext();
  };

  const handlePhoneOTPChange = (text: string, index: number) => {
    const newOTP = [...phoneOTP];
    newOTP[index] = text;
    setPhoneOTP(newOTP);
    if (text && index < 5) phoneOTPRefs.current[index + 1]?.focus();
  };

  const pickImage = async (setter: (v: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled && result.assets?.[0]) setter(result.assets[0].uri);
  };

  const takePhoto = async (setter: (v: string) => void) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Please allow camera access.'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets?.[0]) setter(result.assets[0].uri);
  };

  const handleSignIn = async () => {
    if (!email.includes('@')) { Alert.alert('Invalid Email', 'Please enter your registered email.'); return; }
    await createFundraiserAccount({
      email, emailVerified: true, phone: '', phoneVerified: true,
      nrcFrontUri: '', nrcBackUri: '', nrcSelfieUri: '', nrcVerified: true, type: 'individual',
    });
    navigation.replace('MyFundraiser');
  };

  const handleComplete = async () => {
    if (!nrcFront || !nrcBack || !nrcSelfie) {
      Alert.alert('Required', 'Please upload all 3 images to complete verification.');
      return;
    }
    await createFundraiserAccount({
      email, emailVerified: true, phone, phoneVerified: true,
      nrcFrontUri: nrcFront, nrcBackUri: nrcBack, nrcSelfieUri: nrcSelfie,
      nrcVerified: true, type: 'individual',
    });
    navigation.replace('MyFundraiser');
  };

  const renderOTPBoxes = (
    values: string[],
    onChange: (t: string, i: number) => void,
    refs: typeof emailOTPRefs
  ) => (
    <View style={styles.otpContainer}>
      {values.map((val, i) => (
        <TextInput
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          style={[styles.otpBox, {
            backgroundColor: colors.surfaceContainerLow,
            borderColor: val ? colors.primary : colors.outlineVariant + '50',
            borderWidth: val ? 2 : 1,
          }]}
          keyboardType="number-pad"
          maxLength={1}
          value={val}
          onChangeText={(t) => onChange(t, i)}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === 'Backspace' && !values[i] && i > 0) {
              refs.current[i - 1]?.focus();
            }
          }}
          textAlign="center"
        />
      ))}
    </View>
  );

  const renderUploadCard = (label: string, uri: string, setter: (v: string) => void, icon: string, isCamera?: boolean) => (
    <View style={styles.uploadField}>
      <Text style={[styles.uploadLabel, { color: colors.onSurface }]}>{label}</Text>
      <TouchableOpacity
        style={[styles.uploadCard, {
          backgroundColor: colors.surfaceContainerLow,
          borderColor: uri ? colors.primary : colors.outlineVariant,
          borderWidth: 1,
          borderStyle: uri ? 'solid' : 'dashed',
        }]}
        onPress={() => isCamera ? takePhoto(setter) : pickImage(setter)}
        activeOpacity={0.7}
      >
        {uri ? (
          <View style={styles.uploadDone}>
            <Image source={{ uri }} style={styles.uploadPreview} />
            <View style={[styles.uploadCheck, { backgroundColor: colors.primary }]}>
              <Ionicons name="checkmark" size={sc(12)} color={colors.onPrimary} />
            </View>
          </View>
        ) : (
          <View style={styles.uploadPlaceholder}>
            <Ionicons name={icon as any} size={sc(32)} color={colors.outlineVariant} />
            <Text style={[styles.uploadHintText, { color: colors.onSurfaceVariant }]}>
              {isCamera ? 'Take a photo' : 'Choose from gallery'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const CTAButton = ({ onPress, label, disabled, icon }: {
    onPress: () => void; label: string; disabled?: boolean; icon?: string;
  }) => (
    <TouchableOpacity
      style={[styles.ctaWrap, { opacity: disabled ? 0.4 : 1 }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <LinearGradient colors={[colors.primaryDim, colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
        {icon && <Ionicons name={icon as any} size={sc(18)} color={colors.onPrimary} />}
        <Text style={[styles.ctaText, { color: colors.onPrimary }]}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const GhostButton = ({ onPress, label, sub }: { onPress: () => void; label: string; sub?: string }) => (
    <TouchableOpacity style={styles.ghostBtn} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.ghostLabel, { color: colors.primary }]}>{label}</Text>
      {sub && <Text style={[styles.ghostSub, { color: colors.onSurfaceVariant }]}>{sub}</Text>}
    </TouchableOpacity>
  );

  const renderHeroMascot = () => (
    <View style={styles.heroMascot}>
      <OtterMascot name="fundraiserAuth" size={sc(132)} />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />

      {/* Background decoration */}
      <View style={[styles.blob1, { backgroundColor: colors.primary + '0A' }]} pointerEvents="none" />
      <View style={[styles.blob2, { backgroundColor: colors.tertiary + '08' }]} pointerEvents="none" />
      <View style={[styles.blob3, { backgroundColor: colors.secondary + '06' }]} pointerEvents="none" />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={goBack} activeOpacity={0.7} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.onSurface }]}>
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </Text>
        <View style={{ width: sc(38) }} />
      </View>

      {/* Mode toggle — pill */}
      <View style={[styles.togglePill, { backgroundColor: colors.surfaceContainerLow }]}>
        <TouchableOpacity
          style={[styles.toggleHalf, mode === 'signin' && { backgroundColor: colors.primary }]}
          onPress={() => switchMode('signin')}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleText, { color: mode === 'signin' ? colors.onPrimary : colors.onSurfaceVariant }]}>
            Sign In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleHalf, mode === 'signup' && { backgroundColor: colors.primary }]}
          onPress={() => switchMode('signup')}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleText, { color: mode === 'signup' ? colors.onPrimary : colors.onSurfaceVariant }]}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>

      {/* Step indicator — signup only */}
      {mode === 'signup' && (
        <View style={styles.progressRow}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <View style={[styles.dotWrap, { opacity: i <= step ? 1 : 0.35 }]}>
                <View style={[styles.dot, {
                  backgroundColor: i < step ? colors.primary : i === step ? colors.primary : colors.outlineVariant,
                }]}>
                  {i < step && <Ionicons name="checkmark" size={sc(10)} color={colors.onPrimary} />}
                </View>
                <Text style={[styles.dotLabel, {
                  color: i === step ? colors.primary : colors.onSurfaceVariant,
                  fontWeight: i === step ? '700' : '500',
                }]}>{s}</Text>
              </View>
              {i < STEPS.length - 1 && (
                <View style={[styles.dotLine, {
                  backgroundColor: i < step ? colors.primary : colors.outlineVariant + '44',
                }]} />
              )}
            </React.Fragment>
          ))}
        </View>
      )}

      {/* Content */}
      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        contentContainerStyle={{ paddingBottom: sc(40) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Sign In mode */}
        {mode === 'signin' && (
          <View style={styles.page}>
            {renderHeroMascot()}
            <Text style={[styles.heroTitle, { color: colors.onSurface }]}>Welcome Back</Text>
            <Text style={[styles.heroSub, { color: colors.onSurfaceVariant }]}>
              Sign in to manage your campaigns, track donations, and connect with supporters
            </Text>

            <View style={styles.form}>
              <View style={[styles.inputField, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant + '66' }]}>
                <Ionicons name="mail-outline" size={sc(18)} color={colors.onSurfaceVariant} />
                <TextInput
                  style={[styles.inputText, { color: colors.onSurface }]}
                  placeholder="Email address"
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="go"
                  onSubmitEditing={handleSignIn}
                />
              </View>

              <CTAButton onPress={handleSignIn} label="Sign In" disabled={!email.trim()} icon="log-in-outline" />

              <View style={styles.divider}>
                <View style={[styles.divLine, { backgroundColor: colors.outlineVariant + '33' }]} />
                <Text style={[styles.divText, { color: colors.onSurfaceVariant }]}>or</Text>
                <View style={[styles.divLine, { backgroundColor: colors.outlineVariant + '33' }]} />
              </View>

              <GhostButton
                onPress={() => switchMode('signup')}
                label="Create new account"
                sub="Don't have a fundraiser account yet?"
              />
            </View>
          </View>
        )}

        {/* Sign Up — Step 0: Account */}
        {mode === 'signup' && step === 0 && (
          <View style={styles.page}>
            {renderHeroMascot()}
            <Text style={[styles.heroTitle, { color: colors.onSurface }]}>Create Your Account</Text>
            <Text style={[styles.heroSub, { color: colors.onSurfaceVariant }]}>
              Set up your fundraiser profile — it only takes a minute
            </Text>

            <View style={styles.form}>
              <Text style={[styles.fieldLabel, { color: colors.onSurface }]}>Display Name</Text>
              <View style={[styles.inputField, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant + '66' }]}>
                <Ionicons name="person-outline" size={sc(18)} color={colors.onSurfaceVariant} />
                <TextInput
                  style={[styles.inputText, { color: colors.onSurface }]}
                  placeholder="How supporters will see you"
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={goNext}
                />
              </View>

              <CTAButton onPress={goNext} label="Continue" disabled={!displayName.trim()} icon="arrow-forward" />
            </View>
          </View>
        )}

        {/* Sign Up — Step 1: Email */}
        {mode === 'signup' && step === 1 && (
          <View style={styles.page}>
            {renderHeroMascot()}
            <Text style={[styles.heroTitle, { color: colors.onSurface }]}>Verify Email</Text>
            <Text style={[styles.heroSub, { color: colors.onSurfaceVariant }]}>
              {emailSent
                ? `We sent a 6-digit code to your email`
                : 'Enter your email to receive a verification code'}
            </Text>

            <View style={styles.form}>
              {!emailSent && (
                <View style={[styles.inputField, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant + '66' }]}>
                  <Ionicons name="mail-outline" size={sc(18)} color={colors.onSurfaceVariant} />
                  <TextInput
                    style={[styles.inputText, { color: colors.onSurface }]}
                    placeholder="your@email.com"
                    placeholderTextColor={colors.onSurfaceVariant}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="go"
                    onSubmitEditing={handleSendEmail}
                  />
                </View>
              )}

              {emailSent && (
                <>
                  <Text style={[styles.otpHint, { color: colors.onSurfaceVariant }]}>Enter 6-digit code</Text>
                  {renderOTPBoxes(emailOTP, handleEmailOTPChange, emailOTPRefs)}
                  <GhostButton onPress={handleSendEmail} label="Resend code" />
                </>
              )}

              <CTAButton
                onPress={emailSent ? handleVerifyEmail : handleSendEmail}
                label={emailSent ? 'Verify Email' : 'Send Code'}
                disabled={emailSent ? emailOTP.join('').length !== 6 : !email.trim()}
                icon={emailSent ? 'checkmark-circle' : 'send-outline'}
              />

              <GhostButton onPress={goBack} label="Back" />
            </View>
          </View>
        )}

        {/* Sign Up — Step 2: Phone */}
        {mode === 'signup' && step === 2 && (
          <View style={styles.page}>
            {renderHeroMascot()}
            <Text style={[styles.heroTitle, { color: colors.onSurface }]}>Verify Phone</Text>
            <Text style={[styles.heroSub, { color: colors.onSurfaceVariant }]}>
              {phoneSent
                ? `We sent a 6-digit code to your phone`
                : 'Enter your phone number for verification'}
            </Text>

            <View style={styles.form}>
              {!phoneSent && (
                <View style={[styles.inputField, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant + '66' }]}>
                  <Ionicons name="call-outline" size={sc(18)} color={colors.onSurfaceVariant} />
                  <TextInput
                    style={[styles.inputText, { color: colors.onSurface }]}
                    placeholder="+95 9 xxx xxx xxx"
                    placeholderTextColor={colors.onSurfaceVariant}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    returnKeyType="go"
                    onSubmitEditing={handleSendPhone}
                  />
                </View>
              )}

              {phoneSent && (
                <>
                  <Text style={[styles.otpHint, { color: colors.onSurfaceVariant }]}>Enter 6-digit code</Text>
                  {renderOTPBoxes(phoneOTP, handlePhoneOTPChange, phoneOTPRefs)}
                  <GhostButton onPress={handleSendPhone} label="Resend code" />
                </>
              )}

              <CTAButton
                onPress={phoneSent ? handleVerifyPhone : handleSendPhone}
                label={phoneSent ? 'Verify Phone' : 'Send Code'}
                disabled={phoneSent ? phoneOTP.join('').length !== 6 : phone.length < 9}
                icon={phoneSent ? 'checkmark-circle' : 'send-outline'}
              />

              <GhostButton onPress={goBack} label="Back" />
            </View>
          </View>
        )}

        {/* Sign Up — Step 3: NRC Upload */}
        {mode === 'signup' && step === 3 && (
          <View style={styles.page}>
            {renderHeroMascot()}
            <Text style={[styles.heroTitle, { color: colors.onSurface }]}>Identity Verification</Text>
            <Text style={[styles.heroSub, { color: colors.onSurfaceVariant }]}>
              Upload your NRC and a selfie to complete your account setup
            </Text>

            <View style={styles.form}>
              {renderUploadCard('NRC Front', nrcFront, setNrcFront, 'card-outline')}
              {renderUploadCard('NRC Back', nrcBack, setNrcBack, 'card-outline')}
              {renderUploadCard('Selfie holding NRC', nrcSelfie, setNrcSelfie, 'camera-outline', true)}

              <CTAButton
                onPress={handleComplete}
                label="Complete Setup"
                disabled={!nrcFront || !nrcBack || !nrcSelfie}
                icon="checkmark-done-circle"
              />

              <GhostButton onPress={goBack} label="Back" />
            </View>
          </View>
        )}
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  blob1: { position: 'absolute', top: -sc(100), left: -sc(80), width: sc(280), height: sc(280), borderRadius: sc(140), opacity: 0.5 },
  blob2: { position: 'absolute', bottom: -sc(60), right: -sc(100), width: sc(240), height: sc(240), borderRadius: sc(120), opacity: 0.4 },
  blob3: { position: 'absolute', top: H * 0.4, left: W * 0.6, width: sc(160), height: sc(160), borderRadius: sc(80), opacity: 0.3 },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(20), paddingVertical: sc(12) },
  backBtn: { padding: sc(8), minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  topTitle: { fontSize: sc(15), fontWeight: '700' },

  togglePill: { flexDirection: 'row', marginHorizontal: sc(20), borderRadius: sc(24), padding: sc(3), marginBottom: sc(12) },
  toggleHalf: { flex: 1, borderRadius: sc(20), paddingVertical: sc(8), alignItems: 'center' },
  toggleText: { fontSize: sc(13), fontWeight: '600' },

  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: sc(32), marginBottom: sc(8) },
  dotWrap: { alignItems: 'center' },
  dot: { width: sc(26), height: sc(26), borderRadius: sc(13), justifyContent: 'center', alignItems: 'center', marginBottom: sc(4) },
  dotLabel: { fontSize: sc(9), letterSpacing: 0.3 },
  dotLine: { flex: 1, height: 2, marginHorizontal: sc(4), marginBottom: sc(16) },

  content: { flex: 1 },
  page: { paddingHorizontal: sc(24), paddingTop: sc(8) },
  heroMascot: { alignItems: 'center', justifyContent: 'center', height: sc(126), marginTop: -sc(6), marginBottom: sc(6) },
  heroTitle: { fontSize: sc(24), fontWeight: '800', textAlign: 'center', marginBottom: sc(6) },
  heroSub: { fontSize: sc(13), lineHeight: sc(20), textAlign: 'center', marginBottom: sc(24) },

  form: {},
  fieldLabel: { fontSize: sc(12), fontWeight: '600', marginBottom: sc(8) },
  inputField: { flexDirection: 'row', alignItems: 'center', borderRadius: sc(14), borderWidth: 1, paddingHorizontal: sc(14), paddingVertical: sc(10), marginBottom: sc(16), gap: sc(10) },
  inputText: { flex: 1, fontSize: sc(14), paddingVertical: sc(4) },

  ctaWrap: { borderRadius: sc(26), overflow: 'hidden', marginTop: sc(8), marginBottom: sc(12) },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(8), paddingVertical: sc(14), minHeight: sc(50), borderRadius: sc(26) },
  ctaText: { fontSize: sc(15), fontWeight: '700' },

  ghostBtn: { alignItems: 'center', paddingVertical: sc(10), marginTop: sc(4) },
  ghostLabel: { fontSize: sc(13), fontWeight: '600' },
  ghostSub: { fontSize: sc(11), marginTop: sc(2) },

  divider: { flexDirection: 'row', alignItems: 'center', paddingVertical: sc(12), gap: sc(12) },
  divLine: { flex: 1, height: 1 },
  divText: { fontSize: sc(11), fontWeight: '500' },

  otpHint: { fontSize: sc(13), textAlign: 'center', marginBottom: sc(12) },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', gap: sc(8), marginBottom: sc(12) },
  otpBox: { width: sc(44), height: sc(52), borderRadius: sc(12), textAlign: 'center', fontSize: sc(18), fontWeight: '700' },

  uploadField: { marginBottom: sc(14) },
  uploadLabel: { fontSize: sc(12), fontWeight: '600', marginBottom: sc(6) },
  uploadCard: { borderRadius: sc(14), overflow: 'hidden', minHeight: sc(100), justifyContent: 'center', alignItems: 'center' },
  uploadDone: { width: '100%', alignItems: 'center' },
  uploadPreview: { width: '100%', height: sc(100), resizeMode: 'cover' },
  uploadCheck: { position: 'absolute', top: sc(8), right: sc(8), width: sc(22), height: sc(22), borderRadius: sc(11), justifyContent: 'center', alignItems: 'center' },
  uploadPlaceholder: { alignItems: 'center', paddingVertical: sc(18), gap: sc(6) },
  uploadHintText: { fontSize: sc(12) },
});
