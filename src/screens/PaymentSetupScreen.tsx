import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
import { getFundraiserAccount, updateFundraiserAccount } from '../utils/donations';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const PAYMENT_METHODS = [
  { key: 'bank', label: 'Bank Account', icon: 'business-outline' },
  { key: 'mobile', label: 'Mobile Money', icon: 'phone-portrait-outline' },
  { key: 'crypto', label: 'Cryptocurrency', icon: 'logo-bitcoin' },
];

export default function PaymentSetupScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = theme;

  const [step, setStep] = useState(0);
  const [method, setMethod] = useState('');

  // Bank fields
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [branchCode, setBranchCode] = useState('');

  // Mobile fields
  const [mobileProvider, setMobileProvider] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  // Crypto fields
  const [cryptoType, setCryptoType] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = async () => {
    const acc = await getFundraiserAccount();
    if (acc?.payoutMethod) {
      setMethod(acc.payoutMethod.method || '');
      setStep(1);
      if (acc.payoutMethod.method === 'bank') {
        setBankName(acc.payoutMethod.bankName || '');
        setAccountName(acc.payoutMethod.accountName || '');
        setAccountNumber(acc.payoutMethod.accountNumber || '');
        setBranchCode(acc.payoutMethod.branchCode || '');
      } else if (acc.payoutMethod.method === 'mobile') {
        setMobileProvider(acc.payoutMethod.mobileProvider || '');
        setMobileNumber(acc.payoutMethod.mobileNumber || '');
      } else if (acc.payoutMethod.method === 'crypto') {
        setCryptoType(acc.payoutMethod.cryptoType || '');
        setWalletAddress(acc.payoutMethod.walletAddress || '');
      }
    }
  };

  const canProceed = () => {
    if (method === 'bank') return bankName.trim() && accountName.trim() && accountNumber.trim();
    if (method === 'mobile') return mobileProvider.trim() && mobileNumber.trim();
    if (method === 'crypto') return cryptoType.trim() && walletAddress.trim();
    return false;
  };

  const handleSave = async () => {
    const payoutMethod: any = { method };
    if (method === 'bank') {
      payoutMethod.bankName = bankName.trim();
      payoutMethod.accountName = accountName.trim();
      payoutMethod.accountNumber = accountNumber.trim();
      payoutMethod.branchCode = branchCode.trim();
    } else if (method === 'mobile') {
      payoutMethod.mobileProvider = mobileProvider.trim();
      payoutMethod.mobileNumber = mobileNumber.trim();
    } else if (method === 'crypto') {
      payoutMethod.cryptoType = cryptoType.trim();
      payoutMethod.walletAddress = walletAddress.trim();
    }
    await updateFundraiserAccount({ payoutMethod });
    Alert.alert('Saved', 'Your payout method has been saved.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const selectedMethod = PAYMENT_METHODS.find((m) => m.key === method);

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={sc(24)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
          {step === 0 ? 'Choose Payout Method' : 'Payout Details'}
        </Text>
        <View style={{ width: sc(24) }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 0: Method Selection */}
        {step === 0 && (
          <View style={styles.methods}>
            <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}>
              Select how you want to receive your payouts
            </Text>

            {PAYMENT_METHODS.map((m) => {
              const isSelected = method === m.key;
              return (
                <TouchableOpacity
                  key={m.key}
                  style={[
                    styles.methodCard,
                    {
                      backgroundColor: isSelected ? colors.primary + '12' : colors.surfaceContainerLow,
                      borderColor: isSelected ? colors.primary : colors.outlineVariant + '30',
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => setMethod(m.key)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.methodIcon, { backgroundColor: isSelected ? colors.primary + '18' : colors.surfaceContainerHigh }]}>
                    <Ionicons name={m.icon as any} size={sc(22)} color={isSelected ? colors.primary : colors.onSurfaceVariant} />
                  </View>
                  <View style={styles.methodBody}>
                    <Text style={[styles.methodLabel, { color: colors.onSurface }]}>{m.label}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={sc(20)} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[styles.methodNext, { opacity: method ? 1 : 0.35 }]}
              disabled={!method}
              onPress={() => setStep(1)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colors.primaryDim, colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.methodNextInner}
              >
                <Text style={[styles.methodNextText, { color: colors.onPrimary }]}>Continue</Text>
                <Ionicons name="arrow-forward" size={sc(16)} color={colors.onPrimary} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 1: Details Form */}
        {step === 1 && method === 'bank' && (
          <View style={styles.form}>
            <View style={[styles.formMethodBadge, { backgroundColor: colors.primary + '12' }]}>
              <Ionicons name="business-outline" size={sc(16)} color={colors.primary} />
              <Text style={[styles.formMethodText, { color: colors.primary }]}>Bank Account</Text>
            </View>

            <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>Bank Name</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
              <Ionicons name="business" size={sc(18)} color={colors.onSurfaceVariant} />
              <TextInput
                style={[styles.input, { color: colors.onSurface }]}
                placeholder="e.g. KBZ Bank, AYA Bank"
                placeholderTextColor={colors.onSurfaceVariant}
                value={bankName}
                onChangeText={setBankName}
                autoCapitalize="words"
              />
            </View>

            <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>Account Holder Name</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
              <Ionicons name="person-outline" size={sc(18)} color={colors.onSurfaceVariant} />
              <TextInput
                style={[styles.input, { color: colors.onSurface }]}
                placeholder="Full name on the account"
                placeholderTextColor={colors.onSurfaceVariant}
                value={accountName}
                onChangeText={setAccountName}
                autoCapitalize="words"
              />
            </View>

            <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>Account Number</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
              <Ionicons name="card-outline" size={sc(18)} color={colors.onSurfaceVariant} />
              <TextInput
                style={[styles.input, { color: colors.onSurface }]}
                placeholder="0000-0000-0000"
                placeholderTextColor={colors.onSurfaceVariant}
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="number-pad"
              />
            </View>

            <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>Branch Code (optional)</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
              <Ionicons name="git-branch-outline" size={sc(18)} color={colors.onSurfaceVariant} />
              <TextInput
                style={[styles.input, { color: colors.onSurface }]}
                placeholder="Branch or routing code"
                placeholderTextColor={colors.onSurfaceVariant}
                value={branchCode}
                onChangeText={setBranchCode}
              />
            </View>
          </View>
        )}

        {step === 1 && method === 'mobile' && (
          <View style={styles.form}>
            <View style={[styles.formMethodBadge, { backgroundColor: colors.primary + '12' }]}>
              <Ionicons name="phone-portrait-outline" size={sc(16)} color={colors.primary} />
              <Text style={[styles.formMethodText, { color: colors.primary }]}>Mobile Money</Text>
            </View>

            <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>Provider</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
              <Ionicons name="phone-portrait-outline" size={sc(18)} color={colors.onSurfaceVariant} />
              <TextInput
                style={[styles.input, { color: colors.onSurface }]}
                placeholder="e.g. Wave Money, KBZ Pay"
                placeholderTextColor={colors.onSurfaceVariant}
                value={mobileProvider}
                onChangeText={setMobileProvider}
                autoCapitalize="words"
              />
            </View>

            <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>Phone Number</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
              <Ionicons name="call-outline" size={sc(18)} color={colors.onSurfaceVariant} />
              <TextInput
                style={[styles.input, { color: colors.onSurface }]}
                placeholder="+95 9 xxx xxx xxx"
                placeholderTextColor={colors.onSurfaceVariant}
                value={mobileNumber}
                onChangeText={setMobileNumber}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        )}

        {step === 1 && method === 'crypto' && (
          <View style={styles.form}>
            <View style={[styles.formMethodBadge, { backgroundColor: colors.primary + '12' }]}>
              <Ionicons name="logo-bitcoin" size={sc(16)} color={colors.primary} />
              <Text style={[styles.formMethodText, { color: colors.primary }]}>Cryptocurrency</Text>
            </View>

            <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>Currency Type</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
              <Ionicons name="logo-bitcoin" size={sc(18)} color={colors.onSurfaceVariant} />
              <TextInput
                style={[styles.input, { color: colors.onSurface }]}
                placeholder="e.g. USDT, Bitcoin, Ethereum"
                placeholderTextColor={colors.onSurfaceVariant}
                value={cryptoType}
                onChangeText={setCryptoType}
                autoCapitalize="words"
              />
            </View>

            <Text style={[styles.inputLabel, { color: colors.onSurfaceVariant }]}>Wallet Address</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
              <Ionicons name="wallet-outline" size={sc(18)} color={colors.onSurfaceVariant} />
              <TextInput
                style={[styles.input, { color: colors.onSurface }]}
                placeholder="0x..."
                placeholderTextColor={colors.onSurfaceVariant}
                value={walletAddress}
                onChangeText={setWalletAddress}
                autoCapitalize="none"
              />
            </View>
          </View>
        )}

        {/* Save button */}
        {step === 1 && (
          <View style={styles.formFooter}>
            <TouchableOpacity
              style={[styles.formSave, { opacity: canProceed() ? 1 : 0.35 }]}
              disabled={!canProceed()}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colors.primaryDim, colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.formSaveInner}
              >
                <Ionicons name="checkmark-circle" size={sc(18)} color={colors.onPrimary} />
                <Text style={[styles.formSaveText, { color: colors.onPrimary }]}>Save Payout Method</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.formBack}
              onPress={() => setStep(0)}
              activeOpacity={0.7}
            >
              <Text style={[styles.formBackText, { color: colors.onSurfaceVariant }]}>Change method</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: sc(40) }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(20), paddingBottom: sc(16) },
  headerTitle: { fontSize: sc(16), fontWeight: '700' },
  content: { paddingHorizontal: sc(20) },

  // Method selection
  methods: {},
  sectionLabel: { fontSize: sc(13), marginBottom: sc(16), lineHeight: sc(20) },
  methodCard: { flexDirection: 'row', alignItems: 'center', borderRadius: sc(12), padding: sc(16), marginBottom: sc(10), gap: sc(14) },
  methodIcon: { width: sc(44), height: sc(44), borderRadius: sc(22), alignItems: 'center', justifyContent: 'center' },
  methodBody: { flex: 1 },
  methodLabel: { fontSize: sc(15), fontWeight: '600' },
  methodNext: { borderRadius: sc(24), overflow: 'hidden', marginTop: sc(20) },
  methodNextInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(8), paddingVertical: sc(14), minHeight: sc(50), borderRadius: sc(24) },
  methodNextText: { fontSize: sc(15), fontWeight: '700' },

  // Form
  form: { marginTop: sc(8) },
  formMethodBadge: { flexDirection: 'row', alignItems: 'center', gap: sc(6), alignSelf: 'flex-start', borderRadius: sc(8), paddingHorizontal: sc(12), paddingVertical: sc(6), marginBottom: sc(20) },
  formMethodText: { fontSize: sc(13), fontWeight: '600' },
  inputLabel: { fontSize: sc(11), fontWeight: '600', marginBottom: sc(6), textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: sc(10), borderWidth: 1, paddingHorizontal: sc(14), paddingVertical: sc(4), gap: sc(10), marginBottom: sc(14) },
  input: { flex: 1, fontSize: sc(14), fontWeight: '500', paddingVertical: sc(8) },

  formFooter: { marginTop: sc(20) },
  formSave: { borderRadius: sc(24), overflow: 'hidden' },
  formSaveInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(8), paddingVertical: sc(14), minHeight: sc(50), borderRadius: sc(24) },
  formSaveText: { fontSize: sc(15), fontWeight: '700' },
  formBack: { alignItems: 'center', paddingVertical: sc(12), marginTop: sc(4) },
  formBackText: { fontSize: sc(13), fontWeight: '500' },
});
