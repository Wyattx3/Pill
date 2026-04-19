import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getPayouts, requestPayout, getMyFundraisers, getFundraiserAccount, PayoutRecord, MyFundraiser, FundraiserAccount } from '../utils/donations';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

export default function PayoutScreen({ navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = theme;
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [fundraisers, setFundraisers] = useState<MyFundraiser[]>([]);
  const [account, setAccount] = useState<FundraiserAccount | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    loadAccount();
  }, []);

  const loadData = async () => {
    const p = await getPayouts();
    setPayouts(p);
    const f = await getMyFundraisers();
    setFundraisers(f);
  };

  const loadAccount = async () => {
    const acc = await getFundraiserAccount();
    setAccount(acc);
  };

  const totalRaised = fundraisers.reduce((sum, f) => sum + f.raisedAmount, 0);
  const totalPending = payouts.filter((p) => p.status === 'processing' || p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = payouts.filter((p) => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const available = totalRaised - totalPaid;

  const nextPayout = payouts.find((p) => p.status === 'processing');

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  const handleWithdraw = () => {
    if (!account?.payoutMethod) {
      Alert.alert(
        'No Payout Method',
        'You need to set up a payout method before you can withdraw funds.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Set Up', onPress: () => navigation.navigate('PaymentSetup') },
        ]
      );
      return;
    }
    if (available <= 0) {
      Alert.alert('No Funds', 'You don\'t have any available balance to withdraw.');
      return;
    }
    Alert.alert(
      'Withdraw Funds',
      `Withdraw ${fmt(available)} to your ${account.payoutMethod.method} account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          onPress: async () => {
            await requestPayout(available);
            loadData();
          },
        },
      ]
    );
  };

  const statusDot = (status: string) => {
    if (status === 'completed') return colors.primary;
    if (status === 'processing') return colors.tertiary;
    if (status === 'failed') return colors.error;
    return colors.outlineVariant;
  };

  const statusText = (status: string) => {
    if (status === 'completed') return 'Paid';
    if (status === 'processing') return 'Processing';
    if (status === 'failed') return 'Failed';
    return 'Pending';
  };

  const methodLabel = (m: string) => {
    if (m === 'bank') return 'Bank Account';
    if (m === 'mobile') return 'Mobile Money';
    if (m === 'crypto') return 'Cryptocurrency';
    return m;
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={sc(24)} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Payouts</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('PaymentSetup')}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={sc(24)} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Balance */}
        <View style={styles.balanceBlock}>
          <Text style={[styles.balanceLabel, { color: colors.onSurfaceVariant }]}>Available to payout</Text>
          <Text style={[styles.balanceValue, { color: colors.onSurface }]}>{fmt(available)}</Text>
        </View>

        {nextPayout && (
          <View style={styles.nextPayout}>
            <Ionicons name="hourglass" size={sc(14)} color={colors.tertiary} />
            <Text style={[styles.nextPayoutText, { color: colors.tertiary }]}>
              {fmt(nextPayout.amount)} is being processed
            </Text>
          </View>
        )}

        {/* Withdraw Funds Button */}
        <TouchableOpacity
          style={[styles.withdrawBtn, { opacity: available > 0 ? 1 : 0.35 }]}
          onPress={handleWithdraw}
          disabled={available <= 0}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-down-circle" size={sc(20)} color={available > 0 ? '#fff' : colors.onSurfaceVariant} />
          <Text style={[styles.withdrawBtnText, { color: available > 0 ? '#fff' : colors.onSurfaceVariant }]}>
            Withdraw Funds
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Payout Method */}
        {account?.payoutMethod && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>Payout Method</Text>
            <View style={[styles.methodCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <View style={[styles.methodIconWrap, { backgroundColor: colors.primary + '12' }]}>
                <Ionicons
                  name={account.payoutMethod.method === 'bank' ? 'business-outline' : account.payoutMethod.method === 'mobile' ? 'phone-portrait-outline' : 'logo-bitcoin'}
                  size={sc(18)}
                  color={colors.primary}
                />
              </View>
              <View style={styles.methodBody}>
                <Text style={[styles.methodName, { color: colors.onSurface }]}>
                  {methodLabel(account.payoutMethod.method)}
                </Text>
                <Text style={[styles.methodDetail, { color: colors.onSurfaceVariant }]}>
                  {account.payoutMethod.method === 'bank'
                    ? account.payoutMethod.bankName
                    : account.payoutMethod.method === 'mobile'
                    ? account.payoutMethod.mobileProvider
                    : account.payoutMethod.cryptoType}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('PaymentSetup')}
                activeOpacity={0.7}
              >
                <Text style={[styles.methodEdit, { color: colors.primary }]}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.surfaceContainerLow }]}>
            <Text style={[styles.statValue, { color: colors.onSurface }]}>{fmt(totalRaised)}</Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Total raised</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surfaceContainerLow }]}>
            <Text style={[styles.statValue, { color: colors.onSurface }]}>{fmt(totalPaid)}</Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Paid out</Text>
          </View>
        </View>

        {/* History */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={[styles.historyTitle, { color: colors.onSurface }]}>Payout history</Text>
            {payouts.length > 0 && (
              <Text style={[styles.historyCount, { color: colors.onSurfaceVariant }]}>{payouts.length}</Text>
            )}
          </View>

          {payouts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={sc(40)} color={colors.outlineVariant} />
              <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>No payouts yet</Text>
              <Text style={[styles.emptySub, { color: colors.onSurfaceVariant }]}>
                When you withdraw funds, they'll show up here
              </Text>
            </View>
          ) : (
            payouts.map((p) => (
              <View key={p.id} style={[styles.historyRow, { borderBottomColor: colors.outlineVariant + '15' }]}>
                <View style={styles.historyLeft}>
                  <View style={[styles.historyDot, { backgroundColor: statusDot(p.status) }]} />
                  <View style={styles.historyBody}>
                    <Text style={[styles.historyAmt, { color: colors.onSurface }]}>
                      {p.status === 'completed' || p.status === 'processing' ? `-${fmt(p.amount)}` : fmt(p.amount)}
                    </Text>
                    <Text style={[styles.historyDate, { color: colors.onSurfaceVariant }]}>
                      {formatDate(p.requestedAt)} · {statusText(p.status)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: sc(40) }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: { paddingHorizontal: sc(20), paddingBottom: sc(20) },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: sc(16) },
  headerTitle: { fontSize: sc(17), fontWeight: '700' },

  balanceBlock: { marginBottom: sc(4) },
  balanceLabel: { fontSize: sc(12), fontWeight: '500', marginBottom: sc(2) },
  balanceValue: { fontSize: sc(38), fontWeight: '700' },

  nextPayout: { flexDirection: 'row', alignItems: 'center', gap: sc(6), marginTop: sc(6), marginBottom: sc(12) },
  nextPayoutText: { fontSize: sc(13), fontWeight: '500' },

  withdrawBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sc(8), borderRadius: sc(12), paddingVertical: sc(14), minHeight: sc(48), backgroundColor: '#000', opacity: 1 },
  withdrawBtnText: { fontSize: sc(15), fontWeight: '700', color: '#fff' },

  content: { paddingHorizontal: sc(20) },

  // Section
  section: { marginBottom: sc(20) },
  sectionTitle: { fontSize: sc(12), fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: sc(8) },

  // Method card
  methodCard: { flexDirection: 'row', alignItems: 'center', borderRadius: sc(10), padding: sc(14), gap: sc(12) },
  methodIconWrap: { width: sc(40), height: sc(40), borderRadius: sc(20), alignItems: 'center', justifyContent: 'center' },
  methodBody: { flex: 1 },
  methodName: { fontSize: sc(14), fontWeight: '600' },
  methodDetail: { fontSize: sc(12), marginTop: sc(2) },
  methodEdit: { fontSize: sc(13), fontWeight: '600' },

  // Stats
  statsRow: { flexDirection: 'row', gap: sc(12), marginBottom: sc(20) },
  statBox: { flex: 1, borderRadius: sc(10), padding: sc(16) },
  statValue: { fontSize: sc(18), fontWeight: '700' },
  statLabel: { fontSize: sc(11), marginTop: sc(4) },

  // History
  historySection: { marginBottom: sc(8) },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: sc(10) },
  historyTitle: { fontSize: sc(13), fontWeight: '600' },
  historyCount: { fontSize: sc(12), fontWeight: '500' },

  emptyState: { alignItems: 'center', paddingVertical: sc(40) },
  emptyTitle: { fontSize: sc(15), fontWeight: '600', marginTop: sc(10), marginBottom: sc(4) },
  emptySub: { fontSize: sc(13), textAlign: 'center' },

  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: sc(14), borderBottomWidth: StyleSheet.hairlineWidth },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: sc(12) },
  historyDot: { width: sc(8), height: sc(8), borderRadius: sc(4) },
  historyBody: { flex: 1 },
  historyAmt: { fontSize: sc(14), fontWeight: '600' },
  historyDate: { fontSize: sc(12), marginTop: sc(2) },
});
