import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const payoutHistory = [
  { date: '2026-03-28', amount: 64.50, status: 'paid', sessions: 18 },
  { date: '2026-02-28', amount: 72.00, status: 'paid', sessions: 22 },
  { date: '2026-01-31', amount: 53.00, status: 'paid', sessions: 15 },
  { date: '2026-04-15', amount: 45.00, status: 'pending', sessions: 12 },
];

const paymentMethods = [
  { id: 'kpay' as const, label: 'KPay', desc: 'Instant to KPay wallet', icon: 'phone-portrait', accent: '#E74C3C' },
  { id: 'wavepay' as const, label: 'WavePay', desc: 'Instant to WavePay wallet', icon: 'send', accent: '#8E44AD' },
  { id: 'paypal' as const, label: 'PayPal', desc: 'International payouts', icon: 'globe', accent: '#003087' },
];

export default function EarningsScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;

  // Payout setup state
  const [showSetup, setShowSetup] = useState(false);
  const [step, setStep] = useState<'cycle' | 'method' | 'account'>('cycle');
  const [payoutCycle, setPayoutCycle] = useState<'weekly' | 'monthly'>('monthly');
  const [selectedPayment, setSelectedPayment] = useState<'kpay' | 'wavepay' | 'paypal' | null>(null);
  const [accountValue, setAccountValue] = useState('');
  const [saved, setSaved] = useState(false);

  // Animate form entrance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
  };

  const openSetup = () => {
    setShowSetup(true);
    setStep('cycle');
    setTimeout(animateIn, 50);
  };

  const closeSetup = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 30, duration: 200, useNativeDriver: true }),
    ]).start(() => setShowSetup(false));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setShowSetup(false);
      setSaved(false);
      setStep('cycle');
      setSelectedPayment(null);
      setAccountValue('');
    }, 1500);
  };

  const goNext = () => {
    if (step === 'cycle') setStep('method');
    else if (step === 'method' && selectedPayment) { setStep('account'); setAccountValue(''); }
  };

  const goBack = () => {
    if (step === 'method') setStep('cycle');
    else if (step === 'account') setStep('method');
  };

  const currentMethod = paymentMethods.find(m => m.id === selectedPayment);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.surfaceContainerLow }]} activeOpacity={0.5}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.onSurface }]}>Earnings & Payouts</Text>
        <View style={{ width: sc(38) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
          <Text style={[styles.summaryLabel, { color: colors.onPrimary + 'CC' }]}>Total Earnings</Text>
          <Text style={[styles.summaryAmount, { color: colors.onPrimary }]}>$234.50</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryItemValue, { color: colors.onPrimary }]}>$45.00</Text>
              <Text style={[styles.summaryItemLabel, { color: colors.onPrimary + '99' }]}>Pending</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.onPrimary + '33' }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryItemValue, { color: colors.onPrimary }]}>$189.50</Text>
              <Text style={[styles.summaryItemLabel, { color: colors.onPrimary + '99' }]}>Paid Out</Text>
            </View>
          </View>
        </View>

        {/* Payout Config Card */}
        {saved ? (
          <View style={[styles.savedCard, { backgroundColor: colors.primaryContainer + '22', borderColor: colors.primary + '44', borderWidth: 1 }]}>
            <Ionicons name="checkmark-circle" size={sc(28)} color={colors.primary} />
            <Text style={[styles.savedText, { color: colors.primary }]}>Payout settings saved</Text>
          </View>
        ) : !showSetup ? (
          <View style={[styles.configCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.configRow}>
              <View style={[styles.configIcon, { backgroundColor: colors.primaryContainer + '33' }]}>
                <Ionicons name="repeat" size={sc(20)} color={colors.primary} />
              </View>
              <View style={styles.configInfo}>
                <Text style={[styles.configLabel, { color: colors.onSurface }]}>Payout Schedule</Text>
                <Text style={[styles.configValue, { color: colors.onSurfaceVariant }]}>
                  {payoutCycle === 'weekly' ? 'Weekly' : 'Monthly'}
                  {selectedPayment ? ` · ${currentMethod?.label}` : ' · Not set up'}
                </Text>
              </View>
              <TouchableOpacity style={[styles.configEdit, { backgroundColor: colors.primary }]} onPress={openSetup} activeOpacity={0.7}>
                <Text style={[styles.configEditText, { color: colors.onPrimary }]}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={[styles.setupCard, { backgroundColor: colors.surfaceContainerLow }]}>
              {/* Mini step dots */}
              <View style={styles.dotsRow}>
                {['cycle', 'method', 'account'].map((s, i) => {
                  const isCurrent = s === step;
                  const isDone = (s === 'cycle' && step !== 'cycle') || (s === 'method' && step === 'account');
                  return (
                    <View key={s} style={styles.dotGroup}>
                      <View style={[styles.dot, { backgroundColor: isCurrent ? colors.primary : isDone ? colors.primary : colors.outlineVariant + '33' }]}>
                        {isDone && <Ionicons name="checkmark" size={sc(10)} color={colors.onPrimary} />}
                      </View>
                      {i < 2 && <View style={[styles.dotLine, { backgroundColor: isDone ? colors.primary : colors.outlineVariant + '22' }]} />}
                    </View>
                  );
                })}
              </View>

              {/* Step 1: Cycle */}
              {step === 'cycle' && (
                <View style={styles.stepBody}>
                  <Text style={[styles.stepHeading, { color: colors.onSurface }]}>Payout Frequency</Text>
                  {(['weekly', 'monthly'] as const).map((c) => {
                    const active = payoutCycle === c;
                    return (
                      <TouchableOpacity
                        key={c}
                        style={[styles.optionCard, {
                          backgroundColor: active ? colors.primaryContainer + '22' : colors.surface,
                          borderColor: active ? colors.primary : colors.surfaceContainerHigh,
                          borderWidth: 2,
                        }]}
                        onPress={() => setPayoutCycle(c)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.optionLeft}>
                          <Ionicons
                            name={c === 'weekly' ? 'calendar-outline' : 'calendar-clear-outline'}
                            size={sc(22)}
                            color={active ? colors.primary : colors.onSurfaceVariant}
                          />
                          <View style={{ marginLeft: sc(12) }}>
                            <Text style={[styles.optionTitle, { color: colors.onSurface, fontWeight: active ? '700' : '600' }]}>
                              {c === 'weekly' ? 'Weekly' : 'Monthly'}
                            </Text>
                            <Text style={[styles.optionDesc, { color: colors.onSurfaceVariant }]}>
                              {c === 'weekly' ? 'Get paid every 7 days' : 'Get paid at the end of each month'}
                            </Text>
                          </View>
                        </View>
                        <View style={[styles.radio, { borderColor: active ? colors.primary : colors.outlineVariant }]}>
                          {active && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Step 2: Method */}
              {step === 'method' && (
                <View style={styles.stepBody}>
                  <Text style={[styles.stepHeading, { color: colors.onSurface }]}>Payout Method</Text>
                  {paymentMethods.map((pm) => {
                    const active = selectedPayment === pm.id;
                    return (
                      <TouchableOpacity
                        key={pm.id}
                        style={[styles.optionCard, {
                          backgroundColor: colors.surface,
                          borderColor: active ? pm.accent : colors.surfaceContainerHigh,
                          borderWidth: active ? 2 : 1,
                        }]}
                        onPress={() => setSelectedPayment(pm.id)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.optionIconWrap, { backgroundColor: pm.accent + '18' }]}>
                          <Ionicons name={pm.icon as any} size={sc(20)} color={pm.accent} />
                        </View>
                        <View style={{ flex: 1, marginLeft: sc(12) }}>
                          <Text style={[styles.optionTitle, { color: colors.onSurface, fontWeight: active ? '700' : '600' }]}>{pm.label}</Text>
                          <Text style={[styles.optionDesc, { color: colors.onSurfaceVariant }]}>{pm.desc}</Text>
                        </View>
                        <View style={[styles.radio, { borderColor: active ? pm.accent : colors.outlineVariant }]}>
                          {active && <View style={[styles.radioDot, { backgroundColor: pm.accent }]} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Step 3: Account */}
              {step === 'account' && (
                <View style={styles.stepBody}>
                  <Text style={[styles.stepHeading, { color: colors.onSurface }]}>
                    {currentMethod?.label} Account
                  </Text>
                  <View style={[styles.inputField, { backgroundColor: colors.surface, borderColor: colors.surfaceContainerHigh, borderWidth: 1 }]}>
                    <Ionicons
                      name={selectedPayment === 'paypal' ? 'mail-outline' : 'phone-portrait-outline'}
                      size={sc(18)}
                      color={colors.onSurfaceVariant}
                    />
                    <TextInput
                      style={[styles.textInput, { color: colors.onSurface }]}
                      placeholder={selectedPayment === 'paypal' ? 'Enter your PayPal email' : 'Enter your phone number'}
                      placeholderTextColor={colors.onSurfaceVariant + '66'}
                      keyboardType={selectedPayment === 'paypal' ? 'email-address' : 'phone-pad'}
                      autoCapitalize="none"
                      value={accountValue}
                      onChangeText={setAccountValue}
                    />
                  </View>
                </View>
              )}

              {/* Nav Buttons */}
              <View style={styles.navRow}>
                <TouchableOpacity style={[styles.navBack, { borderColor: colors.outlineVariant + '44' }]} onPress={goBack} activeOpacity={0.7}>
                  <Ionicons name="arrow-back" size={sc(16)} color={colors.onSurfaceVariant} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.navForward, { backgroundColor: (step === 'account' ? accountValue.length > 0 : true) ? colors.primary : colors.outlineVariant + '44' }]}
                  onPress={step === 'account' ? handleSave : goNext}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.navForwardText, { color: colors.onPrimary }]}>
                    {step === 'account' ? 'Save' : 'Next'}
                  </Text>
                  <Ionicons name={step === 'account' ? 'checkmark' : 'arrow-forward'} size={sc(18)} color={colors.onPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Chart */}
        <View style={[styles.chartCard, { backgroundColor: colors.surfaceContainerLow }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.onSurface }]}>Monthly Earnings</Text>
            <View style={[styles.chartBadge, { backgroundColor: colors.primaryContainer + '33' }]}>
              <Ionicons name="trending-up" size={sc(14)} color={colors.primary} />
              <Text style={[styles.chartBadgeText, { color: colors.primary }]}>+$12.50</Text>
            </View>
          </View>
          <View style={styles.chartBars}>
            {[
              { month: 'Jan', pct: 53 },
              { month: 'Feb', pct: 72 },
              { month: 'Mar', pct: 65 },
              { month: 'Apr', pct: 45 },
            ].map((bar, i) => (
              <View key={i} style={styles.chartBar}>
                <View style={styles.chartBarFillWrap}>
                  <View style={[styles.chartBarFill, { height: `${bar.pct}%`, backgroundColor: colors.primaryContainer + '88' }]} />
                </View>
                <Text style={[styles.chartBarLabel, { color: colors.onSurfaceVariant }]}>{bar.month}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* History */}
        <Text style={[styles.historyTitle, { color: colors.onSurface }]}>Payout History</Text>
        {payoutHistory.map((item, i) => (
          <View key={i} style={[styles.historyItem, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={styles.historyLeft}>
              <View style={[styles.historyIcon, { backgroundColor: item.status === 'pending' ? colors.secondaryContainer : colors.primaryContainer }]}>
                <Ionicons
                  name={item.status === 'pending' ? 'time-outline' : 'checkmark-circle'}
                  size={sc(18)}
                  color={item.status === 'pending' ? colors.onSecondaryContainer : colors.primary}
                />
              </View>
              <View>
                <Text style={[styles.historyAmount, { color: colors.onSurface }]}>${item.amount.toFixed(2)}</Text>
                <Text style={[styles.historyDate, { color: colors.onSurfaceVariant }]}>{item.sessions} sessions</Text>
              </View>
            </View>
            <View style={styles.historyRight}>
              <Text style={[styles.historyTime, { color: colors.onSurfaceVariant }]}>{item.date}</Text>
              <View style={[styles.statusBadge, item.status === 'pending' ? { backgroundColor: colors.secondaryContainer + '66' } : { backgroundColor: colors.primaryContainer + '66' }]}>
                <Text style={[styles.statusText, item.status === 'pending' ? { color: colors.onSecondaryContainer } : { color: colors.onPrimaryContainer }]}>
                  {item.status === 'pending' ? 'Pending' : 'Paid'}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: sc(18), paddingBottom: sc(12), paddingTop: sc(8) },
  backButton: { width: sc(38), height: sc(38), borderRadius: sc(19), alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: sc(16), fontWeight: '700', letterSpacing: -0.3 },
  scrollContent: { paddingHorizontal: sc(18), paddingTop: sc(8), paddingBottom: sc(40) },

  // Summary
  summaryCard: { borderRadius: sc(20), padding: sc(22), marginBottom: sc(14) },
  summaryLabel: { fontSize: sc(10), fontWeight: '600', textTransform: 'uppercase', letterSpacing: 2 },
  summaryAmount: { fontSize: sc(36), fontWeight: '800', marginTop: sc(4), letterSpacing: -1 },
  summaryRow: { flexDirection: 'row', marginTop: sc(16), gap: sc(20) },
  summaryItem: { flex: 1 },
  summaryItemValue: { fontSize: sc(18), fontWeight: '700' },
  summaryItemLabel: { fontSize: sc(10), marginTop: sc(2) },
  summaryDivider: { width: 1 },

  // Saved confirmation
  savedCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(8), borderRadius: sc(14), paddingVertical: sc(16), marginBottom: sc(14) },
  savedText: { fontSize: sc(14), fontWeight: '700' },

  // Config summary card
  configCard: { borderRadius: sc(14), marginBottom: sc(14) },
  configRow: { flexDirection: 'row', alignItems: 'center', padding: sc(16) },
  configIcon: { width: sc(40), height: sc(40), borderRadius: sc(20), alignItems: 'center', justifyContent: 'center', marginRight: sc(12) },
  configInfo: { flex: 1 },
  configLabel: { fontSize: sc(14), fontWeight: '700' },
  configValue: { fontSize: sc(11), marginTop: sc(2) },
  configEdit: { borderRadius: sc(20), paddingHorizontal: sc(16), paddingVertical: sc(8) },
  configEditText: { fontSize: sc(13), fontWeight: '700' },

  // Setup card
  setupCard: { borderRadius: sc(16), padding: sc(18), marginBottom: sc(14) },

  // Step dots
  dotsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: sc(20) },
  dotGroup: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: sc(10), height: sc(10), borderRadius: sc(5), alignItems: 'center', justifyContent: 'center' },
  dotLine: { width: sc(30), height: 2, borderRadius: 1, marginHorizontal: sc(4) },

  // Step body
  stepBody: { marginBottom: sc(16) },
  stepHeading: { fontSize: sc(16), fontWeight: '700', marginBottom: sc(14), textAlign: 'center' },

  // Option cards
  optionCard: { flexDirection: 'row', alignItems: 'center', borderRadius: sc(14), padding: sc(16), marginBottom: sc(10) },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  optionIconWrap: { width: sc(38), height: sc(38), borderRadius: sc(19), alignItems: 'center', justifyContent: 'center' },
  optionTitle: { fontSize: sc(14) },
  optionDesc: { fontSize: sc(11), marginTop: sc(2) },
  radio: { width: sc(20), height: sc(20), borderRadius: sc(10), borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: sc(10), height: sc(10), borderRadius: sc(5) },

  // Input
  inputField: { flexDirection: 'row', alignItems: 'center', borderRadius: sc(14), paddingHorizontal: sc(16), minHeight: sc(54), gap: sc(10) },
  textInput: { flex: 1, fontSize: sc(15), paddingVertical: sc(14) },

  // Nav
  navRow: { flexDirection: 'row', alignItems: 'center', marginTop: sc(8), gap: sc(10) },
  navBack: { width: sc(46), height: sc(46), borderRadius: sc(23), borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  navForward: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: sc(23), flex: 1, paddingVertical: sc(14), minHeight: sc(48), gap: sc(6) },
  navForwardText: { fontSize: sc(15), fontWeight: '700' },

  // Chart
  chartCard: { borderRadius: sc(14), padding: sc(18), marginBottom: sc(14) },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: sc(16) },
  chartTitle: { fontSize: sc(14), fontWeight: '700' },
  chartBadge: { flexDirection: 'row', alignItems: 'center', gap: sc(4), borderRadius: sc(12), paddingHorizontal: sc(8), paddingVertical: sc(4) },
  chartBadgeText: { fontSize: sc(11), fontWeight: '700' },
  chartBars: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: sc(120) },
  chartBar: { alignItems: 'center', height: '100%', flex: 1 },
  chartBarFillWrap: { width: sc(28), alignItems: 'center', justifyContent: 'flex-end', flex: 1, marginBottom: sc(4) },
  chartBarFill: { width: '100%', borderRadius: sc(6), position: 'absolute', bottom: 0 },
  chartBarLabel: { fontSize: sc(10), fontWeight: '600' },

  // History
  historyTitle: { fontSize: sc(16), fontWeight: '700', marginBottom: sc(10) },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: sc(12), padding: sc(14), marginBottom: sc(8) },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: sc(10) },
  historyIcon: { width: sc(36), height: sc(36), borderRadius: sc(18), alignItems: 'center', justifyContent: 'center' },
  historyAmount: { fontSize: sc(14), fontWeight: '700' },
  historyDate: { fontSize: sc(10), marginTop: sc(2) },
  historyRight: { alignItems: 'flex-end', gap: sc(4) },
  historyTime: { fontSize: sc(10) },
  statusBadge: { paddingHorizontal: sc(8), paddingVertical: sc(3), borderRadius: sc(12) },
  statusText: { fontSize: sc(10), fontWeight: '600' },
});
