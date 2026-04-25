import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPayoutSchedule, setPayoutSchedule } from '../utils/donations';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const paymentMethods = [
  { id: 'kpay' as const, label: 'KPay', desc: 'Instant transfer to KPay wallet', icon: 'phone-portrait', accent: '#E74C3C' },
  { id: 'wavepay' as const, label: 'WavePay', desc: 'Instant transfer to WavePay wallet', icon: 'send', accent: '#8E44AD' },
  { id: 'paypal' as const, label: 'PayPal', desc: 'International payout support', icon: 'globe', accent: '#003087' },
];

export default function PayoutScheduleEditScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;

  const [payoutCycle, setPayoutCycle] = useState<'weekly' | 'monthly'>('monthly');
  const [selectedPayment, setSelectedPayment] = useState<'kpay' | 'wavepay' | 'paypal' | null>(null);
  const [accountValue, setAccountValue] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    const schedule = await getPayoutSchedule();
    setPayoutCycle(schedule.cycle);
    setSelectedPayment(schedule.paymentMethod);
    setAccountValue(schedule.accountValue);
    setLoading(false);
  };

  const handleSave = async () => {
    await setPayoutSchedule({
      cycle: payoutCycle,
      paymentMethod: selectedPayment,
      accountValue,
    });
    setSaved(true);
    setHasChanges(false);
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  };

  const onChangeCycle = (c: 'weekly' | 'monthly') => {
    setPayoutCycle(c);
    setHasChanges(true);
  };

  const onChangeMethod = (m: 'kpay' | 'wavepay' | 'paypal') => {
    setSelectedPayment(m);
    setAccountValue('');
    setHasChanges(true);
  };

  const onChangeAccount = (v: string) => {
    setAccountValue(v);
    setHasChanges(true);
  };

  const currentMethod = paymentMethods.find((m) => m.id === selectedPayment);

  const canSave = selectedPayment && accountValue.length > 0;

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.headerBtn, { backgroundColor: colors.surfaceContainerLow }]}
          activeOpacity={0.5}
        >
          <Ionicons name="arrow-back" size={sc(20)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Payout Schedule</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Saved state */}
        {saved ? (
          <View style={[styles.savedBanner, { backgroundColor: colors.primary + '14' }]}>
            <Ionicons name="checkmark-circle" size={sc(22)} color={colors.primary} />
            <Text style={[styles.savedText, { color: colors.primary }]}>Saved successfully</Text>
          </View>
        ) : null}

        {/* Section 1: Frequency */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}>Payout Frequency</Text>
          <View style={styles.freqRow}>
            {(['weekly', 'monthly'] as const).map((c) => {
              const active = payoutCycle === c;
              return (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.freqBtn,
                    {
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderColor: active ? colors.primary : colors.surfaceContainerHigh,
                    },
                  ]}
                  onPress={() => onChangeCycle(c)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={c === 'weekly' ? 'calendar-outline' : 'calendar-clear-outline'}
                    size={sc(16)}
                    color={active ? colors.onPrimary : colors.onSurfaceVariant}
                  />
                  <Text
                    style={[
                      styles.freqBtnText,
                      { color: active ? colors.onPrimary : colors.onSurface },
                    ]}
                  >
                    {c === 'weekly' ? 'Weekly' : 'Monthly'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[styles.freqHint, { color: colors.onSurfaceVariant + 'AA' }]}>
            {payoutCycle === 'weekly'
              ? 'Funds will be transferred every 7 days automatically.'
              : 'Funds will be transferred at the end of each month.'}
          </Text>
        </View>

        {/* Section 2: Payment Method */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}>Payment Method</Text>
          {paymentMethods.map((pm) => {
            const active = selectedPayment === pm.id;
            return (
              <TouchableOpacity
                key={pm.id}
                style={[
                  styles.methodCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: active ? pm.accent : colors.surfaceContainerHigh,
                    borderWidth: active ? 1.5 : 1,
                  },
                ]}
                onPress={() => onChangeMethod(pm.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.methodIconWrap, { backgroundColor: pm.accent + '12' }]}>
                  <Ionicons name={pm.icon as any} size={sc(20)} color={pm.accent} />
                </View>
                <View style={styles.methodBody}>
                  <Text style={[styles.methodTitle, { color: colors.onSurface }]}>{pm.label}</Text>
                  <Text style={[styles.methodDesc, { color: colors.onSurfaceVariant }]}>{pm.desc}</Text>
                </View>
                <View
                  style={[
                    styles.checkCircle,
                    {
                      borderColor: active ? pm.accent : colors.outlineVariant,
                      backgroundColor: active ? pm.accent : 'transparent',
                    },
                  ]}
                >
                  {active && <Ionicons name="checkmark" size={sc(12)} color="#fff" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section 3: Account */}
        {selectedPayment && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}>
              {currentMethod?.label} Account
            </Text>
            <View
              style={[
                styles.inputWrap,
                {
                  backgroundColor: colors.surface,
                  borderColor: accountValue.length > 0 ? colors.primary : colors.surfaceContainerHigh,
                },
              ]}
            >
              <Ionicons
                name={selectedPayment === 'paypal' ? 'mail-outline' : 'phone-portrait-outline'}
                size={sc(18)}
                color={colors.onSurfaceVariant}
              />
              <TextInput
                style={[styles.textInput, { color: colors.onSurface }]}
                placeholder={
                  selectedPayment === 'paypal'
                    ? 'Enter PayPal email'
                    : 'Enter phone number'
                }
                placeholderTextColor={colors.onSurfaceVariant + '66'}
                keyboardType={selectedPayment === 'paypal' ? 'email-address' : 'phone-pad'}
                autoCapitalize="none"
                value={accountValue}
                onChangeText={onChangeAccount}
              />
            </View>
          </View>
        )}

        <View style={{ height: sc(24) }} />
      </ScrollView>

      {/* Bottom Save Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, sc(16)) }]}>
        <TouchableOpacity
          style={[
            styles.saveBtn,
            {
              backgroundColor: canSave ? colors.primary : colors.outlineVariant + '44',
            },
          ]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={!canSave}
        >
          <Text style={[styles.saveBtnText, { color: canSave ? colors.onPrimary : colors.onSurfaceVariant }]}>
            Save Changes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sc(18),
    paddingVertical: sc(10),
  },
  headerBtn: {
    width: sc(38),
    height: sc(38),
    borderRadius: sc(19),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: sc(17), fontWeight: '700', letterSpacing: -0.3 },

  scrollContent: { paddingHorizontal: sc(18), paddingTop: sc(4) },

  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sc(8),
    borderRadius: sc(12),
    paddingVertical: sc(12),
    marginBottom: sc(16),
  },
  savedText: { fontSize: sc(14), fontWeight: '600' },

  section: { marginBottom: sc(22) },
  sectionLabel: { fontSize: sc(12), fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: sc(10) },

  freqRow: { flexDirection: 'row', gap: sc(10) },
  freqBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sc(6),
    borderRadius: sc(12),
    borderWidth: 1,
    paddingVertical: sc(14),
  },
  freqBtnText: { fontSize: sc(14), fontWeight: '600' },
  freqHint: { fontSize: sc(12), marginTop: sc(8), lineHeight: sc(18) },

  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: sc(14),
    padding: sc(14),
    marginBottom: sc(10),
    borderWidth: 1,
  },
  methodIconWrap: {
    width: sc(40),
    height: sc(40),
    borderRadius: sc(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: sc(12),
  },
  methodBody: { flex: 1 },
  methodTitle: { fontSize: sc(15), fontWeight: '700' },
  methodDesc: { fontSize: sc(12), marginTop: sc(2) },
  checkCircle: {
    width: sc(22),
    height: sc(22),
    borderRadius: sc(11),
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: sc(14),
    borderWidth: 1,
    paddingHorizontal: sc(16),
    minHeight: sc(54),
    gap: sc(10),
  },
  textInput: { flex: 1, fontSize: sc(15), paddingVertical: sc(14) },

  bottomBar: {
    paddingHorizontal: sc(18),
    paddingTop: sc(10),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.12)',
  },
  saveBtn: {
    borderRadius: sc(14),
    paddingVertical: sc(16),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sc(52),
  },
  saveBtnText: { fontSize: sc(15), fontWeight: '700' },
});
