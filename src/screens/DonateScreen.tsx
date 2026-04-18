import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Switch,
  Modal,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFundraisers, addComment, addDonationRecord, Fundraiser, GiftTier } from '../utils/donations';

const { width: W } = Dimensions.get('window');
const sc = (v: number) => Math.round(v * (W / 390));

const PRESET_AMOUNTS = [5, 10, 25, 50, 100];

export default function DonateScreen({ navigation, route, theme }: any) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = theme;
  const { postId } = route.params || {};

  const [fundraiser, setFundraiser] = useState<Fundraiser | null>(null);
  const [rewardTiers, setRewardTiers] = useState<GiftTier[]>([]);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [donationType, setDonationType] = useState<'money' | 'ads'>('money');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [message, setMessage] = useState('');
  const [showAdModal, setShowAdModal] = useState(false);
  const [adCountdown, setAdCountdown] = useState(10);
  const [adAnimating, setAdAnimating] = useState(false);

  const adProgress = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadFundraiser();
  }, [postId]);

  const loadFundraiser = async () => {
    const data = await getFundraisers();
    const found = data.find((f) => f.id === postId);
    if (found) {
      setFundraiser(found);
      setRewardTiers(found.giftTiers || []);
    }
  };

  const getAmount = () => {
    if (donationType === 'ads') return 1;
    return selectedAmount || parseInt(customAmount, 10) || 0;
  };

  const handleDonate = async () => {
    const amount = getAmount();
    if (amount <= 0) return;

    const selectedTier = rewardTiers.find((t) => t.id === selectedReward);
    const certId = selectedTier ? `cert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` : undefined;

    await addComment({
      id: `comment-${Date.now()}`,
      postId,
      donorName: isAnonymous ? null : (donorName || 'Supporter'),
      amount,
      donationType,
      message: message.trim(),
      timestamp: Date.now(),
      rewardTierId: selectedTier?.id,
      certificateId: certId,
    });

    // Save to personal donation history
    await addDonationRecord({
      id: `donation-${Date.now()}`,
      postId,
      postTitle: fundraiser?.title || 'Fundraiser',
      creatorName: fundraiser?.creatorType === 'organization'
        ? (fundraiser.orgName || fundraiser.creatorName)
        : fundraiser?.creatorName || 'Unknown',
      donorName: isAnonymous ? null : (donorName || 'Supporter'),
      amount,
      donationType,
      message: message.trim(),
      timestamp: Date.now(),
      isAnonymous,
      rewardTier: selectedTier ? { ...selectedTier } : null,
      certificateId: certId,
    });

    navigation.goBack();
    navigation.navigate('DonationPostDetail', { postId });
  };

  const startAdWatch = () => {
    setShowAdModal(true);
    setAdCountdown(10);
    setAdAnimating(true);
    adProgress.setValue(0);
    Animated.timing(adProgress, {
      toValue: 1,
      duration: 10000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => {
      setAdAnimating(false);
    });

    const timer = setInterval(() => {
      setAdCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          setShowAdModal(false);
          handleDonate();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const formatCurrency = (n: number) =>
    `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={sc(22)} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.onSurface }]}>Donate</Text>
        <View style={{ width: sc(22) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Post summary */}
        {fundraiser && (
          <View style={[styles.summaryCard, { backgroundColor: colors.surfaceContainerLow }]}>
            <Text style={[styles.summaryTitle, { color: colors.onSurface }]}>{fundraiser.title}</Text>
            <Text style={[styles.summaryCreator, { color: colors.onSurfaceVariant }]}>
              by {fundraiser.creatorType === 'organization' ? fundraiser.orgName : fundraiser.creatorName}
            </Text>
          </View>
        )}

        {/* Type toggle */}
        <View style={[styles.typeToggle, { backgroundColor: colors.surfaceContainerHigh }]}>
          <TouchableOpacity
            style={[styles.typeBtn, donationType === 'money' && { backgroundColor: colors.primary }]}
            onPress={() => setDonationType('money')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="cash-outline"
              size={sc(16)}
              color={donationType === 'money' ? colors.onPrimary : colors.onSurfaceVariant}
            />
            <Text style={[styles.typeBtnText, {
              color: donationType === 'money' ? colors.onPrimary : colors.onSurfaceVariant,
            }]}>Money</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, donationType === 'ads' && { backgroundColor: colors.primary }]}
            onPress={() => setDonationType('ads')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="videocam-outline"
              size={sc(16)}
              color={donationType === 'ads' ? colors.onPrimary : colors.onSurfaceVariant}
            />
            <Text style={[styles.typeBtnText, {
              color: donationType === 'ads' ? colors.onPrimary : colors.onSurfaceVariant,
            }]}>Watch Ads</Text>
          </TouchableOpacity>
        </View>

        {/* Money amounts */}
        {donationType === 'money' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Choose an amount</Text>
            <View style={styles.presetGrid}>
              {PRESET_AMOUNTS.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[
                    styles.presetBtn,
                    { borderColor: colors.outlineVariant },
                    selectedAmount === amt && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.presetText,
                    { color: selectedAmount === amt ? colors.onPrimary : colors.onSurface },
                  ]}>
                    {formatCurrency(amt)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.customInput, {
                backgroundColor: colors.surfaceContainerLowest,
                color: colors.onSurface,
                borderColor: colors.outlineVariant,
              }]}
              placeholder="Or enter custom amount"
              placeholderTextColor={colors.onSurfaceVariant}
              keyboardType="numeric"
              value={customAmount}
              onChangeText={(t) => { setCustomAmount(t); setSelectedAmount(null); }}
            />
          </View>
        )}

        {/* Ads explanation */}
        {donationType === 'ads' && (
          <View style={styles.section}>
            <View style={[styles.adsInfoCard, { backgroundColor: colors.tertiaryContainer + '22' }]}>
              <Ionicons name="videocam" size={sc(24)} color={colors.tertiary} />
              <Text style={[styles.adsInfoTitle, { color: colors.tertiary }]}>Watch an Ad to Donate</Text>
              <Text style={[styles.adsInfoDesc, { color: colors.tertiaryDim }]}>
                Watch a short 10-second ad. Your time becomes a donation to this fundraiser.
              </Text>
            </View>
          </View>
        )}

        {/* Reward tier selector - only show for money donations */}
        {rewardTiers.length > 0 && donationType === 'money' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
              <Ionicons name="gift-outline" size={sc(16)} color={colors.primary} /> Select Reward
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rewardRow}>
              {rewardTiers.map((tier) => {
                const isSelected = selectedReward === tier.id;
                const canAfford = (selectedAmount || parseInt(customAmount, 10) || 0) >= tier.minAmount;
                return (
                  <TouchableOpacity
                    key={tier.id}
                    style={[styles.rewardCard, {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceContainer,
                      borderColor: isSelected ? colors.primary : colors.outlineVariant,
                      opacity: canAfford ? 1 : 0.35,
                    }]}
                    onPress={() => canAfford && setSelectedReward(isSelected ? null : tier.id)}
                    activeOpacity={0.7}
                    disabled={!canAfford}
                  >
                    {tier.imageUrl ? (
                      <Image source={{ uri: tier.imageUrl }} style={styles.rewardImage} />
                    ) : (
                      <View style={[styles.rewardImage, styles.rewardImagePlaceholder]}>
                        <Ionicons name="gift-outline" size={sc(20)} color={colors.primary} />
                      </View>
                    )}
                    <Text style={[styles.rewardTitle, {
                      color: isSelected ? colors.onPrimary : colors.onSurface,
                    }]} numberOfLines={1}>
                      {tier.title}
                    </Text>
                    <Text style={[styles.rewardMin, {
                      color: isSelected ? colors.onPrimary + 'AA' : colors.onSurfaceVariant,
                    }]}>
                      ${tier.minAmount}+
                    </Text>
                    {isSelected && (
                      <View style={styles.rewardCheck}>
                        <Ionicons name="checkmark-circle" size={sc(14)} color={colors.onPrimary} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Anonymous toggle */}
        <View style={[styles.toggleRow, { backgroundColor: colors.surfaceContainerLow }]}>
          <View>
            <Text style={[styles.toggleLabel, { color: colors.onSurface }]}>Donate anonymously</Text>
            <Text style={[styles.toggleSub, { color: colors.onSurfaceVariant }]}>
              Your name will be hidden from comments
            </Text>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{ true: colors.primary }}
            thumbColor={colors.onPrimary}
          />
        </View>

        {/* Donor name */}
        {!isAnonymous && (
          <View style={styles.section}>
            <Text style={[styles.inputLabel, { color: colors.onSurface }]}>Your name</Text>
            <TextInput
              style={[styles.textInput, {
                backgroundColor: colors.surfaceContainerLowest,
                color: colors.onSurface,
                borderColor: colors.outlineVariant,
              }]}
              placeholder="Enter your name"
              placeholderTextColor={colors.onSurfaceVariant}
              value={donorName}
              onChangeText={setDonorName}
            />
          </View>
        )}

        {/* Message */}
        <View style={styles.section}>
          <Text style={[styles.inputLabel, { color: colors.onSurface }]}>Leave a message (optional)</Text>
          <TextInput
            style={[styles.textArea, {
              backgroundColor: colors.surfaceContainerLowest,
              color: colors.onSurface,
              borderColor: colors.outlineVariant,
            }]}
            placeholder="Share why you're supporting this cause..."
            placeholderTextColor={colors.onSurfaceVariant}
            multiline
            numberOfLines={3}
            value={message}
            onChangeText={setMessage}
          />
        </View>

        {/* Donate button */}
        <TouchableOpacity style={styles.donateBtnWrap} onPress={
          donationType === 'ads' ? startAdWatch : handleDonate
        } activeOpacity={0.85}>
          <LinearGradient
            colors={[colors.primaryDim, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.donateBtn}
          >
            <Ionicons
              name={donationType === 'ads' ? 'play-circle' : 'heart'}
              size={sc(20)}
              color={colors.onPrimary}
            />
            <Text style={[styles.donateBtnText, { color: colors.onPrimary }]}>
              {donationType === 'ads' ? 'Watch Ad & Donate' : `Donate ${formatCurrency(getAmount())}`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: sc(40) }} />
      </ScrollView>

      {/* Ad modal */}
      <Modal visible={showAdModal} animationType="fade" transparent={false}>
        <View style={[styles.adModal, { backgroundColor: colors.background }]}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <View style={styles.adHeader}>
            <Text style={[styles.adSponsored, { color: colors.onSurfaceVariant }]}>Sponsored</Text>
            <TouchableOpacity onPress={() => { setShowAdModal(false); setAdAnimating(false); }}>
              <Ionicons name="close-circle" size={sc(28)} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
          <View style={[styles.adPlayer, { backgroundColor: colors.surfaceContainerHigh }]}>
            {adAnimating ? (
              <Animated.View style={{ opacity: adProgress }}>
                <View style={[styles.adPulse, { borderColor: colors.primary }]}>
                  <Ionicons name="play" size={sc(48)} color={colors.primary} />
                </View>
              </Animated.View>
            ) : (
              <Ionicons name="videocam" size={sc(48)} color={colors.outlineVariant} />
            )}
          </View>
          <Text style={[styles.adTimer, { color: colors.primary }]}>
            Ad ends in {adCountdown}s
          </Text>
          <Text style={[styles.adCaption, { color: colors.onSurfaceVariant }]}>
            Supporting {fundraiser?.title || 'this fundraiser'}
          </Text>
          <View style={styles.adProgressBar}>
            <Animated.View
              style={[
                styles.adProgressFill,
                { backgroundColor: colors.primary },
                { width: adProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                })},
              ]}
            />
          </View>
        </View>
      </Modal>
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
  scrollContent: { paddingHorizontal: sc(16), paddingTop: sc(12) },
  summaryCard: { borderRadius: sc(12), padding: sc(14), marginBottom: sc(14) },
  summaryTitle: { fontSize: sc(15), fontWeight: '700', marginBottom: sc(4) },
  summaryCreator: { fontSize: sc(12) },
  typeToggle: { flexDirection: 'row', borderRadius: sc(14), padding: sc(3), marginBottom: sc(14) },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: sc(5), paddingVertical: sc(11), borderRadius: sc(12),
  },
  typeBtnText: { fontSize: sc(13), fontWeight: '600' },
  section: { marginBottom: sc(14) },
  sectionTitle: { fontSize: sc(14), fontWeight: '700', marginBottom: sc(10) },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: sc(8), marginBottom: sc(10) },
  presetBtn: {
    flex: 1, minWidth: '30%', paddingVertical: sc(12), borderRadius: sc(12),
    borderWidth: 1, alignItems: 'center',
  },
  presetText: { fontSize: sc(15), fontWeight: '700' },
  customInput: {
    borderRadius: sc(12), borderWidth: 1, paddingHorizontal: sc(14),
    paddingVertical: sc(12), fontSize: sc(15),
  },
  adsInfoCard: {
    flexDirection: 'row', alignItems: 'center', gap: sc(12),
    borderRadius: sc(14), padding: sc(16),
  },
  adsInfoTitle: { fontSize: sc(14), fontWeight: '700' },
  adsInfoDesc: { fontSize: sc(12), lineHeight: sc(18), flex: 1 },
  rewardRow: { gap: sc(8), paddingVertical: sc(4) },
  rewardCard: {
    width: sc(90), borderRadius: sc(12), padding: sc(10),
    borderWidth: 1, alignItems: 'center', position: 'relative',
  },
  rewardImage: { width: sc(52), height: sc(52), borderRadius: sc(10), resizeMode: 'cover', marginBottom: sc(6) },
  rewardImagePlaceholder: { backgroundColor: '#f5f5f522', alignItems: 'center', justifyContent: 'center' },
  rewardTitle: { fontSize: sc(10), fontWeight: '700', textAlign: 'center', marginBottom: sc(2) },
  rewardMin: { fontSize: sc(9), fontWeight: '600' },
  rewardCheck: { position: 'absolute', top: sc(4), right: sc(4) },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: sc(14), padding: sc(16), marginBottom: sc(14),
  },
  toggleLabel: { fontSize: sc(14), fontWeight: '700' },
  toggleSub: { fontSize: sc(11), marginTop: sc(2) },
  inputLabel: { fontSize: sc(13), fontWeight: '600', marginBottom: sc(6) },
  textInput: {
    borderRadius: sc(12), borderWidth: 1, paddingHorizontal: sc(14),
    paddingVertical: sc(12), fontSize: sc(15),
  },
  textArea: {
    borderRadius: sc(12), borderWidth: 1, paddingHorizontal: sc(14),
    paddingVertical: sc(12), fontSize: sc(14), textAlignVertical: 'top', minHeight: sc(80),
  },
  donateBtnWrap: { borderRadius: sc(24), overflow: 'hidden', marginTop: sc(8) },
  donateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: sc(8), paddingVertical: sc(15), minHeight: sc(52),
  },
  donateBtnText: { fontSize: sc(16), fontWeight: '800' },
  adModal: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: sc(24) },
  adHeader: {
    position: 'absolute', top: sc(40), left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: sc(20),
  },
  adSponsored: { fontSize: sc(12), fontWeight: '600' },
  adPlayer: {
    width: '100%', height: sc(240), borderRadius: sc(20),
    alignItems: 'center', justifyContent: 'center', marginBottom: sc(20),
  },
  adPulse: {
    width: sc(80), height: sc(80), borderRadius: sc(40),
    borderWidth: 3, alignItems: 'center', justifyContent: 'center',
  },
  adTimer: { fontSize: sc(32), fontWeight: '800', marginBottom: sc(8) },
  adCaption: { fontSize: sc(14), marginBottom: sc(24) },
  adProgressBar: { width: '80%', height: sc(6), borderRadius: sc(3), backgroundColor: '#333' },
  adProgressFill: { height: '100%', borderRadius: sc(3) },
});
