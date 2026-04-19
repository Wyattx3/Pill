import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFundraiserAccount, updateFundraiserAccount, generateAndStorePhoneOTP, verifyPhoneOTP } from '../utils/donations';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function EditPhoneScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = theme;
  const [originalPhone, setOriginalPhone] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpRefs] = useState(Array.from({ length: 6 }, () => React.createRef<TextInput>()));
  const [sentOTP, setSentOTP] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    loadAccount();
  }, []);

  const loadAccount = async () => {
    const acc = await getFundraiserAccount();
    if (acc?.phone) {
      setOriginalPhone(acc.phone);
      setNewPhone(acc.phone);
    }
  };

  const handleSendCode = async () => {
    if (newPhone.length < 9) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number.');
      return;
    }
    if (newPhone === originalPhone) {
      Alert.alert('No Change', 'Please enter a different phone number.');
      return;
    }
    const code = await generateAndStorePhoneOTP(newPhone);
    setGeneratedCode(code);
    setSentOTP(true);
    Alert.alert('Phone Verification', `Your verification code is: ${code}\n\n(Enter this code to verify your new phone number)`, [{ text: 'OK' }]);
  };

  const handleOTPChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      Alert.alert('Incomplete', 'Please enter all 6 digits.');
      return;
    }
    const valid = await verifyPhoneOTP(code);
    if (!valid) {
      Alert.alert('Invalid Code', 'The code you entered is incorrect or expired. Please try again.');
      return;
    }
    await updateFundraiserAccount({ phone: newPhone, phoneVerified: true });
    Alert.alert('Success!', 'Your phone number has been updated and verified.');
    navigation.goBack();
  };

  const handleResendCode = async () => {
    const code = await generateAndStorePhoneOTP(newPhone);
    setGeneratedCode(code);
    setOtp(['', '', '', '', '', '']);
    Alert.alert('Code Resent', `Your new verification code is: ${code}`, [{ text: 'OK' }]);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.onSurface }]}>Edit Phone</Text>
        <View style={{ width: sc(38) }} />
      </View>

      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '12' }]}>
          <Ionicons name="call" size={sc(48)} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.onSurface }]}>
          {sentOTP ? 'Verify New Phone' : 'Change Phone'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          {sentOTP
            ? `We sent a 6-digit code to ${newPhone}`
            : 'Enter your new phone number. We will send a verification code to confirm it belongs to you.'}
        </Text>

        {/* Phone Input */}
        {!sentOTP && (
          <View style={styles.form}>
            <Text style={[styles.fieldLabel, { color: colors.onSurfaceVariant }]}>Current Phone</Text>
            <View style={[styles.readonlyWrap, { backgroundColor: colors.surfaceContainerHigh }]}>
              <Ionicons name="call-outline" size={sc(16)} color={colors.onSurfaceVariant} />
              <Text style={[styles.readonlyText, { color: colors.onSurfaceVariant }]}>{originalPhone || 'Not set'}</Text>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.onSurfaceVariant, marginTop: sc(16) }]}>New Phone</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
              <Ionicons name="call-outline" size={sc(18)} color={colors.onSurfaceVariant} />
              <TextInput
                style={[styles.input, { color: colors.onSurface }]}
                value={newPhone}
                onChangeText={setNewPhone}
                placeholder="+95 9 xxx xxx xxx"
                placeholderTextColor={colors.onSurfaceVariant}
                keyboardType="phone-pad"
                returnKeyType="go"
                onSubmitEditing={handleSendCode}
              />
            </View>

            <TouchableOpacity
              style={[styles.ctaWrap, { opacity: newPhone.length >= 9 && newPhone !== originalPhone ? 1 : 0.4 }]}
              onPress={handleSendCode}
              disabled={newPhone.length < 9 || newPhone === originalPhone}
              activeOpacity={0.85}
            >
              <LinearGradient colors={[colors.primaryDim, colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
                <Ionicons name="send-outline" size={sc(18)} color={colors.onPrimary} />
                <Text style={[styles.ctaText, { color: colors.onPrimary }]}>Send Verification Code</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* OTP Input */}
        {sentOTP && (
          <View style={styles.form}>
            <Text style={[styles.otpHint, { color: colors.onSurfaceVariant }]}>Enter 6-digit verification code</Text>
            <View style={styles.otpRow}>
              {otp.map((val, i) => (
                <TextInput
                  key={i}
                  ref={otpRefs[i]}
                  style={[styles.otpBox, {
                    backgroundColor: colors.surfaceContainerLow,
                    borderColor: val ? colors.primary : colors.outlineVariant + '50',
                    borderWidth: val ? 2 : 1,
                  }]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={val}
                  onChangeText={(t) => handleOTPChange(t, i)}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace' && !val && i > 0) {
                      otpRefs[i - 1].current?.focus();
                    }
                  }}
                  textAlign="center"
                />
              ))}
            </View>

            <TouchableOpacity onPress={handleResendCode} style={styles.resendRow} activeOpacity={0.7}>
              <Ionicons name="refresh-outline" size={sc(14)} color={colors.primary} />
              <Text style={[styles.resendText, { color: colors.primary }]}>Resend Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.ctaWrap, { opacity: otp.join('').length === 6 ? 1 : 0.4 }]}
              onPress={handleVerify}
              disabled={otp.join('').length !== 6}
              activeOpacity={0.85}
            >
              <LinearGradient colors={[colors.primaryDim, colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
                <Ionicons name="checkmark-circle" size={sc(18)} color={colors.onPrimary} />
                <Text style={[styles.ctaText, { color: colors.onPrimary }]}>Verify & Save</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(20), paddingVertical: sc(12) },
  backBtn: { padding: sc(8), minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  topTitle: { fontSize: sc(16), fontWeight: '700' },

  content: { flex: 1, paddingHorizontal: sc(24), paddingTop: sc(32) },
  iconCircle: { width: sc(88), height: sc(88), borderRadius: sc(44), alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: sc(20) },
  title: { fontSize: sc(22), fontWeight: '800', textAlign: 'center', marginBottom: sc(6) },
  subtitle: { fontSize: sc(13), lineHeight: sc(20), textAlign: 'center', marginBottom: sc(32) },

  form: {},
  fieldLabel: { fontSize: sc(11), fontWeight: '600', marginBottom: sc(8), textTransform: 'uppercase', letterSpacing: 0.5 },
  readonlyWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: sc(14), paddingHorizontal: sc(14), paddingVertical: sc(10), gap: sc(10) },
  readonlyText: { fontSize: sc(14), fontWeight: '500' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: sc(14), borderWidth: 1, paddingHorizontal: sc(14), paddingVertical: sc(10), gap: sc(10) },
  input: { flex: 1, fontSize: sc(15), fontWeight: '600', paddingVertical: sc(4) },

  ctaWrap: { borderRadius: sc(26), overflow: 'hidden', marginTop: sc(20) },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(8), paddingVertical: sc(14), minHeight: sc(52), borderRadius: sc(26) },
  ctaText: { fontSize: sc(15), fontWeight: '700' },

  otpHint: { fontSize: sc(13), textAlign: 'center', marginBottom: sc(16) },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: sc(8), marginBottom: sc(12) },
  otpBox: { width: sc(44), height: sc(52), borderRadius: sc(12), textAlign: 'center', fontSize: sc(18), fontWeight: '700' },
  resendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(6), marginBottom: sc(16) },
  resendText: { fontSize: sc(13), fontWeight: '600' },
});
